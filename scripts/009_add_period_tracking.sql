-- Add both missing columns to daily_logs table
-- Add AIP compliance tracking column
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS aip_compliant BOOLEAN DEFAULT NULL;

-- Add period tracking column to daily_logs
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS on_period BOOLEAN DEFAULT FALSE;

-- Add comments for documentation
COMMENT ON COLUMN daily_logs.on_period IS 'Tracks whether the user was on their period on this day (for female users)';
COMMENT ON COLUMN daily_logs.aip_compliant IS 'Tracks whether the user followed 100% AIP diet during Elimination phase';
