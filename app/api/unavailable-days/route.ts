import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Ensure this runs in Node.js runtime, not Edge Runtime
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { selectedDate, unavailable_date, isDayOff, is_confirmed } = body;

        // Accept both selectedDate (Date object) and unavailable_date (string)
        let dateToUse: string;
        if (unavailable_date) {
            // If unavailable_date is provided as string (YYYY-MM-DD format)
            dateToUse = unavailable_date;
        } else if (selectedDate) {
            // If selectedDate is provided as Date object or string
            if (typeof selectedDate === 'string') {
                dateToUse = selectedDate;
            } else {
                // Date object
                const date = new Date(selectedDate);
                dateToUse = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            }
        } else {
            return NextResponse.json(
                { error: "Date is required (provide 'unavailable_date' or 'selectedDate')" },
                { status: 400 }
            );
        }

        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateToUse)) {
            return NextResponse.json(
                { error: "Invalid date format. Expected YYYY-MM-DD" },
                { status: 400 }
            );
        }

        // Use is_confirmed if provided, otherwise use isDayOff, default to true
        const confirmed = is_confirmed !== undefined ? is_confirmed : (isDayOff !== undefined ? isDayOff : true);

        // Check if record already exists
        const existingRecord = await query(
            "SELECT id FROM unavailable_days WHERE unavailable_date = $1",
            [dateToUse]
        );

        if (existingRecord.rows.length > 0) {
            // Update existing record
            await query(
                "UPDATE unavailable_days SET is_confirmed = $1 WHERE unavailable_date = $2",
                [confirmed, dateToUse]
            );
        } else {
            // Insert new record
            await query(
                "INSERT INTO unavailable_days (unavailable_date, is_confirmed) VALUES ($1, $2)",
                [dateToUse, confirmed]
            );
        }

        return NextResponse.json({
            success: true,
            message: confirmed ? "Day marked as unavailable" : "Day marked as available",
            unavailable_date: dateToUse,
            is_confirmed: confirmed
        }, { status: 201 });

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