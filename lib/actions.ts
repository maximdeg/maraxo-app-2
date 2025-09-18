"use server";

import { NewAppointmentInfo } from "./types";
import { query } from "./db";
import { generateCancellationToken, verifyCancellationToken, isCancellationAllowed } from "./cancellation-token";

export const getAppointments = async (date: string) => {
    try {
        // Direct database query instead of HTTP request to avoid circular dependency
        const appointments = await query(
            `
            SELECT
                a.id,
                a.appointment_date,
                a.patient_id,
                a.appointment_time,
                a.status,
                p.first_name as patient_first_name,
                a.health_insurance as patient_health_insurance,
                p.last_name as patient_last_name,
                vt.name as visit_type_name,
                ct.name as consult_type_name,
                pt.name as practice_type_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            LEFT JOIN visit_types vt ON a.visit_type_id = vt.id
            LEFT JOIN consult_types ct ON a.consult_type_id = ct.id
            LEFT JOIN practice_types pt ON a.practice_type_id = pt.id
            WHERE a.appointment_date = $1
            ORDER BY a.appointment_time
        `,
            [date]
        );
        
        return appointments.rows;
    } catch (error) {
        console.error("Error in getAppointments:", error);
        throw error;
    }
};

export const getUnavailableDay = async (date: string) => {
    try {
        // Direct database query instead of HTTP request
        const unavailableDay = await query(
            `
            SELECT * FROM unavailable_days WHERE unavailable_date = $1
        `,
            [date]
        );
        
        if (unavailableDay.rows.length === 0) {
            return null;
        }
        
        return unavailableDay.rows[0];
    } catch (error) {
        console.error("Error in getUnavailableDay:", error);
        throw error;
    }
};

export const addUnavailableDay = async (unavailable_date: Date, is_confirmed: boolean): Promise<any> => {
    try {
        // Direct database query instead of HTTP request
        const result = await query(
            "INSERT INTO unavailable_days (unavailable_date, is_confirmed) VALUES ($1, $2) RETURNING *",
            [unavailable_date, is_confirmed]
        );
        
        return result.rows[0];
    } catch (error) {
        console.error("Error in addUnavailableDay:", error);
        throw error;
    }
};

export const addUnavailableTime = async (workday_date: Date, start_time: string, end_time: string): Promise<any> => {
    try {
        // Direct database query instead of HTTP request
        const result = await query(
            "INSERT INTO unavailable_time_frames (workday_date, start_time, end_time) VALUES ($1, $2, $3) RETURNING *",
            [workday_date, start_time, end_time]
        );
        
        return result.rows[0];
    } catch (error) {
        console.error("Error in addUnavailableTime:", error);
        throw error;
    }
};

