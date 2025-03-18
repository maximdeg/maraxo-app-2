import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getUnavailableDay } from "@/lib/actions";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import SelectTimeComponent from "./SelectTimeComponent";

const DialogComponent = ({ selectedDate }: { selectedDate: Date }) => {
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

            return data ? data : [];
        },
    });

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="flex justify-end w-full border-b-[1px] border-r-[1px] border-l-[1px] rounded-b-lg">
                    <Button variant="outline" className="m-4">
                        Editar dia
                    </Button>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] ">
                <DialogHeader className="text-start">
                    <DialogTitle className="text-xl">Editar dia</DialogTitle>
                    <DialogDescription className="text-white">
                        Haz los cambios de tu dia aca. Incluido deshabilitar el dia e ingresar tus horas laborales.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex p-5 border rounded-lg justify-between">
                        <Label className="text-right text-lg mx-3">Deshabilitar dia</Label>
                        <Switch className="mt-[0.2rem] mx-3" defaultChecked={unavailableDate?.length > 0 ? unavailableDate[0].is_confirmed : false} />
                    </div>
                    <div className="p-5 border rounded-lg  gap-2">
                        <Label className="text-lg mx-3">Horarios de trabajo</Label>
                        <div className="flex justify-around mt-3">
                            <div className="w-[100px]">
                                <SelectTimeComponent placeholderText={"Desde"} />
                            </div>
                            <div className="w-[100px]">
                                <SelectTimeComponent placeholderText={"Hasta"} />
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" variant="outline">
                        <Loader2 className="animate-spin" />
                        Guardar cambios
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DialogComponent;
