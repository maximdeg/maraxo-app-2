"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import DialogComponent from "./DialogComponent";
import AccordionItemList from "./AccordionItemList";
import { getAppointments } from "@/lib/actions";

const AccordionComponent = () => {
    const [date, setDate] = useState<Date>(new Date());

    const {
        data: appointments,
        isError,
        isPending,
        isLoading,
    } = useQuery({
        queryKey: ["appointments", { date }],
        queryFn: async () => {
            const formatedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            const data = await getAppointments(formatedDate);

            return data ? data : [];
        },
    });

    const handleDateChange = (newDate: Date | undefined) => {
        if (newDate) {
            setDate(newDate);
        }
    };

    const memoizedAccordionItemList = useMemo(() => <AccordionItemList date={date} appointments={appointments} />, [date, appointments]);
    const memoizedDialogComponent = useMemo(() => <DialogComponent selectedDate={date} />, [date]);

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
                        {memoizedDialogComponent}
                    </div>
                </AccordionContent>
            </AccordionItem>
            {isLoading ? (
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

AccordionComponent.displayName = "AccordionComponent";

export default AccordionComponent;
