import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const appointmentId = (await params).id;

    try {
        // Validate ID format
        if (!appointmentId || isNaN(Number(appointmentId))) {
            return NextResponse.json({ error: "Invalid appointment ID format" }, { status: 400 });
        }

        const appointments = await query(
            `
            SELECT
                a.*,
                p.first_name as patient_first_name,
                p.last_name as patient_last_name,
                ct.name as consult_type_name,
                vt.name as visit_type_name,
                pt.name as practice_type_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            LEFT JOIN visit_types vt ON a.visit_type_id = vt.id
            LEFT JOIN consult_types ct ON a.consult_type_id = ct.id
            LEFT JOIN practice_types pt ON a.practice_type_id = pt.id
            WHERE a.id = $1
        `,
            [appointmentId]
        );
        
        if (appointments.rows.length === 0) {
            return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
        }
        
        return NextResponse.json({ appointment: appointments.rows[0] }, { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to fetch appointment" }, { status: 500 });
    }
}

export async function PUT(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const appointmentId = (await params).id;
    
    try {
        // Validate ID format
        if (!appointmentId || isNaN(Number(appointmentId))) {
            return NextResponse.json({ error: "Invalid appointment ID format" }, { status: 400 });
        }

        const body = await _request.json();
        const { patient_id, appointment_date, appointment_time, consult_type_id, visit_type_id, practice_type_id, notes } = body;

        // Validate required fields
        if (!patient_id || !appointment_date || !appointment_time) {
            return NextResponse.json({ 
                error: "Missing required fields for update",
                required: ["patient_id", "appointment_date", "appointment_time"],
                received: Object.keys(body)
            }, { status: 400 });
        }

        // Validate date format
        if (isNaN(Date.parse(appointment_date))) {
            return NextResponse.json({ error: "Invalid appointment date format" }, { status: 400 });
        }

        // Validate time format (basic validation)
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(appointment_time)) {
            return NextResponse.json({ error: "Invalid appointment time format. Use HH:MM format" }, { status: 400 });
        }

        // Check if appointment exists
        const appointmentExists = await query("SELECT id FROM appointments WHERE id = $1", [appointmentId]);
        if (appointmentExists.rows.length === 0) {
            return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
        }

        // Check if patient exists
        const patientExists = await query("SELECT id FROM patients WHERE id = $1", [patient_id]);
        if (patientExists.rows.length === 0) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }

        // Check if appointment already exists for this patient, date, and time (excluding current appointment)
        const existingAppointment = await query(
            "SELECT id FROM appointments WHERE patient_id = $1 AND appointment_date = $2 AND appointment_time = $3 AND id != $4 AND status != 'cancelled'",
            [patient_id, appointment_date, appointment_time, appointmentId]
        );

        if (existingAppointment.rows.length > 0) {
            return NextResponse.json({ 
                error: "Appointment already exists for this patient, date, and time",
                existingId: existingAppointment.rows[0].id
            }, { status: 409 });
        }

        const result = await query(
            `UPDATE appointments SET patient_id = $1, appointment_date = $2, appointment_time = $3,
            consult_type_id = $4, visit_type_id = $5, practice_type_id = $7, notes = $7,  updated_at = NOW() WHERE id = $7 RETURNING id`,
            [patient_id, appointment_date, appointment_time, consult_type_id, visit_type_id, practice_type_id, notes, appointmentId]
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

        // Validate ID format
        if (!appointmentId || isNaN(Number(appointmentId))) {
            return NextResponse.json({ error: "Invalid appointment ID format" }, { status: 400 });
        }

        // Check if appointment exists
        const appointmentExists = await query("SELECT id, status FROM appointments WHERE id = $1", [appointmentId]);
        if (appointmentExists.rows.length === 0) {
            return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
        }

        if (appointmentExists.rows[0].status === 'cancelled') {
            return NextResponse.json({ error: "Appointment is already cancelled" }, { status: 409 });
        }

        const result = await query(
            `UPDATE appointments SET status = 'cancelled', updated_at = NOW() WHERE id = $1 RETURNING id`,
            [appointmentId]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Appointment not found for cancellation" }, { status: 404 });
        }

        return NextResponse.json({ 
            message: "Appointment cancelled successfully", 
            cancelledId: result.rows[0].id 
        }, { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to cancel appointment" }, { status: 500 });
    }
}
