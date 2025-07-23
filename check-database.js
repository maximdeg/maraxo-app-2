// Script to check if the cancellation_token column exists in the appointments table
// This helps verify that the database migration was applied correctly

const { Pool } = require('pg');

// Database configuration - adjust these values according to your setup
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'maraxo_app',
    password: process.env.DB_PASSWORD || 'your_password',
    port: process.env.DB_PORT || 5432,
});

async function checkCancellationTokenColumn() {
    try {
        console.log('🔍 Checking if cancellation_token column exists...\n');
        
        // Query to check if the column exists
        const query = `
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'appointments' 
            AND column_name = 'cancellation_token';
        `;
        
        const result = await pool.query(query);
        
        if (result.rows.length > 0) {
            console.log('✅ cancellation_token column found!');
            console.log('Column details:');
            console.log(`- Name: ${result.rows[0].column_name}`);
            console.log(`- Type: ${result.rows[0].data_type}`);
            console.log(`- Nullable: ${result.rows[0].is_nullable}`);
            console.log('\n🎉 Database is ready for the cancellation system!');
        } else {
            console.log('❌ cancellation_token column NOT found!');
            console.log('\n📋 To fix this, run the following SQL command:');
            console.log(`
ALTER TABLE appointments 
ADD COLUMN cancellation_token TEXT;

CREATE INDEX idx_appointments_cancellation_token ON appointments(cancellation_token);

COMMENT ON COLUMN appointments.cancellation_token IS 'JWT token for secure appointment cancellation links';
            `);
        }
        
        // Also check if there are any existing appointments
        const appointmentCount = await pool.query('SELECT COUNT(*) FROM appointments');
        console.log(`\n📊 Total appointments in database: ${appointmentCount.rows[0].count}`);
        
    } catch (error) {
        console.error('❌ Error checking database:', error.message);
        console.log('\n💡 Make sure your database connection is configured correctly.');
    } finally {
        await pool.end();
    }
}

checkCancellationTokenColumn(); 