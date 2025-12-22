-- Create admin_users table to track admin privileges
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Admin users can view all admin records
CREATE POLICY "Admins can view admin users"
  ON admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Create foods table
CREATE TABLE IF NOT EXISTS foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_aip BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL CHECK (status IN ('Can eat', 'Can''t eat', 'Moderate', 'Reintroduction')),
  tags TEXT[] DEFAULT '{}',
  tooltip TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;

-- Everyone can view foods
CREATE POLICY "Anyone can view foods"
  ON foods FOR SELECT
  USING (true);

-- Only admins can insert foods
CREATE POLICY "Admins can insert foods"
  ON foods FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Only admins can update foods
CREATE POLICY "Admins can update foods"
  ON foods FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Only admins can delete foods
CREATE POLICY "Admins can delete foods"
  ON foods FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Breakfast', 'Lunch', 'Dinner', 'Snacks')),
  prep_time TEXT NOT NULL,
  cook_time TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  ingredients JSONB DEFAULT '[]',
  instructions JSONB DEFAULT '[]',
  nutrition_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Everyone can view recipes
CREATE POLICY "Anyone can view recipes"
  ON recipes FOR SELECT
  USING (true);

-- Only admins can insert recipes
CREATE POLICY "Admins can insert recipes"
  ON recipes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Only admins can update recipes
CREATE POLICY "Admins can update recipes"
  ON recipes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Only admins can delete recipes
CREATE POLICY "Admins can delete recipes"
  ON recipes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Create nutrition_plans table
CREATE TABLE IF NOT EXISTS nutrition_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase TEXT NOT NULL CHECK (phase IN ('Adaptation', 'Elimination', 'Reintroduction')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_days INTEGER,
  week_number INTEGER,
  content JSONB NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;

-- Everyone can view nutrition plans
CREATE POLICY "Anyone can view nutrition plans"
  ON nutrition_plans FOR SELECT
  USING (true);

-- Only admins can insert nutrition plans
CREATE POLICY "Admins can insert nutrition plans"
  ON nutrition_plans FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Only admins can update nutrition plans
CREATE POLICY "Admins can update nutrition plans"
  ON nutrition_plans FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Only admins can delete nutrition plans
CREATE POLICY "Admins can delete nutrition plans"
  ON nutrition_plans FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );
