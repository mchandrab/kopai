import { Link } from 'react-router-dom'
import { Card } from '../components/ui.jsx'

const FEATURES = [
  { icon: '📊', title: 'Skor Kredit AI', body: 'Penilaian risiko otomatis 0–100 dari simpanan dan profil usaha — adil untuk anggota unbanked.' },
  { icon: '⚡', title: 'Persetujuan Kilat', body: 'Pengurus melihat antrean terurut risiko lengkap dengan rekomendasi AI yang transparan.' },
  { icon: '💬', title: 'Asisten Keuangan', body: 'Chatbot pendamping membantu anggota mengatur cicilan dan kas usaha harian.' },
]

const STEPS = [
  ['1', 'Daftar & lengkapi profil', 'Isi data diri, simpanan, dan jenis usaha Anda.'],
  ['2', 'Ajukan pinjaman', 'Isi nominal dan tujuan — skor risiko langsung dihitung.'],
  ['3', 'Pengurus memverifikasi', 'Keputusan approve/tolak muncul di dasbor Anda.'],
]

export default function Landing() {
  return (
    <div className="space-y-10">
      <section className="text-center pt-4 sm:pt-8">
        <span className="badge bg-brand-100 text-brand-700">Koperasi Simpan Pinjam · Berbasis AI</span>
        <h1 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          Pinjaman koperasi yang <span className="text-brand-600">cepat & transparan</span>
        </h1>
        <p className="muted mt-3 max-w-xl mx-auto text-base">
          KopAI menilai kelayakan pinjaman dari data simpanan dan usaha Anda — tanpa riwayat bank, dengan rekomendasi AI yang bisa dijelaskan.
        </p>
        <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
          <Link to="/login" className="btn-primary px-6">Mulai Mengajukan</Link>
          <a href="#cara" className="btn-outline px-6">Cara Kerja</a>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2 max-w-md mx-auto text-center">
          {[['Menit', 'proses skor'], ['0–100', 'skor transparan'], ['Gratis', 'infrastruktur']].map(([v, l]) => (
            <div key={l} className="card !p-3">
              <p className="text-lg font-extrabold text-brand-700">{v}</p>
              <p className="text-xs text-slate-500">{l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <Card key={f.title}>
            <p className="text-2xl">{f.icon}</p>
            <p className="font-bold mt-2">{f.title}</p>
            <p className="muted mt-1">{f.body}</p>
          </Card>
        ))}
      </section>

      <section id="cara" className="card">
        <h2 className="text-lg font-bold">Cara kerja</h2>
        <ol className="mt-3 space-y-3">
          {STEPS.map(([n, t, b]) => (
            <li key={n} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white font-bold">{n}</span>
              <div><p className="font-semibold">{t}</p><p className="muted">{b}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <section className="card bg-brand-700 !border-brand-700 text-white text-center">
        <p className="text-lg font-bold">Siap mengajukan pinjaman pertama Anda?</p>
        <p className="text-brand-100 text-sm mt-1">Daftar gratis sebagai anggota koperasi.</p>
        <Link to="/login" className="btn bg-white text-brand-700 hover:bg-brand-50 mt-4 px-6">Daftar Sekarang</Link>
      </section>
    </div>
  )
}
