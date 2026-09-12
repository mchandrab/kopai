Workflow (Alur Kerja Aplikasi)
Registrasi & Login: Pengguna mendaftar dan masuk; sistem mengenali peran (role) apakah mereka sebagai member atau admin.

Pengajuan Pinjaman (Member): Anggota mengisi nominal dan tujuan pinjaman pada aplikasi React.

Proses AI Otomatis: Saat tombol kirim ditekan, sistem menjalankan fungsi kalkulasi skor alternatif berdasarkan data simpanan dan menghasilkan ai_credit_score, ai_risk_level, serta catatan rekomendasi. Data disimpan ke tabel loan_applications.

Verifikasi Pengurus (Admin): Pengurus membuka Admin Dashboard di Tencent EdgeOne, melihat daftar pinjaman terurut berdasarkan analisis risiko AI, lalu memberikan keputusan Approved atau Rejected.

Konsultasi Keuangan (AI Assistant): Anggota dapat berinteraksi dengan chatbot AI untuk mendapatkan saran pengelolaan keuangan secara real-time.