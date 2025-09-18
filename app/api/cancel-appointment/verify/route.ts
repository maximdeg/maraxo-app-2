import { NextResponse, NextRequest } from "next/server";
// import { getAppointmentByToken } from "@/lib/actions"; // Replaced with direct implementation
import { query } from "@/lib/db";
import { verifyCancellationToken, isCancellationAllowed } from "@/lib/cancellation-token";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json({ 
                error: "Token de cancelación requerido" 
            }, { status: 400 });
        }

        // Verify the cancellation token
        const decoded = verifyCancellationToken(token);
        if (!decoded) {
            return NextResponse.json({ 
                error: "Token de cancelación inválido o expirado" 
            }, { status: 400 });
        }

        // Get appointment details
        const result = await query(
            `SELECT 
                a.id, 
                a.appointment_date, 
                a.appointment_time, 
                a.status,
                p.first_name, 
                p.last_name, 
                p.phone_number
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            WHERE a.id = $1`,
            [decoded.appointmentId]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ 
                error: "Cita no encontrada" 
            }, { status: 404 });
        }

        const appointment = result.rows[0];

        // Check if cancellation is allowed
        const canCancel = isCancellationAllowed(decoded);

        return NextResponse.json({ 
            appointment: {
                ...appointment,
                canCancel
            },
            success: true
        }, { status: 200 });

    } catch (error: any) {
        console.error("Error verifying cancellation token:", error);
        return NextResponse.json({ 
            error: error.message || "Error al verificar el token de cancelación" 
        }, { status: 400 });
    }
} 