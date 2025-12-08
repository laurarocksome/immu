import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface TestUserData {
  email: string;
  password: string;
  fullName: string;
  gender: string;
  age: number;
  weight: number;
  height: number;
  conditions: string[];
  symptoms: string[];
  dietStartDay: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const testUserData: TestUserData = {
      email: 'test@immuhealth.com',
      password: 'TestUser123!',
      fullName: 'Test User',
      gender: 'Female',
      age: 32,
      weight: 68.5,
      height: 165,
      conditions: ['Hashimoto\'s thyroiditis', 'Chronic migraines', 'IBS'],
      symptoms: ['Fatigue', 'Brain fog', 'Bloating', 'Headache', 'Joint pain'],
      dietStartDay: 35,
    };

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    let userId: string;
    
    const existingUser = existingUsers.users.find(
      (u) => u.email === testUserData.email
    );

    if (existingUser) {
      userId = existingUser.id;
      console.log('Test user already exists, updating data...');
      
      // Delete existing data for this user
      await supabase.from('symptom_logs').delete().eq('user_id', userId);
      await supabase.from('period_symptoms').delete().eq('user_id', userId);
      await supabase.from('digestive_symptoms').delete().eq('user_id', userId);
      await supabase.from('daily_logs').delete().eq('user_id', userId);
      await supabase.from('diet_violations').delete().eq('user_id', userId);
      await supabase.from('completed_todos').delete().eq('user_id', userId);
      await supabase.from('weight_history').delete().eq('user_id', userId);
      await supabase.from('user_conditions').delete().eq('user_id', userId);
      await supabase.from('user_symptoms').delete().eq('user_id', userId);
      await supabase.from('athlete_info').delete().eq('user_id', userId);
      await supabase.from('user_habits').delete().eq('user_id', userId);
      await supabase.from('diet_plan').delete().eq('user_id', userId);
      await supabase.from('user_profiles').delete().eq('user_id', userId);
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: testUserData.email,
        password: testUserData.password,
        email_confirm: true,
        user_metadata: {
          full_name: testUserData.fullName,
        },
      });

      if (createError) throw createError;
      userId = newUser.user.id;
      console.log('Created new test user');
    }

    // Calculate diet start date (35 days ago)
    const dietStartDate = new Date();
    dietStartDate.setDate(dietStartDate.getDate() - testUserData.dietStartDay);
    const dietStartDateStr = dietStartDate.toISOString().split('T')[0];

    // 1. Create user profile
    await supabase.from('user_profiles').insert({
      user_id: userId,
      gender: testUserData.gender,
      age: testUserData.age,
      weight: testUserData.weight,
      weight_unit: 'kg',
      height: testUserData.height,
      height_unit: 'cm',
    });

    // 2. Create user conditions
    const conditionsData = testUserData.conditions.map((condition) => ({
      user_id: userId,
      condition_name: condition,
    }));
    await supabase.from('user_conditions').insert(conditionsData);

    // 3. Create user symptoms
    const symptomsData = testUserData.symptoms.map((symptom) => ({
      user_id: userId,
      symptom_name: symptom,
      description: null,
    }));
    await supabase.from('user_symptoms').insert(symptomsData);

    // 4. Create user habits
    await supabase.from('user_habits').insert({
      user_id: userId,
      stress_management: 'I practice meditation and yoga',
      activity_level: 'Moderate activity',
      caffeine_habits: '1-2 cups',
      alcohol_habits: 'Occasionally',
      sugar_habits: 'Rarely consume sugar',
      vegetable_habits: '5+ servings',
    });

    // 5. Create diet plan (with 28 day adaptation + 30 day elimination = day 35 means in elimination phase)
    await supabase.from('diet_plan').insert({
      user_id: userId,
      diet_start_date: dietStartDateStr,
      diet_timeline_days: 90,
      needs_adaptation: true,
      adaptation_days: 28,
      elimination_days: 30,
      current_phase: 'elimination',
      streak_days: 35,
      last_diet_success_log: new Date().toISOString().split('T')[0],
    });

    // 6. Create weight history (showing progress)
    const weightHistory = [];
    for (let i = 0; i <= testUserData.dietStartDay; i += 7) {
      const date = new Date(dietStartDate);
      date.setDate(date.getDate() + i);
      const weight = testUserData.weight + (3.5 - (i / testUserData.dietStartDay) * 3.5);
      weightHistory.push({
        user_id: userId,
        weight: Math.round(weight * 10) / 10,
        weight_unit: 'kg',
        logged_date: date.toISOString().split('T')[0],
      });
    }
    await supabase.from('weight_history').insert(weightHistory);

    // 7. Create daily logs for the past 35 days
    const dailyLogs = [];
    const symptomLogs = [];
    
    for (let i = 0; i < testUserData.dietStartDay; i++) {
      const date = new Date(dietStartDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Create daily log with improving wellness scores
      const baseWellness = 50 + (i / testUserData.dietStartDay) * 30;
      const dailyLogData = {
        user_id: userId,
        log_date: dateStr,
        mood: Math.min(5, Math.max(1, Math.round(2 + (i / testUserData.dietStartDay) * 3))),
        sleep_quality: Math.min(5, Math.max(1, Math.round(2 + (i / testUserData.dietStartDay) * 2.5))),
        stress_level: Math.max(1, Math.round(4 - (i / testUserData.dietStartDay) * 2)),
        wellness_score: Math.round(baseWellness + Math.random() * 10),
        notes: i % 7 === 0 ? 'Feeling better this week!' : null,
        on_period: testUserData.gender === 'Female' && i >= 7 && i <= 10,
        diet_success: true,
      };
      
      dailyLogs.push(dailyLogData);
    }
    
    const { data: insertedLogs } = await supabase.from('daily_logs').insert(dailyLogs).select();
    
    // 8. Create symptom logs for each daily log
    if (insertedLogs) {
      for (const log of insertedLogs) {
        const dayNumber = Math.floor((new Date(log.log_date).getTime() - dietStartDate.getTime()) / (1000 * 60 * 60 * 24));
        
        for (const symptom of testUserData.symptoms) {
          // Symptoms improve over time
          const baseSeverity = 5 - Math.floor((dayNumber / testUserData.dietStartDay) * 3);
          symptomLogs.push({
            daily_log_id: log.id,
            user_id: userId,
            symptom_name: symptom,
            severity: Math.max(1, Math.min(5, baseSeverity + Math.floor(Math.random() * 2) - 1)),
          });
        }
      }
      
      await supabase.from('symptom_logs').insert(symptomLogs);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Test user created and populated with data',
        credentials: {
          email: testUserData.email,
          password: testUserData.password,
        },
        userId: userId,
        dietDay: testUserData.dietStartDay,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error setting up test user:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});