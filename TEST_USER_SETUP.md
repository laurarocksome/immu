# Test User Setup Guide

This guide explains how to create and populate a test user with 35 days of data for the IMMU Health application.

## Test User Credentials

- **Email**: `test@immuhealth.com`
- **Password**: `TestUser123!`

## Setup Instructions

### Option 1: Manual Setup (Recommended)

1. **Sign up with the test account**:
   - Go to your app's signup page
   - Create an account with the test credentials above
   - The email is automatically confirmed in development

2. **Get your user ID**:
   ```sql
   SELECT id FROM auth.users WHERE email = 'test@immuhealth.com';
   ```

3. **Update the seed script**:
   - Open `supabase/seed-test-user.sql`
   - Replace `'YOUR_USER_ID_HERE'` with the actual user ID
   - Save the file

4. **Run the seed script** in your Supabase SQL Editor:
   - Copy the contents of `supabase/seed-test-user.sql`
   - Paste and execute in Supabase Dashboard > SQL Editor

### Option 2: Using Edge Function (When Available)

The edge function `setup-test-user` will automatically create the user and populate data:

```bash
curl -X POST "https://mitojtehpuonxkovmwjp.supabase.co/functions/v1/setup-test-user" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

Or run the included script:
```bash
node setup-test-user.mjs
```

## Test User Data

Once set up, the test user will have:

### Profile
- **Gender**: Female
- **Age**: 32 years
- **Current Weight**: 68.5 kg
- **Height**: 165 cm
- **Starting Weight**: 72 kg (3.5 kg loss)

### Health Conditions
1. Hashimoto's thyroiditis
2. Chronic migraines
3. IBS (Irritable Bowel Syndrome)

### Tracked Symptoms (5)
1. Fatigue
2. Brain fog
3. Bloating
4. Headache
5. Joint pain

### Lifestyle Habits
- **Stress Management**: Practices meditation and yoga
- **Activity Level**: Moderate activity
- **Caffeine**: 1-2 cups per day
- **Alcohol**: Occasionally
- **Sugar**: Rarely consumes sugar
- **Vegetables**: 5+ servings per day

### Diet Plan
- **Start Date**: 35 days ago
- **Current Day**: Day 35
- **Current Phase**: Elimination (completed 28-day adaptation phase)
- **Timeline**: 90 days total
- **Streak**: 35 days (perfect adherence)

### Progress Data

**Daily Logs (35 days)**:
- Complete logs for all 35 days
- Wellness scores improve from ~50 to ~80
- Mood improves from 2 to 5
- Sleep quality improves from 2 to 5
- Stress level decreases from 4 to 1
- All symptoms show improvement over time

**Weight History**:
- Week 0: 72.0 kg
- Week 1: 71.3 kg
- Week 2: 70.6 kg
- Week 3: 69.9 kg
- Week 4-5: 68.5 kg (current)

**Symptom Trends**:
All tracked symptoms show decreasing severity:
- Fatigue: 5 → 2
- Brain fog: 5 → 2
- Bloating: 4 → 2
- Headache: 4 → 2
- Joint pain: 5 → 3

## Resetting Test Data

To reset the test user data, simply run the seed script again. It will:
1. Delete all existing data for the user
2. Repopulate with fresh test data

## Notes

- The test user demonstrates a successful AIP diet journey
- Data shows realistic improvement patterns
- Period tracking included (days 7-10)
- Weekly "feeling better" notes added
- All diet compliance days marked as successful
