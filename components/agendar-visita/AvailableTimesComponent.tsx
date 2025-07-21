"use client";

import React, { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";
import { getAvailableTimesByDate } from "@/lib/actions";

interface AvailableTimesComponentProps {
    selectedDate: Date;
    form: UseFormReturn<any>;
}

const AvailableTimesComponent = ({ selectedDate, form }: AvailableTimesComponentProps) => {
    const [times, setTimes] = useState<string[]>([]);
    const [receivedData, setReceivedData] = useState<any>(null);

    const createTimes = (startTime: string, endTime: string, appointmentTimes: string[]) => {
        setTimes([]);

        if (!startTime || !endTime) return {};

        const startHour = parseInt(startTime.split(":")[0]);
        const startMinutes = parseInt(startTime.split(":")[1]);
        const endHour = parseInt(endTime.split(":")[0]);
        const endMinutes = parseInt(endTime.split(":")[1]);

        const totalMinutes = (endHour - startHour) * 60 + (endMinutes - startMinutes);
        const intervalMinutes = 20; // Intervalo de 20 minutos

        for (let i = 0; i <= totalMinutes - intervalMinutes; i += intervalMinutes) {
            const hour = startHour + Math.floor(i / 60);
            const minutes = (i % 60).toString().padStart(2, "0");
            const time = `${hour}:${minutes}`;
            if (!appointmentTimes.includes(time)) {
                setTimes((prevTimes) => [...prevTimes, time]);
            }
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
            if (!selectedDate) return [];
            setTimes([]);
            const formatedDate: string = `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`
                .split("-")
                .map((item) => (item.length < 2 ? `0${item}` : item))
                .join("-");

            console.log("🟠 " + formatedDate);

            const data = await getAvailableTimesByDate(formatedDate);

            // Check if availableSlots is an array and has at least one item
            if (!data.availableSlots || !Array.isArray(data.availableSlots) || data.availableSlots.length === 0) {
                console.log("No available slots found");
                return data;
            }

            // Use the first available slot for time generation
            const firstSlot = data.availableSlots[0];
            if (!firstSlot.start_time || !firstSlot.end_time) {
                console.log("Invalid slot data:", firstSlot);
                return data;
            }

            setReceivedData(data);
            return data;
        },
    });

    useEffect(() => {
        if (receivedData && receivedData.availableSlots && Array.isArray(receivedData.availableSlots) && receivedData.availableSlots.length > 0) {
            const firstSlot = receivedData.availableSlots[0];
            createTimes(firstSlot.start_time, firstSlot.end_time, receivedData?.appointmentTimes || []);
        }
    }, [receivedData]);

    useEffect(() => {
        setTimes([]);
    }, [selectedDate]);

    return (
        <FormField
            control={form.control}
            name="appointment_time"
            render={({ field }) => (
                <FormItem className={selectedDate ? "" : "hidden"}>
                    <FormLabel>Horario</FormLabel>
                    <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccione su horario" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Horarios disponibles</SelectLabel>
                                    {
                                        !isPending ? (
                                            times.length > 0 ? (
                                                times.map((time) => (
                                                    <SelectItem key={time} value={time}>
                                                        {time}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="No hay horarios disponibles">No hay horarios disponibles</SelectItem>
                                            )
                                        ) : (
                                            <SelectItem value="Cargando...">Cargando...</SelectItem>
                                        )
                                    }
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </FormControl>

                    <FormMessage />
                </FormItem>
            )}
        />
    );
};

export default AvailableTimesComponent;
