import { useState } from 'react'
import { Link, Route, Routes, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import ApplyLoan from './pages/ApplyLoan.jsx'
import MemberDashboard from './pages/MemberDashboard.jsx'
import Profile from './pages/Profile.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminMembers from './pages/AdminMembers.jsx'
import ChatAssistant from './pages/ChatAssistant.jsx'

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-extrabold text-lg tracking-tight">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white">K</span>
      KopAI
    </Link>
  )
}

function Nav() {
  const { user, profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const nav = useNavigate()

  async function keluar() {
    await signOut()
    setOpen(false)
    nav('/')
  }

  const links = []
  if (user) {
    links.push(['Dasbor', profile?.role === 'admin' ? '/admin' : '/dashboard'])
    if (profile?.role === 'member') {
      links.push(['Ajukan Pinjaman', '/apply'])
      links.push(['Profil', '/profil'])
    }
    if (profile?.role === 'admin') {
      links.push(['Verifikasi', '/admin'])
      links.push(['Anggota', '/admin/anggota'])
    }
    if (profile?.role === 'member' || profile?.role === 'admin') {
      links.push(['Chat AI', '/chat'])
    }
  }

  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex h-16 items-center gap-3">
          <Logo />
          <span className="flex-1" />
          <nav className="hidden sm:flex items-center gap-1 text-sm">
            {links.map(([label, to]) => (
              <Link key={to} to={to} className="rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100">{label}</Link>
            ))}
            {user ? (
              <button onClick={keluar} className="btn-outline !min-h-0 !py-2 ml-2">Keluar{profile?.role ? ` (${profile.role})` : ''}</button>
            ) : (
              <Link to="/login" className="btn-primary !min-h-0 !py-2 ml-2">Masuk</Link>
            )}
          </nav>
          <button className="sm:hidden btn-outline !min-h-0 !px-3 !py-2" onClick={() => setOpen(!open)} aria-label="Menu">
            ☰
          </button>
        </div>
      </div>
      {open && (
        <nav className="sm:hidden border-t border-slate-200 bg-white px-4 py-2 space-y-1 text-[15px]">
          {links.map(([label, to]) => (
            <Link key={to} to={to} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 font-medium hover:bg-slate-100">{label}</Link>
          ))}
          {user ? (
            <button onClick={keluar} className="block w-full text-left rounded-lg px-3 py-2.5 font-medium text-red-600 hover:bg-red-50">Keluar</button>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)} className="btn-primary w-full">Masuk</Link>
          )}
        </nav>
      )}
    </header>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1 w-full mx-auto max-w-5xl px-4 py-5 sm:py-8">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute allow={['member', 'admin']}><MemberDashboard /></ProtectedRoute>} />
            <Route path="/apply" element={<ProtectedRoute allow={['member']}><ApplyLoan /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute allow={['member', 'admin']}><ChatAssistant /></ProtectedRoute>} />
            <Route path="/profil" element={<ProtectedRoute allow={['member', 'admin']}><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute allow={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/anggota" element={<ProtectedRoute allow={['admin']}><AdminMembers /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-4 text-xs text-slate-500 flex flex-wrap gap-2 justify-between">
            <span>KopAI — Koperasi Modern Berbasis AI</span>
            <span>Simpanan · Pinjaman · Asisten Keuangan</span>
          </div>
        </footer>
      </div>
    </AuthProvider>
  )
}
