import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
    try {
        const workSchedule = await query("SELECT * FROM work_schedule ORDER BY day_of_week");
        return NextResponse.json(workSchedule.rows, { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to fetch work schedule" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { day_of_week, is_working_day } = body;

        if (!day_of_week) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const result = await query(
            "INSERT INTO work_schedule (day_of_week, is_working_day) VALUES ($1, $2) RETURNING id",
            [day_of_week, is_working_day]
        );
        return NextResponse.json(
            { message: "Work schedule entry created successfully", id: result.rows[0].id },
            { status: 201 }
        );
    } catch (error) {
        if (
            error instanceof Error &&
            error.message.includes('duplicate key value violates unique constraint "work_schedule_day_of_week_key"')
        ) {
            return NextResponse.json({ error: "Work schedule for this day already exists" }, { status: 409 }); // 409 Conflict for duplicate
        }
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to create work schedule entry" }, { status: 500 });
    }
}
