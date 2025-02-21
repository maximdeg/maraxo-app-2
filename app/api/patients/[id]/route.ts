import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const patientId = (await params).id;

    try {
        const patients = await query("SELECT * FROM patients WHERE id = $1", [patientId]);
        if (patients.rows.length === 0) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }
        return NextResponse.json(patients.rows[0], { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to fetch patient" }, { status: 500 });
    }
}

export async function PUT(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const patientId = (await params).id;

    try {
        const body = await _request.json();
        const { first_name, last_name, phone_number } = body;

        if (!first_name || !last_name || !phone_number) {
            return NextResponse.json({ error: "Missing required fields for update" }, { status: 400 });
        }

        const result = await query("UPDATE patients SET first_name = $1, last_name = $2, phone_number = $3, updated_at = NOW() WHERE id = $4", [
            first_name,
            last_name,
            phone_number,
            patientId,
        ]);
        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Patient not found for update" }, { status: 404 });
        }
        return NextResponse.json({ message: "Patient updated successfully" }, { status: 200 });
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
        const result = await query("DELETE FROM patients WHERE id = $1", [patientId]);
        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Patient not found for deletion" }, { status: 404 });
        }
        return NextResponse.json({ message: "Patient deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to delete patient" }, { status: 500 });
    }
}
