"use client";

import React, { useCallback, useEffect, useMemo, useState, memo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

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
    const times = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];
    const [loading, setLoading] = useState<Boolean>(true);
    const [appointmentsList, setAppointmentsList] = useState<Appointment[]>([]);

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

            if (response.status === 404) {
                setAppointmentsList((prevState) => {
                    return [];
                });
                setLoading(false);
                return;
            }

            if (!response.ok) {
                console.log(JSON.stringify(response));
                setLoading(false);
                setAppointmentsList((prevState) => {
                    return [];
                });
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
                    <div className="w-full px-4">
                        <div>
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={handleDateChange}
                                className="w-full border-t-[1px] border-r-[1px] border-l-[1px] rounded-t-lg place-items-center"
                            />
                        </div>

                        <Dialog>
                            <DialogTrigger asChild>
                                <div className="flex justify-end w-full border-b-[1px] border-r-[1px] border-l-[1px] rounded-b-lg">
                                    <Button variant="outline" className="m-4">
                                        Editar dia
                                    </Button>
                                </div>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] ">
                                <DialogHeader className="text-start">
                                    <DialogTitle className="text-xl">Editar dia</DialogTitle>
                                    <DialogDescription className="text-white">
                                        Haz los cambios de tu dia aca. Incluido deshabilitar el dia e ingresar tus horas laborales.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="flex p-5 border rounded-lg justify-between">
                                        <Label className="text-right text-lg mx-3">Deshabilitar dia</Label>
                                        <Switch
                                            className="mt-[0.2rem] mx-3"
                                            //                         checked={field.value}
                                            //   onCheckedChange={field.onChange}
                                        />
                                    </div>
                                    <div className="p-5 border rounded-lg  gap-2">
                                        <Label className="text-lg mx-3">Horarios de trabajo</Label>
                                        <div className="flex justify-around mt-3">
                                            <div className="w-[100px]">
                                                <Select>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="De" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            <SelectLabel>Horarios disponibles</SelectLabel>
                                                            {times.map((time) => (
                                                                <SelectItem key={time} value={time}>
                                                                    {time}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="w-[100px]">
                                                <Select>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Hasta" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            <SelectLabel>Horarios disponibles</SelectLabel>
                                                            {times.map((time) => (
                                                                <SelectItem key={time} value={time}>
                                                                    {time}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" variant="outline">
                                        Guardar cambios
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
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
                        <p className="text-center text-white">No hay citas para este día</p>
                    )}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
});

AccordionItemList.displayName = "AccordionItemList";

export default AccordionComponent;
