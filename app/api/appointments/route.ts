import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";
import { generateCancellationToken } from "@/lib/cancellation-token";

// Ensure this runs in Node.js runtime, not Edge Runtime
export const runtime = 'nodejs';

export async function GET() {
    try {
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
            LEFT JOIN consult_types ct ON a.consult_type_id = ct.id
            LEFT JOIN visit_types vt ON a.visit_type_id = vt.id
            LEFT JOIN practice_types pt ON a.practice_type_id = pt.id
            ORDER BY a.appointment_date, a.appointment_time
        `
        );
        return NextResponse.json({ 
            appointments: appointments.rows,
            count: appointments.rows.length
        }, { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ 
            error: "Failed to fetch appointments",
            details: errorMessage
        }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // Accept both camelCase and snake_case field names
        const patient_id = body.patient_id || body.patientId;
        const appointment_date = body.appointment_date || body.date;
        const appointment_time = body.appointment_time || body.time;
        const consult_type_id = body.consult_type_id || body.consultTypeId || body.consultType;
        const visit_type_id = body.visit_type_id || body.visitTypeId || body.visitType;
        const practice_type_id = body.practice_type_id || body.practiceTypeId || body.practiceType;
        const health_insurance = body.health_insurance || body.healthInsurance;

        // Validate required fields
        if (!patient_id || !appointment_date || !appointment_time) {
            return NextResponse.json({ 
                error: "Missing required fields",
                required: ["patient_id/patientId", "appointment_date/date", "appointment_time/time"],
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

        // Check if patient exists
        const patientExists = await query("SELECT id FROM patients WHERE id = $1", [patient_id]);
        if (patientExists.rows.length === 0) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }

        // Resolve visit_type_id from name if provided as string
        let final_visit_type_id = visit_type_id;
        if (visit_type_id && isNaN(Number(visit_type_id))) {
            const visitTypeResult = await query("SELECT id FROM visit_types WHERE name = $1", [visit_type_id]);
            if (visitTypeResult.rows.length > 0) {
                final_visit_type_id = visitTypeResult.rows[0].id;
            } else {
                return NextResponse.json({ error: `Visit type '${visit_type_id}' not found` }, { status: 404 });
            }
        }

        // Resolve consult_type_id from name if provided as string
        let final_consult_type_id = consult_type_id;
        if (consult_type_id && isNaN(Number(consult_type_id))) {
            const consultTypeResult = await query("SELECT id FROM consult_types WHERE name = $1", [consult_type_id]);
            if (consultTypeResult.rows.length > 0) {
                final_consult_type_id = consultTypeResult.rows[0].id;
            } else {
                return NextResponse.json({ error: `Consult type '${consult_type_id}' not found` }, { status: 404 });
            }
        }

        // Resolve practice_type_id from name if provided as string
        let final_practice_type_id = practice_type_id;
        if (practice_type_id && isNaN(Number(practice_type_id))) {
            const practiceTypeResult = await query("SELECT id FROM practice_types WHERE name = $1", [practice_type_id]);
            if (practiceTypeResult.rows.length > 0) {
                final_practice_type_id = practiceTypeResult.rows[0].id;
            } else {
                // Practice type is optional, so set to null if not found
                final_practice_type_id = null;
            }
        }

        // Check if appointment already exists for this patient, date, and time
        const existingAppointment = await query(
            "SELECT id FROM appointments WHERE patient_id = $1 AND appointment_date = $2 AND appointment_time = $3 AND status != 'cancelled'",
            [patient_id, appointment_date, appointment_time]
        );

        if (existingAppointment.rows.length > 0) {
            return NextResponse.json({ 
                error: "Appointment already exists for this patient, date, and time",
                existingId: existingAppointment.rows[0].id
            }, { status: 409 });
        }

        // Get patient phone number for token generation
        const patientInfo = await query(
            "SELECT phone_number FROM patients WHERE id = $1",
            [patient_id]
        );

        if (patientInfo.rows.length === 0) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }

        const patientPhone = patientInfo.rows[0].phone_number;

        // Generate initial cancellation token
        const initialToken = generateCancellationToken({
            appointmentId: '', // Will be updated after creation
            patientId: patient_id.toString(),
            patientPhone: patientPhone,
            appointmentDate: appointment_date,
            appointmentTime: appointment_time,
        });

        const result = await query(
            `INSERT INTO appointments (patient_id, appointment_date, appointment_time, consult_type_id, visit_type_id, practice_type_id, health_insurance, cancellation_token)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING 
            id,
            appointment_date,
            appointment_time,
            consult_type_id,
            visit_type_id,
            practice_type_id,
            health_insurance;`,
            [patient_id, appointment_date, appointment_time, final_consult_type_id || null, final_visit_type_id || null, final_practice_type_id || null, health_insurance || null, initialToken]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
        }

        // Update the token with the actual appointment ID
        const finalToken = generateCancellationToken({
            appointmentId: result.rows[0].id.toString(),
            patientId: patient_id.toString(),
            patientPhone: patientPhone,
            appointmentDate: appointment_date,
            appointmentTime: appointment_time,
        });

        // Update the appointment with the final token
        await query(
            `UPDATE appointments SET cancellation_token = $1 WHERE id = $2`,
            [finalToken, result.rows[0].id]
        );

        const newAppointmentInfo = await query(
            `  SELECT 
                a.id,
                p.last_name || ', ' || p.first_name AS patient_name,
                p.phone_number,
                a.appointment_date,
                a.appointment_time,
                ct.name AS consult_type_name,
                vt.name AS visit_type_name,
                pt.name AS practice_type_name,
                a.health_insurance,
                a.cancellation_token
                FROM appointments a
                JOIN patients p ON a.patient_id = p.id
                LEFT JOIN consult_types ct ON a.consult_type_id = ct.id
                LEFT JOIN visit_types vt ON a.visit_type_id = vt.id
                LEFT JOIN practice_types pt ON a.practice_type_id = pt.id
                WHERE a.id = $1;`,
            [result.rows[0].id]
        );

        const appointmentData = newAppointmentInfo.rows[0];
        
        return NextResponse.json({ 
            message: "Appointment created successfully", 
            id: appointmentData.id,
            appointment: appointmentData,
            appointment_info: appointmentData
        }, { status: 201 });
    } catch (error: any) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: `Failed to create appointment: ${error.message}` }, { status: 500 });
    }
}
