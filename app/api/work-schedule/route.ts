import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";

// Ensure this runs in Node.js runtime, not Edge Runtime
export const runtime = 'nodejs';

export async function GET() {
    try {
        const workSchedule = await query("SELECT * FROM work_schedule ORDER BY day_of_week");
        return NextResponse.json(workSchedule.rows, { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to fetch work schedule" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { day_of_week, is_working_day } = body;

        if (!day_of_week) {
            return NextResponse.json({ 
                error: "Missing required field: day_of_week",
                required: ["day_of_week"],
                optional: ["is_working_day"]
            }, { status: 400 });
        }

        // Validate day_of_week format (should be 0-6 or day name)
        const validDays = ['0', '1', '2', '3', '4', '5', '6', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        if (!validDays.includes(String(day_of_week))) {
            return NextResponse.json({ 
                error: "Invalid day_of_week. Must be 0-6 or day name (Monday-Sunday)" 
            }, { status: 400 });
        }

        // Default is_working_day to true if not provided
        const workingDay = is_working_day !== undefined ? is_working_day : true;

        const result = await query(
            "INSERT INTO work_schedule (day_of_week, is_working_day) VALUES ($1, $2) RETURNING id",
            [day_of_week, workingDay]
        );
        return NextResponse.json(
            { 
                message: "Work schedule entry created successfully", 
                id: result.rows[0].id,
                day_of_week,
                is_working_day: workingDay
            },
            { status: 201 }
        );
    } catch (error) {
        if (
            error instanceof Error &&
            error.message.includes('duplicate key value violates unique constraint "work_schedule_day_of_week_key"')
        ) {
            return NextResponse.json({ error: "Work schedule for this day already exists" }, { status: 409 }); // 409 Conflict for duplicate
        }
        console.error("Database query error:", error);
        return NextResponse.json({ 
            error: "Failed to create work schedule entry",
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
