/*
  Test User Data Population Script

  IMPORTANT: Before running this script:
  1. Sign up manually with: test@immuhealth.com / TestUser123!
  2. Copy your user ID from the auth.users table
  3. Replace 'YOUR_USER_ID_HERE' below with your actual user ID
  4. Run this script to populate test data

  This creates a test user on day 35 of their AIP diet journey with:
  - Complete profile (Female, 32 years old, 68.5kg, 165cm)
  - 3 conditions (Hashimoto's, Chronic migraines, IBS)
  - 5 tracked symptoms (Fatigue, Brain fog, Bloating, Headache, Joint pain)
  - 35 days of daily logs showing improvement
  - Weight history showing 3.5kg loss
*/

DO $$
DECLARE
  v_user_id UUID := 'YOUR_USER_ID_HERE'; -- REPLACE THIS WITH YOUR ACTUAL USER ID
  v_diet_start_date DATE := CURRENT_DATE - INTERVAL '35 days';
  v_log_date DATE;
  v_daily_log_id UUID;
  v_day_number INT;
  v_weight DECIMAL;
BEGIN
  -- Check if user ID is set
  IF v_user_id = 'YOUR_USER_ID_HERE'::UUID THEN
    RAISE EXCEPTION 'Please replace YOUR_USER_ID_HERE with your actual user ID from auth.users';
  END IF;

  -- Clear any existing data for this user
  DELETE FROM symptom_logs WHERE user_id = v_user_id;
  DELETE FROM period_symptoms WHERE user_id = v_user_id;
  DELETE FROM digestive_symptoms WHERE user_id = v_user_id;
  DELETE FROM daily_logs WHERE user_id = v_user_id;
  DELETE FROM diet_violations WHERE user_id = v_user_id;
  DELETE FROM completed_todos WHERE user_id = v_user_id;
  DELETE FROM weight_history WHERE user_id = v_user_id;
  DELETE FROM user_conditions WHERE user_id = v_user_id;
  DELETE FROM user_symptoms WHERE user_id = v_user_id;
  DELETE FROM athlete_info WHERE user_id = v_user_id;
  DELETE FROM user_habits WHERE user_id = v_user_id;
  DELETE FROM diet_plan WHERE user_id = v_user_id;
  DELETE FROM user_profiles WHERE user_id = v_user_id;

  -- 1. Create user profile
  INSERT INTO user_profiles (user_id, gender, age, weight, weight_unit, height, height_unit)
  VALUES (v_user_id, 'Female', 32, 68.5, 'kg', 165, 'cm');

  -- 2. Create user conditions
  INSERT INTO user_conditions (user_id, condition_name) VALUES
    (v_user_id, 'Hashimoto''s thyroiditis'),
    (v_user_id, 'Chronic migraines'),
    (v_user_id, 'IBS');

  -- 3. Create user symptoms
  INSERT INTO user_symptoms (user_id, symptom_name) VALUES
    (v_user_id, 'Fatigue'),
    (v_user_id, 'Brain fog'),
    (v_user_id, 'Bloating'),
    (v_user_id, 'Headache'),
    (v_user_id, 'Joint pain');

  -- 4. Create user habits
  INSERT INTO user_habits (user_id, stress_management, activity_level, caffeine_habits, alcohol_habits, sugar_habits, vegetable_habits)
  VALUES (v_user_id, 'I practice meditation and yoga', 'Moderate activity', '1-2 cups', 'Occasionally', 'Rarely consume sugar', '5+ servings');

  -- 5. Create diet plan (day 35: in elimination phase after 28-day adaptation)
  INSERT INTO diet_plan (
    user_id, diet_start_date, diet_timeline_days, needs_adaptation,
    adaptation_days, elimination_days, current_phase, streak_days, last_diet_success_log
  )
  VALUES (
    v_user_id, v_diet_start_date, 90, true,
    28, 30, 'elimination', 35, CURRENT_DATE
  );

  -- 6. Create weight history (showing 3.5kg loss over 35 days)
  FOR i IN 0..4 LOOP
    v_weight := 72.0 - (i * 0.7); -- Started at 72kg, now at 68.5kg
    INSERT INTO weight_history (user_id, weight, weight_unit, logged_date)
    VALUES (v_user_id, v_weight, 'kg', v_diet_start_date + (i * 7));
  END LOOP;

  -- 7. Create daily logs for past 35 days
  FOR i IN 0..34 LOOP
    v_log_date := v_diet_start_date + i;

    INSERT INTO daily_logs (
      user_id, log_date, mood, sleep_quality, stress_level,
      wellness_score, notes, on_period, diet_success
    )
    VALUES (
      v_user_id,
      v_log_date,
      LEAST(5, GREATEST(1, 2 + (i / 12)::INT)), -- Mood improves: 2 -> 5
      LEAST(5, GREATEST(1, 2 + (i / 14)::INT)), -- Sleep improves: 2 -> 5
      GREATEST(1, 4 - (i / 18)::INT), -- Stress decreases: 4 -> 1
      50 + (i * 30 / 35) + (random() * 10)::INT, -- Wellness: 50 -> 80+
      CASE WHEN i % 7 = 0 THEN 'Feeling better this week!' ELSE NULL END,
      (i >= 7 AND i <= 10), -- Period on days 7-10
      true
    )
    RETURNING id INTO v_daily_log_id;

    -- 8. Create symptom logs for each day
    INSERT INTO symptom_logs (daily_log_id, user_id, symptom_name, severity)
    VALUES
      (v_daily_log_id, v_user_id, 'Fatigue', GREATEST(1, 5 - (i / 12)::INT)),
      (v_daily_log_id, v_user_id, 'Brain fog', GREATEST(1, 5 - (i / 12)::INT)),
      (v_daily_log_id, v_user_id, 'Bloating', GREATEST(1, 4 - (i / 12)::INT)),
      (v_daily_log_id, v_user_id, 'Headache', GREATEST(1, 4 - (i / 10)::INT)),
      (v_daily_log_id, v_user_id, 'Joint pain', GREATEST(1, 5 - (i / 15)::INT));
  END LOOP;

  RAISE NOTICE 'Test data populated successfully for user %', v_user_id;
  RAISE NOTICE 'User is on day 35 of AIP diet (elimination phase)';
  RAISE NOTICE 'Weight loss: 3.5kg (72kg -> 68.5kg)';
  RAISE NOTICE 'Wellness score improved from ~50 to ~80';
END $$;
