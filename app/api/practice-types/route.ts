import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Ensure this runs in Node.js runtime, not Edge Runtime
export const runtime = 'nodejs';

export async function GET() {
    try {
        const practiceTypes = await query("SELECT * FROM practice_types ORDER BY name");
        // Return as array for API consistency
        return NextResponse.json(practiceTypes.rows, { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Failed to fetch practice types" }, { status: 500 });
    }
}

