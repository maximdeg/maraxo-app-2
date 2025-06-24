import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
    try {
        const unavailableTimeFrames = await query(`
            SELECT
                utf.*,
                ws.day_of_week
            FROM unavailable_time_frames utf
            JOIN work_schedule ws ON utf.work_schedule_id = ws.id
            ORDER BY utf.workday_date, utf.start_time
        `);
        return NextResponse.json({ 
            unavailableTimeFrames: unavailableTimeFrames.rows,
            count: unavailableTimeFrames.rows.length
        }, { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to fetch unavailable time frames" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { workday_date, start_time, end_time } = body;

        if (!workday_date || !start_time || !end_time) {
            return NextResponse.json({ error: "Missing required fields: workday_date, start_time, end_time" }, { status: 400 });
        }

        // Validate date format
        if (isNaN(Date.parse(workday_date))) {
            return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
        }

        // Validate time format (basic validation)
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
            return NextResponse.json({ error: "Invalid time format. Use HH:MM format" }, { status: 400 });
        }

        // Validate that start_time is before end_time
        if (start_time >= end_time) {
            return NextResponse.json({ error: "Start time must be before end time" }, { status: 400 });
        }

        const work_schedule_id = new Date(workday_date).getDay() + 1;

        // Check if there's already an unavailable time frame for this date and time
        const existingTimeFrame = await query(
            `SELECT id FROM unavailable_time_frames 
             WHERE workday_date = $1 
             AND ((start_time <= $2 AND end_time > $2) OR (start_time < $3 AND end_time >= $3) OR (start_time >= $2 AND end_time <= $3))`,
            [workday_date, start_time, end_time]
        );

        if (existingTimeFrame.rows.length > 0) {
            return NextResponse.json({ 
                error: "Time frame overlaps with existing unavailable time",
                existingId: existingTimeFrame.rows[0].id
            }, { status: 409 });
        }

        const result = await query(
            `INSERT INTO unavailable_time_frames (workday_date, start_time, end_time, work_schedule_id)
            VALUES ($1, $2, $3, $4) RETURNING id, workday_date, start_time, end_time`,
            [workday_date, start_time, end_time, work_schedule_id]
        );
        
        return NextResponse.json({ 
            message: "Unavailable time frame created successfully", 
            unavailableTimeFrame: result.rows[0]
        }, { status: 201 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to create unavailable time frame" }, { status: 500 });
    }
}
