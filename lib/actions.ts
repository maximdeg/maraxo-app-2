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

export const addUnavailableTime = async (workday_date: Date, start_time: string, end_time: string): Promise<any> => {
    try {
        const response = await fetch(`http://localhost:3000/api/unavailable-times`, {
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

        console.log("ADDING DAY?");

        const data = await response.json();

        return data;
    } catch (error) {
        console.error(error);
    }
};

export const getAvailableTimesByDate = async (date: string) => {
    try {
        // const unavailableTimesResponse = await fetch(`http://localhost:3000/api/unavailable-times/${date}`, {
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

        const availableTimesResponse = await fetch(`http://localhost:3000/api/available-times/${date}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!availableTimesResponse.ok) {
            throw new Error("Error fetching available times");
        }

        const availableTimesData = await availableTimesResponse.json();

        return availableTimesData;
    } catch (error) {
        console.error(error);
    }
};
