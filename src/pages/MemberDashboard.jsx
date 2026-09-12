import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { Card, PageHeader, Stat, StatusBadge, RiskBadge, EmptyState, Loading, rupiah } from '../components/ui.jsx'

export default function MemberDashboard() {
  const { user, profile } = useAuth()
  const [loans, setLoans] = useState(null)

  useEffect(() => {
    if (!user) return
    supabase.from('loan_applications').select('*').eq('member_id', user.id)
      .order('created_at', { ascending: false }).then(({ data }) => setLoans(data ?? []))
  }, [user])

  if (loans === null) return <Loading />

  const pending = loans.filter((l) => l.status === 'pending').length
  const active = loans.filter((l) => l.status === 'approved').length

  return (
    <div>
      <PageHeader
        title={`Halo, ${profile?.name || 'Anggota'} 👋`}
        subtitle="Kelola simpanan, pinjaman, dan kesehatan keuangan Anda."
        action={<Link to="/chat" className="btn-outline">💬 Chat AI</Link>}
      />
      {!profile?.business_type && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm flex-1"><b>Profil belum lengkap.</b> Isi jenis usaha agar skor pinjaman akurat.</p>
          <Link to="/profil" className="btn-primary !min-h-0 !py-2">Lengkapi</Link>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4">
        <Stat label="Total Simpanan" value={rupiah(profile?.total_savings)} sub={`Anggota sejak ${profile?.join_date ? new Date(profile.join_date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : '-'}`} />
        <Stat label="Menunggu Verifikasi" value={pending} sub="pengajuan" />
        <div className="col-span-2 sm:col-span-1">
          <Stat label="Pinjaman Disetujui" value={active} sub="pengajuan" />
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold">Riwayat Pengajuan</h3>
        <Link to="/apply" className="btn-primary !min-h-0 !py-2">+ Ajukan</Link>
      </div>

      {loans.length === 0 ? (
        <EmptyState
          title="Belum ada pengajuan"
          body="Anda belum pernah mengajukan pinjaman. Isi nominal dan tujuan — skor risiko langsung dihitung transparan."
          action={<Link to="/apply" className="btn-primary px-6">Ajukan Pinjaman Pertama</Link>}
        />
      ) : (
        <ul className="space-y-2">
          {loans.map((l) => (
            <li key={l.id}>
              <Card>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold tnum">{rupiah(l.requested_amount)}</span>
                  <StatusBadge status={l.status} />
                  {l.ai_risk_level && <RiskBadge level={l.ai_risk_level} />}
                  <span className="flex-1" />
                  <span className="text-xs text-slate-500 tnum">Skor {l.ai_credit_score ?? '-'}</span>
                </div>
                <p className="muted mt-1">{l.purpose}</p>
                {l.status === 'rejected' && l.rejection_reason && (
                  <p className="text-sm text-red-600 mt-1">Alasan: {l.rejection_reason}</p>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
