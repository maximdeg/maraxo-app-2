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

const pool = new Pool({
    host: process.env.POSTGRESQL_HOST,
    port: Number(process.env.POSTGRESQL_PORT),
    user: process.env.POSTGRESQL_USER,
    password: process.env.POSTGRESQL_PASSWORD,
    database: process.env.POSTGRESQL_DATABASE || "postgres",
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: true,
        ca: process.env.POSTGRESQL_CA_CERT,
    } : {
        rejectUnauthorized: false,
    },
});

export async function query(text: string, params?: any[]) {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("executed query", { text, duration, rows: res.rowCount });
    return res;
}

// TODO:

// Security Note on SSL `rejectUnauthorized: false`:
// For *development* and *testing*, setting `rejectUnauthorized: false` might be convenient to avoid SSL certificate issues locally.
// **However, for production, you SHOULD enable proper SSL certificate verification** for secure connections to your RDS instance.
// In production, you would typically configure SSL to use the RDS certificate authority (CA) and remove `rejectUnauthorized: false`.
// Refer to AWS RDS documentation and `pg` document
