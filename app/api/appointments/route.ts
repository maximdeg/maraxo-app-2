import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
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
            ORDER BY a.appointment_date, a.appointment_time
        `
        );
        return NextResponse.json(appointments.rows, { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { patient_id, appointment_date, appointment_time, consult_type_id, visit_type_id, notes } = body;

        if (!patient_id || !appointment_date || !appointment_time) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        console.log("💻", body);

        const result = await query(
            `INSERT INTO appointments (patient_id, appointment_date, appointment_time, consult_type_id, visit_type_id, notes)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING 
            id,
            appointment_date,
            appointment_time,
            consult_type_id,
            visit_type_id,
            notes;`,
            [patient_id, appointment_date, appointment_time, consult_type_id, visit_type_id, notes]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
        }

        const newAppointmentInfo = await query(
            `  SELECT 
                a.id,
                p.last_name || ', ' || p.first_name AS patient_name,
                p.phone_number,
                a.appointment_date,
                a.appointment_time,
                ct.name AS consult_type_name,
                vt.name AS visit_type_name,
                a.notes
                FROM appointments a
                JOIN patients p ON a.patient_id = p.id
                JOIN consult_types ct ON a.consult_type_id = ct.id
                JOIN visit_types vt ON a.visit_type_id = vt.id
                WHERE a.id = $1;`,
            [result.rows[0].id]
        );

        return NextResponse.json({ message: "Appointment created successfully", appointment_info: newAppointmentInfo.rows[0] }, { status: 201 });
    } catch (error: any) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: `Failed to create appointment ${error.message}` }, { status: 500 });
    }
}
