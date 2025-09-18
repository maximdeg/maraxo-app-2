import React from "react";
import { AppointmentInfo } from "@/lib/types";
import { Button } from "../ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { cancelAppointment } from "@/lib/actions"; // Replaced with API route
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"

const AppointmentCard = ({ appointment }: { appointment: AppointmentInfo }) => {
    const [showButton, setShowButton] = React.useState(false);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const queryClient = useQueryClient();

    const { mutateAsync: cancelAppointmentMutation, isPending } = useMutation({
        mutationFn: async (variables: { appointment: AppointmentInfo }) => {
            const response = await fetch(`/api/appointments/${appointment.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to cancel appointment');
            }

            return response.json();
        },
        onMutate: async () => {
            // Cancel any outgoing refetches for all appointment queries
            await queryClient.cancelQueries({ queryKey: ["appointments"] });

            // Get all appointment queries and update them optimistically
            const queries = queryClient.getQueriesData({ queryKey: ["appointments"] });
            
            // Snapshot the previous values
            const previousQueries = queries.map(([queryKey, data]) => ({ queryKey, data }));

            // Update all appointment queries optimistically
            queries.forEach(([queryKey, data]) => {
                if (data && Array.isArray(data)) {
                    queryClient.setQueryData(queryKey, (old: any) => {
                        if (!old) return old;
                        
                        // Update the specific appointment status to cancelled
                        return old.map((apt: AppointmentInfo) => 
                            apt.id === appointment.id 
                                ? { ...apt, status: "cancelled" }
                                : apt
                        );
                    });
                }
            });

            // Return a context object with the snapshotted values
            return { previousQueries };
        },
        onError: (err, variables, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousQueries) {
                context.previousQueries.forEach(({ queryKey, data }) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            toast.warning("No se ha cancelado correctamente.");
        },
        onSuccess: () => {
            // Close the dialog
            setIsDialogOpen(false);
            setShowButton(false);
            
            toast.success("Se cancelo la visita.", {
                description: `La visita se cancelo exitosamente`,
                action: {
                    label: "OK",
                    onClick: () => console.log("OK"),
                },
                duration: 10000,
            });
            
            // Invalidate and refetch to ensure data consistency
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
        },
        onSettled: () => {
            // Always refetch after error or success
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
        },
    });

    const handleCancelAppointment = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        cancelAppointmentMutation({ appointment });
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case "scheduled":
                return {
                    label: "Confirmada",
                    className: "bg-green-100 text-green-800 border-green-200",
                    icon: "✓"
                };
            case "cancelled":
                return {
                    label: "Cancelada",
                    className: "bg-red-100 text-red-800 border-red-200",
                    icon: "✗"
                };
            default:
                return {
                    label: "Programada",
                    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
                    icon: "⏳"
                };
        }
    };

    const statusInfo = getStatusInfo(appointment.status);

    return (
        <div
            key={appointment.id}
            className="p-6 border rounded-xl shadow-sm hover:shadow-md transition-all ease-in-out duration-300 bg-[#cabab5] shadow-inner shadow-black/10"
            tabIndex={0}
            onClick={() => setShowButton(!showButton)}
        >
            {/* Header with Patient Name and Status */}
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <h3 className="font-bold text-xl text-gray-900 mb-1">
                        {appointment.patient_first_name} {appointment.patient_last_name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        {/* <span className="font-medium">📅 {appointment.appointment_date}</span> */}
                        <span className="font-medium">🕐 {appointment.appointment_time}</span>
                    </div>
                    {appointment.visit_type_name && (
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-black font-medium min-w-[80px]">Tipo de visita:</span>
                        <span className="text-gray-700 bg-blue-50 px-2 py-1 rounded-md">
                            {appointment.visit_type_name}{" | "}{appointment.visit_type_name === "Practica" ? appointment.practice_type_name : appointment.consult_type_name}
                        </span>
                    </div>
                )}
                </div>
                <div className="flex items-center gap-2">
                    <span
                        className={`px-3 py-1.5 text-sm font-medium rounded-full border ${statusInfo.className}`}
                    >
                        <span className="mr-1">{statusInfo.icon}</span>
                        {statusInfo.label}
                    </span>
                </div>
            </div>

            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogTrigger asChild>
                    {showButton && (
                        <Button
                            className="w-full mt-4"
                            variant={appointment.status === "scheduled" ? "destructive" : "outline"}
                            aria-label="Cancelar visita"
                        >
                            {appointment.status === "scheduled" ? "Cancelar cita" : "Reagendar cita"}
                        </Button>
                    )}
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cuidado!</AlertDialogTitle>
                        <AlertDialogDescription>
                            {appointment.status === "scheduled" 
                                ? "Esta acción cancelará la cita programada."
                                : "Esta acción te permitirá reagendar la cita."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                            className="bg-red-500 text-white" 
                            onClick={(e) => appointment.status === "scheduled" && handleCancelAppointment(e)}
                            disabled={isPending}
                        >
                            {isPending ? "Cancelando..." : "Cancelar visita"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AppointmentCard;
