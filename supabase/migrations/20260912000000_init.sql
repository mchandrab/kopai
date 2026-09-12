-- KopAI init schema (mirrors docs/DATABASE_SCHEMA.md).
-- Scoring 50/30/20 runs client-side in src/lib/scoring.js.
-- Formula: savingsScore = min(total_savings / requested_amount, 1) * 100 (50%),
-- tenureScore from join_date: <3bln=40, 3-6=60, 6-12=80, >12=100 (30%),
-- businessScore: karyawan_tetap=90, warung/toko/UMKM>1th=80,
-- ojek/petani/buruh=60, baru/tidak_jelas=50, default 60 (20%).
-- total = 0.5*savings + 0.3*tenure + 0.2*business; >=80 Low, 60-79 Medium, <60 High.

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  role text check (role in ('member', 'admin')) not null default 'member',
  join_date timestamp with time zone default timezone('utc'::text, now()) not null,
  total_savings numeric not null default 0 check (total_savings >= 0),
  business_type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.loan_applications (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references public.profiles(id) on delete cascade not null,
  requested_amount numeric not null check (requested_amount > 0),
  purpose text not null,
  status text check (status in ('pending', 'approved', 'rejected')) not null default 'pending',
  ai_credit_score integer check (ai_credit_score is null or (ai_credit_score between 0 and 100)),
  ai_risk_level text check (ai_risk_level is null or (ai_risk_level in ('Low', 'Medium', 'High'))),
  ai_recommendation_notes text,
  decided_by uuid references public.profiles(id),
  decided_at timestamp with time zone,
  rejection_reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
create index loan_applications_member_idx on public.loan_applications (member_id);
create index loan_applications_status_idx on public.loan_applications (status);

create table public.ai_chat_history (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references public.profiles(id) on delete cascade not null,
  sender text check (sender in ('user', 'ai')) not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
create index ai_chat_history_member_idx on public.ai_chat_history (member_id);
