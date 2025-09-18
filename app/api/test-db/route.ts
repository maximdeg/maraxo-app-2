import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Ensure this runs in Node.js runtime, not Edge Runtime
export const runtime = 'nodejs';

export async function GET() {
    try {
        // Test getAvailableTimesByDate logic for today
        const today = new Date();
        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const dayName = dayNames[today.getDay()];
        const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
        
        console.log(`🟠 Testing for today: ${formattedDate}, Day: ${dayName}`);
        
        // Get work_schedule for today
        const workSchedule = await query('SELECT * FROM work_schedule WHERE day_of_week = $1', [dayName]);
        
        if (workSchedule.rows.length === 0) {
            return NextResponse.json({ 
                error: `No work schedule found for ${dayName}`,
                dayName,
                formattedDate
            }, { status: 404 });
        }
        
        // Check if there are available slots for today
        const availableSlots = await query(`
            SELECT 
                asl.*,
                ws.day_of_week
            FROM available_slots asl
            JOIN work_schedule ws ON asl.work_schedule_id = ws.id
            WHERE ws.day_of_week = $1
            ORDER BY asl.start_time
        `, [dayName]);
        
        console.log(`🟠 Available slots for ${dayName}:`, availableSlots.rows);
        
        // If no slots exist, create some test slots
        if (availableSlots.rows.length === 0) {
            console.log("🟠 No slots found, creating test slots...");
            
            const workScheduleId = workSchedule.rows[0].id;
            
            // Insert test slots
            await query(`
                INSERT INTO available_slots (work_schedule_id, start_time, end_time)
                VALUES ($1, '09:00', '12:00'), ($1, '14:00', '17:00')
                ON CONFLICT DO NOTHING
            `, [workScheduleId]);
            
            console.log("🟢 Test slots created");
            
            // Fetch the newly created slots
            const newSlots = await query(`
                SELECT 
                    asl.*,
                    ws.day_of_week
                FROM available_slots asl
                JOIN work_schedule ws ON asl.work_schedule_id = ws.id
                WHERE ws.day_of_week = $1
                ORDER BY asl.start_time
            `, [dayName]);
            
            console.log("🟠 New slots:", newSlots.rows);
            
            return NextResponse.json({ 
                message: 'Test slots created',
                dayName,
                formattedDate,
                slots: newSlots.rows
            }, { status: 200 });
        }
        
        return NextResponse.json({ 
            message: 'Slots found',
            dayName,
            formattedDate,
            slots: availableSlots.rows
        }, { status: 200 });
        
    } catch (error) {
        console.error('🔴 Error:', error);
        return NextResponse.json({ 
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}


// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     try {
//         const results = await query('SELECT 1 + 1 AS result');
//         res.status(200).json({ connection: 'success', result: results.rows }); // Access rows from pg result
//         console.log("🟢 Conected to database");
//     } catch (error) {
//         console.error('🔴 Database connection error:', error);
//         res.status(500).json({ connection: 'failed', error: error });
//     }
// }

