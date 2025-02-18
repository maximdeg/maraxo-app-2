import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
    try {
        const consultTypes = await query("SELECT * FROM consult_types ORDER BY name");
        return NextResponse.json(consultTypes.rows, { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to fetch consult types" }, { status: 500 });
    }
}
