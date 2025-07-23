import { NextResponse, NextRequest } from "next/server";
import { getAppointmentByToken } from "@/lib/actions";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json({ 
                error: "Token de cancelación requerido" 
            }, { status: 400 });
        }

        const appointment = await getAppointmentByToken(token);

        return NextResponse.json({ 
            appointment,
            success: true
        }, { status: 200 });

    } catch (error: any) {
        console.error("Error verifying cancellation token:", error);
        return NextResponse.json({ 
            error: error.message || "Error al verificar el token de cancelación" 
        }, { status: 400 });
    }
} 