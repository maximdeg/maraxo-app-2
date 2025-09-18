import React, { memo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
// import { addUnavailableDay, getUnavailableDay, addUnavailableTime } from "@/lib/actions"; // Replaced with API routes

import SelectTimeComponent from "./SelectTimeComponent";
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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

const DialogComponent = memo(({ selectedDate }: { selectedDate: Date }) => {
    const [isDayOff, setIsDayOff] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [firstDayOffState, setFirstDayOffState] = useState(false);
    const [endTime, setEndTime] = useState("");
    const [startTime, setStartTime] = useState("");

    const {
        data: unavailableDate,
        isError,
        isPending,
        isLoading,
    } = useQuery({
        queryKey: ["unavailableDate", { selectedDate }],
        queryFn: async () => {
            const formatedDate = `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`;
            
            const response = await fetch(`/api/unavailable-days?date=${formatedDate}`);
            if (!response.ok) {
                throw new Error('Failed to fetch unavailable day');
            }
            const data = await response.json();

            setIsDayOff(data?.is_confirmed);
            setFirstDayOffState(data?.is_confirmed);
            return data ? data : [];
        },
    });

    const { mutateAsync: addUnavailableDayMutation } = useMutation({
        mutationFn: async (variables: { selectedDate: Date; isDayOff: boolean }) => {
            const response = await fetch('/api/unavailable-days', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    selectedDate: variables.selectedDate,
                    isDayOff: variables.isDayOff
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update unavailable day');
            }

            return response.json();
        },
        onMutate: () => {
            // Handle Mutation?
        },
        onSettled: () => {
            setIsOpen(false);
        },
        onSuccess: () => {
            toast.success("Se guardo tu dia exitosamente.", {
                description: `La fecha ${selectedDate.toLocaleDateString("es-AR", {
                    year: "2-digit",
                    month: "2-digit",
                    day: "2-digit",
                })} fue editada correctamente.`,
                action: {
                    label: "OK",
                    onClick: () => console.log("OK"),
                },
                duration: 10000,
            });
        },
        onError: () => {
            toast.warning("No se ha editado el dia.");
        },
    });

    const { mutateAsync: addUnavailableTimeMutation } = useMutation({
        mutationFn: async (variables: { selectedDate: Date; start_time: string; end_time: string }) => {
            const response = await fetch('/api/unavailable-times', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    selectedDate: variables.selectedDate,
                    start_time: variables.start_time,
                    end_time: variables.end_time
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add unavailable time');
            }

            return response.json();
        },
        onMutate: () => {
            // Handle Mutation?
        },
        onSettled: () => {
            setIsOpen(false);
        },
        onSuccess: () => {
            toast.success("Se guardo tus horarios exitosamente.", {
                description: `La fecha ${selectedDate.toLocaleDateString("es-AR", {
                    year: "2-digit",
                    month: "2-digit",
                    day: "2-digit",
                })} se trabajara de ${startTime} a ${endTime}.`,
                action: {
                    label: "OK",
                    onClick: () => console.log("OK"),
                },
                duration: 10000,
            });

            setStartTime("");
            setEndTime("");
        },
        onError: () => {
            // Handle error
        },
    });

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSaving(true);

        try {
            if (isDayOff !== firstDayOffState) {
                const responseDay = await addUnavailableDayMutation({ selectedDate, isDayOff });
            }

            if (startTime !== "" || endTime !== "") {
                console.log("Entro a guardar horarios");
                const responseTime = await addUnavailableTimeMutation({ selectedDate, start_time: startTime, end_time: endTime });
            }
        } catch (error: any) {
            toast.error("Ocurrió un error", {
                description: error.message,
                action: {
                    label: "OK",
                    onClick: () => console.log(error.message),
                },
            });
            setIsSaving(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangeSwitch = (e: boolean) => {
        setIsDayOff(() => e);
    };

    const handleStartTimeChange = (startTime: string) => {
        setStartTime(startTime);
    };

    const handleEndTimeChange = (endTime: string) => {
        setEndTime(endTime);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <div className="flex justify-end w-full border-b-[1px] border-r-[1px] border-l-[1px] rounded-b-lg">
                    <Button variant="outline" className="m-4" disabled={isLoading}>
                        {isLoading && <Loader2 className="animate-spin" />}
                        Editar dia
                    </Button>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] ">
                <DialogHeader className="text-start">
                    <DialogTitle className="text-xl">
                        Editar dia ({selectedDate.toLocaleDateString("es-AR", { year: "2-digit", month: "2-digit", day: "2-digit" })})
                    </DialogTitle>
                    <DialogDescription className="text-white">
                        Haz los cambios de tu dia aca. Incluido deshabilitar el dia e ingresar tus horas laborales.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4 group">
                        <div className="flex p-5 border rounded-lg justify-between">
                            <Label className="text-right text-lg mx-3">Deshabilitar dia</Label>
                            <Switch
                                className="mt-[0.2rem] mx-3"
                                defaultChecked={isDayOff ? true : false}
                                onCheckedChange={(e) => handleChangeSwitch(e)}
                            />
                        </div>
                        <div
                            className={
                                isDayOff
                                    ? "p-5 rounded-lg gap-2 border !border-gray-700 !text-gray-700 bg-[#6d514c36]"
                                    : "p-5 border rounded-lg gap-2"
                            }
                        >
                            <Label className="text-lg mx-3">Horarios de trabajo</Label>
                            <div className="flex justify-around mt-3">
                                <div className="w-[100px]">
                                    <SelectTimeComponent placeholderText={"Desde"} isDisabled={isDayOff} onChange={handleStartTimeChange} />
                                </div>
                                <div className="w-[100px]">
                                    <SelectTimeComponent placeholderText={"Hasta"} isDisabled={isDayOff} onChange={handleEndTimeChange} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" variant="outline" className="m-4" onClick={() => setIsOpen(true)} disabled={isLoading}>
                            {isSaving && <Loader2 className="animate-spin" />}
                            Guardar cambios
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
});

DialogComponent.displayName = "DialogComponent";

export default DialogComponent;
