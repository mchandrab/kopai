-- KopAI RLS (mandatory). Run after init migration.
alter table public.profiles enable row level security;
alter table public.loan_applications enable row level security;
alter table public.ai_chat_history enable row level security;

create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- profiles: user reads/updates own row; admin reads all
create policy profiles_select_own on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy profiles_update_own on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_insert_own on public.profiles for insert with check (id = auth.uid());

-- loan_applications: member inserts+selects own; admin selects all + updates decisions
create policy loans_select on public.loan_applications for select using (member_id = auth.uid() or public.is_admin());
create policy loans_insert_member on public.loan_applications for insert with check (member_id = auth.uid());
create policy loans_update_admin on public.loan_applications for update using (public.is_admin()) with check (public.is_admin());

-- ai_chat_history: private per member
create policy chat_select_own on public.ai_chat_history for select using (member_id = auth.uid());
create policy chat_insert_own on public.ai_chat_history for insert with check (member_id = auth.uid());
