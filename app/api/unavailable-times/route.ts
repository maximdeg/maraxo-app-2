import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
    try {
        const unavailable_time_frames = await query(`
            SELECT
                utf.*
            FROM unavailable_time_frames utf
        `);
        return NextResponse.json(unavailable_time_frames.rows, { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to fetch available slots" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { workday_date, start_time, end_time } = body;

        if (!workday_date || !start_time || !end_time) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const work_schedule_id = new Date(workday_date).getDay() + 1;

        const result = await query(
            `INSERT INTO unavailable_time_frames (workday_date, start_time, end_time, work_schedule_id)
            VALUES ($1, $2, $3, $4) RETURNING id`,
            [workday_date, start_time, end_time, work_schedule_id]
        );
        return NextResponse.json({ message: "Available slot created successfully", id: result.rows[0].id }, { status: 201 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to create available slot" }, { status: 500 });
    }
}
