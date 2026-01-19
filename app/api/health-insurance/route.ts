import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

// Ensure this runs in Node.js runtime, not Edge Runtime
export const runtime = 'nodejs';

export async function GET() {
    try {
        const filePath = join(process.cwd(), 'data', 'obras-sociales.json');
        const fileContent = readFileSync(filePath, 'utf-8');
        const healthInsuranceData = JSON.parse(fileContent);
        
        // Normalize the data structure - ensure consistent format
        const normalizedData = healthInsuranceData.map((item: any, index: number) => ({
            id: index + 1,
            name: item.name,
            price: item.price || null, // Keep as string or null (e.g., "$25.000" or null)
            price_numeric: item.price ? parseFloat(item.price.replace(/[^0-9.]/g, '')) : null, // Extract numeric value for convenience
            notes: item.notes || null,
            pricing: item.price || null // Alias for backward compatibility
        }));
        
        return NextResponse.json(normalizedData, { status: 200 });
    } catch (error) {
        console.error("Error reading health insurance data:", error);
        return NextResponse.json(
            { error: "Failed to load health insurance data" }, 
            { status: 500 }
        );
    }
} 