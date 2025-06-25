"use client";

import type { JSX } from "react";
import { Check } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import React, { useState, useMemo } from "react";
import { toast } from "sonner";

import { es } from "date-fns/locale";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { addNewPatientAndAppointment } from "@/lib/actions";
import { NewAppointmentInfo } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import AvailableTimesComponent from "./AvailableTimesComponent";
// import { Label } from "@/components/ui/label";
// import { json } from "node:stream/consumers";
interface Option {
    value: string;
    label: string;
}

interface OptionComponentMap {
    [key: string]: JSX.Element;
}

const formSchema = z.object({
    first_name: z.string().min(2, {
        message: "El nombre debe tener al menos 2 caracteres.",
    }),
    last_name: z.string().min(2, {
        message: "El apellido debe tener al menos 2 caracteres.",
    }),
    phone_number: z.string()
        .min(10, {
            message: "El número de teléfono debe tener al menos 10 caracteres.",
        })
        .max(15, {
            message: "El número de teléfono no puede tener más de 15 caracteres.",
        })
        .regex(/^[0-9+\-\s()]+$/, {
            message: "El número de teléfono solo puede contener números, espacios, guiones, paréntesis y el símbolo +.",
        }),
    visit_type: z.string().nonempty("Por favor seleccione un tipo de visita."),
    appointment_date: z.date().refine((date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
    }, { message: "La fecha debe ser hoy o una fecha futura." }),
    consult_type: z.string({
        required_error: "Por favor seleccione un tipo de consulta.",
    }),
    appointment_time: z.string().nonempty("Por favor seleccione un horario."),
});

const holidays = [
    new Date("2025-01-01"),
    new Date("2025-12-25"), 
];

const areDatesEqual = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
};

const disabledDays = (day: Date) => {
    const dayOfWeek = day.getDay();
    const today = new Date();
    const limitDay = new Date(today);
    limitDay.setDate(today.getDate() + 30);

    return (
        dayOfWeek === 0 ||
        dayOfWeek === 4 ||
        dayOfWeek === 5 ||
        dayOfWeek === 6 ||
        day < new Date() ||
        day > limitDay ||
        holidays.some((holiday) => areDatesEqual(holiday, day))
    );
};

