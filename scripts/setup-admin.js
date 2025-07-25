const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
    host: process.env.POSTGRESQL_HOST,
    port: Number(process.env.POSTGRESQL_PORT),
    user: process.env.POSTGRESQL_USER,
    password: process.env.POSTGRESQL_PASSWORD,
    database: process.env.POSTGRESQL_DATABASE || "postgres",
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function setupAdmin() {
    try {
        console.log('Setting up admin user...');
        
        // Hash the password
        const password = 'admin123'; // Default password
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Check if admin user already exists
        const checkResult = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            ['admin@maraxo.com']
        );
        
        if (checkResult.rows.length > 0) {
            // Update existing admin user
            await pool.query(
                'UPDATE users SET password = $1, updated_at = NOW() WHERE email = $2',
                [hashedPassword, 'admin@maraxo.com']
            );
            console.log('Admin user password updated successfully!');
        } else {
            // Create new admin user
            await pool.query(
                'INSERT INTO users (full_name, email, password, role) VALUES ($1, $2, $3, $4)',
                ['Admin User', 'admin@maraxo.com', hashedPassword, 'admin']
            );
            console.log('Admin user created successfully!');
        }
        
        console.log('Default credentials:');
        console.log('Email: admin@maraxo.com');
        console.log('Password: admin123');
        console.log('\n⚠️  IMPORTANT: Change the default password after first login!');
        
    } catch (error) {
        console.error('Error setting up admin user:', error);
    } finally {
        await pool.end();
    }
}

// Run the setup
setupAdmin(); 