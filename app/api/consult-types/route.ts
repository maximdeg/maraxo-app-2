import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";

// Ensure this runs in Node.js runtime, not Edge Runtime
export const runtime = 'nodejs';

export async function GET() {
    try {
        const consultTypes = await query("SELECT * FROM consult_types ORDER BY name");
        return NextResponse.json({ 
            consultTypes: consultTypes.rows,
            count: consultTypes.rows.length
        }, { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to fetch consult types" }, { status: 500 });
    }
}
