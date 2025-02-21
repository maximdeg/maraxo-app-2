import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";

export async function GET(_request: NextRequest, { params }: { params: Promise<any> }) {
    const appointmentsDate = (await params).date;

    try {
        const appointments = await query(
            `
            SELECT
                a.id,
                a.appointment_date,
                a.patient_id,
                a.appointment_time,
                a.status,
                p.first_name as patient_first_name,
                p.last_name as patient_last_name,
                vt.name as visit_type_name,
                ct.name as consult_type_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            LEFT JOIN consult_types ct ON a.consult_type_id = ct.id
            LEFT JOIN visit_types vt ON a.visit_type_id = vt.id
            WHERE a.appointment_date = $1
        `,
            [appointmentsDate]
        );
        if (appointments.rows.length === 0) {
            return NextResponse.json({ error: "No appointments on this date" }, { status: 404 });
        }
        return NextResponse.json(appointments.rows, { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to fetch day" }, { status: 500 });
    }
}
