"use client"

import type {JSX} from 'react'
import { Check } from 'lucide-react'
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
  import React, { useState } from 'react';

import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
 
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { json } from 'node:stream/consumers'



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
  visit_type: z.string().nonempty("Por favor seleccione un tipo de visita."),
  date: z.date().min(new Date(), { message: "Hoy ya no hay visitas disponibles, por favor elija una fecha futura." }),
  consult_type: z.string({
    required_error: "Por favor seleccione un tipo de consulta.",
  }),
  time: z.string().nonempty("Por favor seleccione un horario."),
})

const AppointmentForm = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const limitDay = new Date(tomorrow);
  limitDay.setDate(tomorrow.getDate() + 7);
  const [date, setDate] = useState(tomorrow);
  const times = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00"]
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [confirmationInfo, setConfirmationInfo] = useState<React.ReactNode>()

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
                  <SelectLabel>Consultas</SelectLabel>
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

  const clearForm = () => {
    form.reset();
  };
 
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)

    const AppointmentInfoComponent: React.ReactNode = (
      <DialogHeader>
        <DialogTitle>
          <div>
            <span className='font-light text-zinc-500'>Nombre: </span>
            <span>{values.name} {values.lastname}</span>
            <br/>
            <span className='font-light text-zinc-500'>Telefono: </span>
            <span>{values.phone_number}</span>
            <br/>
            <span className='font-light text-zinc-500'>Tipo de visita: </span>
            <span>{values.visit_type}</span>
            <br/>
            {values.visit_type === "consulta" && <><span className='font-light text-zinc-500'>Tipo de consulta: </span>
              <span>{values.consult_type}</span><br/></>}
            <span className='font-light text-zinc-500'>Fecha: </span>
            <span>{format(date, "dd/MM/yyyy")}</span>
            <br/>
            <span className='font-light text-zinc-500'>Horario: </span>
            <span>{values.time}</span>
            <br/>
          </div>
        </DialogTitle>
      </DialogHeader>
    )

    setConfirmationInfo(AppointmentInfoComponent)
    
    clearForm();
   
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
                        date < new Date() || date > limitDay
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
        <div className='flex justify-end py-6'>
          <Dialog>
            <DialogTrigger asChild>
              <Button type="submit" variant="outline">Agendar</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className='flex gap-2 items-center text-green-600 text-2xl '><Check className='h-8 w-8'/>Visita agendada con exito</DialogTitle>
                <DialogDescription>
                  Asegurese que toda la informacion es correcta
                </DialogDescription>
              </DialogHeader>
             {confirmationInfo}

              
              <DialogFooter className="justify-end">
                <DialogClose asChild >
                  <Button type="button" variant="secondary">
                    Cerrar
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </form>
    </Form>
  )
}

export default AppointmentForm
