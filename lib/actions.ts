"use server";

import { NewAppointmentInfo } from "./types";

export const getAppointments = async (date: string) => {
    try {
        const response = await fetch(`${process.env.BACKEND_API_PROD}/api/appointments/date/${date}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.status === 404) {
            return;
        }
        if (!response.ok) {
            throw new Error("Error fetching appointments");
        }
        const data = await response.json();

        return data;
    } catch (error) {
        console.error(error);
    }
};

export const getUnavailableDay = async (date: string) => {
    try {
        const response = await fetch(`${process.env.BACKEND_API_PROD}/api/unavailable-days/${date}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        console.dir(JSON.stringify(response));

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            console.log(JSON.stringify(response));
            throw new Error("Error fetching unavailable days");
        }

        const data = await response.json();

        return data;
    } catch (error) {
        console.error(error);
    }
};

export const addUnavailableDay = async (unavailable_date: Date, is_confirmed: boolean): Promise<any> => {
    try {
        const response = await fetch(`${process.env.BACKEND_API_PROD}/api/unavailable-days`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ unavailable_date, is_confirmed }),
        });

        if (!response.ok) {
            console.log(JSON.stringify(response));
            throw new Error("Error adding unavailable day");
        }

        console.log("ADDING DAY?");

        const data = await response.json();

        return data;
    } catch (error) {
        console.error(error);
    }
};

export const addUnavailableTime = async (workday_date: Date, start_time: string, end_time: string): Promise<any> => {
    try {
        const response = await fetch(`${process.env.BACKEND_API_PROD}/api/unavailable-times`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ workday_date, start_time, end_time }),
        });

        if (!response.ok) {
            console.log(JSON.stringify(response));
            throw new Error("Error adding unavailable day");
        }

        const data = await response.json();

        return data;
    } catch (error) {
        console.error(error);
    }
};

export const addNewPatientAndAppointment = async ({ appointment }: { appointment: NewAppointmentInfo }) => {
    try {
        if (!appointment.first_name || !appointment.last_name || !appointment.phone_number) {
            throw new Error("Missing required patient information");
        }

        const patientResponse = await fetch(`${process.env.BACKEND_API_PROD}/api/patients`, {
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

        if (patientResponse.ok) {
            console.log("🟢 Patient booked successfully!", patientResponse);
        } else {
            const errorData = await patientResponse.json();
            console.log(`🔴 Patient registration failed: ${errorData.error || "Unknown error"}`);
        }

        const { id } = await patientResponse.json();

        if (!id) throw Error("Servidor no pudo encargarse del usuario id.");

        const appointmentJSON = {
            patient_id: id,
            appointment_date: appointment.appointment_date,
            appointment_time: appointment.appointment_time,
            consult_type_id: appointment.consult_type_id,
            visit_type_id: appointment.visit_type_id,
            notes: null,
        };

        const appointmentResponse = await fetch(`${process.env.BACKEND_API_PROD}/api/appointments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(appointmentJSON),
        });

        console.dir(appointmentResponse.body, appointmentResponse);

        if (appointmentResponse.ok) {
            console.log("🟢 Appointment booked successfully!", appointmentResponse);
        } else {
            const appointment_error = await appointmentResponse.json();
            console.log(`🔴 Appointment registration failed: ${appointment_error.error || "Unknown error"}`);
            throw new Error(appointment_error.error || "Unknown error");
        }

        const appointment_info = await appointmentResponse.json();

        return appointment_info;
    } catch (error) {
        console.error(error);
    }
};

export const getAvailableTimesByDate = async (date: string) => {
    try {
        // const unavailableTimesResponse = await fetch(`${process.env.BACKEND_API_PROD}/api/unavailable-times/${date}`, {
        //     method: "GET",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        // });

        // if (!unavailableTimesResponse.ok) {
        //     console.log("Error fetching unavailable times");
        // }

        // const data = await unavailableTimesResponse.json();

        // if (data.length > 0) {
        //     return data;
        // }

        console.log("🟢 " + date);

        const availableTimesResponse = await fetch(`${process.env.BACKEND_API_PROD}/api/available-times/${date}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!availableTimesResponse.ok) {
            throw new Error("Error fetching available times");
        }

        const availableTimesData = await availableTimesResponse.json();
        console.dir(availableTimesData);

        return availableTimesData;
    } catch (error) {
        console.error(error);
    }
};

export const cancelAppointment = async (id: string) => {
    try {
        const response = await fetch(`${process.env.BACKEND_API_PROD}/api/appointments/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Error cancelling appointment");
        }

        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error(error);
    }
};
