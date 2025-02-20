"use client";

import React, { useCallback, useEffect, useMemo, useState, memo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Appointment {
    id: string;
    status: string;
    appointment_time: string;
    patient_first_name: string;
    patient_last_name: string;
    visit_type_name: string | null;
}

const AccordionComponent = () => {
    const [date, setDate] = useState<Date>(new Date());
    const [loading, setLoading] = useState<Boolean>(true);
    const [appointmentsList, setAppointmentsList] = useState<Appointment[]>([]); // or proper interface

    const fetchAppointmentsByDate = useCallback(async () => {
        try {
            setLoading(true);
            const formatedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            const response = await fetch(`/api/appointments/date/${formatedDate}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Error fetching appointments");
            }

            const data = await response.json();
            setAppointmentsList(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [date]);

    useEffect(() => {
        fetchAppointmentsByDate();
    }, [fetchAppointmentsByDate]);

    const handleDateChange = (newDate: Date | undefined) => {
        if (newDate) {
            setDate(newDate);
        }
    };

    const memoizedAccordionItemList = useMemo(() => <AccordionItemList date={date} appointments={appointmentsList} />, [date, appointmentsList]);

    return (
        <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
                <AccordionTrigger className="text-2xl ">Calendario</AccordionTrigger>
                <AccordionContent>
                    <div className="mx-4 space-y-1">
                        <Calendar mode="single" selected={date} onSelect={handleDateChange} className="w-full rounded-md border place-items-center" />
                    </div>
                </AccordionContent>
            </AccordionItem>
            {loading ? (
                <AccordionItem value="item-2">
                    <AccordionTrigger>
                        <h1>Cargando...</h1>
                    </AccordionTrigger>
                </AccordionItem>
            ) : (
                memoizedAccordionItemList
            )}
        </Accordion>
    );
};

const AccordionItemList = memo(({ date, appointments }: { date: Date; appointments: Appointment[] }) => {
    const days = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    return (
        <AccordionItem value="item-2">
            <AccordionTrigger>
                {days[date?.getDay() || 0]} {date?.getDate()} de {months[date?.getMonth() || 0]}
            </AccordionTrigger>
            <AccordionContent>
                <div className="flex flex-col gap-4">
                    <div className="text-center">
                        <h1 className="text-2xl">Visitas</h1>
                        <h2 className="text-lg">
                            {days[date?.getDay() || 0]} {date?.getDate()} de {months[date?.getMonth() || 0]}
                        </h2>
                    </div>
                    {appointments.length > 0 ? (
                        <div className="space-y-2">
                            {appointments.map((appointment) => (
                                <div key={appointment.id} className="p-4 border rounded-lg shadow-sm">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">
                                                {appointment.patient_first_name} {appointment.patient_last_name}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {appointment.appointment_time} - {appointment.visit_type_name}
                                            </p>
                                        </div>
                                        <span className="px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800">{appointment.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">No hay citas para este día</p>
                    )}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
});

AccordionItemList.displayName = "AccordionItemList";

export default AccordionComponent;
