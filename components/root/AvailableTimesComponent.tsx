import React from "react";
import { SelectItem } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { getAvailableTimesByDate } from "@/lib/actions";

const AvailableTimesComponent = ({ selectedDate }: { selectedDate: Date }) => {
    const [times, setTimes] = React.useState<string[]>([]);
    const [receivedData, setReceivedData] = React.useState();

    const createTimes = (startTime: string, endTime: string) => {
        const startHour = parseInt(startTime.split(":")[0]);
        const startMinutes = parseInt(startTime.split(":")[1]);
        const endHour = parseInt(endTime.split(":")[0]);
        const endMinutes = parseInt(endTime.split(":")[1]);

        const totalMinutes = (endHour - startHour) * 60 + (endMinutes - startMinutes);
        const intervalMinutes = 20; // Intervalo de 20 minutos

        for (let i = 0; i <= totalMinutes; i += intervalMinutes) {
            const hour = startHour + Math.floor(i / 60);
            const minutes = (i % 60).toString().padStart(2, "0");
            const time = `${hour}:${minutes}`;
            setTimes((prevTimes) => [...prevTimes, time]);
        }
    };

    const {
        data: availableTimes,
        isError,
        isPending,
        isLoading,
    } = useQuery({
        queryKey: ["availableTimes", { selectedDate }],
        queryFn: async () => {
            const formatedDate: string = `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`
                .split("-")
                .map((item) => (item.length < 2 ? `0${item}` : item))
                .join("-");

            console.log(formatedDate);

            const data = await getAvailableTimesByDate(formatedDate);
            setReceivedData(data);
            createTimes(data?.start_time, data?.end_time);
            return data ? data : [];
        },
    });

    return (
        <>
            {times.map((time) => (
                <SelectItem key={time} value={time}>
                    {time}
                </SelectItem>
            ))}
        </>
    );
};

export default AvailableTimesComponent;
