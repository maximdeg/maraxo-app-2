import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ date: string }> }) {
    const appointmentsDate = (await params).date;

    try {
        // Validate date format
        if (!appointmentsDate || isNaN(Date.parse(appointmentsDate))) {
            return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
        }

        const appointments = await query(
            `
            SELECT
                a.id,
                a.appointment_date,
                a.patient_id,
                a.appointment_time,
                a.status,
                p.first_name as patient_first_name,
                a.health_insurance as patient_health_insurance,
                p.last_name as patient_last_name,
                vt.name as visit_type_name,
                ct.name as consult_type_name,
                pt.name as practice_type_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            LEFT JOIN visit_types vt ON a.visit_type_id = vt.id
            LEFT JOIN consult_types ct ON a.consult_type_id = ct.id
            LEFT JOIN practice_types pt ON a.practice_type_id = pt.id
            WHERE a.appointment_date = $1
            ORDER BY a.appointment_time
        `,
            [appointmentsDate]
        );
        
        return NextResponse.json({ 
            appointments: appointments.rows,
            count: appointments.rows.length,
            date: appointmentsDate
        }, { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to fetch appointments for the specified date" }, { status: 500 });
    }
}
