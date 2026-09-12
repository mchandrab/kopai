// Daftar jenis usaha kanonis — dipakai dropdown Profil, Kelola Anggota, dan skor.
// key = nilai tersimpan di profiles.business_type (selaras BUSINESS_MAP di scoring.js)
export const BUSINESS_TYPES = [
  { key: 'karyawan_tetap', label: 'Karyawan Tetap', score: 90 },
  { key: 'warung', label: 'Warung', score: 80 },
  { key: 'toko', label: 'Toko', score: 80 },
  { key: 'dagang', label: 'Dagang / UMKM', score: 80 },
  { key: 'ojek', label: 'Ojek / Transportasi', score: 60 },
  { key: 'petani', label: 'Petani', score: 60 },
  { key: 'buruh', label: 'Buruh Harian', score: 60 },
  { key: 'baru', label: 'Usaha Baru (≤ 1 tahun)', score: 50 },
  { key: 'lainnya', label: 'Lainnya', score: 60 },
]

export function businessLabel(key) {
  return BUSINESS_TYPES.find((t) => t.key === key)?.label || key || '-'
}
