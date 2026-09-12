-- Reinstate first admin + audit future role changes.
-- Idempotent: safe to re-push.
do $$
declare
  target_email constant text := 'muhammadchandrab@gmail.com';
  target_id uuid;
  display_name text;
begin
  select id into target_id from auth.users where email = target_email;
  if target_id is null then
    raise exception 'auth user % not found — daftar dulu via halaman /login, lalu push ulang', target_email;
  end if;
  select coalesce(raw_user_meta_data ->> 'name', raw_user_meta_data ->> 'full_name', 'Pengurus')
    into display_name from auth.users where id = target_id;
  insert into public.profiles (id, name, role)
    values (target_id, display_name, 'admin')
    on conflict (id) do update set role = 'admin', updated_at = now();
  raise notice 'admin ensured for % (%)', target_email, target_id;
end $$;

-- Audit log for role changes (owner-visible via Table Editor; no API access).
create table if not exists public.role_audit_log (
  id bigint generated always as identity primary key,
  profile_id uuid not null,
  old_role text,
  new_role text,
  changed_at timestamp with time zone default now() not null
);

create or replace function public.log_role_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role then
    insert into public.role_audit_log (profile_id, old_role, new_role) values (new.id, old.role, new.role);
  end if;
  return new;
end $$;

drop trigger if exists trg_log_role_change on public.profiles;
create trigger trg_log_role_change
  after update on public.profiles
  for each row execute function public.log_role_change();
