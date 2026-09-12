// Weighted credit scoring 50/30/20 — works offline of Gemini.
// Contract: { score 0-100, riskLevel Low|Medium|High, notes string }

export function savingsScore(totalSavings, requestedAmount) {
  const savings = Number(totalSavings) || 0
  const amount = Number(requestedAmount) || 0
  if (amount <= 0) return 0
  return Math.round(Math.min(savings / amount, 1) * 100)
}

export function tenureScore(joinDate) {
  if (!joinDate) return 50
  const months =
    (Date.now() - new Date(joinDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
  if (months > 12) return 100
  if (months >= 6) return 80
  if (months >= 3) return 60
  return 40
}

const BUSINESS_MAP = {
  karyawan_tetap: 90,
  karyawan: 90,
  'warung': 80,
  'toko': 80,
  umkm: 80,
  dagang: 80,
  ojek: 60,
  petani: 60,
  buruh: 60,
  baru: 50,
}

export function businessScore(businessType) {
  if (!businessType) return 60
  const key = String(businessType).toLowerCase().trim()
  if (BUSINESS_MAP[key] !== undefined) return BUSINESS_MAP[key]
  for (const [k, v] of Object.entries(BUSINESS_MAP)) {
    if (key.includes(k)) return v
  }
  return 60
}

export function riskLevel(total) {
  if (total >= 80) return 'Low'
  if (total >= 60) return 'Medium'
  return 'High'
}

export function recommendationNotes({ score, risk, requestedAmount }) {
  const amount = Number(requestedAmount).toLocaleString('id-ID')
  if (risk === 'Low')
    return `Skor ${score} (risiko rendah). Simpanan kuat relatif terhadap ajuan Rp${amount}. Rekomendasi: layak disetujui.`
  if (risk === 'Medium')
    return `Skor ${score} (risiko sedang). Ajuan Rp${amount} wajar namun perlu verifikasi usaha/simpanan. Rekomendasi: setujui dengan tenor bertahap atau minta tambahan simpanan.`
  return `Skor ${score} (risiko tinggi). Simpanan/tenor belum mendukung ajuan Rp${amount}. Rekomendasi: tolak atau minta ajuan lebih kecil + riwayat simpanan 3 bulan.`
}

// Example: savings 5jt / ajuan 10jt = 50; tenure 8bln = 80; warung = 80
// => 0.5*50 + 0.3*80 + 0.2*80 = 65 => Medium
export function calculateCreditScore({ totalSavings, requestedAmount, joinDate, businessType }) {
  const s = savingsScore(totalSavings, requestedAmount)
  const t = tenureScore(joinDate)
  const b = businessScore(businessType)
  const score = Math.round(0.5 * s + 0.3 * t + 0.2 * b)
  const risk = riskLevel(score)
  const notes = recommendationNotes({ score, risk, requestedAmount })
  return { score, riskLevel: risk, notes, parts: { savings: s, tenure: t, business: b } }
}
