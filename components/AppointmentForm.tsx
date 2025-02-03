"use client"

import React from 'react'
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

  const formSchema = z.object({
    name: z.string().min(2, {
      message: "El nombre debe tener al menos 2 caracteres.",
    }),
    lastname: z.string().min(2, {
      message: "El apellido debe tener al menos 2 caracteres.",
    }),
    phone_number: z.string().min(2, {
      message: "El número de teléfono debe tener 10 caracteres.",
    }),
    visit_type: z.string({
      required_error: "Por favor selecctione un tipo de visita.",
    }),
    date: z.string({
      required_error: "Por favor seleccione una fecha.",
    }),
  })

const AppointmentForm = () => {
        const [date, setDate] = useState<Date>()
    
    // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      lastname: "",
      phone_number: "",
      visit_type: "",
      date: "",
    },
  })
 
  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                <Select>
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
         <FormField
          control={form.control}
          name="visit_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de visita</FormLabel>
              <FormControl>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4 text-white" />
                        {date ? format(date, "PPP") : <span className='text-white'>Seleccione una fecha</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
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
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}

export default AppointmentForm
