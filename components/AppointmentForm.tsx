"use client"

import React from 'react'
import Link from 'next/link'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { z } from "zod"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "./ui/select"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
  import { useState } from 'react';

import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
 
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Option {
  value: string;
  label: string;
}

interface OptionComponentMap {
  [key: string]: JSX.Element;
}

interface SubmitedJson{
  name: string,
  lastname: string,
  phone_number: string,
  visit_type: string,
  date: string,
  consult_type: string,
  time: string
}



const formSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  lastname: z.string().min(2, {
    message: "El apellido debe tener al menos 2 caracteres.",
  }),
  phone_number: z.string().min(10, {
    message: "El número de teléfono debe tener 10 caracteres.",
  }),
  visit_type: z.string({
    required_error: "Por favor selecctione un tipo de visita.",
  }),
  date: z.date({
    required_error: "Por favor seleccione una fecha.",
  }),
  consult_type: z.string({
    required_error: "Por favor seleccione un tipo de consulta.",
  }),
  time: z.string({
    required_error: "Por favor seleccione un horario.",
  })
})

const AppointmentForm = () => {
  const times = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00"]
  const [date, setDate] = useState<Date>()
  const [selectedOption, setSelectedOption] = useState<string>("");

    // ZOD form
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        name: "",
        lastname: "",
        phone_number: "",
        visit_type: "",
        date: new Date(),
        consult_type: "",
        time: ""
      },
    })
  
  const OptionComponents: OptionComponentMap = {
    consulta: <FormField
    control={form.control}
    name="consult_type"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Tipo de consulta</FormLabel>
        <FormControl>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione su visita" />
              </SelectTrigger>
              <SelectContent>
                  <SelectGroup>
                  {/* <SelectLabel>Visita</SelectLabel> */}
                  <SelectItem value="primera_vez">Primera vez</SelectItem>
                  <SelectItem value="seguimiento">Seguimiento</SelectItem>
                  </SelectGroup>
              </SelectContent>
           </Select>
        </FormControl>
        {/* <FormDescription>
          This is your public display name.
        </FormDescription> */}
        <FormMessage />
      </FormItem>
    )}
  />,
    Practica: <div>Hidden component for Option 2</div>,
  };



  const handleSelectChange = (value: string) => {
    setSelectedOption(value);
  };
 
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input className='w-full' placeholder="Su nombre" {...field}/>
              </FormControl>
              {/* <FormDescription>
                This is your public display name.
              </FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Apellido</FormLabel>
              <FormControl>
                <Input className='w-full' placeholder="Su apellido" {...field}/>
              </FormControl>
              {/* <FormDescription>
                This is your public display name.
              </FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefono</FormLabel>
              <FormControl>
                <Input className='w-full' placeholder="342 1234567" {...field}/>
              </FormControl>
              {/* <FormDescription>
                This is your public display name.
              </FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="visit_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de visita</FormLabel>
              <FormControl>
                <Select onValueChange={(value) => { handleSelectChange(value); field.onChange(value); }} defaultValue={field.value}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccione su visita" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                        {/* <SelectLabel>Visita</SelectLabel> */}
                        <SelectItem value="consulta">Consulta</SelectItem>
                        <SelectItem value="practica">Practica</SelectItem>
                        <SelectItem value="peeling">Peeling</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
              </FormControl>
              {/* <FormDescription>
                This is your public display name.
              </FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />
        {OptionComponents[selectedOption]}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>Fecha</FormLabel>
              <FormControl>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-[280px] justify-start text-left font-normal mt-6",
                        !date && "text-white"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4 text-white" />
                        {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Seleccione una fecha</span>
                      )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date() || date > new Date("2025-02-10")
                      }
                      initialFocus
                        />
                    </PopoverContent>
                </Popover>
              </FormControl>
              {/* <FormDescription>
                This is your public display name.
              </FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horario</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccione su horario" />
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
              </FormControl>
              {/* <FormDescription>
                This is your public display name.
              </FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='flex justify-end'>
          <Link href="/success">
            <Button className='bg-white text-black font-bold !mt-6 hover:bg-white hover:text-[#eb8658] border border-white hover:border-3' type="submit">Agendar</Button>
          </Link>
        </div>
      </form>
    </Form>
  )
}

export default AppointmentForm
