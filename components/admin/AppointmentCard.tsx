import React from "react";
import { AppointmentInfo } from "@/lib/types";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import { cancelAppointment } from "@/lib/actions";
import { toast } from "sonner";

const AppointmentCard = ({ appointment }: { appointment: AppointmentInfo }) => {
    const [showButton, setShowButton] = React.useState(false);

    const { mutateAsync: cancelAppointmentMutation } = useMutation({
        mutationFn: async (variables: { appointment: AppointmentInfo }) => {
            return cancelAppointment(appointment.id);
        },
        onMutate: () => {
            // Handle Mutation?
        },
        onSettled: () => {
            toast.success("Se guardo tu dia exitosamente.", {
                description: "La visita se esta cancelando...",
                action: {
                    label: "OK",
                    onClick: () => console.log("OK"),
                },
                duration: 5000,
            });
        },
        onSuccess: () => {
            toast.success("Se guardo tu dia exitosamente.", {
                description: `La visita se cancelo exitosamente`,
                action: {
                    label: "OK",
                    onClick: () => console.log("OK"),
                },
                duration: 10000,
            });
        },
        onError: () => {
            toast.warning("No se ha cancelado correctamente.");
        },
    });

    const handleCancelAppointment = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        cancelAppointmentMutation({ appointment });
    };

    return (
        <div
            key={appointment.id}
            className=" p-4 border rounded-lg shadow-sm flex flex-col ease-in-out group duration-200"
            tabIndex={0}
            onClick={() => setShowButton(true)}
        >
            <div className="flex justify-between items-center">
                <div>
                    <p className="font-semibold text-2xl">
                        {appointment.patient_first_name} {appointment.patient_last_name}
                    </p>
                    <p className="text-sm text-gray-600">
                        {appointment.appointment_time} - {appointment.visit_type_name}
                    </p>
                </div>
                <span
                    aria-label={appointment.status === "scheduled" ? "Confirmada" : "Cancelada"}
                    className={`px-2 py-1 text-lg rounded-full focus:bg-red-600 ${
                        appointment.status === "scheduled" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    } `}
                >
                    {appointment.status === "scheduled" ? "Confirmada" : "Cancelada"}
                </span>
            </div>
            {showButton && (
                <div className="mt-2 pt-2 self-center">
                    <Button className="w-full" variant="destructive" aria-label="Cancelar visita" onClick={(e) => handleCancelAppointment(e)}>
                        Cancelar visita
                    </Button>
                </div>
            )}
        </div>
    );
};

export default AppointmentCard;
