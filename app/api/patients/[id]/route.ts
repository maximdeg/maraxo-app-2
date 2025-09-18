import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";

// Ensure this runs in Node.js runtime, not Edge Runtime
export const runtime = 'nodejs';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const patientId = (await params).id;

    try {
        // Validate ID format
        if (!patientId || isNaN(Number(patientId))) {
            return NextResponse.json({ error: "Invalid patient ID format" }, { status: 400 });
        }

        const patients = await query("SELECT * FROM patients WHERE id = $1", [patientId]);
        if (patients.rows.length === 0) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }
        return NextResponse.json({ patient: patients.rows[0] }, { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to fetch patient" }, { status: 500 });
    }
}

export async function PUT(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const patientId = (await params).id;
        const body = await _request.json();
        const { first_name, last_name, phone_number } = body;

        // Validate ID format
        if (!patientId || isNaN(Number(patientId))) {
            return NextResponse.json({ error: "Invalid patient ID format" }, { status: 400 });
        }

        // Validate required fields
        if (!first_name || !last_name || !phone_number) {
            return NextResponse.json({ 
                error: "Missing required fields for update",
                required: ["first_name", "last_name", "phone_number"],
                received: Object.keys(body)
            }, { status: 400 });
        }

        // Validate phone number format (basic validation)
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        if (!phoneRegex.test(phone_number)) {
            return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
        }

        // Check if patient exists
        const patientExists = await query("SELECT id FROM patients WHERE id = $1", [patientId]);
        if (patientExists.rows.length === 0) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }

        // Check if phone number is already used by another patient
        const phoneExists = await query("SELECT id FROM patients WHERE phone_number = $1 AND id != $2", [phone_number, patientId]);
        if (phoneExists.rows.length > 0) {
            return NextResponse.json({ error: "Phone number already exists for another patient" }, { status: 409 });
        }

        const result = await query(
            "UPDATE patients SET first_name = $1, last_name = $2, phone_number = $3, updated_at = NOW() WHERE id = $4 RETURNING id, first_name, last_name, phone_number",
            [first_name, last_name, phone_number, patientId]
        );
        
        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Patient not found for update" }, { status: 404 });
        }
        
        return NextResponse.json({ 
            message: "Patient updated successfully",
            patient: result.rows[0]
        }, { status: 200 });
    } catch (error) {
        if (error instanceof Error && error.message.includes('duplicate key value violates unique constraint "patients_phone_number_key"')) {
            return NextResponse.json({ error: "Phone number already exists" }, { status: 409 }); // 409 Conflict for duplicate
        }
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to update patient" }, { status: 500 });
    }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const patientId = (await params).id;

    try {
        // Validate ID format
        if (!patientId || isNaN(Number(patientId))) {
            return NextResponse.json({ error: "Invalid patient ID format" }, { status: 400 });
        }

        // Check if patient has any appointments
        const appointments = await query("SELECT id FROM appointments WHERE patient_id = $1", [patientId]);
        if (appointments.rows.length > 0) {
            return NextResponse.json({ 
                error: "Cannot delete patient with existing appointments",
                appointmentCount: appointments.rows.length
            }, { status: 409 });
        }

        const result = await query("DELETE FROM patients WHERE id = $1 RETURNING id", [patientId]);
        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Patient not found for deletion" }, { status: 404 });
        }
        
        return NextResponse.json({ 
            message: "Patient deleted successfully",
            deletedId: result.rows[0].id
        }, { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to delete patient" }, { status: 500 });
    }
}
