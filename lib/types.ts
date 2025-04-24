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

export interface NewAppointmentInfo {
    first_name: string;
    last_name: string;
    phone_number: string;
    visit_type_id: number;
    consult_type_id: number;
    appointment_date: Date;
    appointment_time: string;
}
