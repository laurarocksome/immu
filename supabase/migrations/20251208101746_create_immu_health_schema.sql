/*
  # IMMU Health App - Complete Database Schema
  
  ## Overview
  This migration creates the complete database schema for the IMMU Health AIP (Autoimmune Protocol) 
  diet tracking and health management application. The schema supports user profiles, health condition 
  tracking, symptom monitoring, lifestyle habits, diet plan management, and comprehensive daily logging.

  ## Tables Created
  
  ### 1. user_profiles
  Stores detailed user profile information collected during onboarding including demographics 
  and physical characteristics (gender, age, weight, height).
  
  ### 2. weight_history
  Tracks user weight changes over time for progress monitoring.
  
  ### 3. user_conditions
  Stores up to 3 health conditions selected by users (from 104+ available conditions like 
  Multiple sclerosis, Rheumatoid arthritis, Crohn's disease, etc.).
  
  ### 4. user_symptoms
  Stores the 5 symptoms users select to track (from 68+ available symptoms like Fatigue, 
  Brain fog, Bloating, etc.).
  
  ### 5. user_habits
  Stores lifestyle habits including stress management, activity level, caffeine/alcohol/sugar 
  consumption, and vegetable intake.
  
  ### 6. athlete_info
  Optional table for users with "Athlete" activity level to store sport type, training 
  frequency, and competition level.
  
  ### 7. diet_plan
  Stores user's AIP diet plan configuration including start date, timeline, current phase 
  (adaptation/elimination/reintroduction), and streak tracking.
  
  ### 8. daily_logs
  Main table for daily tracking including mood, sleep quality, stress level, wellness score, 
  period status, diet compliance, and notes.
  
  ### 9. symptom_logs
  Tracks severity (1-5) of each tracked symptom for each daily log.
  
  ### 10. period_symptoms
  Tracks period-related symptoms for female users (cramps, headaches, breast tenderness, etc.).
  
  ### 11. digestive_symptoms
  Tracks daily digestive symptoms (nauseous, bloated, gassy, heartburn, or OK).
  
  ### 12. diet_violations
  Records when users don't follow the AIP diet, including violation type and whether they 
  want to restart.
  
  ### 13. completed_todos
  Tracks daily to-do list completion for phase-specific tasks.

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Policies ensure users can only access their own data
  - All tables use auth.uid() for user identification
  - Foreign key constraints maintain data integrity

  ## Indexes
  - Created on all foreign keys for query performance
  - Composite unique indexes prevent duplicate entries
  - Date-based indexes for efficient time-series queries
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Table 1: user_profiles
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
  age INTEGER NOT NULL CHECK (age > 0 AND age <= 120),
  weight DECIMAL(5,2) NOT NULL CHECK (weight > 0),
  weight_unit TEXT NOT NULL DEFAULT 'kg' CHECK (weight_unit IN ('kg', 'lb')),
  height DECIMAL(5,2) NOT NULL CHECK (height > 0),
  height_unit TEXT NOT NULL DEFAULT 'cm' CHECK (height_unit IN ('cm', 'ft')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- =====================================================
-- Table 2: weight_history
-- =====================================================
CREATE TABLE IF NOT EXISTS weight_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  weight DECIMAL(5,2) NOT NULL CHECK (weight > 0),
  weight_unit TEXT NOT NULL CHECK (weight_unit IN ('kg', 'lb')),
  logged_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weight_history_user_id ON weight_history(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_history_logged_date ON weight_history(logged_date);

-- =====================================================
-- Table 3: user_conditions
-- =====================================================
CREATE TABLE IF NOT EXISTS user_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  condition_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_conditions_user_id ON user_conditions(user_id);

-- =====================================================
-- Table 4: user_symptoms
-- =====================================================
CREATE TABLE IF NOT EXISTS user_symptoms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symptom_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_symptoms_user_id ON user_symptoms(user_id);

-- =====================================================
-- Table 5: user_habits
-- =====================================================
CREATE TABLE IF NOT EXISTS user_habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  stress_management TEXT,
  activity_level TEXT CHECK (activity_level IN ('Sedentary', 'Light activity', 'Moderate activity', 'Active', 'Athlete')),
  caffeine_habits TEXT CHECK (caffeine_habits IN ('None', '1-2 cups', '3-4 cups', '5+ cups')),
  alcohol_habits TEXT CHECK (alcohol_habits IN ('Never', 'Occasionally', 'Weekly', 'Frequently')),
  sugar_habits TEXT,
  vegetable_habits TEXT CHECK (vegetable_habits IN ('5+ servings', '3-4 servings', '1-2 servings', 'None')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_habits_user_id ON user_habits(user_id);

-- =====================================================
-- Table 6: athlete_info
-- =====================================================
CREATE TABLE IF NOT EXISTS athlete_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  sport_type TEXT,
  training_frequency TEXT,
  competition_level TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_athlete_info_user_id ON athlete_info(user_id);

-- =====================================================
-- Table 7: diet_plan
-- =====================================================
CREATE TABLE IF NOT EXISTS diet_plan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  diet_start_date DATE NOT NULL,
  diet_timeline_days INTEGER NOT NULL CHECK (diet_timeline_days >= 30 AND diet_timeline_days <= 132),
  needs_adaptation BOOLEAN NOT NULL DEFAULT FALSE,
  adaptation_days INTEGER DEFAULT 0 CHECK (adaptation_days IN (0, 28)),
  elimination_days INTEGER NOT NULL,
  current_phase TEXT NOT NULL CHECK (current_phase IN ('adaptation', 'elimination', 'reintroduction')),
  streak_days INTEGER DEFAULT 1 CHECK (streak_days >= 0),
  last_diet_success_log DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diet_plan_user_id ON diet_plan(user_id);

-- =====================================================
-- Table 8: daily_logs
-- =====================================================
CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL,
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 5),
  wellness_score INTEGER CHECK (wellness_score >= 0 AND wellness_score <= 100),
  notes TEXT,
  on_period BOOLEAN DEFAULT FALSE,
  diet_success BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_date UNIQUE(user_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_logs_user_id ON daily_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_log_date ON daily_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON daily_logs(user_id, log_date);

-- =====================================================
-- Table 9: symptom_logs
-- =====================================================
CREATE TABLE IF NOT EXISTS symptom_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  daily_log_id UUID REFERENCES daily_logs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symptom_name TEXT NOT NULL,
  severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_symptom_logs_daily_log_id ON symptom_logs(daily_log_id);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_user_id ON symptom_logs(user_id);

-- =====================================================
-- Table 10: period_symptoms
-- =====================================================
CREATE TABLE IF NOT EXISTS period_symptoms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  daily_log_id UUID REFERENCES daily_logs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symptom_id TEXT NOT NULL,
  symptom_name TEXT NOT NULL,
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_period_symptoms_daily_log_id ON period_symptoms(daily_log_id);
CREATE INDEX IF NOT EXISTS idx_period_symptoms_user_id ON period_symptoms(user_id);

-- =====================================================
-- Table 11: digestive_symptoms
-- =====================================================
CREATE TABLE IF NOT EXISTS digestive_symptoms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  daily_log_id UUID REFERENCES daily_logs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symptom_id TEXT NOT NULL,
  symptom_name TEXT NOT NULL,
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_digestive_symptoms_daily_log_id ON digestive_symptoms(daily_log_id);
CREATE INDEX IF NOT EXISTS idx_digestive_symptoms_user_id ON digestive_symptoms(user_id);

-- =====================================================
-- Table 12: diet_violations
-- =====================================================
CREATE TABLE IF NOT EXISTS diet_violations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  violation_date DATE NOT NULL,
  violation_type TEXT NOT NULL CHECK (violation_type IN ('full', 'single')),
  wants_restart BOOLEAN,
  chose_adaptation BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diet_violations_user_id ON diet_violations(user_id);
CREATE INDEX IF NOT EXISTS idx_diet_violations_date ON diet_violations(violation_date);

-- =====================================================
-- Table 13: completed_todos
-- =====================================================
CREATE TABLE IF NOT EXISTS completed_todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  todo_date DATE NOT NULL,
  todo_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_date_todo UNIQUE(user_id, todo_date, todo_id)
);

CREATE INDEX IF NOT EXISTS idx_completed_todos_user_id ON completed_todos(user_id);
CREATE INDEX IF NOT EXISTS idx_completed_todos_date ON completed_todos(todo_date);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE period_symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE digestive_symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_todos ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- user_profiles policies
-- =====================================================
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
  ON user_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- weight_history policies
-- =====================================================
CREATE POLICY "Users can view own weight history"
  ON weight_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight history"
  ON weight_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight history"
  ON weight_history FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight history"
  ON weight_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- user_conditions policies
-- =====================================================
CREATE POLICY "Users can view own conditions"
  ON user_conditions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conditions"
  ON user_conditions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conditions"
  ON user_conditions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conditions"
  ON user_conditions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- user_symptoms policies
-- =====================================================
CREATE POLICY "Users can view own symptoms"
  ON user_symptoms FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own symptoms"
  ON user_symptoms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own symptoms"
  ON user_symptoms FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own symptoms"
  ON user_symptoms FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- user_habits policies
-- =====================================================
CREATE POLICY "Users can view own habits"
  ON user_habits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits"
  ON user_habits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits"
  ON user_habits FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits"
  ON user_habits FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- athlete_info policies
-- =====================================================
CREATE POLICY "Users can view own athlete info"
  ON athlete_info FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own athlete info"
  ON athlete_info FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own athlete info"
  ON athlete_info FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own athlete info"
  ON athlete_info FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- diet_plan policies
-- =====================================================
CREATE POLICY "Users can view own diet plan"
  ON diet_plan FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diet plan"
  ON diet_plan FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diet plan"
  ON diet_plan FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own diet plan"
  ON diet_plan FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- daily_logs policies
-- =====================================================
CREATE POLICY "Users can view own daily logs"
  ON daily_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily logs"
  ON daily_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily logs"
  ON daily_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily logs"
  ON daily_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- symptom_logs policies
-- =====================================================
CREATE POLICY "Users can view own symptom logs"
  ON symptom_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own symptom logs"
  ON symptom_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own symptom logs"
  ON symptom_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own symptom logs"
  ON symptom_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- period_symptoms policies
-- =====================================================
CREATE POLICY "Users can view own period symptoms"
  ON period_symptoms FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own period symptoms"
  ON period_symptoms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own period symptoms"
  ON period_symptoms FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own period symptoms"
  ON period_symptoms FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- digestive_symptoms policies
-- =====================================================
CREATE POLICY "Users can view own digestive symptoms"
  ON digestive_symptoms FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own digestive symptoms"
  ON digestive_symptoms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own digestive symptoms"
  ON digestive_symptoms FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own digestive symptoms"
  ON digestive_symptoms FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- diet_violations policies
-- =====================================================
CREATE POLICY "Users can view own diet violations"
  ON diet_violations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diet violations"
  ON diet_violations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diet violations"
  ON diet_violations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own diet violations"
  ON diet_violations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- completed_todos policies
-- =====================================================
CREATE POLICY "Users can view own completed todos"
  ON completed_todos FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completed todos"
  ON completed_todos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own completed todos"
  ON completed_todos FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own completed todos"
  ON completed_todos FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);