# Portal E-Presensi Ma'had Tahfidz Imam 'Ashim Yogyakarta

![Logo Lembaga](logo-clean.png)

[![Live Demo](https://img.shields.io/badge/Demo-Cloudflare%20Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://absensiweb-esy.pages.dev)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/jogboy-web/absensiweb)
[![Release](https://img.shields.io/badge/Release-v1.0--submission-blue?style=for-the-badge)](https://github.com/jogboy-web/absensiweb/releases/tag/v1.0-submission)

> **Sistem Informasi Manajemen Presensi Digital & Rekapitulasi Kehadiran Asatidz Berbasis Web Terintegrasi.**  
> Dirancang khusus untuk memfasilitasi pencatatan kehadiran, monitoring halaqah, dan administrasi pesantren secara modern, akurat, dan transparan.

---

## 📌 Daftar Isi
1. [Tautan Cepat & Akses Publik](#-tautan-cepat--akses-publik)
2. [Isi Minimum Repository (Checklist Submission)](#-isi-minimum-repository-checklist-submission)
3. [Fitur Utama Aplikasi](#-fitur-utama-aplikasi)
4. [Struktur Folder & Source Code](#-struktur-folder--source-code)
5. [Panduan Instalasi & Menjalankan Aplikasi](#-panduan-instalasi--menjalankan-aplikasi)
6. [Konfigurasi Environment (.env.example)](#-konfigurasi-environment-envexample)
7. [Dokumentasi Antarmuka (UI/UX)](#-dokumentasi-antarmuka-uiux)
8. [AI & Technology Disclosure](#-ai--technology-disclosure)

---

## 🔗 Tautan Cepat & Akses Publik

* **Live Website (Cloudflare Pages):** [https://absensiweb-esy.pages.dev](https://absensiweb-esy.pages.dev)
* **Repositori GitHub:** [https://github.com/jogboy-web/absensiweb](https://github.com/jogboy-web/absensiweb)
* **Tag Submission:** [`v1.0-submission`](https://github.com/jogboy-web/absensiweb/tree/v1.0-submission)
* **Commit Hash Submission:** `8d7fc642dd1868fbfe4e150a2a4bbc1357bb8016`
* **Release Resmi:** [GitHub Releases v1.0-submission](https://github.com/jogboy-web/absensiweb/releases/tag/v1.0-submission)

---

## ✅ Isi Minimum Repository (Checklist Submission)

Sesuai dengan ketentuan submission kompetisi, repositori ini memuat seluruh komponen wajib:

- [x] **Source Code Aplikasi**: Berkas lengkap HTML, CSS, JavaScript, dan aset grafis siap pakai.
- [x] **README.md**: Panduan komprehensif struktur, instruksi pengoperasian, dan fitur.
- [x] **`.env.example`**: Berkas template konfigurasi environment bersih tanpa secret/API key asli.
- [x] **Dokumentasi / Screenshot**: Penjelasan arsitektur antarmuka dan visualisasi sistem.
- [x] **AI & Technology Disclosure**: Pernyataan transparansi penggunaan kecerdasan buatan & stack teknologi ([klik di sini](#-ai--technology-disclosure)).

---

## 🌟 Fitur Utama Aplikasi

### 1. Sistem Autentikasi Multi-Peran (Role-Based Access)
- **Portal Asatidz/Ustadz:** Login menggunakan username/password resmi dengan proteksi kode registrasi lembaga (`MTIA2026`).
- **Portal Administrator:** Dashboard rekapitulasi data kehadiran terpusat, audit log asatidz, dan laporan harian.

### 2. Digital E-Presensi Realtime
- Jam digital presisi tinggi WIB dengan integrasi tanggal kalender resmi.
- Sistem pencatatan status kehadiran: Hadir Tepat Waktu, Izin, Sakit, atau Dinas Luar.
- Proteksi duplikasi entri presensi per sesi/hari.

### 3. Database Mandiri & Tangguh (Client-Side Persistence)
- Menggunakan modul `local-db.js` yang memanfaatkan penyimpanan `localStorage` terstruktur.
- Menjamin aplikasi tetap berfungsi optimal dalam kondisi jaringan minim/offline (PWA-ready architecture).

### 4. Desain Responsif Berkarakter Islami Modern
- Tipografi elegan kombinasi *Plus Jakarta Sans* (keterbacaan modern) dan *Amiri* (aksen kaligrafi Arab).
- Skema palet warna khas kelembagaan: *Emerald Green*, *Royal Gold*, dan *Clean White*.
- Aksesibilitas penuh pada perangkat smartphone, tablet, maupun layar desktop.

---

## 📂 Struktur Folder & Source Code

```text
├── index.html              # Halaman gerbang utama / portal login & registrasi asatidz
├── login.html              # Halaman otentikasi login alternatif
├── dashboard-ustadz.html   # Antarmuka presensi mandiri dan rekap kehadiran ustadz
├── dashboard-admin.html    # Antarmuka panel admin, audit log, & data master presensi
├── script.js               # Logika controller aplikasi, validasi form, & event handlers
├── local-db.js             # Engine database lokal (LocalStorage CRUD manager)
├── style.css               # Desain UI, tema warna gold-emerald, layout flex/grid
├── logo-clean.png          # Aset grafis logo utama resolusi tinggi
├── logo-transparent.png    # Aset logo transparan
├── logo.jpeg               # Favicon & thumbnail lembaga
├── .env.example            # Template konfigurasi environment (bebas dari secrets)
├── .gitignore              # Daftar file temporary build yang diabaikan Git
└── README.md               # Dokumentasi utama proyek
```

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

Karena aplikasi ini dibangun dengan arsitektur web modern yang mandiri, tidak diperlukan kompilasi runtime yang rumit.

### Opsi 1: Menjalankan Langsung di Browser (Offline / Local)
1. Kloning repositori ini ke komputer Anda:
   ```bash
   git clone https://github.com/jogboy-web/absensiweb.git
   cd absensiweb
   ```
2. Buka berkas `index.html` langsung dengan peramban favorit Anda (Google Chrome, Mozilla Firefox, Edge, Safari).

### Opsi 2: Menjalankan Menggunakan Local Web Server
Untuk pengalaman optimal (bebas dari batasan protokol `file://`):
```bash
# Menggunakan Python 3
python -m http.server 8080

# Menggunakan Node.js npx serve
npx serve .
```
Lalu akses melalui browser di `http://localhost:8080`.

---

## ⚙️ Konfigurasi Environment (`.env.example`)

Untuk deployment yang membutuhkan integrasi backend atau Cloudflare API, file contoh telah disediakan di `.env.example`:

```env
# Konfigurasi Aplikasi
APP_ENV=production
APP_DEBUG=false
APP_URL=https://absensiweb-esy.pages.dev

# Kode Registrasi Lembaga
REGISTRATION_PASSCODE=MTIA2026

# Konfigurasi Cloudflare Pages (Opsional)
CLOUDFLARE_ACCOUNT_ID=your_account_id_placeholder
CLOUDFLARE_API_TOKEN=your_api_token_placeholder

# Database Eksternal (Opsional)
DATABASE_URL=
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_placeholder
```

> [!NOTE]
> File `.env.example` **tidak memuat rahasia atau API key aktif**. Semua data bersifat placeholder untuk keperluan standarisasi pengumpulan karya.

---

## 📸 Dokumentasi Antarmuka (UI/UX)

| Tampilan Portal | Deskripsi Fungsi |
| :--- | :--- |
| **Portal Autentikasi (`index.html`)** | Pintu masuk asatidz dan admin dengan jam digital real-time dan validasi kode lembaga. |
| **Dashboard Asatidz (`dashboard-ustadz.html`)** | Formulir pencatatan absensi harian, kartu ringkasan status kehadiran, dan riwayat presensi. |
| **Dashboard Administrator (`dashboard-admin.html`)** | Panel kontrol untuk melihat seluruh rekap kehadiran asatidz, penyaringan data, dan ekspor data. |

Aset grafis pendukung antarmuka:
- `logo-clean.png` : Identitas Ma'had Tahfidz Imam 'Ashim Yogyakarta.
- `logo-transparent.png` : Aset ikonik transparan untuk header dan badge.

---

## 🤖 AI & Technology Disclosure

Sebagai bentuk transparansi akademik, integritas profesional, dan kepatuhan terhadap regulasi kompetisi, berikut adalah rincian peran teknologi kecerdasan buatan (*AI*) dan stack rekayasa yang digunakan dalam proyek ini:

### 1. Model & Tooling AI yang Digunakan
- **Model / Agen AI:** Google DeepMind Gemini (via Antigravity / `agy` CLI Agent).
- **Peran AI Agent:**
  - **Otomasi Alur Deployment:** Membantu eksekusi Git workflow (versioning tag `v1.0-submission`, commit hygiene, dan manajemen repositori).
  - **Infrastruktur Cloud:** Mengotomasi integrasi dan deployment static asset ke jaringan global Cloudflare Pages melalui Cloudflare Wrangler API.
  - **Refactoring & Dokumentasi:** Membantu perapian struktur README, penulisan `.env.example`, dan standarisasi checklist submission.

### 2. Kode Sumber & Logika Bisnis (Human Authorship)
- Logika aturan presensi santri dan asatidz, alur pembagian hak akses, desain tematik islami (CSS/HTML), serta struktur penyimpanan database lokal dirancang dan ditentukan oleh pengembang manusia berdasarkan kebutuhan nyata Ma'had Tahfidz Imam 'Ashim Yogyakarta.
- Seluruh kode yang dihasilkan atau dioptimalkan telah melalui penelaahan (*human review*), validasi fungsional, dan pengujian langsung.

### 3. Teknologi Inti (Tech Stack)
- **Frontend:** Semantic HTML5, CSS3 Custom Properties (Modern CSS Variables, Flexbox, CSS Grid), Vanilla ES6+ JavaScript.
- **Data Engine:** HTML5 Web Storage API (`localStorage`) dengan abstraksi CRUD asinkron.
- **Hosting & CDN:** Cloudflare Pages Global Edge Network.
- **Version Control:** Git & GitHub.

---

## 📄 Lisensi
Hak Cipta © 2026 **Ma'had Tahfidz Imam 'Ashim Yogyakarta**.  
Dikembangkan untuk keperluan sistem administrasi lembaga dan submission kompetisi resmi.