export const addNewPatientAndAppointment = async ({ appointment }: { appointment: NewAppointmentInfo }) => {
    try {
        if (!appointment.first_name || !appointment.last_name || !appointment.phone_number) {
            throw new Error("Missing required patient information");
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
            throw new Error("Server could not process patient ID");
        }

        // Check if appointment already exists for this patient, date, and time
        const existingAppointment = await query(
            "SELECT id FROM appointments WHERE patient_id = $1 AND appointment_date = $2 AND appointment_time = $3 AND status != 'cancelled'",
            [patientId, appointment.appointment_date, appointment.appointment_time]
        );

        if (existingAppointment.rows.length > 0) {
            throw new Error("Appointment already exists for this patient, date, and time");
        }

        // Generate cancellation token
        const cancellationToken = generateCancellationToken({
            appointmentId: '', // Will be set after appointment creation
            patientId: patientId.toString(),
            patientPhone: appointment.phone_number,
            appointmentDate: appointment.appointment_date,
            appointmentTime: appointment.appointment_time,
        });

        // Direct database query for appointment creation
        const appointmentResult = await query(
            `INSERT INTO appointments (
                patient_id, 
                appointment_date, 
                appointment_time, 
                consult_type_id, 
                visit_type_id, 
                practice_type_id, 
                health_insurance,
                cancellation_token
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [
                patientId,
                appointment.appointment_date,
                appointment.appointment_time,
                appointment.consult_type_id,
                appointment.visit_type_id,
                appointment.practice_type_id,
                appointment.health_insurance,
                cancellationToken,
            ]
        );

        // Update the token with the actual appointment ID
        const finalToken = generateCancellationToken({
            appointmentId: appointmentResult.rows[0].id.toString(),
            patientId: patientId.toString(),
            patientPhone: appointment.phone_number,
            appointmentDate: appointment.appointment_date,
            appointmentTime: appointment.appointment_time,
        });

        // Update the appointment with the final token
        await query(
            `UPDATE appointments SET cancellation_token = $1 WHERE id = $2`,
            [finalToken, appointmentResult.rows[0].id]
        );

        // Return appointment info with patient details for confirmation
        const appointmentInfo = await query(
            `SELECT 
                a.id,
                p.last_name || ', ' || p.first_name AS patient_name,
                p.phone_number,
                a.appointment_date,
                a.appointment_time,
                vt.name as visit_type_name,
                ct.name as consult_type_name,
                pt.name as practice_type_name,
                a.health_insurance,
                a.cancellation_token
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            LEFT JOIN visit_types vt ON a.visit_type_id = vt.id
            LEFT JOIN consult_types ct ON a.consult_type_id = ct.id
            LEFT JOIN practice_types pt ON a.practice_type_id = pt.id
            WHERE a.id = $1`,
            [appointmentResult.rows[0].id]
        );

        return {
            appointment_info: appointmentInfo.rows[0],
            is_existing_patient: isExistingPatient
        };
    } catch (error) {
        console.error("Error in addNewPatientAndAppointment:", error);
        throw error;
    }
};

export const getAvailableTimesByDate = async (date: string) => {
    try {
        // Direct database query instead of HTTP request
        const realDate: Date = new Date(`${date}T12:00:00.000Z`);
        const weekDay: number = realDate.getDay();
        
        // Convert day number to day name (Spanish)
        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const dayName = dayNames[weekDay];

        // Check if the day is unavailable
        const workday_date = await query(
            `SELECT 
                ws.is_working_day, 
                utf.start_time,
                utf.end_time,
                ud.is_confirmed
            FROM unavailable_time_frames utf
            JOIN work_schedule ws ON utf.work_schedule_id = ws.id
            LEFT JOIN unavailable_days ud ON utf.workday_date = ud.unavailable_date
            WHERE utf.workday_date = $1`,
            [date]
        );

        console.log(workday_date.rows);

        if (workday_date.rows.length > 0) {
            if (workday_date.rows[0].is_working_day === false || workday_date.rows[0].is_confirmed === true) {
                throw new Error("This day is unavailable");
            } else {
                return {
                    availableSlots: workday_date.rows,
                    date: date,
                    type: "custom_schedule"
                };
            }
        }

        // Get default available slots for the day of week
        const availableSlots = await query(
            `SELECT 
                asl.*,
                ws.day_of_week
            FROM available_slots asl
            JOIN work_schedule ws ON asl.work_schedule_id = ws.id
            WHERE ws.day_of_week = $1
            ORDER BY asl.start_time`,
            [dayName]
        );

        console.log(availableSlots.rows);
        return {
            availableSlots: availableSlots.rows,
            date: date,
            type: "default_schedule"
        };
    } catch (error) {
        console.error("Error in getAvailableTimesByDate:", error);
        throw error;
    }
};

export const cancelAppointment = async (id: string) => {
    try {
        // Update appointment status to cancelled instead of deleting
        const result = await query(
            "UPDATE appointments SET status = 'cancelled', updated_at = NOW() WHERE id = $1 AND status != 'cancelled' RETURNING *",
            [id]
        );
        
        if (result.rows.length === 0) {
            throw new Error("Appointment not found or already cancelled");
        }
        
        return result.rows[0];
    } catch (error) {
        console.error("Error in cancelAppointment:", error);
        throw error;
    }
};

export const cancelAppointmentByToken = async (token: string) => {
    try {
        // Verify the token
        const decoded = verifyCancellationToken(token);
        if (!decoded) {
            throw new Error("Invalid or expired cancellation token");
        }

        // Check if appointment exists and is not already cancelled
        const appointment = await query(
            `SELECT 
                a.id,
                a.status,
                a.cancellation_token,
                p.phone_number
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            WHERE a.id = $1`,
            [decoded.appointmentId]
        );

        if (appointment.rows.length === 0) {
            throw new Error("Appointment not found");
        }

        if (appointment.rows[0].status === 'cancelled') {
            throw new Error("Appointment is already cancelled");
        }

        // Check if cancellation is still allowed (more than 12 hours before appointment)
        if (!isCancellationAllowed(decoded.appointmentDate, decoded.appointmentTime)) {
            throw new Error("Cancellation is no longer allowed. Please contact the clinic directly.");
        }

        // Verify the token matches the stored token
        if (appointment.rows[0].cancellation_token !== token) {
            throw new Error("Invalid cancellation token");
        }

        // Verify the phone number matches
        if (appointment.rows[0].phone_number !== decoded.patientPhone) {
            throw new Error("Token verification failed");
        }

        // Cancel the appointment
        const result = await query(
            "UPDATE appointments SET status = 'cancelled', updated_at = NOW() WHERE id = $1 RETURNING *",
            [decoded.appointmentId]
        );

        return {
            success: true,
            appointment: result.rows[0],
            message: "Appointment cancelled successfully"
        };
    } catch (error) {
        console.error("Error in cancelAppointmentByToken:", error);
        throw error;
    }
};

export const getAppointmentByToken = async (token: string) => {
    try {
        // Verify the token
        const decoded = verifyCancellationToken(token);
        if (!decoded) {
            throw new Error("Invalid or expired cancellation token");
        }

        // Get appointment details
        const appointment = await query(
            `SELECT 
                a.id,
                a.appointment_date,
                a.appointment_time,
                a.status,
                a.cancellation_token,
                p.first_name,
                p.last_name,
                p.phone_number,
                vt.name as visit_type_name,
                ct.name as consult_type_name,
                pt.name as practice_type_name,
                a.health_insurance
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            LEFT JOIN visit_types vt ON a.visit_type_id = vt.id
            LEFT JOIN consult_types ct ON a.consult_type_id = ct.id
            LEFT JOIN practice_types pt ON a.practice_type_id = pt.id
            WHERE a.id = $1`,
            [decoded.appointmentId]
        );

        if (appointment.rows.length === 0) {
            throw new Error("Appointment not found");
        }

        // Check if cancellation is still allowed (more than 12 hours before appointment)
        if (!isCancellationAllowed(decoded.appointmentDate, decoded.appointmentTime)) {
            throw new Error("Cancellation is no longer allowed. Please contact the clinic directly.");
        }

        // Verify the token matches the stored token
        if (appointment.rows[0].cancellation_token !== token) {
            throw new Error("Invalid cancellation token");
        }

        // Verify the phone number matches
        if (appointment.rows[0].phone_number !== decoded.patientPhone) {
            throw new Error("Token verification failed");
        }

        return appointment.rows[0];
    } catch (error) {
        console.error("Error in getAppointmentByToken:", error);
        throw error;
    }
};
