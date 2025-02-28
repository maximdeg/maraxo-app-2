import React from "react";
import { AppointmentInfo } from "@/lib/types";
import { Button } from "../ui/button";

const AppointmentCard = ({ appointment }: { appointment: AppointmentInfo }) => {
    return (
        <div key={appointment.id} className="group p-4 border rounded-lg shadow-sm flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <p className="font-semibold">
                        {appointment.patient_first_name} {appointment.patient_last_name}
                    </p>
                    <p className="text-sm text-gray-600">
                        {appointment.appointment_time} - {appointment.visit_type_name}
                    </p>
                </div>
                <span className="px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800">{appointment.status}</span>
            </div>
            <div className="hidden pt-2 self-end group-focus-within:flex">
                <Button className="!h-7" variant="destructive">
                    Cancelar visita
                </Button>
            </div>
        </div>
    );
};

export default AppointmentCard;
