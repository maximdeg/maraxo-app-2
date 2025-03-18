export interface AppointmentInfo {
    id: string;
    status: string;
    appointment_time: string;
    patient_first_name: string;
    patient_last_name: string;
    visit_type_name: string | null;
}

export interface UnavailableDay {
    unavailable_date: Date;
    is_confirmed: boolean;
}
