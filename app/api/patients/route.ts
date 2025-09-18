import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";

// Ensure this runs in Node.js runtime, not Edge Runtime
export const runtime = 'nodejs';

const getPatientId = async (phone_number: string) => {
    try {
        const result = await query("SELECT id FROM patients WHERE phone_number = $1", [phone_number]);

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0].id;
    } catch (error) {
        console.error("Error in getPatientId:", error);
        throw error;
    }
};

export async function GET() {
    try {
        const patients = await query("SELECT * FROM patients ORDER BY last_name, first_name");
        return NextResponse.json({ 
            patients: patients.rows,
            count: patients.rows.length
        }, { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { first_name, last_name, phone_number } = body;

        // Validate required fields
        if (!first_name || !last_name || !phone_number) {
            return NextResponse.json({ 
                error: "Missing required fields",
                required: ["first_name", "last_name", "phone_number"],
                received: Object.keys(body)
            }, { status: 400 });
        }

        // Validate phone number format (basic validation)
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        if (!phoneRegex.test(phone_number)) {
            return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
        }

        // Check if patient already exists
        const patientIdIfExists = await getPatientId(phone_number);
        if (patientIdIfExists) {
            return NextResponse.json({ 
                message: "Patient already exists", 
                id: patientIdIfExists,
                existing: true
            }, { status: 200 });
        }

        const result = await query(
            "INSERT INTO patients (first_name, last_name, phone_number) VALUES ($1, $2, $3) RETURNING id, first_name, last_name, phone_number",
            [first_name, last_name, phone_number]
        );
        
        return NextResponse.json({ 
            message: "Patient created successfully", 
            patient: result.rows[0]
        }, { status: 201 });
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
