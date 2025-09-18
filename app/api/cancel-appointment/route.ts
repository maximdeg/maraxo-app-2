import { NextResponse, NextRequest } from "next/server";
// import { cancelAppointmentByToken } from "@/lib/actions"; // Replaced with direct implementation
import { query } from "@/lib/db";
import { verifyCancellationToken, isCancellationAllowed } from "@/lib/cancellation-token";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token } = body;

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

        // Check if cancellation is allowed
        const canCancel = isCancellationAllowed(decoded.appointmentDate, decoded.appointmentTime);
        if (!canCancel) {
            return NextResponse.json({
                error: "No se puede cancelar la cita. Debe cancelar al menos 12 horas antes de la cita."
            }, { status: 400 });
        }

        // Update the appointment status to cancelled
        const result = await query(
            "UPDATE appointments SET status = 'cancelled' WHERE id = $1 RETURNING id, status",
            [decoded.appointmentId]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ 
                error: "Cita no encontrada" 
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Cita cancelada exitosamente",
            appointmentId: result.rows[0].id
        }, { status: 200 });

    } catch (error: any) {
        console.error("Error cancelling appointment:", error);
        return NextResponse.json({ 
            error: error.message || "Error al cancelar la cita" 
        }, { status: 400 });
    }
} 