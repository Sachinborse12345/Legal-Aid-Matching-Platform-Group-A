-- Add new columns to directory_entries table
ALTER TABLE directory_entries 
ADD COLUMN IF NOT EXISTS experience_years INTEGER,
ADD COLUMN IF NOT EXISTS approved BOOLEAN NOT NULL DEFAULT false;

-- Create index on approved column for faster filtering
CREATE INDEX IF NOT EXISTS idx_directory_entries_approved ON directory_entries(approved);

-- Update existing entries to set approved = false if null
UPDATE directory_entries SET approved = false WHERE approved IS NULL;
