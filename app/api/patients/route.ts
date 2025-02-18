import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";

// --- GET: /api/patients ---
export async function GET() {
    try {
        const patients = await query("SELECT * FROM patients ORDER BY last_name, first_name");
        return NextResponse.json(patients.rows, { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 });
    }
}

// --- POST: /api/patients ---
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { first_name, last_name, phone_number } = body;

        if (!first_name || !last_name || !phone_number) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const result = await query(
            "INSERT INTO patients (first_name, last_name, phone_number) VALUES ($1, $2, $3) RETURNING id",
            [first_name, last_name, phone_number]
        );
        return NextResponse.json({ message: "Patient created successfully", id: result.rows[0].id }, { status: 201 });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message.includes('duplicate key value violates unique constraint "patients_phone_number_key"')
        ) {
            return NextResponse.json({ error: "Phone number already exists" }, { status: 409 }); // 409 Conflict for duplicate
        }
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to create patient" }, { status: 500 });
    }
}
