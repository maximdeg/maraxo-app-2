-- Updated Schema for Appointment System in PostgreSQL with Flexible Work Schedule

-- Patients Table (No changes from previous schema)
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX idx_patients_phone_number ON patients (phone_number);

-- Consult Types Lookup Table (No changes from previous schema)
CREATE TABLE consult_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO consult_types (name, description) VALUES
    ('Initial Consultation', 'First appointment to understand the patient''s needs.'),
    ('Follow-up', 'Subsequent appointment for ongoing care.'),
    ('Check-up', 'Routine health check.'),
    ('Emergency Consultation', 'Urgent appointment for immediate concerns.');

-- Visit Types Lookup Table (No changes from previous schema)
CREATE TABLE visit_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO visit_types (name, description) VALUES
    ('In-Person', 'Physical visit at the clinic.'),
    ('Online', 'Video or telehealth consultation.'),
    ('Phone Call', 'Consultation via phone call.');

-- Appointments Table (No changes from previous schema)
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME WITHOUT TIME ZONE NOT NULL,
    consult_type_id INTEGER,
    visit_type_id INTEGER,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (consult_type_id) REFERENCES consult_types(id),
    FOREIGN KEY (visit_type_id) REFERENCES visit_types(id)
);
CREATE INDEX idx_appointments_date ON appointments (appointment_date);
CREATE INDEX idx_appointments_patient_id ON appointments (patient_id);


-- Work Schedule Table - MODIFIED to represent working DAYS of the week
CREATE TABLE work_schedule (
    id SERIAL PRIMARY KEY,
    day_of_week VARCHAR(10) NOT NULL, -- e.g., Monday, Tuesday, Wednesday
    is_working_day BOOLEAN DEFAULT TRUE NOT NULL, -- Flag to indicate if it's a working day in general
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (day_of_week) -- Ensure only one schedule entry per day of the week
);

-- Optional: Populate work_schedule with days, initially all set as working days
INSERT INTO work_schedule (day_of_week, is_working_day) VALUES
    ('Monday', TRUE),
    ('Tuesday', TRUE),
    ('Wednesday', TRUE),
    ('Thursday', TRUE),
    ('Friday', TRUE),
    ('Saturday', FALSE), -- Example: Non-working day by default
    ('Sunday', FALSE);   -- Example: Non-working day by default


-- Available Time Slots Table - NEW TABLE to define specific available times within working days
CREATE TABLE available_slots (
    id SERIAL PRIMARY KEY,
    work_schedule_id INTEGER NOT NULL, -- Foreign key to work_schedule to link to the day of the week
    start_time TIME WITHOUT TIME ZONE NOT NULL,
    end_time TIME WITHOUT TIME ZONE NOT NULL,
    is_available BOOLEAN DEFAULT TRUE NOT NULL, -- To temporarily disable a slot without deleting
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (work_schedule_id) REFERENCES work_schedule(id) ON DELETE CASCADE -- If a work day is deleted, remove slots
);

-- Optional: Add some default available time slots for Monday and Tuesday from the work_schedule
INSERT INTO available_slots (work_schedule_id, start_time, end_time)
SELECT ws.id, '09:00', '12:00' FROM work_schedule ws WHERE ws.day_of_week = 'Monday';
INSERT INTO available_slots (work_schedule_id, start_time, end_time)
SELECT ws.id, '13:00', '17:00' FROM work_schedule ws WHERE ws.day_of_week = 'Monday';
INSERT INTO available_slots (work_schedule_id, start_time, end_time)
SELECT ws.id, '09:00', '13:00' FROM work_schedule ws WHERE ws.day_of_week = 'Tuesday';
INSERT INTO available_slots (work_schedule_id, start_time, end_time)
SELECT ws.id, '14:00', '17:00' FROM work_schedule ws WHERE ws.day_of_week = 'Tuesday';


-- Triggers to automatically update 'updated_at' column on record update (Added for available_slots)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER patients_updated_at_trigger
BEFORE UPDATE ON patients
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER appointments_updated_at_trigger
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER consult_types_updated_at_trigger
BEFORE UPDATE ON consult_types
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER visit_types_updated_at_trigger
BEFORE UPDATE ON visit_types
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER work_schedule_updated_at_trigger
BEFORE UPDATE ON work_schedule
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER available_slots_updated_at_trigger -- NEW trigger for available_slots
BEFORE UPDATE ON available_slots
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();


-- Optional: Roles and permissions for database access control