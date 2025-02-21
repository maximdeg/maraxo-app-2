import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const scheduleId = (await params).id;

    try {
        const workSchedule = await query("SELECT * FROM work_schedule WHERE id = $1", [scheduleId]);
        if (workSchedule.rows.length === 0) {
            return NextResponse.json({ error: "Work schedule entry not found" }, { status: 404 });
        }
        return NextResponse.json(workSchedule.rows[0], { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to fetch work schedule entry" }, { status: 500 });
    }
}

export async function PUT(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const scheduleId = (await params).id;

    try {
        const body = await _request.json();
        const { day_of_week, is_working_day } = body;

        if (!day_of_week) {
            return NextResponse.json({ error: "Missing required fields for update" }, { status: 400 });
        }

        const result = await query("UPDATE work_schedule SET day_of_week = $1, is_working_day = $2, updated_at = NOW() WHERE id = $3", [
            day_of_week,
            is_working_day,
            scheduleId,
        ]);
        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Work schedule entry not found for update" }, { status: 404 });
        }
        return NextResponse.json({ message: "Work schedule entry updated successfully" }, { status: 200 });
    } catch (error) {
        if (error instanceof Error && error.message.includes('duplicate key value violates unique constraint "work_schedule_day_of_week_key"')) {
            return NextResponse.json({ error: "Work schedule for this day already exists" }, { status: 409 }); // 409 Conflict for duplicate
        }
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to update work schedule entry" }, { status: 500 });
    }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const scheduleId = (await params).id;

    try {
        const result = await query("DELETE FROM work_schedule WHERE id = $1", [scheduleId]);
        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Work schedule entry not found for deletion" }, { status: 404 });
        }
        return NextResponse.json({ message: "Work schedule entry deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to delete work schedule entry" }, { status: 500 });
    }
}
