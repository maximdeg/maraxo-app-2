"use client"

import Image from 'next/image';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
 
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

// const formSchema = z.object({
//   username: z.string().min(2).max(50),
// })

// export function ProfileForm() {
//   // 1. Define your form.
//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       username: "",
//     },
//   })
 
//   // 2. Define a submit handler.
//   function onSubmit(values: z.infer<typeof formSchema>) {
//     // Do something with the form values.
//     // ✅ This will be type-safe and validated.
//     console.log(values)
//   }
// }

export default function Home() {
  const [date, setDate] = useState<Date>()


  return (
    <section className='flex flex-col py-5 px-10 mx-10 items-center'>
     <div className='text-center mb-5'>
      <h1 className='text-6xl'>Mara Flamini</h1>
      <h2 className='text-3xl'>Consultorio dermatologico</h2>
     </div>
     <form action="" className='max-w-5xl'>
     <div >
      <label htmlFor="">Nombre</label>
      <Input className='w-full'/>
     </div>
     <div>
      <label htmlFor="">Apellido</label>
      <Input/>
     </div>
     <div>
      <label htmlFor="">Telefono</label>
      <Input/>
     </div>
     <div>
      <label htmlFor="">Tipo de Visita</label>
      <Select>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Seleccione su visita" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {/* <SelectLabel>Visita</SelectLabel> */}
          <SelectItem value="apple">Consulta</SelectItem>
          <SelectItem value="banana">Practica</SelectItem>
          <SelectItem value="blueberry">Peeling</SelectItem>
        </SelectGroup>
      </SelectContent>
      </Select>
     </div>
     <div className='flex flex-col'>
      <label htmlFor="">Dia</label>
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
     </div>
     <div>
      <label htmlFor="">Horario</label>
      <Input/>
     </div>
     <Button className='mt-5 self-end'>
      Reservar
     </Button>
      </form>
    </section>
  );
}
