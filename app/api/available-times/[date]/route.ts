import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ date: string }> }) {
    const date = (await params).date;

    const realDate: Date = new Date(`${date}T12:00:00.000Z`);
    const dateId: number = realDate.getDay();

    try {
        const workday_date = await query(
            `
                SELECT * FROM available_slots WHERE work_schedule_id = $1
            `,
            [dateId]
        );
        return NextResponse.json(workday_date.rows, { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to fetch available slot" }, { status: 500 });
    }
}

export async function PUT(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const slotId = (await params).id;

    try {
        const body = await _request.json();
        const { work_schedule_id, start_time, end_time, is_available } = body;

        if (!work_schedule_id || !start_time || !end_time) {
            return NextResponse.json({ error: "Missing required fields for update" }, { status: 400 });
        }

        const result = await query(
            `UPDATE available_slots SET work_schedule_id = $1, start_time = $2, end_time = $3,
             is_available = $4, updated_at = NOW() WHERE id = $5`,
            [work_schedule_id, start_time, end_time, is_available, slotId]
        );
        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Available slot not found for update" }, { status: 404 });
        }
        return NextResponse.json({ message: "Available slot updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to update available slot" }, { status: 500 });
    }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const slotId = (await params).id;

    try {
        const result = await query("DELETE FROM available_slots WHERE id = $1", [slotId]);
        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Available slot not found for deletion" }, { status: 404 });
        }
        return NextResponse.json({ message: "Available slot deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to delete available slot" }, { status: 500 });
    }
}
