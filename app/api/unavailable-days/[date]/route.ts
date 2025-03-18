import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ date: string }> }) {
    const date = (await params).date;
    try {
        const unavailableDay = await query(
            `
            SELECT * FROM unavailable_days WHERE unavailable_date = $1
        `,
            [date]
        );
        return NextResponse.json(unavailableDay.rows[0], { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to fetch available slots" }, { status: 500 });
    }
}
