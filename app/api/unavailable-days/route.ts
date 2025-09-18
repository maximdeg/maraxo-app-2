import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Ensure this runs in Node.js runtime, not Edge Runtime
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const { selectedDate, isDayOff } = await request.json();

        if (!selectedDate) {
            return NextResponse.json(
                { error: "Date is required" },
                { status: 400 }
            );
        }

        const formatedDate = `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`;

        // Check if record already exists
        const existingRecord = await query(
            "SELECT id FROM unavailable_days WHERE unavailable_date = $1",
            [formatedDate]
        );

        if (existingRecord.rows.length > 0) {
            // Update existing record
            await query(
                "UPDATE unavailable_days SET is_confirmed = $1 WHERE unavailable_date = $2",
                [isDayOff, formatedDate]
            );
        } else {
            // Insert new record
            await query(
                "INSERT INTO unavailable_days (unavailable_date, is_confirmed) VALUES ($1, $2)",
                [formatedDate, isDayOff]
            );
        }

        return NextResponse.json({
            success: true,
            message: isDayOff ? "Day marked as unavailable" : "Day marked as available"
        });

    } catch (error) {
        console.error('Error updating unavailable day:', error);
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
            "SELECT * FROM unavailable_days WHERE unavailable_date = $1",
            [date]
        );

        const data = result.rows[0] || { is_confirmed: false };

        return NextResponse.json(data);

    } catch (error) {
        console.error('Error fetching unavailable day:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}