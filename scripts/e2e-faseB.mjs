// E2E Fase B — akun member dummy + pinjaman L/M/H.
// Pakai: E2E_PASSWORD='...' node scripts/e2e-faseB.mjs phase1|phase2
// phase1: daftar 3 akun, laporkan id + apakah sesi langsung (confirm-email OFF?)
// phase2: masuk tiap akun, lengkapi usaha, hitung skor lokal, ajukan pinjaman.
import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { calculateCreditScore } from '../src/lib/scoring.js'

const env = Object.fromEntries(
  fs.readFileSync('.env', 'utf8').split('\n').filter((l) => l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] }),
)
const URL = env.VITE_SUPABASE_URL
const ANON = env.VITE_SUPABASE_ANON_KEY
const PASSWORD = process.env.E2E_PASSWORD
if (!PASSWORD) {
  console.error('Isi E2E_PASSWORD dulu (password akun dummy, tidak di-commit).')
  process.exit(1)
}

const BASE = process.env.E2E_EMAIL_BASE || 'muhammadchandrab@gmail.com'
const plus = (n) => BASE.replace('@', `+kopaiuji${n}@`)

const DUMMIES = [
  { email: plus(1), name: 'Siti (uji)', business: 'karyawan_tetap', amount: 8000000, purpose: 'Modal usaha katering (uji)' },
  { email: plus(2), name: 'Budi (uji)', business: 'warung', amount: 10000000, purpose: 'Stok warung (uji)' },
  { email: plus(3), name: 'Agus (uji)', business: 'baru', amount: 10000000, purpose: 'Buka usaha baru (uji)' },
]

const mode = process.argv[2] || 'phase1'

if (mode === 'phase1') {
  for (const d of DUMMIES) {
    const sb = createClient(URL, ANON)
    const { data, error } = await sb.auth.signUp({ email: d.email, password: PASSWORD })
    if (error) {
      console.log(d.email, 'SIGNUP_FAIL:', error.message)
    } else {
      console.log(d.email, 'id=' + data.user?.id, data.session ? 'SESSION_OK(confirm OFF)' : 'NO_SESSION(confirm ON)')
    }
    await new Promise((r) => setTimeout(r, 6000))
  }
}

if (mode === 'phase2') {
  for (const d of DUMMIES) {
    const sb = createClient(URL, ANON)
    const { data: sess, error: loginErr } = await sb.auth.signInWithPassword({ email: d.email, password: PASSWORD })
    if (loginErr) {
      console.log(d.email, 'LOGIN_FAIL:', loginErr.message)
      continue
    }
    const uid = sess.user.id
    await sb.from('profiles').update({ business_type: d.business }).eq('id', uid)
    const { data: prof } = await sb.from('profiles').select('*').eq('id', uid).single()
    const calc = calculateCreditScore({
      totalSavings: prof.total_savings ?? 0,
      requestedAmount: d.amount,
      joinDate: prof.join_date,
      businessType: prof.business_type,
    })
    const { error: loanErr } = await sb.from('loan_applications').insert({
      member_id: uid,
      requested_amount: d.amount,
      purpose: d.purpose,
      ai_credit_score: calc.score,
      ai_risk_level: calc.riskLevel,
      ai_recommendation_notes: calc.notes,
    })
    console.log(d.email, 'skor=' + calc.score, calc.riskLevel, loanErr ? 'LOAN_FAIL:' + loanErr.message : 'LOAN_OK')
  }
}
