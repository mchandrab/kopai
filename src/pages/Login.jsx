import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { Card } from '../components/ui.jsx'

export default function Login() {
  const { user, signIn, signUp } = useAuth()
  const nav = useNavigate()
  const [mode, setMode] = useState('signin')
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  // Sudah masuk? Jangan tampilkan form lagi.
  if (user) return <Navigate to="/dashboard" replace />

  async function submit(e) {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      if (mode === 'signin') await signIn(form)
      else await signUp(form)
      nav('/dashboard')
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <div className="text-center mb-4">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white text-2xl font-extrabold">K</span>
        <h1 className="text-2xl font-extrabold mt-2">{mode === 'signin' ? 'Selamat datang kembali' : 'Daftar anggota'}</h1>
        <p className="muted">Koperasi Modern Berbasis AI</p>
      </div>
      <Card>
        <form onSubmit={submit} className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="label" htmlFor="nama">Nama lengkap</label>
              <input id="nama" className="field" placeholder="cth. Siti Aminah"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
          )}
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" className="field" type="email" placeholder="nama@email.com" autoComplete="email"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="label" htmlFor="sandi">Kata sandi</label>
            <input id="sandi" className="field" type="password" placeholder="Minimal 6 karakter" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          {err && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}
          <button disabled={busy} className="btn-primary w-full">
            {busy ? 'Memproses...' : mode === 'signin' ? 'Masuk' : 'Daftar'}
          </button>
        </form>
        <button className="mt-3 w-full text-sm text-brand-600 font-medium py-2" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setErr('') }}>
          {mode === 'signin' ? 'Belum punya akun? Daftar di sini' : 'Sudah punya akun? Masuk di sini'}
        </button>
      </Card>
      <p className="muted text-center mt-3 text-xs">
        Akun pengurus (admin) diatur oleh koperasi. <Link className="underline" to="/">← Beranda</Link>
      </p>
    </div>
  )
}
