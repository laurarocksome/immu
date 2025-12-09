-- Create users table
create table if not exists users (
  id uuid primary key default auth.uid(),
  email text unique not null,
  name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_profiles table
create table if not exists user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  gender text,
  age integer,
  weight numeric,
  weight_unit text default 'kg',
  height numeric,
  height_unit text default 'cm',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Create conditions table
create table if not exists user_conditions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  condition text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create symptoms table
create table if not exists user_symptoms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  symptom text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create diet_info table
create table if not exists diet_info (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  start_date timestamp with time zone not null,
  timeline_days integer not null,
  adaptation_choice text not null,
  current_phase text default 'adaptation',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Create daily_logs table
create table if not exists daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  log_date date not null,
  mood integer,
  sleep integer,
  stress integer,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, log_date)
);

-- Create symptom_logs table
create table if not exists symptom_logs (
  id uuid primary key default gen_random_uuid(),
  daily_log_id uuid not null references daily_logs(id) on delete cascade,
  symptom text not null,
  severity integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table users enable row level security;
alter table user_profiles enable row level security;
alter table user_conditions enable row level security;
alter table user_symptoms enable row level security;
alter table diet_info enable row level security;
alter table daily_logs enable row level security;
alter table symptom_logs enable row level security;

-- Create RLS policies
create policy "Users can view own data" on users
  for select using (auth.uid() = id);

create policy "Users can view own profile" on user_profiles
  for select using (auth.uid() = user_id);

create policy "Users can insert own profile" on user_profiles
  for insert with check (auth.uid() = user_id);

create policy "Users can update own profile" on user_profiles
  for update using (auth.uid() = user_id);

create policy "Users can view own conditions" on user_conditions
  for select using (auth.uid() = user_id);

create policy "Users can insert own conditions" on user_conditions
  for insert with check (auth.uid() = user_id);

create policy "Users can view own symptoms" on user_symptoms
  for select using (auth.uid() = user_id);

create policy "Users can insert own symptoms" on user_symptoms
  for insert with check (auth.uid() = user_id);

create policy "Users can view own diet info" on diet_info
  for select using (auth.uid() = user_id);

create policy "Users can insert own diet info" on diet_info
  for insert with check (auth.uid() = user_id);

create policy "Users can update own diet info" on diet_info
  for update using (auth.uid() = user_id);

create policy "Users can view own logs" on daily_logs
  for select using (auth.uid() = user_id);

create policy "Users can insert own logs" on daily_logs
  for insert with check (auth.uid() = user_id);

create policy "Users can update own logs" on daily_logs
  for update using (auth.uid() = user_id);

create policy "Users can view own symptom logs" on symptom_logs
  for select using (
    exists (
      select 1 from daily_logs
      where daily_logs.id = symptom_logs.daily_log_id
      and daily_logs.user_id = auth.uid()
    )
  );

create policy "Users can insert own symptom logs" on symptom_logs
  for insert with check (
    exists (
      select 1 from daily_logs
      where daily_logs.id = symptom_logs.daily_log_id
      and daily_logs.user_id = auth.uid()
    )
  );
