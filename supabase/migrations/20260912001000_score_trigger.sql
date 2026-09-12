-- Skor otoritatif di server: hitung ulang ai_credit_score + ai_risk_level
-- dari data profil saat INSERT, timpa nilai kiriman klien.
-- Menutup lubang: member mem-POST skor palsu via API langsung.
-- (ai_recommendation_notes tetap milik klien — hasil pengayaan Gemini.)
create or replace function public.score_loan_application()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_savings numeric;
  v_join timestamptz;
  v_biz text;
  v_months numeric;
  s integer;
  t integer;
  b integer;
  total integer;
begin
  select total_savings, join_date, coalesce(business_type, '')
    into v_savings, v_join, v_biz
    from public.profiles where id = new.member_id;
  if not found then
    raise exception 'profil anggota tidak ditemukan';
  end if;

  s := round(least(v_savings / nullif(new.requested_amount, 0), 1) * 100)::integer;

  v_months := floor(extract(epoch from (now() - v_join)) / 2592000);
  t := case
    when v_months > 12 then 100
    when v_months >= 6 then 80
    when v_months >= 3 then 60
    else 40
  end;

  b := case
    when v_biz ilike '%karyawan%' then 90
    when v_biz ilike '%warung%' or v_biz ilike '%toko%' or v_biz ilike '%umkm%' or v_biz ilike '%dagang%' then 80
    when v_biz ilike '%ojek%' or v_biz ilike '%petani%' or v_biz ilike '%buruh%' then 60
    when v_biz ilike '%baru%' then 50
    else 60
  end;

  total := round(0.5 * s + 0.3 * t + 0.2 * b)::integer;
  new.ai_credit_score := total;
  new.ai_risk_level := case when total >= 80 then 'Low' when total >= 60 then 'Medium' else 'High' end;
  return new;
end $$;

drop trigger if exists trg_score_loan_application on public.loan_applications;
create trigger trg_score_loan_application
  before insert on public.loan_applications
  for each row execute function public.score_loan_application();
