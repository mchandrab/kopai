// Komponen UI bersama — fintech bersih, mobile-first, Indonesia penuh.
export function rupiah(n) {
  return 'Rp' + Number(n || 0).toLocaleString('id-ID')
}

export function Card({ children, className = '' }) {
  return <div className={`card ${className}`}>{children}</div>
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="muted mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function RiskBadge({ level }) {
  if (!level) return null
  const cls = level === 'Low' ? 'badge-low' : level === 'Medium' ? 'badge-medium' : 'badge-high'
  const label = level === 'Low' ? 'Risiko Rendah' : level === 'Medium' ? 'Risiko Sedang' : 'Risiko Tinggi'
  return <span className={cls}>{label}</span>
}

export function StatusBadge({ status }) {
  const map = { pending: ['badge-pending', 'Menunggu'], approved: ['badge-approved', 'Disetujui'], rejected: ['badge-rejected', 'Ditolak'] }
  const [cls, label] = map[status] || ['badge-pending', status]
  return <span className={cls}>{label}</span>
}

export function ScoreMeter({ score }) {
  const pct = Math.max(0, Math.min(100, Number(score) || 0))
  const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tnum">{pct}</span>
        <span className="muted">/ 100</span>
      </div>
      <div className="mt-2 h-2.5 rounded-full bg-slate-200 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-slate-500">
        <span>Tinggi</span><span>Sedang</span><span>Rendah</span>
      </div>
    </div>
  )
}

export function Stat({ label, value, sub }) {
  return (
    <div className="card">
      <p className="muted">{label}</p>
      <p className="text-2xl font-extrabold tnum mt-1">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}

export function EmptyState({ title, body, action }) {
  return (
    <div className="card text-center py-10">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-2xl">📋</div>
      <p className="font-semibold">{title}</p>
      <p className="muted mt-1 max-w-sm mx-auto">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Loading({ text = 'Memuat...' }) {
  return <p className="p-6 text-center muted">{text}</p>
}
