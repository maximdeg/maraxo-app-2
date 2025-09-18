import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Ensure this runs in Node.js runtime, not Edge Runtime
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const { selectedDate, start_time, end_time } = await request.json();

        if (!selectedDate || !start_time || !end_time) {
            return NextResponse.json(
                { error: "Date, start_time, and end_time are required" },
                { status: 400 }
            );
        }

        const formatedDate = `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`;

        // Check if record already exists
        const existingRecord = await query(
            "SELECT id FROM unavailable_time_frames WHERE workday_date = $1 AND start_time = $2 AND end_time = $3",
            [formatedDate, start_time, end_time]
        );

        if (existingRecord.rows.length === 0) {
            // Insert new record
            await query(
                "INSERT INTO unavailable_time_frames (workday_date, start_time, end_time) VALUES ($1, $2, $3)",
                [formatedDate, start_time, end_time]
            );
        }

        return NextResponse.json({
            success: true,
            message: "Unavailable time slot added successfully"
        });

    } catch (error) {
        console.error('Error adding unavailable time:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');

        if (!date) {
            return NextResponse.json(
                { error: "Date parameter is required" },
                { status: 400 }
            );
        }

        const result = await query(
            "SELECT * FROM unavailable_time_frames WHERE workday_date = $1",
            [date]
        );

        return NextResponse.json(result.rows);

    } catch (error) {
        console.error('Error fetching unavailable times:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}