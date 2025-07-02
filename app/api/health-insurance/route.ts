import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
    try {
        const filePath = join(process.cwd(), 'data', 'obras-sociales.json');
        const fileContent = readFileSync(filePath, 'utf-8');
        const healthInsuranceData = JSON.parse(fileContent);
        
        return NextResponse.json(healthInsuranceData, { status: 200 });
    } catch (error) {
        console.error("Error reading health insurance data:", error);
        return NextResponse.json(
            { error: "Failed to load health insurance data" }, 
            { status: 500 }
        );
    }
} 