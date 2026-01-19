import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";

// Ensure this runs in Node.js runtime, not Edge Runtime
export const runtime = 'nodejs';

export async function GET() {
    try {
        const visitTypes = await query("SELECT * FROM visit_types ORDER BY name");
        // Return as array for API consistency, also include object format for backward compatibility
        return NextResponse.json(visitTypes.rows, { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to fetch visit types" }, { status: 500 });
    }
}
