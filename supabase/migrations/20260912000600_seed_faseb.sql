-- Seed E2E Fase B (data uji, akan dihapus migrasi cleanup setelahnya).
-- Skenario skor: Siti ~98 Low, Budi ~70 Medium, Agus ~27 High.
insert into public.profiles (id, name, role, join_date, total_savings, business_type)
values
  ('147494c3-d535-4539-bc4f-fbd88bf13696', 'Siti (uji)', 'member', now() - interval '14 months', 12000000, 'karyawan_tetap'),
  ('f9f2e7e6-a0e4-4c46-86d5-a3761b9f5f43', 'Budi (uji)', 'member', now() - interval '8 months', 6000000, 'warung'),
  ('8a4ba4cd-8ffb-4a14-9b64-260cd4d225f7', 'Agus (uji)', 'member', now() - interval '1 month', 1000000, 'baru')
on conflict (id) do update set
  name = excluded.name, role = 'member', join_date = excluded.join_date,
  total_savings = excluded.total_savings, business_type = excluded.business_type,
  updated_at = now();
