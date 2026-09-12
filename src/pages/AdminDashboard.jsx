import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { Card, PageHeader, Stat, StatusBadge, RiskBadge, ScoreMeter, EmptyState, Loading, rupiah } from '../components/ui.jsx'

const RISK_ORDER = { Low: 0, Medium: 1, High: 2 }

export default function AdminDashboard() {
  const { user } = useAuth()
  const [loans, setLoans] = useState(null)
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 })
  const [detail, setDetail] = useState(null)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    const [{ data: pending }, { data: all }] = await Promise.all([
      supabase.from('loan_applications').select('*, profiles!loan_applications_member_id_fkey(name)').eq('status', 'pending').order('created_at', { ascending: false }),
      supabase.from('loan_applications').select('status'),
    ])
    const sorted = (pending ?? []).sort((a, b) => (RISK_ORDER[a.ai_risk_level] ?? 9) - (RISK_ORDER[b.ai_risk_level] ?? 9))
    setLoans(sorted)
    const c = { pending: 0, approved: 0, rejected: 0 }
    for (const r of all ?? []) if (c[r.status] !== undefined) c[r.status]++
    setCounts(c)
  }

  useEffect(() => { load() }, [])

  async function decide(status) {
    if (!detail) return
    if (status === 'rejected' && !reason.trim()) return
    setBusy(true)
    await supabase.from('loan_applications').update({
      status,
      decided_by: user.id,
      decided_at: new Date().toISOString(),
      rejection_reason: status === 'rejected' ? reason.trim() : null,
      updated_at: new Date().toISOString(),
    }).eq('id', detail.id)
    setBusy(false)
    setDetail(null)
    setReason('')
    load()
  }

  if (loans === null) return <Loading />

  return (
    <div>
      <PageHeader title="Verifikasi Pinjaman" subtitle="Antrean terurut dari risiko terendah. Klik untuk detail." />
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
        <Stat label="Menunggu" value={counts.pending} />
        <Stat label="Disetujui" value={counts.approved} />
        <Stat label="Ditolak" value={counts.rejected} />
      </div>

      {loans.length === 0 ? (
        <EmptyState
          title="Antrean kosong"
          body="Belum ada pengajuan berstatus menunggu. Pengajuan baru dari anggota akan muncul di sini terurut berdasarkan risiko AI."
        />
      ) : (
        <ul className="space-y-2">
          {loans.map((l) => (
            <li key={l.id}>
              <button onClick={() => { setDetail(l); setReason('') }} className="w-full text-left">
                <Card className="hover:border-brand-300">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold">{l.profiles?.name || 'Anggota'}</span>
                    <span className="font-extrabold tnum">{rupiah(l.requested_amount)}</span>
                    <span className="flex-1" />
                    <RiskBadge level={l.ai_risk_level} />
                  </div>
                  <p className="muted mt-1 line-clamp-1">{l.purpose} · Skor {l.ai_credit_score ?? '-'}</p>
                </Card>
              </button>
            </li>
          ))}
        </ul>
      )}

      {detail && (
        <div className="fixed inset-0 z-20 flex items-end sm:items-center justify-center bg-slate-900/50 p-0 sm:p-4" onClick={() => setDetail(null)}>
          <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg flex-1">{detail.profiles?.name}</h3>
              <StatusBadge status={detail.status} />
              <button onClick={() => setDetail(null)} className="btn-outline !min-h-0 !px-3 !py-1.5" aria-label="Tutup">✕</button>
            </div>
            <p className="text-2xl font-extrabold tnum mt-2">{rupiah(detail.requested_amount)}</p>
            <p className="muted">{detail.purpose}</p>
            <div className="mt-4 border-t border-slate-100 pt-4">
              <ScoreMeter score={detail.ai_credit_score} />
              <p className="mt-2"><RiskBadge level={detail.ai_risk_level} /></p>
              <p className="text-sm mt-2 bg-slate-50 border border-slate-100 rounded-xl p-3">{detail.ai_recommendation_notes || 'Tidak ada catatan AI.'}</p>
            </div>
            <div className="mt-4">
              <label className="label" htmlFor="alasan">Alasan penolakan (wajib jika menolak)</label>
              <input id="alasan" className="field" placeholder="cth. Simpanan belum mencukupi"
                value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => decide('rejected')} disabled={busy} className="btn-danger flex-1">Tolak</button>
              <button onClick={() => decide('approved')} disabled={busy} className="btn-success flex-1">{busy ? 'Memproses...' : 'Setujui'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
