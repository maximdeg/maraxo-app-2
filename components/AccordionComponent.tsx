"use client"

import React from 'react'
import { Calendar } from "@/components/ui/calendar"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"

const AccordionComponent = () => {
const [date, setDate] = React.useState<Date | undefined>(new Date())
    const days = ["Domingo","Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"]
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

  return (
    
      <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
                <AccordionTrigger className='text-2xl '>Calendario</AccordionTrigger>
                <AccordionContent>
                    <div className='mx-4 space-y-1'>
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="w-full rounded-md border"
                        />
                    </div>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>{days[date?.getDay() || 0]} {date?.getDate()} de {months[date?.getMonth() || 0]}</AccordionTrigger>
                <AccordionContent>
                    <div className='flex justify-center items-centerl'>
                        <h1 className='text-2xl'>Visitas</h1>
                    </div>
                    <div className='flex justify-center items-centerl'>
                        <h2 className='text-lg'>{days[date?.getDay() || 0]} {date?.getDate()} de {months[date?.getMonth() || 0]}</h2>
                    </div>

                </AccordionContent>
            </AccordionItem>
        </Accordion>
    
  )
}

export default AccordionComponent
