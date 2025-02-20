ALTER TABLE appointments ALTER COLUMN appointment_time TYPE TEXT;

ALTER TABLE appointments ADD CONSTRAINT valid_time_format CHECK (appointment_time ~ '^\d{2}:\d{2}$');
