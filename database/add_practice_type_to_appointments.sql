-- Query to add practice_type_id column to existing appointments table
-- This query should be run on an existing database that already has the appointments and practice_types tables

-- Add the new column to appointments table
ALTER TABLE appointments 
ADD COLUMN practice_type_id INTEGER;

-- Add foreign key constraint
ALTER TABLE appointments 
ADD CONSTRAINT fk_appointments_practice_type 
FOREIGN KEY (practice_type_id) REFERENCES practice_types(id);

-- Create index for better query performance
CREATE INDEX idx_appointments_practice_type_id ON appointments (practice_type_id);

-- Optional: Set a default value for existing records (e.g., to the empty practice type with id=0)
UPDATE appointments SET practice_type_id = 0 WHERE practice_type_id IS NULL;

-- Optional: Make the column NOT NULL after setting default values (uncomment if needed)
ALTER TABLE appointments ALTER COLUMN practice_type_id SET NOT NULL; 