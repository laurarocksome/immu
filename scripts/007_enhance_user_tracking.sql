-- Add meal logging table to track what users eat each day
CREATE TABLE IF NOT EXISTS meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_log_id UUID REFERENCES daily_logs(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('Breakfast', 'Lunch', 'Dinner', 'Snack')),
  food_items TEXT[] DEFAULT '{}',
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  notes TEXT,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for meal_logs
CREATE POLICY "Users can view own meal logs"
  ON meal_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own meal logs"
  ON meal_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own meal logs"
  ON meal_logs FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own meal logs"
  ON meal_logs FOR DELETE
  USING (user_id = auth.uid());

-- Add user favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  food_id UUID REFERENCES foods(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id),
  UNIQUE(user_id, food_id),
  CHECK (
    (recipe_id IS NOT NULL AND food_id IS NULL) OR
    (recipe_id IS NULL AND food_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_favorites
CREATE POLICY "Users can view own favorites"
  ON user_favorites FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own favorites"
  ON user_favorites FOR DELETE
  USING (user_id = auth.uid());

-- Add phase history tracking table
CREATE TABLE IF NOT EXISTS phase_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phase TEXT NOT NULL CHECK (phase IN ('Adaptation', 'Elimination', 'Reintroduction', 'Maintenance')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE phase_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for phase_history
CREATE POLICY "Users can view own phase history"
  ON phase_history FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own phase history"
  ON phase_history FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own phase history"
  ON phase_history FOR UPDATE
  USING (user_id = auth.uid());

-- Create function to automatically initialize diet_info on user creation
CREATE OR REPLACE FUNCTION initialize_user_diet_info()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert initial diet_info record when a new user is created
  INSERT INTO diet_info (user_id, start_date, current_phase, adaptation_choice, timeline_days)
  VALUES (
    NEW.id,
    NOW(),
    'Adaptation',
    '14-day',
    90
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Insert initial phase history record
  INSERT INTO phase_history (user_id, phase, started_at)
  VALUES (
    NEW.id,
    'Adaptation',
    NOW()
  )
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function when auth user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_diet_info();

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_id ON meal_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_logs_daily_log_id ON meal_logs(daily_log_id);
CREATE INDEX IF NOT EXISTS idx_meal_logs_logged_at ON meal_logs(logged_at);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_phase_history_user_id ON phase_history(user_id);
CREATE INDEX IF NOT EXISTS idx_phase_history_started_at ON phase_history(started_at);
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_id ON daily_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_log_date ON daily_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_diet_info_user_id ON diet_info(user_id);

-- Add constraint to ensure only one active phase per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_phase_per_user 
  ON phase_history(user_id) 
  WHERE ended_at IS NULL;
