"use server";

export const getAppointments = async (date: string) => {
    try {
        const response = await fetch(`http://localhost:3000/api/appointments/date/${date}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.status === 404) {
            return;
        }

        if (!response.ok) {
            console.log(JSON.stringify(response));

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
        const response = await fetch(`http://localhost:3000/api/unavailable-days/${date}`, {
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
        const response = await fetch(`http://localhost:3000/api/unavailable-days`, {
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
