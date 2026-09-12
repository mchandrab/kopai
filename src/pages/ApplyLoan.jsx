import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { calculateCreditScore } from '../lib/scoring.js'
import { enrichNotes } from '../lib/gemini.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { Card, PageHeader, ScoreMeter, RiskBadge, rupiah } from '../components/ui.jsx'

export default function ApplyLoan() {
  const { user, profile } = useAuth()
  const nav = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ requested_amount: '', purpose: '' })
  const [preview, setPreview] = useState(null)
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(null)

  function hitung() {
    const calc = calculateCreditScore({
      totalSavings: profile?.total_savings ?? 0,
      requestedAmount: form.requested_amount,
      joinDate: profile?.join_date,
      businessType: profile?.business_type,
    })
    setPreview(calc)
    setStep(2)
  }

  async function kirim() {
    setErr('')
    setSaving(true)
    try {
      const notes = await enrichNotes(preview.notes, { score: preview.score, risk: preview.riskLevel })
      const { error } = await supabase.from('loan_applications').insert({
        member_id: user.id,
        requested_amount: form.requested_amount,
        purpose: form.purpose,
        ai_credit_score: preview.score,
        ai_risk_level: preview.riskLevel,
        ai_recommendation_notes: notes,
      })
      if (error) throw error
      setDone({ ...preview, notes })
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setSaving(false)
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md">
        <Card className="text-center py-8">
          <p className="text-4xl">✅</p>
          <h2 className="text-xl font-extrabold mt-2">Pengajuan terkirim!</h2>
          <p className="muted mt-1">Pengurus akan memverifikasi. Pantau status di dasbor.</p>
          <div className="mt-4 text-left border-t border-slate-100 pt-4">
            <ScoreMeter score={done.score} />
            <p className="mt-2"><RiskBadge level={done.riskLevel} /></p>
            <p className="muted mt-2">{done.notes}</p>
          </div>
          <button onClick={() => nav('/dashboard')} className="btn-primary w-full mt-4">Lihat Dasbor</button>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md">
      <PageHeader title="Pengajuan Pinjaman" subtitle={`Langkah ${step} dari 2`} />
      <div className="flex gap-1 mb-4">
        {[1, 2].map((n) => (
          <div key={n} className={`h-1.5 flex-1 rounded-full ${n <= step ? 'bg-brand-600' : 'bg-slate-200'}`} />
        ))}
      </div>

      {step === 1 && (
        <Card>
          <form onSubmit={(e) => { e.preventDefault(); hitung() }} className="space-y-3">
            <div>
              <label className="label" htmlFor="nominal">Nominal pinjaman</label>
              <input id="nominal" className="field tnum" type="number" min="1" inputMode="numeric" placeholder="cth. 5000000"
                value={form.requested_amount} onChange={(e) => setForm({ ...form, requested_amount: e.target.value })} required />
              {form.requested_amount && <p className="text-sm text-brand-700 font-semibold mt-1 tnum">{rupiah(form.requested_amount)}</p>}
            </div>
            <div>
              <label className="label" htmlFor="tujuan">Tujuan pinjaman</label>
              <textarea id="tujuan" className="field" rows="3" placeholder="cth. Modal warung sembako"
                value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} required />
            </div>
            <button className="btn-primary w-full">Lihat Skor Saya →</button>
          </form>
        </Card>
      )}

      {step === 2 && preview && (
        <div className="space-y-3">
          <Card>
            <p className="label">Pratinjau skor Anda</p>
            <ScoreMeter score={preview.score} />
            <p className="mt-2"><RiskBadge level={preview.riskLevel} /></p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              {[['Simpanan', preview.parts.savings], ['Keanggotaan', preview.parts.tenure], ['Usaha', preview.parts.business]].map(([l, v]) => (
                <div key={l} className="rounded-xl bg-slate-50 border border-slate-100 p-2">
                  <p className="font-extrabold text-base tnum">{v}</p>
                  <p className="text-slate-500">{l}</p>
                </div>
              ))}
            </div>
            <p className="muted mt-3">{preview.notes}</p>
          </Card>
          {err && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="btn-outline flex-1">← Ubah</button>
            <button onClick={kirim} disabled={saving} className="btn-success flex-1">{saving ? 'Mengirim...' : 'Kirim Pengajuan'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
