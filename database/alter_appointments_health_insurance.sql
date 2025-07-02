-- SQL script to modify appointments table
-- Drop the notes column and add health_insurance column

-- Step 1: Drop the notes column
ALTER TABLE appointments DROP COLUMN notes;

-- Step 2: Add the new health_insurance column
ALTER TABLE appointments ADD COLUMN health_insurance VARCHAR(255);

-- Optional: Add a comment to document the change
COMMENT ON COLUMN appointments.health_insurance IS 'Health insurance provider or coverage information for the appointment'; 