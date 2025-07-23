import { NextResponse, NextRequest } from "next/server";
import { cancelAppointmentByToken } from "@/lib/actions";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json({ 
                error: "Token de cancelación requerido" 
            }, { status: 400 });
        }

        const result = await cancelAppointmentByToken(token);

        return NextResponse.json(result, { status: 200 });

    } catch (error: any) {
        console.error("Error cancelling appointment:", error);
        return NextResponse.json({ 
            error: error.message || "Error al cancelar la cita" 
        }, { status: 400 });
    }
} 