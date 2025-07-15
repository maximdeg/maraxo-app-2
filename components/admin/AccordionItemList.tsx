import React, { memo } from "react";
import { AppointmentInfo } from "@/lib/types";
import AppointmentCard from "./AppointmentCard";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const AccordionItemList = memo(({ date, appointments = [] }: { date: Date; appointments?: AppointmentInfo[] }) => {
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
                        <div className="space-y-2 ">
                            {appointments.map((appointment: AppointmentInfo) => (
                                <AppointmentCard key={appointment.id} appointment={appointment} />
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

export default AccordionItemList;
