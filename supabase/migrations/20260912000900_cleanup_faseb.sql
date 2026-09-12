-- Cleanup E2E Fase B: hapus pinjaman + profil + user dummy.
-- Dijalankan setelah Confirm email dinyalakan lagi.
delete from public.loan_applications where member_id in (
  '147494c3-d535-4539-bc4f-fbd88bf13696',
  'f9f2e7e6-a0e4-4c46-86d5-a3761b9f5f43',
  '8a4ba4cd-8ffb-4a14-9b64-260cd4d225f7'
);
delete from public.profiles where id in (
  '147494c3-d535-4539-bc4f-fbd88bf13696',
  'f9f2e7e6-a0e4-4c46-86d5-a3761b9f5f43',
  '8a4ba4cd-8ffb-4a14-9b64-260cd4d225f7'
);
delete from auth.users where id in (
  '147494c3-d535-4539-bc4f-fbd88bf13696',
  'f9f2e7e6-a0e4-4c46-86d5-a3761b9f5f43',
  '8a4ba4cd-8ffb-4a14-9b64-260cd4d225f7'
);
