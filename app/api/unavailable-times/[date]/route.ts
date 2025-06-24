import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ date: string }> }) {
    const date = (await params).date;

    try {
        // Validate date format
        if (!date || isNaN(Date.parse(date))) {
            return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
        }

        const workday_date = await query(
            `
            SELECT * FROM unavailable_time_frames WHERE workday_date = $1
        `,
            [date]
        );

        if (workday_date.rows.length === 0) {
            return NextResponse.json({ error: "No unavailable time frames found for this date" }, { status: 404 });
        }

        return NextResponse.json(workday_date.rows[0], { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to fetch unavailable time frames" }, { status: 500 });
    }
}
