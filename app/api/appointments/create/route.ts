import { NextRequest, NextResponse } from 'next/server';
import { NewAppointmentInfo } from '@/lib/types';
import { query } from '@/lib/db';
import { generateCancellationToken } from '@/lib/cancellation-token';

// Ensure this runs in Node.js runtime, not Edge Runtime
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const appointment: NewAppointmentInfo = await request.json();

        // Validate required fields
        if (!appointment.first_name || !appointment.last_name || !appointment.phone_number) {
            return NextResponse.json(
                { error: "Missing required patient information" },
                { status: 400 }
            );
        }

        // First, check if a patient with this phone number already exists
        const existingPatient = await query(
            "SELECT id, first_name, last_name, phone_number FROM patients WHERE phone_number = $1",
            [appointment.phone_number]
        );

        let patientId: number;
        let isExistingPatient = false;

        if (existingPatient.rows.length > 0) {
            // Patient already exists, use their ID
            patientId = existingPatient.rows[0].id;
            isExistingPatient = true;
            console.log(`Patient with phone ${appointment.phone_number} already exists with ID: ${patientId}`);
        } else {
            // Create new patient
            const patientResult = await query(
                "INSERT INTO patients (first_name, last_name, phone_number) VALUES ($1, $2, $3) RETURNING id, first_name, last_name, phone_number",
                [appointment.first_name, appointment.last_name, appointment.phone_number]
            );
            patientId = patientResult.rows[0].id;
            console.log(`New patient created with ID: ${patientId}`);
        }

        if (!patientId) {
            return NextResponse.json(
                { error: "Server could not process patient ID" },
                { status: 500 }
            );
        }

        // Check if appointment already exists for this patient, date, and time
        const existingAppointment = await query(
            "SELECT id FROM appointments WHERE patient_id = $1 AND appointment_date = $2 AND appointment_time = $3 AND status != 'cancelled'",
            [patientId, appointment.appointment_date, appointment.appointment_time]
        );

        if (existingAppointment.rows.length > 0) {
            return NextResponse.json(
                { error: "Appointment already exists for this patient, date, and time" },
                { status: 409 }
            );
        }

        // Generate cancellation token
        const appointmentDate = new Date(appointment.appointment_date);
        const cancellationToken = generateCancellationToken({
            appointmentId: '', // Will be set after appointment creation
            patientId: patientId.toString(),
            patientPhone: appointment.phone_number,
            appointmentDate: appointmentDate.toISOString().split('T')[0],
            appointmentTime: appointment.appointment_time
        });

        // Create the appointment
        const appointmentResult = await query(
            `INSERT INTO appointments (
                patient_id, 
                appointment_date, 
                appointment_time, 
                consult_type_id, 
                visit_type_id, 
                practice_type_id, 
                health_insurance, 
                status,
                cancellation_token
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            RETURNING id, appointment_date, appointment_time, status, cancellation_token`,
            [
                patientId,
                appointment.appointment_date,
                appointment.appointment_time,
                appointment.consult_type_id || null,
                appointment.visit_type_id,
                appointment.practice_type_id || null,
                appointment.health_insurance || null,
                'scheduled',
                cancellationToken
            ]
        );

        const newAppointment = appointmentResult.rows[0];

        // Update the cancellation token with the actual appointment ID
        const updatedCancellationToken = generateCancellationToken({
            appointmentId: newAppointment.id.toString(),
            patientId: patientId.toString(),
            patientPhone: appointment.phone_number,
            appointmentDate: appointmentDate.toISOString().split('T')[0],
            appointmentTime: appointment.appointment_time
        });

        // Update the appointment with the correct cancellation token
        await query(
            "UPDATE appointments SET cancellation_token = $1 WHERE id = $2",
            [updatedCancellationToken, newAppointment.id]
        );

        // Get the patient information
        const patientInfo = await query(
            "SELECT first_name, last_name, phone_number FROM patients WHERE id = $1",
            [patientId]
        );

        // Get visit type name
        const visitTypeInfo = await query(
            "SELECT name FROM visit_types WHERE id = $1",
            [appointment.visit_type_id]
        );

        // Get consult type name if applicable
        let consultTypeInfo = null;
        if (appointment.consult_type_id) {
            consultTypeInfo = await query(
                "SELECT name FROM consult_types WHERE id = $1",
                [appointment.consult_type_id]
            );
        }

        // Get practice type name if applicable
        let practiceTypeInfo = null;
        if (appointment.practice_type_id) {
            practiceTypeInfo = await query(
                "SELECT name FROM practice_types WHERE id = $1",
                [appointment.practice_type_id]
            );
        }

        const appointment_info = {
            id: newAppointment.id,
            patient_id: patientId,
            patient_name: `${patientInfo.rows[0].first_name} ${patientInfo.rows[0].last_name}`,
            phone_number: patientInfo.rows[0].phone_number,
            visit_type_name: visitTypeInfo.rows[0]?.name || 'Unknown',
            consult_type_name: consultTypeInfo?.rows[0]?.name || null,
            practice_type_name: practiceTypeInfo?.rows[0]?.name || null,
            appointment_date: newAppointment.appointment_date,
            appointment_time: newAppointment.appointment_time,
            cancellation_token: updatedCancellationToken
        };

        return NextResponse.json({
            success: true,
            appointment_info,
            patient_id: patientId,
            is_existing_patient: isExistingPatient,
            message: isExistingPatient 
                ? "Appointment scheduled successfully for existing patient."
                : "Appointment scheduled successfully for new patient."
        });

    } catch (error) {
        console.error('Error creating appointment:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

