-- Harden profiles role: members must not self-promote to admin.
-- Previously profiles_update_own allowed changing own role column.
drop policy if exists profiles_update_own on public.profiles;

create or replace function public.my_role()
returns text language sql security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

-- member boleh update baris sendiri asal role tidak berubah (atau ia admin)
create policy profiles_update_own on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and (role = public.my_role() or public.is_admin()));

-- admin boleh update baris siapa pun (untuk ubah role / koreksi data)
create policy profiles_update_admin on public.profiles for update
  using (public.is_admin()) with check (public.is_admin());
