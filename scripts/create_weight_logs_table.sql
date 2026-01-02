-- Create weight_logs table to track weight changes over time
CREATE TABLE IF NOT EXISTS weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight NUMERIC NOT NULL,
  weight_unit TEXT NOT NULL DEFAULT 'lbs',
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

-- Enable RLS
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own weight logs"
  ON weight_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight logs"
  ON weight_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight logs"
  ON weight_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight logs"
  ON weight_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_date ON weight_logs(user_id, log_date DESC);
