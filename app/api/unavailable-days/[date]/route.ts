import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ date: string }> }) {
    const date = (await params).date;
    
    try {
        // Validate date format
        if (!date || isNaN(Date.parse(date))) {
            return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
        }

        const unavailableDay = await query(
            `
            SELECT * FROM unavailable_days WHERE unavailable_date = $1
        `,
            [date]
        );
        
        if (unavailableDay.rows.length === 0) {
            return NextResponse.json({ error: "No unavailable day found for this date" }, { status: 404 });
        }
        
        return NextResponse.json(unavailableDay.rows[0], { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to fetch unavailable day" }, { status: 500 });
    }
}
