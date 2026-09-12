import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { BUSINESS_TYPES, businessLabel } from '../lib/businessTypes.js'
import { Card, PageHeader, rupiah } from '../components/ui.jsx'

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth()
  const [form, setForm] = useState({ name: profile?.name || '', business_type: profile?.business_type || '' })
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(profile)

  async function submit(e) {
    e.preventDefault()
    setErr('')
    setMsg('')
    setBusy(true)
    try {
      const { data, error } = await supabase.from('profiles')
        .update({ name: form.name.trim(), business_type: form.business_type || null, updated_at: new Date().toISOString() })
        .eq('id', user.id).select().single()
      if (error) throw error
      setSaved(data)
      await refreshProfile()
      setMsg('Profil tersimpan.')
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <PageHeader title="Profil Saya" subtitle="Data ini dipakai menghitung skor pinjaman Anda." />
      <Card>
        <dl className="text-[15px] space-y-2 mb-4">
          <div className="flex justify-between gap-3"><dt className="muted">Total simpanan</dt><dd className="font-extrabold tnum">{rupiah(saved?.total_savings)}</dd></div>
          <div className="flex justify-between gap-3"><dt className="muted">Jenis usaha</dt><dd className="font-semibold text-right">{businessLabel(saved?.business_type)}</dd></div>
          <div className="flex justify-between gap-3"><dt className="muted">Anggota sejak</dt><dd>{saved?.join_date ? new Date(saved.join_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</dd></div>
        </dl>
        <p className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 mb-4">
          Nominal simpanan hanya bisa diubah oleh pengurus koperasi. Hubungi pengurus bila tidak sesuai.
        </p>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="label" htmlFor="nama">Nama lengkap</label>
            <input id="nama" className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label" htmlFor="usaha">Jenis usaha</label>
            <select id="usaha" className="field" value={form.business_type} onChange={(e) => setForm({ ...form, business_type: e.target.value })} required>
              <option value="">— Pilih —</option>
              {BUSINESS_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </div>
          {err && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}
          {msg && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">{msg}</p>}
          <button disabled={busy} className="btn-primary w-full">{busy ? 'Menyimpan...' : 'Simpan Profil'}</button>
        </form>
      </Card>
    </div>
  )
}
