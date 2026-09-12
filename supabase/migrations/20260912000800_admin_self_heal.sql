-- Admin self-heal: reinstate current row + auto-admin on future re-registrations.
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

-- Setiap pendaftaran ulang email admin otomatis menjadi admin lagi,
-- sehingga hapus-daftar tak sengaja sembuh sendiri saat login berikutnya.
create or replace function public.auto_admin_on_signup()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  admin_id uuid;
begin
  select id into admin_id from auth.users where email = 'muhammadchandrab@gmail.com';
  if admin_id is not null and new.id = admin_id then
    new.role := 'admin';
  end if;
  return new;
end $$;

drop trigger if exists trg_auto_admin_on_signup on public.profiles;
create trigger trg_auto_admin_on_signup
  before insert on public.profiles
  for each row execute function public.auto_admin_on_signup();
