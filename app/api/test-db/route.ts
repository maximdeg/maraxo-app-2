import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        console.log("🟠 Trying to connect to database...");
        const results = await query('SELECT 1 + 1 AS result');
        console.log("🟢 Connected to database");
        return NextResponse.json({ connection: 'success', result: results.rows }, { status: 200 });
    } catch (error) {
        console.error('🔴 Database connection error:', error);
        return NextResponse.json({ connection: 'failed', error: error }, { status: 500 });
    }
}


// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     try {
//         const results = await query('SELECT 1 + 1 AS result');
//         res.status(200).json({ connection: 'success', result: results.rows }); // Access rows from pg result
//         console.log("🟢 Conected to database");
//     } catch (error) {
//         console.error('🔴 Database connection error:', error);
//         res.status(500).json({ connection: 'failed', error: error });
//     }
// }

