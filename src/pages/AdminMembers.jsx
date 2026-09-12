import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { BUSINESS_TYPES, businessLabel } from '../lib/businessTypes.js'
import { Card, PageHeader, EmptyState, Loading, rupiah } from '../components/ui.jsx'

export default function AdminMembers() {
  const [members, setMembers] = useState(null)
  const [q, setQ] = useState('')
  const [edit, setEdit] = useState(null)
  const [form, setForm] = useState({ total_savings: '', business_type: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'member').order('created_at', { ascending: false })
    setMembers(data ?? [])
  }

  useEffect(() => { load() }, [])

  function openEdit(m) {
    setEdit(m)
    setForm({ total_savings: String(m.total_savings ?? 0), business_type: m.business_type || '' })
    setErr('')
  }

  async function save() {
    const savings = Number(form.total_savings)
    if (!Number.isFinite(savings) || savings < 0) {
      setErr('Nominal simpanan harus angka ≥ 0.')
      return
    }
    setBusy(true)
    setErr('')
    const { error } = await supabase.from('profiles').update({
      total_savings: savings,
      business_type: form.business_type || null,
      updated_at: new Date().toISOString(),
    }).eq('id', edit.id)
    setBusy(false)
    if (error) {
      setErr(error.message)
      return
    }
    setEdit(null)
    load()
  }

  if (members === null) return <Loading />
  const filtered = members.filter((m) => (m.name || '').toLowerCase().includes(q.toLowerCase()))

  return (
    <div>
      <PageHeader title="Kelola Anggota" subtitle="Ubah simpanan dan koreksi jenis usaha. Hanya pengurus yang bisa mengubah simpanan." />
      <input className="field mb-3" placeholder="Cari nama anggota..." value={q} onChange={(e) => setQ(e.target.value)} />
      {filtered.length === 0 ? (
        <EmptyState title={members.length === 0 ? 'Belum ada anggota' : 'Tidak ditemukan'} body={members.length === 0 ? 'Anggota yang mendaftar via aplikasi akan muncul di sini.' : `Tidak ada anggota bernama "${q}".`} />
      ) : (
        <ul className="space-y-2">
          {filtered.map((m) => (
            <li key={m.id}>
              <Card>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">{m.name}</span>
                  <span className="flex-1" />
                  <span className="font-extrabold tnum">{rupiah(m.total_savings)}</span>
                </div>
                <p className="muted mt-1">{businessLabel(m.business_type)} · sejak {m.join_date ? new Date(m.join_date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : '-'}</p>
                <button onClick={() => openEdit(m)} className="btn-outline !min-h-0 !py-1.5 mt-2 text-xs">Ubah Simpanan / Usaha</button>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {edit && (
        <div className="fixed inset-0 z-20 flex items-end sm:items-center justify-center bg-slate-900/50 p-0 sm:p-4" onClick={() => setEdit(null)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg flex-1">{edit.name}</h3>
              <button onClick={() => setEdit(null)} className="btn-outline !min-h-0 !px-3 !py-1.5" aria-label="Tutup">✕</button>
            </div>
            <div className="mt-3 space-y-3">
              <div>
                <label className="label" htmlFor="simpanan">Total simpanan (Rp)</label>
                <input id="simpanan" className="field tnum" type="number" min="0" inputMode="numeric"
                  value={form.total_savings} onChange={(e) => setForm({ ...form, total_savings: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="usaha-admin">Jenis usaha</label>
                <select id="usaha-admin" className="field" value={form.business_type} onChange={(e) => setForm({ ...form, business_type: e.target.value })}>
                  <option value="">— Belum diisi —</option>
                  {BUSINESS_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label} (skor {t.score})</option>)}
                </select>
              </div>
              {err && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}
              <button onClick={save} disabled={busy} className="btn-primary w-full">{busy ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
