"use server";

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

export const addNewPatientAndAppointment = async (first_name: string, last_name: string, phone_number: string) => {
    try {
        const patientResponse = await fetch("/api/patients", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                first_name,
                last_name,
                phone_number,
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
            // appointment_date: values.appointment_date,
            // appointment_time: values.appointment_time,
            // consult_type_id: +values.consult_type,
            // visit_type_id: +values.visit_type,
            notes: null,
        };

        const response = await fetch("/api/appointments", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(appointmentJSON),
        });
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
