import React, { memo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { addUnavailableDay, getUnavailableDay } from "@/lib/actions";

import SelectTimeComponent from "./SelectTimeComponent";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

const DialogComponent = memo(({ selectedDate }: { selectedDate: Date }) => {
    const [isDayOff, setIsDayOff] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const {
        data: unavailableDate,
        isError,
        isPending,
        isLoading,
    } = useQuery({
        queryKey: ["unavailableDate", { selectedDate }],
        queryFn: async () => {
            const formatedDate = `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`;
            const data = await getUnavailableDay(formatedDate);

            setIsDayOff(data?.is_confirmed);
            return data ? data : [];
        },
    });

    const { mutateAsync: addUnavailableDayMutation } = useMutation({
        mutationFn: async (variables: { selectedDate: Date; isDayOff: boolean }) => {
            return addUnavailableDay(variables.selectedDate, variables.isDayOff);
        },
    });

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSaving(true);
        try {
            const response = await addUnavailableDayMutation({ selectedDate, isDayOff });

            console.log(response);

            toast.success("Se guardo tu dia exitosamente.", {
                description: `La fecha ${selectedDate} fue editada correctamente.`,
                action: {
                    label: "OK",
                    onClick: () => console.log("OK"),
                },
                duration: 10000,
            });
        } catch (error) {
            console.log(error);
            setIsSaving(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangeSwitch = (e: boolean) => {
        setIsDayOff(() => e);
    };

    return (
        <Dialog>
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
                                    <SelectTimeComponent placeholderText={"Desde"} isDisabled={isDayOff} />
                                </div>
                                <div className="w-[100px]">
                                    <SelectTimeComponent placeholderText={"Hasta"} isDisabled={isDayOff} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" variant="outline">
                            {isSaving && <Loader2 className="animate-spin" />}
                            Guardar cambios
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
});

DialogComponent.displayName = 'DialogComponent';


export default DialogComponent;
