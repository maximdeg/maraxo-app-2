import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ date: string }> }) {
    const date = (await params).date;

    try {
        // Validate date format
        if (!date || isNaN(Date.parse(date))) {
            return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
        }

        const realDate: Date = new Date(`${date}T12:00:00.000Z`);
        const weekDay: number = realDate.getDay();

        // Check if the day is unavailable
        const workday_date = await query(
            `SELECT 
                ws.is_working_day, 
                utf.start_time,
                utf.end_time,
                ud.is_confirmed
            FROM unavailable_time_frames utf
            JOIN work_schedule ws ON utf.work_schedule_id = ws.id
            LEFT JOIN unavailable_days ud ON utf.workday_date = ud.unavailable_date
            WHERE utf.workday_date = $1`,
            [date]
        );

        if (workday_date.rows.length > 0) {
            if (workday_date.rows[0].is_working_day === false || workday_date.rows[0].is_confirmed === true) {
                return NextResponse.json({ 
                    error: "This day is unavailable",
                    reason: workday_date.rows[0].is_working_day === false ? "Not a working day" : "Day marked as unavailable"
                }, { status: 404 });
            } else {
                return NextResponse.json({
                    availableSlots: workday_date.rows,
                    date: date,
                    type: "custom_schedule"
                }, { status: 200 });
            }
        }

        // Get default available slots for the day of week
        const availableSlots = await query(
            `SELECT 
                available_slots.start_time,
                available_slots.end_time,
                ws.is_working_day
            FROM available_slots 
            JOIN work_schedule ws ON available_slots.work_schedule_id = ws.id
            WHERE work_schedule_id = $1`,
            [weekDay]
        );

        if (availableSlots.rows.length < 1) {
            return NextResponse.json({ error: "No available slots configured for this day of week" }, { status: 404 });
        }

        if (!availableSlots.rows[0].is_working_day) {
            return NextResponse.json({ error: "This day is not a working day" }, { status: 404 });
        }

        // Get existing appointments for the date
        const appointmentTimesByDate = await query(
            `SELECT 
                a.appointment_date,
                a.appointment_time
            FROM appointments a
            WHERE a.appointment_date = $1 AND a.status != 'cancelled'`,
            [date]
        );

        const appointmentTimes = appointmentTimesByDate.rows.map((item: any) => item.appointment_time);

        return NextResponse.json({ 
            availableSlots: availableSlots.rows[0], 
            appointmentTimes,
            date: date,
            type: "default_schedule"
        }, { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to fetch available times" }, { status: 500 });
    }
}

export async function PUT(_request: NextRequest, { params }: { params: Promise<{ date: string }> }) {
    const date = (await params).date;

    try {
        // Validate date format
        if (!date || isNaN(Date.parse(date))) {
            return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
        }

        const body = await _request.json();
        const { work_schedule_id, start_time, end_time, is_available } = body;

        if (!work_schedule_id || !start_time || !end_time) {
            return NextResponse.json({ error: "Missing required fields for update" }, { status: 400 });
        }

        const result = await query(
            `UPDATE available_slots SET work_schedule_id = $1, start_time = $2, end_time = $3,
             is_available = $4, updated_at = NOW() WHERE id = $5`,
            [work_schedule_id, start_time, end_time, is_available, date]
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

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ date: string }> }) {
    const date = (await params).date;

    try {
        // Validate date format
        if (!date || isNaN(Date.parse(date))) {
            return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
        }

        const result = await query("DELETE FROM available_slots WHERE workday_date = $1", [date]);
        
        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Available slot not found for deletion" }, { status: 404 });
        }
        
        return NextResponse.json({ message: "Available slot deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to delete available slot" }, { status: 500 });
    }
}
