-- First, enable the uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop the existing table
DROP TABLE IF EXISTS appointments;

-- Create new appointments table
CREATE TABLE appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    consult_type_id INTEGER,
    visit_type_id INTEGER,
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on patient_id for better query performance
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);

-- Create an index on appointment_date for better query performance
CREATE INDEX idx_appointments_date ON appointments(appointment_date);

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE appointments
ADD CONSTRAINT fk_patient
FOREIGN KEY (patient_id) 
REFERENCES patients(id);

ALTER TABLE appointments
ADD CONSTRAINT fk_consult_type
FOREIGN KEY (consult_type_id) 
REFERENCES consult_types(id);

ALTER TABLE appointments
ADD CONSTRAINT fk_visit_type
FOREIGN KEY (visit_type_id) 
REFERENCES visit_types(id);

