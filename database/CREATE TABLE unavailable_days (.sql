CREATE TABLE unavailable_days (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY, -- Auto-generated UUID as primary key
    work_schedule_id INT NOT NULL, -- Foreign key referencing the day of the week from "work_schedule"
    unavailable_date DATE NOT NULL, -- The actual date that is unavailable
    is_confirmed BOOLEAN NOT NULL DEFAULT FALSE, -- Confirms if the date is unavailable
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Timestamp of row creation
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Timestamp of row update
    CONSTRAINT fk_work_schedule FOREIGN KEY (work_schedule_id) REFERENCES work_schedule(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_unavailable_date ON unavailable_days (unavailable_date);
CREATE INDEX idx_work_schedule_id ON unavailable_days (work_schedule_id);

CREATE TABLE unavailable_time_frames (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY, -- Auto-generated UUID as primary key
    workday_date DATE NOT NULL, -- The date of the edited workday
    start_time TIME NOT NULL, -- Start time of the unavailable frame
    end_time TIME NOT NULL, -- End time of the unavailable frame
    reason TEXT, -- Optional reason for unavailability (e.g., "Meeting", "Maintenance")
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Timestamp of row creation
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Timestamp of row update,
    CONSTRAINT unique_time_frame UNIQUE (workday_date, start_time, end_time) -- Ensures no overlapping time frames for the same day
);

-- Indexes for better performance
CREATE INDEX idx_workday_date ON unavailable_time_frames (workday_date);

ALTER TABLE unavailable_time_frames
ADD COLUMN work_schedule_id INTEGER;

ALTER TABLE unavailable_time_frames
ADD CONSTRAINT fk_work_schedule_id
FOREIGN KEY (work_schedule_id)
REFERENCES work_schedule(id)
ON DELETE CASCADE;

