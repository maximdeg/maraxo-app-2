"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AppointmentInfo } from "@/lib/types";
import SelectTimeComponent from "./SelectTimeComponent";
import AccordionItemList from "./AccordionItemList";

const AccordionComponent = () => {
    const [date, setDate] = useState<Date>(new Date());
    const [loading, setLoading] = useState<Boolean>(true);
    const [appointmentsList, setAppointmentsList] = useState<AppointmentInfo[]>([]);

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
                                                <SelectTimeComponent />
                                            </div>
                                            <div className="w-[100px]">
                                                <SelectTimeComponent />
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

AccordionItemList.displayName = "AccordionItemList";

export default AccordionComponent;
