import React from "react";
import { AppointmentInfo } from "@/lib/types";

const AppointmentCard = ({ appointment }: { appointment: AppointmentInfo }) => {
    return (
        <div key={appointment.id} className="p-4 border rounded-lg shadow-sm">
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
        </div>
    );
};

export default AppointmentCard;
