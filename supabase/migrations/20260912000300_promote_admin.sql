-- Promote first admin. Requires the user to have signed up via the app first
-- (AuthContext.signUp creates auth.users + public.profiles row).
-- Fails loudly if the auth user does not exist yet.
do $$
declare
  target_email constant text := 'muhammadchandrab@gmail.com';
  target_id uuid;
begin
  select id into target_id from auth.users where email = target_email;
  if target_id is null then
    raise exception 'auth user % not found — daftar dulu via halaman /login, lalu push ulang', target_email;
  end if;
  update public.profiles set role = 'admin', updated_at = now() where id = target_id;
end $$;
