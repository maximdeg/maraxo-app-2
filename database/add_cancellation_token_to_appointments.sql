-- Add cancellation_token column to appointments table
-- This will store JWT tokens for secure appointment cancellation

ALTER TABLE appointments 
ADD COLUMN cancellation_token TEXT;

ALTER TABLE appointments 
ADD COLUMN confirmation_token TEXT;

-- Create index for better query performance when looking up by token
CREATE INDEX idx_appointments_cancellation_token ON appointments(cancellation_token);
CREATE INDEX idx_appointments_confirmation_token ON appointments(confirmation_token);

-- Add a comment to document the purpose of this column
COMMENT ON COLUMN appointments.cancellation_token IS 'JWT token for secure appointment cancellation links';
COMMENT ON COLUMN appointments.confirmation_token IS 'JWT token for secure appointment confirmation links';

-- Optional: Add a constraint to ensure token is unique when present
-- ALTER TABLE appointments ADD CONSTRAINT unique_cancellation_token UNIQUE (cancellation_token); 