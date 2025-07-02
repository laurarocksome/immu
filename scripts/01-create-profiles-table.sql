-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  age INTEGER CHECK (age > 0 AND age < 150),
  weight NUMERIC(5,2) CHECK (weight > 0),
  weight_unit TEXT DEFAULT 'lbs' CHECK (weight_unit IN ('lbs', 'kg')),
  height_feet INTEGER CHECK (height_feet >= 0 AND height_feet <= 10),
  height_inches INTEGER CHECK (height_inches >= 0 AND height_inches < 12),
  height_cm INTEGER CHECK (height_cm > 0 AND height_cm < 300),
  height_unit TEXT DEFAULT 'ft_in' CHECK (height_unit IN ('ft_in', 'cm')),
  phase_name TEXT CHECK (phase_name IN ('adaptation', 'elimination', 'reintroduction')),
  phase_day INTEGER CHECK (phase_day > 0),
  conditions TEXT[], -- Array of condition strings
  stress_level TEXT CHECK (stress_level IN ('low', 'moderate', 'high')),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
  caffeine_habit TEXT CHECK (caffeine_habit IN ('none', 'occasional', 'daily_1_2', 'daily_3_plus')),
  alcohol_habit TEXT CHECK (alcohol_habit IN ('none', 'occasional', 'weekly', 'daily')),
  sugar_habit TEXT CHECK (sugar_habit IN ('low', 'moderate', 'high')),
  vegetable_habit TEXT CHECK (vegetable_habit IN ('low', 'moderate', 'high')),
  is_athlete BOOLEAN DEFAULT FALSE,
  athlete_info JSONB, -- Store additional athlete data as JSON
  onboarding_completed BOOLEAN DEFAULT FALSE,
  diet_start_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- Create function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
