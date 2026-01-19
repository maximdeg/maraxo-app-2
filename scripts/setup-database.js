/**
 * Database Setup Script
 * Runs migrations and seeds reference data
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    host: process.env.POSTGRESQL_HOST,
    port: Number(process.env.POSTGRESQL_PORT),
    user: process.env.POSTGRESQL_USER,
    password: process.env.POSTGRESQL_PASSWORD,
    database: process.env.POSTGRESQL_DATABASE || "postgres",
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false,
});

async function runMigrations() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        console.log('📦 Running database migrations...\n');
        
        // Create unavailable_days table if it doesn't exist (simpler version)
        // First check if table exists
        const tableExists = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'unavailable_days'
            );
        `);
        
        if (!tableExists.rows[0].exists) {
            await client.query(`
                CREATE TABLE unavailable_days (
                    id SERIAL PRIMARY KEY,
                    unavailable_date DATE UNIQUE NOT NULL,
                    is_confirmed BOOLEAN DEFAULT FALSE NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
                );
            `);
            console.log('✓ Unavailable days table created');
        } else {
            // Table exists, check if work_schedule_id column exists and make it nullable if needed
            const columnExists = await client.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.columns 
                    WHERE table_name = 'unavailable_days' 
                    AND column_name = 'work_schedule_id'
                );
            `);
            
            if (columnExists.rows[0].exists) {
                // Make work_schedule_id nullable if it's required
                await client.query(`
                    ALTER TABLE unavailable_days 
                    ALTER COLUMN work_schedule_id DROP NOT NULL;
                `);
                console.log('✓ Unavailable days table schema updated (work_schedule_id made nullable)');
            } else {
                console.log('✓ Unavailable days table verified (no work_schedule_id column)');
            }
        }
        
        // Create index if it doesn't exist
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_unavailable_days_date 
            ON unavailable_days (unavailable_date);
        `);
        
        // Run push_subscriptions migration
        const pushSubscriptionsSQL = fs.readFileSync(
            path.join(__dirname, '../database/create_push_subscriptions_table.sql'),
            'utf8'
        );
        await client.query(pushSubscriptionsSQL);
        console.log('✓ Push subscriptions table created');
        
        await client.query('COMMIT');
        console.log('\n✅ Migrations completed successfully!\n');
        
    } catch (error) {
        await client.query('ROLLBACK');
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
            console.log('⚠️  Some tables already exist (this is okay)');
        } else {
            console.error('❌ Migration error:', error.message);
            throw error;
        }
    } finally {
        client.release();
    }
}

async function seedReferenceData() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // Seed Visit Types
        console.log('🌱 Seeding visit types...');
        const visitTypes = [
            { name: 'Consulta', description: 'Consulta médica' },
            { name: 'Practica', description: 'Práctica médica' },
            { name: 'In-Person', description: 'Physical visit at the clinic.' },
            { name: 'Online', description: 'Video or telehealth consultation.' },
            { name: 'Phone Call', description: 'Consultation via phone call.' }
        ];

        for (const vt of visitTypes) {
            await client.query(
                `INSERT INTO visit_types (name, description) 
                 VALUES ($1, $2) 
                 ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description`,
                [vt.name, vt.description]
            );
        }
        console.log('✓ Visit types seeded');

        // Seed Consult Types
        console.log('🌱 Seeding consult types...');
        const consultTypes = [
            { name: 'Primera vez', description: 'Primera consulta con el paciente.' },
            { name: 'Seguimiento', description: 'Consulta de seguimiento.' },
            { name: 'Initial Consultation', description: 'First appointment to understand the patient\'s needs.' },
            { name: 'Follow-up', description: 'Subsequent appointment for ongoing care.' },
            { name: 'Check-up', description: 'Routine health check.' },
            { name: 'Emergency Consultation', description: 'Urgent appointment for immediate concerns.' }
        ];

        for (const ct of consultTypes) {
            await client.query(
                `INSERT INTO consult_types (name, description) 
                 VALUES ($1, $2) 
                 ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description`,
                [ct.name, ct.description]
            );
        }
        console.log('✓ Consult types seeded');

        // Seed Practice Types
        console.log('🌱 Seeding practice types...');
        const practiceTypes = [
            { id: 0, name: '', description: '' },
            { name: 'Criocirugía', description: 'Surgical procedure using extreme cold to destroy abnormal tissue.' },
            { name: 'Electrocoagulación', description: 'Surgical procedure that uses electrical current to coagulate tissue.' },
            { name: 'Biopsia', description: 'Medical procedure to remove a sample of tissue for examination.' }
        ];

        for (const pt of practiceTypes) {
            if (pt.id !== undefined) {
                await client.query(
                    `INSERT INTO practice_types (id, name, description) 
                     VALUES ($1, $2, $3) 
                     ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description`,
                    [pt.id, pt.name, pt.description]
                );
            } else {
                await client.query(
                    `INSERT INTO practice_types (name, description) 
                     VALUES ($1, $2) 
                     ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description`,
                    [pt.name, pt.description]
                );
            }
        }

        // Reset sequence if needed
        await client.query(
            `SELECT setval('practice_types_id_seq', (SELECT MAX(id) FROM practice_types), true)`
        );
        console.log('✓ Practice types seeded');

        await client.query('COMMIT');
        console.log('\n✅ All reference data seeded successfully!\n');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error seeding reference data:', error.message);
        throw error;
    } finally {
        client.release();
    }
}

async function verifyDatabase() {
    try {
        console.log('🔍 Verifying database state...\n');
        
        const visitTypesCount = await pool.query('SELECT COUNT(*) FROM visit_types');
        const consultTypesCount = await pool.query('SELECT COUNT(*) FROM consult_types');
        const practiceTypesCount = await pool.query('SELECT COUNT(*) FROM practice_types');
        
        // Check if push_subscriptions table exists
        let pushSubscriptionsExists = false;
        try {
            await pool.query('SELECT 1 FROM push_subscriptions LIMIT 1');
            pushSubscriptionsExists = true;
        } catch (e) {
            pushSubscriptionsExists = false;
        }

        console.log('Database Status:');
        console.log(`  - Visit Types: ${visitTypesCount.rows[0].count}`);
        console.log(`  - Consult Types: ${consultTypesCount.rows[0].count}`);
        console.log(`  - Practice Types: ${practiceTypesCount.rows[0].count}`);
        console.log(`  - Push Subscriptions Table: ${pushSubscriptionsExists ? '✓ Exists' : '✗ Missing'}\n`);

        return {
            visitTypes: parseInt(visitTypesCount.rows[0].count),
            consultTypes: parseInt(consultTypesCount.rows[0].count),
            practiceTypes: parseInt(practiceTypesCount.rows[0].count),
            pushSubscriptionsExists
        };
    } catch (error) {
        console.error('Error verifying database:', error.message);
        throw error;
    }
}

async function main() {
    try {
        console.log('🚀 Starting database setup...\n');
        
        // Verify current state
        await verifyDatabase();
        
        // Run migrations
        await runMigrations();
        
        // Seed data
        await seedReferenceData();
        
        // Verify final state
        await verifyDatabase();
        
        console.log('✅ Database setup completed successfully!');
        
    } catch (error) {
        console.error('\n❌ Fatal error:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    main();
}

module.exports = { runMigrations, seedReferenceData, verifyDatabase };

