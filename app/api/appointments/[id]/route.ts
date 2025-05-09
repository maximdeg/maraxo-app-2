import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const appointmentId = (await params).id;

    try {
        const appointments = await query(
            `
            SELECT
                a.*,
                p.first_name as patient_first_name,
                p.last_name as patient_last_name,
                ct.name as consult_type_name,
                vt.name as visit_type_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            LEFT JOIN consult_types ct ON a.consult_type_id = ct.id
            LEFT JOIN visit_types vt ON a.visit_type_id = vt.id
            WHERE a.id = $1
        `,
            [appointmentId]
        );
        if (appointments.rows.length === 0) {
            return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
        }
        return NextResponse.json(appointments.rows[0], { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to fetch appointment" }, { status: 500 });
    }
}

export async function PUT(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const appointmentId = (await params).id;
    try {
        const body = await _request.json();
        const { patient_id, appointment_date, appointment_time, consult_type_id, visit_type_id, notes } = body;

        if (!patient_id || !appointment_date || !appointment_time) {
            return NextResponse.json({ error: "Missing required fields for update" }, { status: 400 });
        }

        const result = await query(
            `UPDATE appointments SET patient_id = $1, appointment_date = $2, appointment_time = $3,
            consult_type_id = $4, visit_type_id = $5, notes = $6, updated_at = NOW() WHERE id = $7`,
            [patient_id, appointment_date, appointment_time, consult_type_id, visit_type_id, notes, appointmentId]
        );
        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Appointment not found for update" }, { status: 404 });
        }
        return NextResponse.json({ message: "Appointment updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
    }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const appointmentId = (await params).id;

        if (!appointmentId) {
            return NextResponse.json({ error: "Missing appointment ID" }, { status: 400 });
        }

        const result = await query(`UPDATE appointments SET status = 'cancelled', updated_at = NOW() WHERE id = $1`, [appointmentId]);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Appointment not found for update" }, { status: 404 });
        }

        return NextResponse.json({ message: "Appointment cancelled successfully", id: result.rows[0].id }, { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to cancel appointment" }, { status: 500 });
    }
}
