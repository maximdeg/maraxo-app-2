import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
    try {
        const unavailableSlots = await query(`
            SELECT ud.unavailable_date, ud.is_confirmed, ws.day_of_week as day
            FROM unavailable_days ud
            JOIN work_schedule ws ON ud.work_schedule_id = ws.id
            ORDER BY ud.unavailable_date
        `);
        return NextResponse.json(unavailableSlots.rows, { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to fetch available slots" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { work_schedule_id, unavailable_date, is_confirmed } = body;

        if (!work_schedule_id || !unavailable_date) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const result = await query(
            `INSERT INTO unavailable_days (work_schedule_id, unavailable_date, is_confirmed)
            VALUES ($1, $2, $3) RETURNING id`,
            [work_schedule_id, unavailable_date, is_confirmed]
        );
        return NextResponse.json({ message: "Available slot created successfully", id: result.rows[0].id }, { status: 201 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to create available slot" }, { status: 500 });
    }
}
