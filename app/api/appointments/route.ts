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

        const result = await query(
            `INSERT INTO appointments (patient_id, appointment_date, appointment_time, consult_type_id, visit_type_id, notes)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING 
                a.id,
                p.name AS patient_name,
                a.appointment_date,
                a.appointment_time,
                ct.name AS consult_type_name,
                vt.name AS visit_type_name,
                a.notes
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            JOIN consult_types ct ON a.consult_type_id = ct.id
            JOIN visit_types vt ON a.visit_type_id = vt.id;`,
            [patient_id, appointment_date, appointment_time, consult_type_id, visit_type_id, notes]
        );

        return NextResponse.json({ message: "Appointment created successfully", appointment_info: result.rows[0] }, { status: 201 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
    }
}
