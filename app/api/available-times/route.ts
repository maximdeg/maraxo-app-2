import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
    try {
        const availableSlots = await query(`
            SELECT
                asl.*,
                ws.day_of_week
            FROM available_slots asl
            JOIN work_schedule ws ON asl.work_schedule_id = ws.id
            ORDER BY ws.day_of_week, asl.start_time
        `);
        return NextResponse.json(availableSlots.rows, { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to fetch available slots" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { work_schedule_id, start_time, end_time, is_available } = body;

        if (!work_schedule_id || !start_time || !end_time) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const result = await query(
            `INSERT INTO available_slots (work_schedule_id, start_time, end_time, is_available)
             VALUES ($1, $2, $3, $4) RETURNING id`,
            [work_schedule_id, start_time, end_time, is_available]
        );
        return NextResponse.json(
            { message: "Available slot created successfully", id: result.rows[0].id },
            { status: 201 }
        );
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to create available slot" }, { status: 500 });
    }
}
