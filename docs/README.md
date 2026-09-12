# KopAI: Koperasi Modern Berbasis AI 🚀

[![Tech Stack](https://img.shields.io/badge/Stack-React%20%2B%20Vite%20%2B%20Supabase-blue)](https://github.com)
[![AI Powered](https://img.shields.io/badge/AI-Google%20Gemini%20API-orange)](https://aistudio.google.com)
[![Edge Network](https://img.shields.io/badge/Hosting-Tencent%20EdgeOne-green)](https://www.tencent.com)

KopAI adalah platform aplikasi cerdas yang mentransformasi koperasi konvensional menjadi institusi keuangan digital yang efisien, transparan, dan inklusif menggunakan teknologi kecerdasan buatan (*Artificial Intelligence*).

## 🌟 Fitur Unggulan
- **AI Alternative Credit Scoring:** Penilaian risiko pinjaman otomatis bagi anggota *unbanked* berdasarkan data simpanan dan profil usaha.
- **Smart Admin Dashboard:** Membantu pengurus koperasi mengambil keputusan pinjaman dengan cepat didukung oleh analitik risiko transparan.
- **AI Financial Health Assistant:** Chatbot pendamping keuangan personal untuk membantu anggota mengelola cicilan dan keuangan usaha.
- **Zero Cost Infrastructure:** Dibangun menggunakan perangkat modern berskala gratis (*Free Tier*).

## 🛠️ Tech Stack
- **Frontend:** React, Vite, Tailwind CSS
- **Backend & Database:** Supabase (PostgreSQL & Auth)
- **Deployment & Edge Security:** Tencent EdgeOne
- **AI Integration:** Google Gemini API (Free Tier)

## 📦 Panduan Instalasi & Menjalankan Proyek (Lokal)

1. **Clone & install:**
   ```bash
   git clone https://github.com/username/kopai-app.git
   cd kopai-app
   npm install
   ```

2. **Env (salin `.env.example` ke `.env`):**
   ```bash
   cp .env.example .env
   ```
   Isi `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (Dashboard Supabase → Settings → API),
   dan `VITE_GEMINI_API_KEY` (Google AI Studio). Jangan commit `.env`.

3. **Database (Supabase CLI, folder `supabase/migrations/`):**
   ```bash
   npm i -g supabase
   supabase link --project-ref XXX
   supabase db push
   ```
   Cerminan SQL kanonis ada di `docs/DATABASE_SCHEMA.md`.

4. **Jalan / build:**
   ```bash
   npm run dev      # dev server Vite (bukan Apache XAMPP)
   npm run build    # output dist/
   npm run preview  # cek hasil build
   ```

5. **Deploy EdgeOne:** upload isi `dist/` sebagai situs statis.

## 🧮 Skor kredit 50/30/20
`src/lib/scoring.js`: 50% rasio simpanan vs ajuan + 30% lama anggota + 20% jenis usaha.
`>=80 Low, 60-79 Medium, <60 High`. Berjalan offline (tanpa Gemini); Gemini hanya memperkaya catatan & chatbot.