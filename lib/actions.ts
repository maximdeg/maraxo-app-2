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
