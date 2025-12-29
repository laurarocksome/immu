-- Remove meal logging table (app is not for meal tracking)
DROP TABLE IF EXISTS meal_logs CASCADE;
DROP TABLE IF EXISTS user_favorites CASCADE;

-- Create phase history table to track when users transition between phases
CREATE TABLE IF NOT EXISTS phase_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phase TEXT NOT NULL CHECK (phase IN ('Adaptation', 'Elimination', 'Reintroduction')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE phase_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own phase history
CREATE POLICY "Users can view own phase history"
  ON phase_history FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own phase history
CREATE POLICY "Users can insert own phase history"
  ON phase_history FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own phase history
CREATE POLICY "Users can update own phase history"
  ON phase_history FOR UPDATE
  USING (user_id = auth.uid());

-- Add aip_compliant field to daily_logs (only tracked during Elimination phase)
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS aip_compliant BOOLEAN;
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS phase TEXT CHECK (phase IN ('Adaptation', 'Elimination', 'Reintroduction'));

-- Create function to automatically track phase transitions
CREATE OR REPLACE FUNCTION track_phase_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- If current_phase changed, close the old phase and start a new one
  IF OLD.current_phase IS DISTINCT FROM NEW.current_phase THEN
    -- Close the previous phase
    UPDATE phase_history 
    SET ended_at = NOW()
    WHERE user_id = NEW.user_id 
      AND phase = OLD.current_phase 
      AND ended_at IS NULL;
    
    -- Start the new phase
    INSERT INTO phase_history (user_id, phase, started_at)
    VALUES (NEW.user_id, NEW.current_phase, NOW());
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for phase transitions
DROP TRIGGER IF EXISTS phase_transition_trigger ON diet_info;
CREATE TRIGGER phase_transition_trigger
  AFTER UPDATE ON diet_info
  FOR EACH ROW
  EXECUTE FUNCTION track_phase_transition();

-- Insert initial phase history for existing users
INSERT INTO phase_history (user_id, phase, started_at)
SELECT user_id, current_phase, start_date
FROM diet_info
WHERE NOT EXISTS (
  SELECT 1 FROM phase_history 
  WHERE phase_history.user_id = diet_info.user_id
)
ON CONFLICT DO NOTHING;
