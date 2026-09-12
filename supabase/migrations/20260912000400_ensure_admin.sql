-- Ensure first admin exists even if the profiles row was never created
-- (e.g. signup insert blocked by RLS when email confirmation is on).
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
