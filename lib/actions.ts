"use server";

import { NewAppointmentInfo } from "./types";
import { query } from "./db";

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

        // Direct database query for patient creation
        const patientResult = await query(
            "INSERT INTO patients (first_name, last_name, phone_number) VALUES ($1, $2, $3) RETURNING id, first_name, last_name, phone_number",
            [appointment.first_name, appointment.last_name, appointment.phone_number]
        );

        const patientId = patientResult.rows[0].id;

        if (!patientId) {
            throw new Error("Server could not process patient ID");
        }

        // Direct database query for appointment creation
        const appointmentResult = await query(
            `INSERT INTO appointments (
                patient_id, 
                appointment_date, 
                appointment_time, 
                consult_type_id, 
                visit_type_id, 
                practice_type_id, 
                health_insurance
            ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [
                patientId,
                appointment.appointment_date,
                appointment.appointment_time,
                appointment.consult_type_id,
                appointment.visit_type_id,
                appointment.practice_type_id,
                appointment.health_insurance,
            ]
        );

        return appointmentResult.rows[0];
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
            [weekDay]
        );

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
        // Direct database query instead of HTTP request
        const result = await query(
            "DELETE FROM appointments WHERE id = $1 RETURNING *",
            [id]
        );
        
        if (result.rows.length === 0) {
            throw new Error("Appointment not found");
        }
        
        return result.rows[0];
    } catch (error) {
        console.error("Error in cancelAppointment:", error);
        throw error;
    }
};
