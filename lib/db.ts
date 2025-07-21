import { Pool } from "pg";

// Validate required environment variables
const requiredEnvVars = [
    'POSTGRESQL_HOST',
    'POSTGRESQL_PORT', 
    'POSTGRESQL_USER',
    'POSTGRESQL_PASSWORD'
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

// SSL configuration based on environment
const getSSLConfig = () => {
    if (process.env.NODE_ENV === 'production') {
        // In production, handle AWS RDS SSL properly
        if (process.env.POSTGRESQL_SSL_MODE === 'verify-full' && process.env.POSTGRESQL_CA_CERT) {
            return {
                rejectUnauthorized: true,
                ca: process.env.POSTGRESQL_CA_CERT,
            };
        } else if (process.env.POSTGRESQL_SSL_MODE === 'require') {
            return {
                rejectUnauthorized: false, // Allow self-signed certificates for AWS RDS
            };
        } else {
            // Default production behavior for AWS RDS - require SSL but allow self-signed
            return {
                rejectUnauthorized: false,
                ssl: true,
            };
        }
    } else {
        // Development - disable SSL or allow self-signed
        return {
            rejectUnauthorized: false,
        };
    }
};

const pool = new Pool({
    host: process.env.POSTGRESQL_HOST,
    port: Number(process.env.POSTGRESQL_PORT),
    user: process.env.POSTGRESQL_USER,
    password: process.env.POSTGRESQL_PASSWORD,
    database: process.env.POSTGRESQL_DATABASE || "postgres",
    ssl: getSSLConfig(),
    // Add connection timeout and retry logic
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 20, // Maximum number of clients in the pool
});

// Handle connection errors
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export async function query(text: string, params?: any[]) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log("executed query", { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error("Database query error:", error);
        throw error;
    }
}

// SSL Configuration Notes:
// 
// Environment Variables:
// - POSTGRESQL_SSL_MODE: Controls SSL behavior
//   - 'require': Requires SSL but allows self-signed certificates (default for production)
//   - 'verify-full': Requires SSL with full certificate verification (requires POSTGRESQL_CA_CERT)
//   - undefined: Uses default behavior based on NODE_ENV
//
// - POSTGRESQL_CA_CERT: Certificate Authority certificate for full SSL verification
//
// AWS RDS Specific Notes:
// - AWS RDS uses self-signed certificates by default
// - For production, set POSTGRESQL_SSL_MODE='require' to allow self-signed certificates
// - For maximum security, download AWS RDS CA certificate and set POSTGRESQL_SSL_MODE='verify-full'
//
// Security Considerations:
// - In development: SSL verification is disabled for convenience
// - In production: SSL is required but self-signed certificates are allowed by default
// - For maximum security in production, set POSTGRESQL_SSL_MODE='verify-full' and provide POSTGRESQL_CA_CERT
