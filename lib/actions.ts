"use server";

import { NewAppointmentInfo } from "./types";

export const getAppointments = async (date: string) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/appointments/date/${date}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.status === 404) {
            return null;
        }
        if (!response.ok) {
            throw new Error(`Error fetching appointments: ${response.status}`);
        }
        const data = await response.json();
        
        // Return the appointments array directly to maintain compatibility with frontend
        return data.appointments || data;
    } catch (error) {
        console.error("Error in getAppointments:", error);
        throw error;
    }
};

export const getUnavailableDay = async (date: string) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/unavailable-days/${date}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            throw new Error(`Error fetching unavailable days: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error in getUnavailableDay:", error);
        throw error;
    }
};

export const addUnavailableDay = async (unavailable_date: Date, is_confirmed: boolean): Promise<any> => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/unavailable-days`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ unavailable_date, is_confirmed }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error adding unavailable day: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error in addUnavailableDay:", error);
        throw error;
    }
};

export const addUnavailableTime = async (workday_date: Date, start_time: string, end_time: string): Promise<any> => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/unavailable-times`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ workday_date, start_time, end_time }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error adding unavailable time: ${response.status}`);
        }

        const data = await response.json();
        return data;
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

        const patientResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/patients`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                first_name: appointment.first_name,
                last_name: appointment.last_name,
                phone_number: appointment.phone_number,
            }),
        });

        if (!patientResponse.ok) {
            const errorData = await patientResponse.json();
            throw new Error(`Patient registration failed: ${errorData.error || "Unknown error"}`);
        }

        const patientData = await patientResponse.json();
        const patientId = patientData.id || patientData.patient?.id;

        if (!patientId) {
            throw new Error("Server could not process patient ID");
        }

        const appointmentJSON = {
            patient_id: patientId,
            appointment_date: appointment.appointment_date,
            appointment_time: appointment.appointment_time,
            consult_type_id: appointment.consult_type_id,
            visit_type_id: appointment.visit_type_id,
            practice_type_id: appointment.practice_type_id,
            health_insurance: null,
        };

        const appointmentResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/appointments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(appointmentJSON),
        });

        if (!appointmentResponse.ok) {
            const errorData = await appointmentResponse.json();
            throw new Error(`Appointment registration failed: ${errorData.error || "Unknown error"}`);
        }

        const appointment_info = await appointmentResponse.json();
        return appointment_info;
    } catch (error) {
        console.error("Error in addNewPatientAndAppointment:", error);
        throw error;
    }
};

export const getAvailableTimesByDate = async (date: string) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/available-times/${date}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error fetching available times: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error in getAvailableTimesByDate:", error);
        throw error;
    }
};

export const cancelAppointment = async (id: string) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/appointments/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error cancelling appointment: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error in cancelAppointment:", error);
        throw error;
    }
};
