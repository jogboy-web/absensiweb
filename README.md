# E-Presensi Ma'had Tahfidz Imam 'Ashim Yogyakarta

![Logo Lembaga](logo-clean.png)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Cloudflare%20Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://absensiweb-esy.pages.dev)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/jogboy-web/absensiweb)
[![Release](https://img.shields.io/badge/Release-v1.0--submission-blue?style=for-the-badge)](https://github.com/jogboy-web/absensiweb/releases/tag/v1.0-submission)

---

## 📋 Ringkasan Elemen Submission

| Elemen README | Rangkuman Keterangan |
| :--- | :--- |
| **Project Name & Description** | E-Presensi Ma'had Tahfidz Imam 'Ashim Yogyakarta: Sistem informasi pencatatan dan monitoring kehadiran asatidz berbasis web. |
| **Problem & Target User** | Mengatasi pencatatan presensi manual/kertas yang rentan hilang; ditujukan untuk Asatidz dan Administrator Ma'had. |
| **Key Features** | Multi-role Auth, Digital Clock Realtime, Logging Presensi Asatidz, Dashboard Admin Terpusat, & Local Database. |
| **Tech Stack** | HTML5, CSS3 Modern, Vanilla ES6+ JavaScript, LocalStorage Engine, Cloudflare Pages Edge CDN. |
| **AI Implementation** | Google DeepMind Gemini (via Antigravity / `agy` CLI Agent) untuk otomasi CI/CD, deployment Cloudflare, dan sanitasi berkas. |
| **Run Instructions** | Buka langsung `index.html` pada browser atau jalankan lewat local server `python -m http.server 8080`. |
| **Architecture / Data Flow** | Alur autentikasi berbasis role dan modul client-side persistence terstruktur. |
| **Deployment URL** | [https://absensiweb-esy.pages.dev](https://absensiweb-esy.pages.dev) |
| **Team Members** | Ibrohim (`jogboy-web`) - Fullstack Developer & Project Lead. |
| **Known Limitations** | Penyimpanan aktif berbasis LocalStorage per browser; geofencing GPS masih opsional. |
| **Third-party Resources** | Google Fonts (*Plus Jakarta Sans*, *Amiri*), Cloudflare Pages, GitHub. |

---

## 1. 📖 Project Name & Description
* **Nama Proyek:** E-Presensi Ma'had Tahfidz Imam 'Ashim Yogyakarta
* **Deskripsi:**  
  Platform sistem informasi manajemen presensi digital dan monitoring kehadiran harian asatidz/pengajar berbasis web yang dirancang khusus untuk lingkungan pesantren tahfidz Al-Qur'an. Aplikasi ini menyederhanakan proses absensi pengajar halaqah secara cepat, akurat, dan transparan melalui antarmuka responsif bernuansa Islami modern.

---

## 2. 🎯 Problem & Target User

### Masalah yang Dihadapi (*Problem Statement*):
1. **Inefisiensi Presensi Manual:** Penggunaan buku presensi kertas rentan sobek, hilang, dan memakan waktu saat proses rekapitulasi bulanan.
2. **Ketiadaan Data Real-Time:** Pimpinan dan pengurus ma'had kesulitan memantau kehadiran asatidz pada sesi halaqah pagi, sore, dan malam secara langsung.
3. **Validitas & Transparansi:** Risiko duplikasi atau pencatatan presensi yang tidak terverifikasi tanpa adanya sistem otentikasi kelembagaan.

### Pengguna yang Dituju (*Target User*):
1. **Asatidz / Ustadz:** Mencatatkan kehadiran harian (Hadir, Izin, Sakit, Tugas Lembaga) secara mandiri dari perangkat ponsel/laptop dengan cepat.
2. **Administrator / Pengurus Pesantren:** Mengontrol audit log harian, mengelola data asatidz, menyaring absensi, dan merekap data kehadiran secara terpusat.
3. **Pimpinan Lembaga:** Memantau kedisiplinan dan konsistensi pengajaran asatidz sebagai bahan evaluasi manajemen pesantren.

---

## 3. ⚡ Key Features (Fitur Utama yang Berfungsi)

- [x] **Autentikasi Multi-Peran (Multi-Role Authentication):**
  - Pemisahan portal akses untuk **Asatidz** dan **Administrator**.
  - Pendaftaran akun asatidz terlindungi oleh *Passcode Lembaga Resmi* (`MTIA2026`).
- [x] **Real-Time Clock & Kalender Dinamis:**
  - Penunjuk waktu presisi digital WIB dan tanggal dinamis untuk menjamin validitas sesi waktu absensi.
- [x] **Pencatatan Presensi Digital Asatidz:**
  - Opsi status kehadiran lengkap: *Hadir*, *Izin*, *Sakit*, dan *Tugas Luar/Dinas*.
  - Pencegahan penginputan ganda (*duplicate submission prevention*) per sesi.
- [x] **Dashboard Khusus Asatidz (`dashboard-ustadz.html`):**
  - Kartu statistik kehadiran pribadi, riwayat absensi mandiri, dan status halaqah.
- [x] **Dashboard Administrator (`dashboard-admin.html`):**
  - Monitoring seluruh presensi asatidz dalam satu tabel terpusat.
  - Fitur pencarian nama asatidz dan penyaringan berdasarkan status kehadiran.
- [x] **Penyimpanan Mandiri Tangguh (High-Availability Client Persistence):**
  - Bekerja secara instan tanpa ketergantungan server eksternal berkat modul `local-db.js`.
- [x] **Desain Responsif & Estetika Islami Modern:**
  - Didukung tipografi *Plus Jakarta Sans* dan aksen *Amiri*, dengan skema warna *Emerald Green* & *Royal Gold*.

---

## 4. 🛠️ Tech Stack

* **Frontend:**
  - Semantic HTML5
  - Modern CSS3 (CSS Custom Variables, Flexbox, CSS Grid)
  - Vanilla JavaScript (ES6+ Native, No Heavy Framework Dependency)
* **Backend / Storage Engine:**
  - Client-side Web Storage API (`localStorage`) melalui abstraksi controller `local-db.js`.
  - Arsitektur modular siap dihubungkan ke REST API / Cloudflare Workers / Supabase.
* **Hosting & Deployment:**
  - **Cloudflare Pages** (Global Edge CDN Network, HTTPS otomatis, Fast Edge Delivery).
* **Version Control & CI/CD:**
  - **Git & GitHub** untuk source code management, semantic tagging, dan releases.

---

## 5. 🤖 AI Implementation (Implementasi AI & Metodologi)

Proyek ini memanfaatkan teknologi kecerdasan buatan (*Artificial Intelligence*) secara terarah dan bertanggung jawab untuk mempercepat siklus rekayasa perangkat lunak:

* **Model & Alat AI:** Google DeepMind Gemini yang diorkestrasi melalui **Antigravity (`agy` CLI) Autonomous AI Agent**.
* **Fungsi & Peranan AI:**
  1. **Automated CI/CD & Cloud Deployment:** AI Agent mengotomasi pembuatan repositori GitHub melalui REST API, mengatur branch & commit, serta mendeploy langsung ke Cloudflare Pages menggunakan Wrangler CLI.
  2. **Code Structure Optimization & Scaffolding:** Membantu penyusunan abstraksi modular pada file JavaScript serta standarisasi template environment `.env.example`.
  3. **Quality Assurance & Security Screening:** Memverifikasi integritas repositori dan memastikan tidak ada secret/token yang bocor ke publik.
* **Integritas Penulisan:** Seluruh alur logika bisnis presensi, aturan peran asatidz, konten kurikulum pesantren, serta desain tema Islami dirancang dan diverifikasi secara langsung oleh pengembang manusia.

---

## 6. 💻 Run Instructions (Cara Menjalankan Proyek)

Proyek ini dirancang *zero-configuration* sehingga dapat dijalankan secara instan tanpa proses *build* atau instalasi dependensi yang rumit.

### Opsi A: Langsung Menggunakan Web Browser (Metode Termudah)
1. Kloning repositori GitHub:
   ```bash
   git clone https://github.com/jogboy-web/absensiweb.git
   cd absensiweb
   ```
2. Klik dua kali atau buka berkas `index.html` menggunakan browser apa pun (Google Chrome, Firefox, Microsoft Edge, Safari).

### Opsi B: Menggunakan Local HTTP Server
Jika ingin menjalankan simulasi server lokal:
```bash
# Menggunakan Python 3:
python -m http.server 8080

# ATAU menggunakan Node.js:
npx serve .
```
Buka peramban pada alamat: `http://localhost:8080`.

---

## 🏗️ Architecture / Data Flow (Alur Sistem)

```
[ Pengguna: Asatidz / Admin ]
               │
               ▼
      [ Halaman index.html ]
               │
   ┌───────────┴───────────┐
   ▼                       ▼
[ Form Registrasi ]    [ Form Login ]
(Validasi Passcode)    (Verifikasi Kredensial)
   │                       │
   └───────────┬───────────┘
               ▼
     [ local-db.js Engine ]
               │
   ┌───────────┴───────────┐
   ▼                       ▼
[ LocalStorage Users ]  [ LocalStorage Attendance ]
               │
   ┌───────────┴───────────┐
   ▼                       ▼
[ Dashboard Ustadz ]   [ Dashboard Admin ]
(Input & Cek Presensi) (Rekapitulasi & Filter)
```

1. **Autentikasi:** Pengguna memasukkan kredensial; pendaftar baru diverifikasi dengan kode `MTIA2026`.
2. **Controller (`local-db.js`):** Memvalidasi format data dan menyimpan state ke storage peramban.
3. **Routing Sederhana:** Mengarahkan akun sesuai role: asatidz ke `dashboard-ustadz.html` dan administrator ke `dashboard-admin.html`.
4. **Logging & Query:** Setiap presensi disimpan lengkap dengan timestamp WIB, status kehadiran, dan identitas asatidz.

---

## 🌐 Deployment URL

Aplikasi telah teruji dan aktif secara publik pada infrastruktur Cloudflare Pages:

* **Situs Produksi:** [https://absensiweb-esy.pages.dev](https://absensiweb-esy.pages.dev)
* **GitHub Repository:** [https://github.com/jogboy-web/absensiweb](https://github.com/jogboy-web/absensiweb)
* **Submission Release:** [Release v1.0-submission](https://github.com/jogboy-web/absensiweb/releases/tag/v1.0-submission)

---

## 👥 Team Members

* **Ibrohim (`jogboy-web`)** — *Project Lead & Fullstack Developer*
  - Bertanggung jawab atas arsitektur sistem, desain antarmuka, penulisan kode JavaScript, dan implementasi deployment.
* **Tim Ma'had Tahfidz Imam 'Ashim Yogyakarta** — *Product Owner & Domain Experts*
  - Bertanggung jawab atas validasi kebutuhan presensi asatidz dan standarisasi operasional pesantren.

---

## ⚠️ Known Limitations (Batasan MVP Saat Ini)

1. **Storage Terisolasi per Perangkat:** Saat ini basis data menggunakan `localStorage` per browser, sehingga sinkronisasi data antarperangkat yang berbeda memerlukan penyambungan ke database cloud (seperti Supabase/Cloudflare D1).
2. **Validasi Lokasi Fisik (Geofencing):** Verifikasi kehadiran saat ini berbasis kepemilikan kode akses lembaga dan pencatatan waktu realtime, belum menyertakan radius koordinat GPS otomatis.
3. **Laporan Cetak:** Fitur ekspor laporan saat ini mengandalkan fungsi *Print to PDF* bawaan peramban.

---

## 📚 Third-party Resources & Credits

* **Tipografi:** Google Fonts — [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) & [Amiri](https://fonts.google.com/specimen/Amiri).
* **Infrastruktur Cloud:** [Cloudflare Pages](https://pages.cloudflare.com/) untuk static hosting dan global edge caching.
* **Development Agent:** Google DeepMind Gemini via Antigravity AGY CLI.
* **Identitas Visual:** Logo resmi Ma'had Tahfidz Imam 'Ashim Yogyakarta.

---

## 📄 Lisensi & Hak Cipta
Hak Cipta © 2026 **Ma'had Tahfidz Imam 'Ashim Yogyakarta & Ibrohim**. Seluruh hak cipta dilindungi undang-undang.