const AppointmentForm = () => {
    const [date, setDate] = useState();
    const [userSelectedDate, setUserSelectedDate] = useState<Date>();
    const [selectedOption, setSelectedOption] = useState<string>("");
    const [confirmationInfo, setConfirmationInfo] = useState<React.ReactNode>();

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const limitDay = new Date(tomorrow);
    limitDay.setDate(tomorrow.getDate() + 30);

    // const selectTimesComponent = useCallback(() => {
    //     return <AvailableTimesComponent selectedDate={userSelectedDate as Date} />;
    // }, [userSelectedDate]);

    // const selectTimesComponent = useMemo(() => {
    //     return <AvailableTimesComponent selectedDate={userSelectedDate as Date} />;
    // }, [userSelectedDate?.getTime()]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            phone_number: "",
            visit_type: "",
            appointment_date: new Date(),
            consult_type: "",
            appointment_time: "",
        },
    });

    const selectTimesComponent = useMemo(() => {
        return <AvailableTimesComponent selectedDate={userSelectedDate as Date} form={form} />;
    }, [userSelectedDate, form]);

    const OptionComponents: OptionComponentMap = {
        1: (
            <FormField
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
                                        <SelectItem value="1">Primera vez</SelectItem>
                                        <SelectItem value="2">Seguimiento</SelectItem>
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
        ),
        4: <div>Hidden component for Option 2</div>,
    };

    const handleSelectChange = (value: string) => {
        setSelectedOption(value);
    };

    const handleDateChange = (value: Date) => {
        console.log(value);
        setUserSelectedDate(() => value);
    };

    const clearForm = () => {
        setUserSelectedDate(undefined);
        setSelectedOption("");
        setDate(undefined);
        form.reset();
    };

    const showModalInfo = (values: any) => {
        const AppointmentInfoComponent: React.ReactNode = (
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex gap-2 items-center text-green-400 text-2xl text-center">
                        <Check className="h-8 w-8" />
                        Visita agendada con exito
                    </DialogTitle>
                    <DialogDescription className="text-white text-center">Asegurese que toda la informacion es correcta</DialogDescription>
                </DialogHeader>
                <DialogHeader>
                    <DialogTitle>
                        <div className="items-start text-left tracking-wide leading-5">
                            <span className="font-extralight">Nombre: </span>
                            <span>{values.patient_name}</span>
                            <br />
                            <span className="font-extralight ">Telefono: </span>
                            <span>{values.phone_number}</span>
                            <br />
                            <span className="font-extralight ">Tipo de visita: </span>
                            <span>{values.visit_type_name}</span>
                            <br />
                            {values.visit_type_name === "consulta" && (
                                <>
                                    <span className="font-extralight ">Tipo de consulta: </span>
                                    <span>{values.consult_type_name}</span>
                                    <br />
                                </>
                            )}
                            <span className="font-extralight ">Fecha: </span>
                            <span>{format(values.appointment_date, "dd/MM/yyyy")}</span>
                            <br />
                            <span className="font-extralight ">Horario: </span>
                            <span>{values.appointment_time}</span>
                            <br />
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <DialogFooter className="justify-end">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Cerrar
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        );

        setConfirmationInfo(AppointmentInfoComponent);
    };

    const { mutateAsync: addNewPatientAndAppointmentMutation, isPending } = useMutation({
        mutationFn: async (variables: { appointment: NewAppointmentInfo }) => {
            return addNewPatientAndAppointment(variables);
        },
        onMutate: () => {
            toast.loading("Agendando su cita...", {
                duration: Infinity,
            });
        },
        onSuccess: () => {
            toast.dismiss();
            toast.success("Se guardo tu dia exitosamente.", {
                description: `La visita se agendo exitosamente`,
                duration: 10000,
            });

            console.log("🟢 Appointment booked successfully!");
            clearForm();
        },
        onError: (error) => {
            toast.dismiss();
            toast.error("No se ha agendado correctamente.", {
                description: error.message || "Intente nuevamente mas tarde.",
            });
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const newAppointmentInfo: NewAppointmentInfo = {
                first_name: values.first_name,
                last_name: values.last_name,
                phone_number: values.phone_number,
                visit_type_id: +values.visit_type,
                consult_type_id: +values.consult_type,
                appointment_date: values.appointment_date,
                appointment_time: values.appointment_time,
            };

            const response = await addNewPatientAndAppointmentMutation({
                appointment: newAppointmentInfo,
            });

            showModalInfo(response.appointment_info);
        } catch (error) {
            console.error("🟠 Fetch error:", error);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                                <Input className="w-full" placeholder="Su nombre" {...field} />
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
                    name="last_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Apellido</FormLabel>
                            <FormControl>
                                <Input className="w-full" placeholder="Su apellido" {...field} />
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
                                <Input className="w-full" placeholder="342 1234567" {...field} />
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
                                <Select
                                    onValueChange={(value) => {
                                        handleSelectChange(value);
                                        field.onChange(value);
                                    }}
                                    defaultValue={field.value}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Seleccione su visita" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {/* <SelectLabel>Visita</SelectLabel> */}
                                            <SelectItem value="1">Consulta</SelectItem>
                                            <SelectItem value="2">Practica</SelectItem>
                                            {/* <SelectItem value="3">Peeling</SelectItem> */}
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
                    name="appointment_date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Fecha</FormLabel>
                            <FormControl>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn("w-[280px] justify-start text-left font-normal mt-6", !date && "text-white")}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4 text-white" />
                                            {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccione una fecha</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={(selectedDate) => {
                                                handleDateChange(selectedDate as Date);
                                                return field.onChange(selectedDate);
                                            }}
                                            disabled={disabledDays}
                                            // initialFocus
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
                {selectTimesComponent}
                <div className="flex justify-end py-6 ">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button 
                                type="submit" 
                                variant="outline" 
                                disabled={!form.formState.isValid || isPending}
                            >
                                {isPending ? "Agendando..." : "Agendar"}
                            </Button>
                        </DialogTrigger>
                        {confirmationInfo}
                    </Dialog>
                </div>
            </form>
        </Form>
    );
};

export default AppointmentForm;
