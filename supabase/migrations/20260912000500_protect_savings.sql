-- Proteksi kolom total_savings: hanya pengurus (atau backend/migrasi) yang boleh mengubahnya.
-- Anggota tetap boleh update nama/business_type via policy profiles_update_own.
create or replace function public.forbid_member_savings_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- auth.uid() null = dijalankan backend/migrasi/seed (tanpa JWT) -> izinkan
  if auth.uid() is null then
    return new;
  end if;
  if new.total_savings is distinct from old.total_savings and not public.is_admin() then
    raise exception 'Hanya pengurus yang dapat mengubah simpanan anggota';
  end if;
  return new;
end $$;

drop trigger if exists trg_forbid_member_savings_change on public.profiles;
create trigger trg_forbid_member_savings_change
  before update on public.profiles
  for each row execute function public.forbid_member_savings_change();
