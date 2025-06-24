import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
    try {
        const unavailableDays = await query(`
            SELECT ud.unavailable_date, ud.is_confirmed, ws.day_of_week as day
            FROM unavailable_days ud
            JOIN work_schedule ws ON ud.work_schedule_id = ws.id
            ORDER BY ud.unavailable_date
        `);
        return NextResponse.json({ 
            unavailableDays: unavailableDays.rows,
            count: unavailableDays.rows.length
        }, { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to fetch unavailable days" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { unavailable_date, is_confirmed } = body;

        if (!unavailable_date) {
            return NextResponse.json({ error: "Missing required field: unavailable_date" }, { status: 400 });
        }

        // Validate date format
        if (isNaN(Date.parse(unavailable_date))) {
            return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
        }

        const work_schedule_id: number = new Date(unavailable_date).getDay() + 1;

        // Check if the day is already marked as unavailable
        const existingDay = await query(
            "SELECT id FROM unavailable_days WHERE unavailable_date = $1",
            [unavailable_date]
        );

        if (existingDay.rows.length > 0) {
            return NextResponse.json({ 
                error: "Day is already marked as unavailable",
                existingId: existingDay.rows[0].id
            }, { status: 409 });
        }

        const result = await query(
            `INSERT INTO unavailable_days (work_schedule_id, unavailable_date, is_confirmed)
            VALUES ($1, $2, $3) RETURNING id, unavailable_date, is_confirmed`,
            [work_schedule_id, unavailable_date, is_confirmed || false]
        );
        
        return NextResponse.json({ 
            message: "Unavailable day created successfully", 
            unavailableDay: result.rows[0]
        }, { status: 201 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to create unavailable day" }, { status: 500 });
    }
}
