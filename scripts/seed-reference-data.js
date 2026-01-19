/**
 * Database Seeding Script for Reference Data
 * Seeds visit types, consult types, and practice types if they don't exist
 */

const { Pool } = require('pg');
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

async function seedReferenceData() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // Seed Visit Types
        console.log('Seeding visit types...');
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
                 ON CONFLICT (name) DO NOTHING`,
                [vt.name, vt.description]
            );
        }
        console.log('✓ Visit types seeded');

        // Seed Consult Types
        console.log('Seeding consult types...');
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
                 ON CONFLICT (name) DO NOTHING`,
                [ct.name, ct.description]
            );
        }
        console.log('✓ Consult types seeded');

        // Seed Practice Types
        console.log('Seeding practice types...');
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
                     ON CONFLICT (name) DO NOTHING`,
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
        console.log('\n✅ All reference data seeded successfully!');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error seeding reference data:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function checkDataExists() {
    try {
        const visitTypesCount = await pool.query('SELECT COUNT(*) FROM visit_types');
        const consultTypesCount = await pool.query('SELECT COUNT(*) FROM consult_types');
        const practiceTypesCount = await pool.query('SELECT COUNT(*) FROM practice_types');

        console.log('\nCurrent database state:');
        console.log(`- Visit Types: ${visitTypesCount.rows[0].count}`);
        console.log(`- Consult Types: ${consultTypesCount.rows[0].count}`);
        console.log(`- Practice Types: ${practiceTypesCount.rows[0].count}\n`);

        return {
            visitTypes: parseInt(visitTypesCount.rows[0].count),
            consultTypes: parseInt(consultTypesCount.rows[0].count),
            practiceTypes: parseInt(practiceTypesCount.rows[0].count)
        };
    } catch (error) {
        console.error('Error checking data:', error);
        throw error;
    }
}

async function main() {
    try {
        console.log('🔍 Checking current database state...');
        await checkDataExists();
        
        console.log('🌱 Starting database seeding...\n');
        await seedReferenceData();
        
        console.log('\n🔍 Verifying seeded data...');
        await checkDataExists();
        
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    main();
}

module.exports = { seedReferenceData, checkDataExists };

