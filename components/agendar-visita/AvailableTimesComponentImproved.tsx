"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
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
    const [isGeneratingTimes, setIsGeneratingTimes] = useState(false);

    // Memoize the date string to prevent unnecessary re-renders
    const dateString = useMemo(() => {
        if (!selectedDate) return null;
        return selectedDate.toISOString().split('T')[0];
    }, [selectedDate]);

    // Memoize the createTimes function to prevent unnecessary re-creations
    const createTimes = useCallback((startTime: string, endTime: string, appointmentTimes: string[]) => {
        if (!startTime || !endTime) {
            setTimes([]);
            return;
        }

        const startHour = parseInt(startTime.split(":")[0]);
        const startMinutes = parseInt(startTime.split(":")[1]);
        const endHour = parseInt(endTime.split(":")[0]);
        const endMinutes = parseInt(endTime.split(":")[1]);

        const totalMinutes = (endHour - startHour) * 60 + (endMinutes - startMinutes);
        const intervalMinutes = 20; // 20-minute intervals

        const newTimes: string[] = [];
        
        for (let i = 0; i <= totalMinutes - intervalMinutes; i += intervalMinutes) {
            const hour = startHour + Math.floor(i / 60);
            const minutes = (i % 60).toString().padStart(2, "0");
            const time = `${hour}:${minutes}`;
            if (!appointmentTimes.includes(time)) {
                newTimes.push(time);
            }
        }
        
        setTimes(newTimes);
        setIsGeneratingTimes(false);
    }, []);

    // Memoize the formatDateForAPI function
    const formatDateForAPI = useCallback((date: Date) => {
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }, []);

    const {
        data: availableTimes,
        isError,
        isPending,
        isLoading,
        error
    } = useQuery({
        queryKey: ["availableTimes", { dateString }],
        queryFn: async () => {
            if (!selectedDate || !dateString) return null;
            
            setIsGeneratingTimes(true);
            const formatedDate = formatDateForAPI(selectedDate);

            try {
                const data = await getAvailableTimesByDate(formatedDate);

                // Check if availableSlots is an array and has at least one item
                if (!data.availableSlots || !Array.isArray(data.availableSlots) || data.availableSlots.length === 0) {
                    setTimes([]);
                    setIsGeneratingTimes(false);
                    return data;
                }

                // Use the first available slot for time generation
                const firstSlot = data.availableSlots[0];
                
                if (!firstSlot.start_time || !firstSlot.end_time) {
                    setTimes([]);
                    setIsGeneratingTimes(false);
                    return data;
                }

                // Fetch existing appointments for this date
                let appointmentTimes: string[] = [];
                try {
                    const appointmentsResponse = await fetch(`/api/appointments/date/${formatedDate}`);
                    if (appointmentsResponse.ok) {
                        const appointmentsData = await appointmentsResponse.json();
                        appointmentTimes = appointmentsData.appointments.map((appointment: any) => appointment.appointment_time);
                    }
                } catch (error) {
                    console.error("Error fetching appointments:", error);
                    // Continue with empty appointment times if fetch fails
                }

                // Generate times immediately when we get the data
                createTimes(firstSlot.start_time, firstSlot.end_time, appointmentTimes);
                return data;
            } catch (error) {
                console.error("Error in queryFn:", error);
                setTimes([]);
                setIsGeneratingTimes(false);
                throw error;
            }
        },
        enabled: !!selectedDate && !!dateString,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    // Clear times and form field when date changes
    useEffect(() => {
        setTimes([]);
        setIsGeneratingTimes(false);
        form.setValue("appointment_time", "");
    }, [selectedDate, form]);

    // Handle errors
    useEffect(() => {
        if (isError) {
            setTimes([]);
            setIsGeneratingTimes(false);
            console.error("Error fetching available times:", error);
        }
    }, [isError, error]);

    // Determine loading state
    const isActuallyLoading = isPending || isLoading || isGeneratingTimes;

    return (
        <FormField
            control={form.control}
            name="appointment_time"
            render={({ field }) => (
                <FormItem className={selectedDate ? "" : "hidden"}>
                    <FormLabel>Horario</FormLabel>
                    <FormControl>
                        <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                            disabled={isActuallyLoading}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccione su horario" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Horarios disponibles</SelectLabel>
                                    {
                                        !isActuallyLoading ? (
                                            times.length > 0 ? (
                                                times.map((time) => (
                                                    <SelectItem key={time} value={time}>
                                                        {time}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="No hay horarios disponibles" disabled>
                                                    No hay horarios disponibles
                                                </SelectItem>
                                            )
                                        ) : (
                                            <SelectItem value="Cargando..." disabled>
                                                Cargando...
                                            </SelectItem>
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
