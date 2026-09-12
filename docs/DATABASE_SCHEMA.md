-- KopAI canonical schema (Supabase Postgres). Cerminan file migrasi di supabase/migrations/.
-- Scoring 50/30/20 (client-side, src/lib/scoring.js):
--   savingsScore = min(total_savings / requested_amount, 1) * 100  (bobot 50%)
--   tenureScore dari join_date: <3bln=40, 3-6bln=60, 6-12bln=80, >12bln=100 (bobot 30%)
--   businessScore mapping: karyawan_tetap=90, warung/toko/UMKM>1th=80,
--     ojek/petani/buruh=60, baru/tidak_jelas=50, default 60 (bobot 20%)
--   total = 0.5*savings + 0.3*tenure + 0.2*business
--   risk: >=80 Low, 60-79 Medium, <60 High
-- Contoh: savings 5jt / ajuan 10jt = 50; tenure 8bln = 80; warung = 80
--   => 0.5*50 + 0.3*80 + 0.2*80 = 25+24+16 = 65 => Medium

-- 1. Tabel Profil Pengguna (Relasi ke Supabase Auth)
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

-- 2. Tabel Pengajuan Pinjaman & Hasil AI Credit Scoring
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

-- 3. Tabel Riwayat Chat Asisten Keuangan AI
create table public.ai_chat_history (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references public.profiles(id) on delete cascade not null,
  sender text check (sender in ('user', 'ai')) not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
create index ai_chat_history_member_idx on public.ai_chat_history (member_id);

-- 4. RLS wajib (jangan ship tanpa ini)
alter table public.profiles enable row level security;
alter table public.loan_applications enable row level security;
alter table public.ai_chat_history enable row level security;

create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- profiles: user baca/update milik sendiri; admin baca semua + update siapa pun.
-- Proteksi role: member tidak bisa self-promote (with check role tak berubah).
create policy profiles_select_own on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy profiles_insert_own on public.profiles for insert with check (id = auth.uid());

create or replace function public.my_role()
returns text language sql security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create policy profiles_update_own on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and (role = public.my_role() or public.is_admin()));
create policy profiles_update_admin on public.profiles for update
  using (public.is_admin()) with check (public.is_admin());

-- loan_applications: member insert+select milik sendiri; admin select semua + update keputusan
create policy loans_select on public.loan_applications for select using (member_id = auth.uid() or public.is_admin());
create policy loans_insert_member on public.loan_applications for insert with check (member_id = auth.uid());
create policy loans_update_admin on public.loan_applications for update using (public.is_admin()) with check (public.is_admin());

-- ai_chat_history: member-only milik sendiri (admin tidak butuh akses chat privat)
create policy chat_select_own on public.ai_chat_history for select using (member_id = auth.uid());
create policy chat_insert_own on public.ai_chat_history for insert with check (member_id = auth.uid());