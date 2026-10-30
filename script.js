/**
 * E-Presensi Ma'had Tahfidz Imam 'Ashim Yogyakarta
 * Script Interaktivitas Portal Login, Dashboard Ustadz & Dashboard Admin
 * Terintegrasi dengan Supabase Cloud (Opsi A) + LocalStorage Fallback (100% Gratis & Cloudflare Pages Ready)
 */

// Reset otomatis seluruh data uji coba & data presentasi agar sistem bersih total untuk produksi
(function resetAllTestData() {
  const CURRENT_CLEAN_VERSION = 'ashim_clean_v7_secure_passcode';
  if (localStorage.getItem(CURRENT_CLEAN_VERSION) !== 'true') {
    // Hapus semua data pengguna, presensi, sesi, dan cache izin pengujian
    localStorage.removeItem('ashim_user');
    localStorage.removeItem('ashim_today_presence');
    localStorage.removeItem('ashim_izin_records');
    localStorage.removeItem('ashim_saved_izin');
    localStorage.removeItem('ashim_db_users');
    localStorage.removeItem('ashim_db_presensi');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('users');
    localStorage.removeItem('presensi_records');
    localStorage.removeItem('registered_users');

    // Bersihkan seluruh item localStorage yang terkait data pengujian
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('ashim_') || key.toLowerCase().includes('jogja') || key === 'users' || key === 'currentUser' || key === 'presensi_records')) {
        if (key !== CURRENT_CLEAN_VERSION) {
          localStorage.removeItem(key);
        }
      }
    }

    localStorage.setItem(CURRENT_CLEAN_VERSION, 'true');
    console.log("Sistem E-Presensi berhasil dibersihkan total untuk peluncuran produksi.");
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initLoginForm();
  initRegisterForm();
  initAuthViewSwitcher();
  initUstadzDashboard();
  initAdminDashboard();
});

/* ==========================================================================
   1. Live Clock & Calendar (WIB) Realtime
   ========================================================================== */
function initClock() {
  const clockElement = document.getElementById('liveTime');
  const dateElement = document.getElementById('liveDate');
  const navClock = document.getElementById('navLiveTime');
  const navDate = document.getElementById('navLiveDate');
  const livePresensiDisplay = document.getElementById('livePresensiDisplay');
  const livePresensiDateText = document.getElementById('livePresensiDateText');
  const badgeHariIni = document.getElementById('badgeHariIni');

  function update() {
    const now = new Date();

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeFull = `${hours}:${minutes}:${seconds} WIB`;

    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const dayName = days[now.getDay()];
    const dateNum = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();
    const dateStr = `${dayName}, ${dateNum} ${monthName} ${year}`;

    if (clockElement) clockElement.textContent = timeFull;
    if (dateElement) dateElement.textContent = dateStr;
    if (navClock) navClock.textContent = timeFull;
    if (navDate) navDate.textContent = dateStr;
    if (badgeHariIni) badgeHariIni.textContent = dateStr;

    if (livePresensiDisplay) livePresensiDisplay.textContent = timeFull;
    if (livePresensiDateText) livePresensiDateText.textContent = dateStr;
  }

  update();
  setInterval(update, 1000);
}

function getCurrentTimeShort() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes} WIB`;
}

function getTodayISODate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/* ==========================================================================
   2. Form Login & Validasi 2 Tahap (Username Dulu, Lalu Password)
   ========================================================================== */
function initLoginForm() {
  const form = document.getElementById('loginForm');
  const roleTabs = document.querySelectorAll('.role-tab');
  const roleInput = document.getElementById('userRole');
  const usernameInput = document.getElementById('username');
  const togglePassBtn = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');

  if (!form) return;

  const authSwitchRegisterWrapper = document.getElementById('authSwitchRegisterWrapper');

  roleTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const role = tab.getAttribute('data-role');

      roleTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      if (roleInput) roleInput.value = role;

      if (role === 'admin') {
        if (authSwitchRegisterWrapper) authSwitchRegisterWrapper.style.display = 'none';
      } else {
        if (authSwitchRegisterWrapper) authSwitchRegisterWrapper.style.display = 'flex';
      }
    });
  });

  // Toggle Lihat / Sembunyikan Password
  if (togglePassBtn && passwordInput) {
    togglePassBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      togglePassBtn.setAttribute('aria-pressed', isPassword ? 'true' : 'false');
      togglePassBtn.setAttribute('aria-label', isPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi');

      togglePassBtn.innerHTML = isPassword ? '<span>Sembunyi</span>' : '<span>Lihat</span>';
    });
  }

  // Proses Submit Login
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = usernameInput ? usernameInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';

    if (!username) {
      showToast('Silakan masukkan username Anda.', 'error');
      if (usernameInput) usernameInput.focus();
      return;
    }

    if (!password) {
      showToast('Silakan masukkan kata sandi Anda.', 'error');
      if (passwordInput) passwordInput.focus();
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.innerHTML : 'Masuk ke E-Presensi';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Memverifikasi Akun...</span>`;
    }

    const selectedRole = roleInput ? roleInput.value : 'guru';

    // A. Kredensial Administrator Pusat
    if (selectedRole === 'admin') {
      if (username.toLowerCase() !== 'adminmtia' || password !== 'adminmtia') {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
        showToast('Kredensial Administrator salah! Periksa kembali username dan password.', 'error');
        if (passwordInput) {
          passwordInput.value = '';
          passwordInput.focus();
        }
        return;
      }

      localStorage.setItem('ashim_user', JSON.stringify({
        username: 'adminmtia',
        name: 'Administrator Pusat',
        role: 'admin'
      }));

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
        showToast('Alhamdulillah, login Administrator berhasil!', 'gold');
        setTimeout(() => {
          window.location.href = 'dashboard-admin.html';
        }, 500);
      }, 700);
      return;
    }

    // B. Kredensial Asatidz / Guru (Validasi 2 Tahap)
    try {
      // TAHAP 1: Periksa apakah Username sudah terdaftar di database
      const user = await db.getUserByUsername(username);

      if (!user) {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
        showToast(`Username "${username}" belum terdaftar! Silakan periksa kembali atau buat akun baru terlebih dahulu.`, 'error');
        if (usernameInput) usernameInput.focus();
        return;
      }

      // TAHAP 2: Jika Username terdaftar, lanjut periksa Kata Sandi
      if (user.password !== password) {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
        showToast('Kata sandi yang Anda masukkan salah. Silakan coba lagi.', 'error');
        if (passwordInput) {
          passwordInput.value = '';
          passwordInput.focus();
        }
        return;
      }

      // TAHAP 3: Berhasil Masuk
      localStorage.setItem('ashim_user', JSON.stringify({
        id: user.id,
        username: user.username,
        name: user.name,
        phone: user.phone || '',
        subject: user.subject || 'Pengajar Tahfidz',
        role: 'guru'
      }));

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
        showToast(`Ahlan wa Sahlan, ${user.name}! Mengalihkan ke Dashboard...`, 'success');
        setTimeout(() => {
          window.location.href = 'dashboard-ustadz.html';
        }, 600);
      }, 700);

    } catch (err) {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
      console.error(err);
      showToast('Terjadi kendala saat memvalidasi akun. Silakan coba lagi.', 'error');
    }
  });
}

/* ==========================================================================
   3. Fitur Buat Akun Baru (Registrasi Mandiri Asatidz)
   ========================================================================== */
function initRegisterForm() {
  const regForm = document.getElementById('registerForm');
  const regPasscodeInput = document.getElementById('regPasscode');
  const regNameInput = document.getElementById('regName');
  const regUsernameInput = document.getElementById('regUsername');
  const regPhoneInput = document.getElementById('regPhone');
  const regSubjectInput = document.getElementById('regSubject');
  const regPassInput = document.getElementById('regPassword');
  const regConfirmPassInput = document.getElementById('regConfirmPassword');
  const toggleRegPassBtn = document.getElementById('toggleRegPassword');

  if (!regForm) return;

  if (toggleRegPassBtn && regPassInput) {
    toggleRegPassBtn.addEventListener('click', () => {
      const isPass = regPassInput.type === 'password';
      regPassInput.type = isPass ? 'text' : 'password';
      if (regConfirmPassInput) regConfirmPassInput.type = isPass ? 'text' : 'password';

      toggleRegPassBtn.setAttribute('aria-pressed', isPass ? 'true' : 'false');
      toggleRegPassBtn.setAttribute('aria-label', isPass ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi');

      toggleRegPassBtn.innerHTML = isPass ? '<span>Sembunyi</span>' : '<span>Lihat</span>';
    });
  }

  regForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const passcode = regPasscodeInput ? regPasscodeInput.value.trim().toUpperCase() : '';
    const name = regNameInput ? regNameInput.value.trim() : '';
    const username = regUsernameInput ? regUsernameInput.value.trim().toLowerCase() : '';
    const phone = regPhoneInput ? regPhoneInput.value.trim() : '';
    const subject = regSubjectInput ? regSubjectInput.value.trim() : '';
    const pass = regPassInput ? regPassInput.value : '';
    const confirmPass = regConfirmPassInput ? regConfirmPassInput.value : '';

    const VALID_REGISTRATION_PASSCODE = 'MTIA2026';

    // 1. Verifikasi Kode Registrasi Lembaga Resmi (Cegah Orang Luar Buat Akun Sembarangan)
    if (!passcode) {
      showToast('Mohon masukkan Kode Registrasi Lembaga yang diberikan pengurus Ma\'had.', 'error');
      if (regPasscodeInput) regPasscodeInput.focus();
      return;
    }

    if (passcode !== VALID_REGISTRATION_PASSCODE) {
      showToast('Kode Registrasi Lembaga tidak valid! Hanya asatidz resmi Ma\'had yang dapat mendaftar.', 'error');
      if (regPasscodeInput) regPasscodeInput.focus();
      return;
    }

    if (!name || !username) {
      showToast('Mohon lengkapi Nama Lengkap dan Username.', 'error');
      return;
    }

    if (!phone) {
      showToast('Mohon masukkan Nomor WhatsApp aktif untuk koordinasi halaqah.', 'error');
      if (regPhoneInput) regPhoneInput.focus();
      return;
    }

    if (!subject) {
      showToast('Mohon pilih Jabatan Anda.', 'error');
      const triggerBtn = document.querySelector('#wrapperJabatan .custom-select-trigger');
      if (triggerBtn) {
        triggerBtn.focus();
        toggleCustomSelect('wrapperJabatan');
      }
      return;
    }

    if (pass.length < 8) {
      showToast('Kata sandi minimal terdiri dari 8 karakter.', 'error');
      if (regPassInput) regPassInput.focus();
      return;
    }

    if (pass !== confirmPass) {
      showToast('Konfirmasi kata sandi tidak cocok. Silakan periksa kembali.', 'error');
      if (regConfirmPassInput) regConfirmPassInput.focus();
      return;
    }

    // Periksa apakah username dilarang (akun khusus admin)
    if (username === 'admin' || username === 'adminmtia') {
      showToast('Username ini merupakan akun khusus administrator dan tidak dapat didaftarkan mandiri.', 'error');
      if (regUsernameInput) regUsernameInput.focus();
      return;
    }

    // Periksa apakah username sudah dipakai
    const existingUser = await db.getUserByUsername(username);
    if (existingUser) {
      showToast(`Username "${username}" sudah digunakan. Silakan pilih username lain.`, 'error');
      if (regUsernameInput) regUsernameInput.focus();
      return;
    }

    const submitBtn = regForm.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.innerHTML : 'Daftar Akun Pengajar';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Mendaftarkan Akun Baru...</span>`;
    }

    try {
      const newUser = {
        id: 'user_' + Date.now(),
        username: username,
        password: pass,
        name: name,
        phone: phone,
        subject: subject,
        role: 'guru',
        passcode: passcode,
        created_at: new Date().toISOString()
      };

      await db.addUser(newUser);

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }

        showToast(`Alhamdulillah, akun @${username} (${name}) berhasil dibuat! Silakan masuk.`, 'success');

        switchAuthView('login');

        const loginUsernameInput = document.getElementById('username');
        if (loginUsernameInput) {
          loginUsernameInput.value = username;
          const loginPass = document.getElementById('password');
          if (loginPass) {
            loginPass.value = '';
            loginPass.focus();
          }
        }
        regForm.reset();
        const jabatanLabel = document.querySelector('#wrapperJabatan .trigger-label');
        if (jabatanLabel) {
          jabatanLabel.textContent = '-- Pilih Jabatan --';
          jabatanLabel.classList.add('placeholder');
        }
        const regSubjectHidden = document.getElementById('regSubject');
        if (regSubjectHidden) regSubjectHidden.value = '';
        document.querySelectorAll('#wrapperJabatan .custom-option').forEach(opt => opt.classList.remove('selected'));
      }, 700);

    } catch (err) {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
      console.error(err);
      showToast('Gagal mendaftarkan akun. Silakan coba kembali.', 'error');
    }
  });
}

/* ==========================================================================
   4. Alih Tampilan Login <-> Registrasi
   ========================================================================== */
function switchAuthView(viewName) {
  const loginView = document.getElementById('loginView');
  const registerView = document.getElementById('registerView');

  if (viewName === 'register') {
    if (loginView) loginView.classList.add('hidden');
    if (registerView) registerView.classList.remove('hidden');
  } else {
    if (registerView) registerView.classList.add('hidden');
    if (loginView) loginView.classList.remove('hidden');
  }
}

function initAuthViewSwitcher() {
  const btnShowRegister = document.getElementById('btnShowRegister');
  const btnShowLogin = document.getElementById('btnShowLogin');

  if (btnShowRegister) {
    btnShowRegister.addEventListener('click', () => switchAuthView('register'));
  }
  if (btnShowLogin) {
    btnShowLogin.addEventListener('click', () => switchAuthView('login'));
  }
}

function openHelpModal() {
  const modal = document.getElementById('helpModal');
  if (modal) modal.classList.add('open');
}

function closeHelpModal() {
  const modal = document.getElementById('helpModal');
  if (modal) modal.classList.remove('open');
}

/* ==========================================================================
   5. DASHBOARD USTADZ (PRESENSI HARIAN & REKAPITULASI)
   ========================================================================== */
const SHIFT_SPECS = {
  pagi: {
    title: 'Shift Pagi',
    defaultKegiatan: "Halaqah & Setoran Tahfidz",
    defaultLokasi: "-"
  },
  siang: {
    title: 'Shift Siang',
    defaultKegiatan: "KBM Tajwid & Ulumul Qur'an",
    defaultLokasi: "-"
  },
  sore: {
    title: 'Shift Sore',
    defaultKegiatan: "Halaqah Muroja'ah Santri",
    defaultLokasi: "-"
  },
  malam: {
    title: 'Shift Malam',
    defaultKegiatan: "Kajian Kitab & Halaqah Malam",
    defaultLokasi: "-"
  }
};

let currentUserSession = null;
let todayPresenceList = []; // Menyimpan semua log presensi hari ini (bisa multi-shift)
let currentSelectedShift = null; // Shift yang aktif dipilih: 'pagi', 'siang', 'sore', 'malam', atau null (batal pilih)
let currentTodayPresence = {
  id: null,
  shift: 'siang',
  checkInTime: null,
  checkOutTime: null,
  checkOutStatus: null,
  isIzin: false,
  izinJenis: null,
  izinKeterangan: null,
  kegiatan: "Halaqah Tahfidz Santri",
  lokasi: "-"
};

let currentRecapMonthIndex = new Date().getMonth();
let currentRecapYear = new Date().getFullYear();

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];
const DAY_NAMES = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

async function initUstadzDashboard() {
  const isDashboard = document.getElementById('viewAbsenHarian');
  if (!isDashboard) return;

  // Baca sesi login
  const savedUserStr = localStorage.getItem('ashim_user');
  if (savedUserStr) {
    try {
      currentUserSession = JSON.parse(savedUserStr);
    } catch (e) {
      console.warn(e);
    }
  }

  // Jika tidak ada user login atau role admin, buat default profil
  if (!currentUserSession || currentUserSession.role !== 'guru') {
    currentUserSession = {
      username: 'ustadz',
      name: 'Ustadz Pengajar',
      phone: '0812-xxxx-xxxx',
      subject: 'Pengajar Tahfidz',
      role: 'guru'
    };
  }

  // Tampilkan profil ustadz yang login
  const nameElem = document.getElementById('userDisplayName');
  const greetingElem = document.getElementById('greetingUstadz');
  if (nameElem) nameElem.textContent = currentUserSession.name;
  if (greetingElem) greetingElem.textContent = `Ahlan wa Sahlan, ${currentUserSession.name}!`;

  // Pasang event listener realtime untuk sinkronisasi Catatan Pembelajaran
  const inputKegiatan = document.getElementById('inputKegiatan');
  if (inputKegiatan) {
    inputKegiatan.removeEventListener('input', syncCatatanPembelajaran);
    inputKegiatan.addEventListener('input', syncCatatanPembelajaran);
    inputKegiatan.removeEventListener('change', syncCatatanPembelajaran);
    inputKegiatan.addEventListener('change', syncCatatanPembelajaran);
  }

  // Inisialisasi status hari ini dari Database
  await loadTodayPresenceFromDB();

  // Inisialisasi DatePicker Udzur / Izin
  initCustomDatePicker();

  // Inisialisasi Tombol Periode Bulan Rekap
  updateQuickMonthButtons();

  // Muat data rekapitulasi riil ustadz ini
  await loadRecapData(currentRecapMonthIndex, currentRecapYear);
}

// Sinkronisasi realtime formulir Catatan Pembelajaran dengan Kartu Status Kehadiran
function syncCatatanPembelajaran() {
  const inputKegiatan = document.getElementById('inputKegiatan');
  const taskDescElem = document.getElementById('todayTaskDesc');
  if (!inputKegiatan || !taskDescElem) return;

  const val = inputKegiatan.value.trim();
  if (currentSelectedShift) {
    const rec = todayPresenceList.find(p => !p.is_izin && p.shift === currentSelectedShift);
    if (rec) {
      rec.kegiatan = val;
    }
  }
  taskDescElem.textContent = val || 'Belum Ada Catatan';
}
window.syncCatatanPembelajaran = syncCatatanPembelajaran;

// Muat Status Kehadiran Hari Ini dari Database
async function loadTodayPresenceFromDB() {
  if (!currentUserSession) return;
  const todayISO = getTodayISODate();

  try {
    const list = await db.getPresensi({
      username: currentUserSession.username,
      date: todayISO
    });
    todayPresenceList = Array.isArray(list) ? list : [];
  } catch (err) {
    console.error("Gagal memuat data presensi hari ini:", err);
    todayPresenceList = [];
  }

  // Tentukan shift awal jika belum ada yang terpilih secara manual
  if (!currentSelectedShift) {
    // 1. Prioritaskan shift yang sedang berjalan (sudah check-in tapi belum check-out)
    const inProgress = todayPresenceList.find(p => !p.is_izin && p.jam_masuk && p.jam_masuk !== '-' && (!p.jam_pulang || p.jam_pulang === '-'));
    if (inProgress && inProgress.shift && SHIFT_SPECS[inProgress.shift]) {
      currentSelectedShift = inProgress.shift;
    } else {
      // 2. Berdasarkan jam kerja saat ini
      const hour = new Date().getHours();
      let shiftByHour = 'siang';
      if (hour >= 5 && hour < 11) shiftByHour = 'pagi';
      else if (hour >= 11 && hour < 15) shiftByHour = 'siang';
      else if (hour >= 15 && hour < 18) shiftByHour = 'sore';
      else shiftByHour = 'malam';

      currentSelectedShift = shiftByHour;
    }
  }

  updateShiftCardsUI();
  renderTodayStatusCard();
}

function switchDashboardTab(tabName) {
  const tabHarian = document.getElementById('tabBtnHarian');
  const tabRekap = document.getElementById('tabBtnRekap');
  const viewHarian = document.getElementById('viewAbsenHarian');
  const viewRekap = document.getElementById('viewRekapBulanan');

  if (tabName === 'harian') {
    if (tabHarian) tabHarian.classList.add('active');
    if (tabRekap) tabRekap.classList.remove('active');
    if (viewHarian) viewHarian.classList.remove('hidden');
    if (viewRekap) viewRekap.classList.add('hidden');
  } else {
    if (tabRekap) tabRekap.classList.add('active');
    if (tabHarian) tabHarian.classList.remove('active');
    if (viewRekap) viewRekap.classList.remove('hidden');
    if (viewHarian) viewHarian.classList.add('hidden');
    loadRecapData(currentRecapMonthIndex, currentRecapYear);
  }
}

// Memperbarui UI Kartu Shift & Badge Status Kecil
function updateShiftCardsUI() {
  const cards = document.querySelectorAll('.shift-radio-card');
  const inputSelected = document.getElementById('inputSelectedShift');
  if (inputSelected) {
    inputSelected.value = currentSelectedShift || '';
  }

  cards.forEach(card => {
    const key = card.getAttribute('data-shift');
    if (key === currentSelectedShift) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }

    const pill = document.getElementById(`pillShift_${key}`);
    if (pill) {
      const rec = todayPresenceList.find(item => !item.is_izin && item.shift === key);
      if (rec) {
        if (rec.jam_pulang && rec.jam_pulang !== '-') {
          pill.className = 'shift-status-pill pill-done';
          pill.textContent = `✓ Selesai (${rec.jam_masuk || ''} - ${rec.jam_pulang})`;
        } else if (rec.jam_masuk && rec.jam_masuk !== '-') {
          pill.className = 'shift-status-pill pill-active';
          pill.textContent = `● Masuk ${rec.jam_masuk}`;
        } else {
          pill.className = 'shift-status-pill pill-none';
          pill.textContent = 'Belum Presensi';
        }
      } else {
        pill.className = 'shift-status-pill pill-none';
        pill.textContent = 'Belum Presensi';
      }
    }
  });
}

// Memilih Shift Tugas (Klik untuk pilih, klik lagi untuk batal pilih)
function selectShiftRadio(shiftKey, showNotice = true) {
  // Jika tombol shift yang sama diklik kembali -> BATAL PILIH
  if (currentSelectedShift === shiftKey) {
    currentSelectedShift = null;
    updateShiftCardsUI();
    renderTodayStatusCard();
    if (showNotice) {
      showToast('Pilihan shift dibatalkan. Klik salah satu shift untuk memilih.', 'gold');
    }
    return;
  }

  // Pilih shift yang baru
  currentSelectedShift = shiftKey;
  updateShiftCardsUI();
  renderTodayStatusCard();

  const spec = SHIFT_SPECS[shiftKey];
  if (spec && showNotice) {
    showToast(`Shift terpilih: ${spec.title}`, 'gold');
  }
}

// Aksi Presensi Masuk (Check-In) — Bisa Presensi di Tiap Shift Berbeda
async function handleCheckInAction() {
  if (!currentUserSession) return;

  if (!currentSelectedShift) {
    showToast('Silakan klik salah satu shift tugas (Pagi, Siang, Sore, atau Malam) terlebih dahulu.', 'gold');
    return;
  }

  const spec = SHIFT_SPECS[currentSelectedShift] || SHIFT_SPECS.siang;
  const shiftTitle = spec.title;

  // Cek jika sudah izin seharian penuh
  const izinFull = todayPresenceList.find(p => p.is_izin && (p.shift_title === 'Seharian Penuh' || p.shift === 'izin'));
  if (izinFull) {
    showToast(`Anda sudah tercatat izin (${izinFull.jenis_izin || "Udzur Syar'i"}) untuk hari ini.`, 'gold');
    return;
  }

  // Cek apakah shift ini sudah presensi masuk
  const existing = todayPresenceList.find(p => !p.is_izin && p.shift === currentSelectedShift);
  if (existing && existing.jam_masuk && existing.jam_masuk !== '-') {
    showToast(`Anda sudah melakukan Presensi Masuk untuk ${shiftTitle} hari ini pada pukul ${existing.jam_masuk}.`, 'gold');
    return;
  }

  const inputKegiatan = document.getElementById('inputKegiatan');
  let defKegiatan = spec.defaultKegiatan || 'Catatan Pembelajaran';
  if (currentUserSession.subject === 'Musyrifah') defKegiatan = 'Pembinaan & Pendampingan Santri';
  else if (currentUserSession.subject === 'Staff Administrasi') defKegiatan = 'Administrasi & Layanan Santri';
  else if (currentUserSession.subject === 'Mudiroh') defKegiatan = 'Supervisi & Manajerial Ma\'had';
  else if (currentUserSession.subject) defKegiatan = currentUserSession.subject;

  const kegiatan = inputKegiatan && inputKegiatan.value.trim() ? inputKegiatan.value.trim() : defKegiatan;
  const jamMasuk = getCurrentTimeShort();
  const todayISO = getTodayISODate();

  const record = {
    id: 'pres_' + Date.now(),
    username: currentUserSession.username,
    name: currentUserSession.name,
    date: todayISO,
    shift: currentSelectedShift,
    shift_title: shiftTitle,
    jam_masuk: jamMasuk,
    jam_pulang: null,
    status: 'hadir',
    kegiatan: kegiatan,
    keterangan: kegiatan,
    ruang: '-',
    is_izin: false,
    created_at: new Date().toISOString()
  };

  try {
    const saved = await db.addPresensi(record);
    if (saved && saved.id) record.id = saved.id;
    todayPresenceList.unshift(record);

    updateShiftCardsUI();
    renderTodayStatusCard();
    showToast(`Alhamdulillah, Presensi Masuk ${shiftTitle} berhasil dicatat pada ${jamMasuk} (Status: Hadir).`, 'success');
    await loadRecapData(currentRecapMonthIndex, currentRecapYear);
  } catch (err) {
    console.error("Gagal presensi masuk:", err);
    showToast(err.message || 'Gagal menyimpan presensi masuk.', 'error');
  }
}

// Aksi Presensi Pulang (Check-Out)
async function handleCheckOutAction() {
  if (!currentUserSession) return;

  if (!currentSelectedShift) {
    showToast('Silakan klik salah satu shift tugas (Pagi, Siang, Sore, atau Malam) terlebih dahulu.', 'gold');
    return;
  }

  const spec = SHIFT_SPECS[currentSelectedShift] || SHIFT_SPECS.siang;
  const shiftTitle = spec.title;

  const currentRec = todayPresenceList.find(p => !p.is_izin && p.shift === currentSelectedShift);
  if (!currentRec || !currentRec.jam_masuk || currentRec.jam_masuk === '-') {
    showToast(`Silakan lakukan Presensi Masuk untuk ${shiftTitle} terlebih dahulu.`, 'error');
    return;
  }

  if (currentRec.jam_pulang && currentRec.jam_pulang !== '-') {
    showToast(`Presensi Pulang untuk ${shiftTitle} sudah tercatat sebelumnya pada pukul ${currentRec.jam_pulang}.`, 'gold');
    return;
  }

  const jamPulang = getCurrentTimeShort();
  const inputKegiatan = document.getElementById('inputKegiatan');
  const kegiatanTerbaru = inputKegiatan && inputKegiatan.value.trim() ? inputKegiatan.value.trim() : (currentRec.kegiatan || '-');

  try {
    await db.updatePresensi(currentRec.id, {
      id: currentRec.id,
      username: currentUserSession.username,
      date: getTodayISODate(),
      shift: currentSelectedShift,
      jam_pulang: jamPulang,
      kegiatan: kegiatanTerbaru,
      keterangan: kegiatanTerbaru
    });

    currentRec.jam_pulang = jamPulang;
    currentRec.kegiatan = kegiatanTerbaru;
    currentRec.keterangan = kegiatanTerbaru;

    updateShiftCardsUI();
    renderTodayStatusCard();
    showToast(`Alhamdulillah, Presensi Pulang ${shiftTitle} berhasil dicatat pada ${jamPulang}. Tugas shift selesai!`, 'success');
    await loadRecapData(currentRecapMonthIndex, currentRecapYear);
  } catch (err) {
    console.error("Gagal presensi pulang:", err);
    showToast(err.message || 'Gagal menyimpan presensi pulang.', 'error');
  }
}

// Pengajuan Izin / Udzur Syar'i (Masuk Rekap Bulanan Tanpa Perlu Jam)
async function handleIzinSubmit(event) {
  event.preventDefault();
  if (!currentUserSession) return;

  const jenisSelect = document.getElementById('inputJenisIzin');
  const tanggalInput = document.getElementById('inputTanggalIzin');
  const shiftSelect = document.getElementById('inputShiftIzin');
  const keteranganInput = document.getElementById('inputKeteranganIzin');

  const jenis = jenisSelect ? jenisSelect.value : "Izin Syar'i";
  const tanggal = tanggalInput && tanggalInput.value ? tanggalInput.value : getTodayISODate();
  const shift = shiftSelect ? shiftSelect.value : 'Seharian Penuh';
  const keterangan = keteranganInput && keteranganInput.value.trim() ? keteranganInput.value.trim() : 'Keperluan Syar\'i';

  const record = {
    id: 'izin_' + Date.now(),
    username: currentUserSession.username,
    name: currentUserSession.name,
    date: tanggal,
    shift: 'izin',
    shift_title: shift,
    jam_masuk: '-',
    jam_pulang: '-',
    status: 'izin',
    kegiatan: `${jenis}: ${keterangan}`,
    ruang: '-',
    is_izin: true,
    jenis_izin: jenis,
    keterangan_izin: keterangan,
    created_at: new Date().toISOString()
  };

  await db.addPresensi(record);

  // Jika izin untuk hari ini
  if (tanggal === getTodayISODate()) {
    todayPresenceList.unshift(record);
    updateShiftCardsUI();
    renderTodayStatusCard();
  }

  if (keteranganInput) keteranganInput.value = '';

  const dateParts = tanggal.split('-').map(Number);
  if (dateParts.length === 3) {
    currentRecapMonthIndex = dateParts[1] - 1;
    currentRecapYear = dateParts[0];
  }

  loadRecapData(currentRecapMonthIndex, currentRecapYear);
  showToast(`Alhamdulillah, permohonan ${jenis} (${shift}) berhasil masuk ke Rekapitulasi Bulanan.`, 'success');
}

// Render Kartu Status Kehadiran Hari Ini
function renderTodayStatusCard() {
  const shiftNameElem = document.getElementById('todayShiftName');
  const inTimeElem = document.getElementById('todayCheckInTime');
  const inBadgeElem = document.getElementById('todayCheckInBadge');
  const outTimeElem = document.getElementById('todayCheckOutTime');
  const outBadgeElem = document.getElementById('todayCheckOutBadge');
  const taskDescElem = document.getElementById('todayTaskDesc');
  const inputKegiatan = document.getElementById('inputKegiatan');

  // Cek izin seharian penuh hari ini
  const izinFull = todayPresenceList.find(p => p.is_izin && (p.shift_title === 'Seharian Penuh' || p.shift === 'izin'));

  // JIKA BELUM ADA SHIFT YANG DIPILIH (Batal Pilih / State Netral)
  if (!currentSelectedShift) {
    if (shiftNameElem) shiftNameElem.textContent = izinFull ? 'Izin Resmi' : 'Belum Ada Shift Dipilih';

    if (inTimeElem) {
      inTimeElem.textContent = izinFull ? 'Izin' : '-';
      inTimeElem.style.color = izinFull ? '#0284c7' : 'var(--text-muted)';
    }
    if (inBadgeElem) {
      if (izinFull) {
        inBadgeElem.style.display = 'inline-block';
        inBadgeElem.className = 'status-indicator-badge';
        inBadgeElem.style.background = '#e0f2fe';
        inBadgeElem.style.color = '#0284c7';
        inBadgeElem.style.border = '1px solid rgba(2, 132, 199, 0.3)';
        inBadgeElem.textContent = izinFull.jenis_izin || 'Izin Resmi';
      } else {
        inBadgeElem.style.display = 'none';
      }
    }

    if (outTimeElem) {
      outTimeElem.textContent = izinFull ? 'Izin' : '-';
      outTimeElem.style.color = izinFull ? '#0284c7' : 'var(--text-muted)';
    }
    if (outBadgeElem) {
      if (izinFull) {
        outBadgeElem.style.display = 'inline-block';
        outBadgeElem.className = 'status-indicator-badge';
        outBadgeElem.style.background = '#e0f2fe';
        outBadgeElem.style.color = '#0284c7';
        outBadgeElem.style.border = '1px solid rgba(2, 132, 199, 0.3)';
        outBadgeElem.textContent = 'Disetujui';
      } else {
        outBadgeElem.style.display = 'none';
      }
    }

    if (taskDescElem) {
      taskDescElem.textContent = izinFull ? (izinFull.kegiatan || izinFull.keterangan || 'Permohonan Izin / Udzur') : 'Silakan klik salah satu shift di bawah untuk melihat status atau presensi.';
    }

    currentTodayPresence = {
      id: null,
      shift: null,
      checkInTime: null,
      checkOutTime: null,
      checkOutStatus: null,
      isIzin: Boolean(izinFull),
      kegiatan: '',
      lokasi: '-'
    };
    return;
  }

  // JIKA SHIFT SEDANG TERPILIH
  const spec = SHIFT_SPECS[currentSelectedShift] || SHIFT_SPECS.siang;
  const rec = todayPresenceList.find(p => !p.is_izin && p.shift === currentSelectedShift);
  const izinShift = todayPresenceList.find(p => p.is_izin && (p.shift === currentSelectedShift || p.shift_title === 'Seharian Penuh' || p.shift === 'izin'));

  if (izinShift) {
    if (shiftNameElem) shiftNameElem.textContent = `${spec.title} (Izin)`;
    if (inTimeElem) {
      inTimeElem.textContent = 'Izin';
      inTimeElem.style.color = '#0284c7';
    }
    if (inBadgeElem) {
      inBadgeElem.style.display = 'inline-block';
      inBadgeElem.className = 'status-indicator-badge';
      inBadgeElem.style.background = '#e0f2fe';
      inBadgeElem.style.color = '#0284c7';
      inBadgeElem.style.border = '1px solid rgba(2, 132, 199, 0.3)';
      inBadgeElem.textContent = izinShift.jenis_izin || 'Izin Resmi';
    }
    if (outTimeElem) {
      outTimeElem.textContent = 'Izin';
      outTimeElem.style.color = '#0284c7';
    }
    if (outBadgeElem) {
      outBadgeElem.style.display = 'inline-block';
      outBadgeElem.className = 'status-indicator-badge';
      outBadgeElem.style.background = '#e0f2fe';
      outBadgeElem.style.color = '#0284c7';
      outBadgeElem.style.border = '1px solid rgba(2, 132, 199, 0.3)';
      outBadgeElem.textContent = 'Disetujui';
    }
    if (taskDescElem) {
      taskDescElem.textContent = izinShift.kegiatan || izinShift.keterangan || 'Permohonan Izin / Udzur';
    }
    currentTodayPresence = {
      id: izinShift.id,
      shift: currentSelectedShift,
      checkInTime: null,
      checkOutTime: null,
      checkOutStatus: null,
      isIzin: true,
      izinJenis: izinShift.jenis_izin,
      kegiatan: izinShift.kegiatan,
      lokasi: '-'
    };
    return;
  }

  if (shiftNameElem) shiftNameElem.textContent = spec.title;

  // Status Masuk
  if (rec && rec.jam_masuk && rec.jam_masuk !== '-') {
    if (inTimeElem) {
      inTimeElem.textContent = rec.jam_masuk;
      inTimeElem.style.color = 'var(--primary)';
    }
    if (inBadgeElem) {
      inBadgeElem.style.display = 'inline-block';
      inBadgeElem.className = 'status-indicator-badge centang-masuk';
      inBadgeElem.style.background = '';
      inBadgeElem.style.color = '';
      inBadgeElem.style.border = '';
      inBadgeElem.textContent = 'Sudah Check-In';
    }
  } else {
    if (inTimeElem) {
      inTimeElem.textContent = 'Belum Check-In';
      inTimeElem.style.color = 'var(--text-muted)';
    }
    if (inBadgeElem) {
      inBadgeElem.style.display = 'none';
      inBadgeElem.textContent = '';
    }
  }

  // Status Pulang
  if (rec && rec.jam_pulang && rec.jam_pulang !== '-') {
    if (outTimeElem) {
      outTimeElem.textContent = rec.jam_pulang;
      outTimeElem.style.color = 'var(--primary)';
    }
    if (outBadgeElem) {
      outBadgeElem.style.display = 'inline-block';
      outBadgeElem.className = 'status-indicator-badge centang-masuk';
      outBadgeElem.style.background = '';
      outBadgeElem.style.color = '';
      outBadgeElem.style.border = '';
      outBadgeElem.textContent = 'Sudah Check-Out';
    }
  } else {
    if (outTimeElem) {
      outTimeElem.textContent = 'Belum Check-Out';
      outTimeElem.style.color = 'var(--text-muted)';
    }
    if (outBadgeElem) {
      outBadgeElem.style.display = 'none';
      outBadgeElem.textContent = '';
    }
  }

  // Catatan Pembelajaran / Tugas
  let defaultTask = spec.defaultKegiatan || "Halaqah Tahfidz Santri";
  if (currentUserSession.subject === 'Musyrifah') {
    defaultTask = 'Pembinaan & Pendampingan Santri';
  } else if (currentUserSession.subject === 'Staff Administrasi') {
    defaultTask = 'Administrasi & Layanan Santri';
  } else if (currentUserSession.subject === 'Mudiroh') {
    defaultTask = 'Supervisi & Manajerial Ma\'had';
  } else if (currentUserSession.subject) {
    defaultTask = currentUserSession.subject;
  }

  const activeCatatan = (rec && (rec.kegiatan || rec.keterangan)) ? (rec.kegiatan || rec.keterangan) : defaultTask;
  if (taskDescElem) {
    taskDescElem.textContent = activeCatatan;
  }
  if (inputKegiatan) {
    inputKegiatan.value = activeCatatan;
  }

  currentTodayPresence = {
    id: rec ? rec.id : null,
    shift: currentSelectedShift,
    checkInTime: rec ? rec.jam_masuk : null,
    checkOutTime: rec ? rec.jam_pulang : null,
    checkOutStatus: rec && rec.jam_pulang ? 'selesai' : (rec && rec.jam_masuk ? 'masuk' : null),
    isIzin: false,
    kegiatan: activeCatatan,
    lokasi: '-'
  };
}

// Muat Data Rekapitulasi Riil Ustadz yang Login
async function loadRecapData(monthIndex, year) {
  const monthName = MONTH_NAMES[monthIndex];
  const titleElem = document.getElementById('tableHeaderTitle');
  if (titleElem) {
    titleElem.innerHTML = `<span>Rincian Rekap Presensi Bulan ${monthName} ${year}</span>`;
  }

  const tbody = document.getElementById('recapTableBody');
  if (!tbody) return;

  if (!currentUserSession) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">Silakan masuk terlebih dahulu untuk melihat riwayat presensi.</td></tr>`;
    return;
  }

  const prefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
  const allRecords = await db.getPresensi({ username: currentUserSession.username });
  const records = allRecords.filter(r => r.date && r.date.startsWith(prefix));

  let hadirCount = 0;
  let izinCount = 0;

  tbody.innerHTML = '';

  if (records.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--dark); margin-bottom: 0.25rem;">Belum Ada Riwayat Presensi</div>
          <p style="font-size: 0.85rem; max-width: 420px; margin: 0 auto;">Riwayat presensi atau permohonan izin Anda pada bulan ${monthName} ${year} akan otomatis tercatat di sini.</p>
        </td>
      </tr>
    `;
  } else {
    // Urutkan dari tanggal terbaru di atas
    records.sort((a, b) => new Date(b.date) - new Date(a.date));

    records.forEach(r => {
      const dateParts = r.date.split('-').map(Number);
      const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
      const dayName = DAY_NAMES[dateObj.getDay()] || 'Hari';
      const formattedDate = `${dayName}, ${dateParts[2]} ${MONTH_NAMES[dateParts[1] - 1]}`;

      const tr = document.createElement('tr');

      if (r.is_izin) {
        izinCount++;
        tr.innerHTML = `
          <td><strong>${formattedDate}</strong></td>
          <td><span class="shift-name-text">${r.shift_title || 'Izin Resmi'}</span></td>
          <td style="color: #0284c7; font-weight: 700;">Izin Resmi (Tanpa Jam)</td>
          <td>${r.kegiatan || r.keterangan || 'Permohonan Izin / Udzur'}</td>
          <td><span class="status-badge-table izin">${r.jenis_izin || 'Izin'}</span></td>
        `;
      } else {
        hadirCount++;
        const jamRentang = r.jam_pulang ? `${r.jam_masuk} - ${r.jam_pulang}` : `${r.jam_masuk} - (Sedang Bertugas)`;
        tr.innerHTML = `
          <td><strong>${formattedDate}</strong></td>
          <td><span class="shift-name-text">${r.shift_title || SHIFT_SPECS[r.shift]?.title || 'Shift'}</span></td>
          <td>${jamRentang}</td>
          <td>${r.kegiatan || r.keterangan || '-'}</td>
          <td><span class="status-badge-table hadir">Hadir</span></td>
        `;
      }
      tbody.appendChild(tr);
    });
  }

  // Update Kartu Statistik Riil
  const statHadirElem = document.getElementById('statHadirCount');
  const statIzinElem = document.getElementById('statIzinCount');
  const statTotalLogElem = document.getElementById('statTotalLogCount');

  if (statHadirElem) statHadirElem.textContent = `${hadirCount} Hari`;
  if (statIzinElem) statIzinElem.textContent = `${izinCount} Hari`;
  if (statTotalLogElem) statTotalLogElem.textContent = `${records.length} Sesi`;
}

function filterRecapTable() {
  const searchInput = document.getElementById('recapSearchInput');
  const filter = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const rows = document.querySelectorAll('#recapTableBody tr');

  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(filter) ? '' : 'none';
  });
}

function exportRecapToCSV() {
  const monthName = MONTH_NAMES[currentRecapMonthIndex];
  const filename = `Rekap_Presensi_Ustadz_${monthName}_${currentRecapYear}.csv`;

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Tanggal & Hari,Waktu Shift,Jam Masuk - Jam Pulang,Catatan Pembelajaran,Status\n";

  const rows = document.querySelectorAll('#recapTableBody tr');
  rows.forEach(row => {
    const cols = row.querySelectorAll('td');
    if (cols.length === 5) {
      const rowData = Array.from(cols).map(c => `"${c.textContent.trim().replace(/"/g, '""')}"`);
      csvContent += rowData.join(',') + "\n";
    }
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast(`Rekapitulasi presensi berhasil diekspor ke ${filename}!`, 'success');
}

// ==========================================================================
// CUSTOM SELECT & CUSTOM DATEPICKER DROPDOWNS
// ==========================================================================

// 1. Toggle Custom Select (Jenis Izin, Shift Izin, Filter Bulan/Tahun Rekap)
function toggleCustomSelect(wrapperId) {
  const target = document.getElementById(wrapperId);
  if (!target) return;

  const isOpen = target.classList.contains('open');
  closeAllCustomDropdowns();

  if (!isOpen) {
    // Hitung posisi terhadap viewport layar (Smart-Flip jika mepet bawah)
    const rect = target.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < 210 && spaceAbove > 200) {
      target.classList.add('open-up');
    } else {
      target.classList.remove('open-up');
    }

    target.classList.add('open');

    // Elevasi z-index pada parent agar tidak tertutup input atau card lain
    const formGroup = target.closest('.form-group');
    if (formGroup) formGroup.style.zIndex = '9999';
    const formGrid = target.closest('.form-grid-2');
    if (formGrid) formGrid.style.zIndex = '9999';

    // Pastikan dropdown terlihat nyaman di layar mobile
    setTimeout(() => {
      const dropdown = target.querySelector('.custom-select-dropdown');
      if (dropdown) {
        const dropRect = dropdown.getBoundingClientRect();
        if (dropRect.bottom > window.innerHeight) {
          window.scrollBy({ top: dropRect.bottom - window.innerHeight + 24, behavior: 'smooth' });
        }
      }
    }, 50);
  }
}

// 2. Pilih Opsi pada Custom Select
function selectCustomOption(wrapperId, value, label) {
  const wrapper = document.getElementById(wrapperId);
  if (!wrapper) return;

  const labelElem = wrapper.querySelector('.trigger-label');
  if (labelElem) {
    labelElem.textContent = label;
    labelElem.classList.remove('placeholder');
  }

  const hiddenInput = wrapper.querySelector('input[type="hidden"]');
  if (hiddenInput) {
    hiddenInput.value = value;
    hiddenInput.dispatchEvent(new Event('change'));
  }

  wrapper.querySelectorAll('.custom-option').forEach(opt => {
    const optVal = opt.getAttribute('data-value');
    if (String(optVal) === String(value)) {
      opt.classList.add('selected');
    } else {
      opt.classList.remove('selected');
    }
  });

  wrapper.classList.remove('open');

  // Trigger reload rekapitulasi jika filter bulan / tahun diubah
  if (wrapperId === 'wrapperMonth' || wrapperId === 'wrapperYear') {
    const monthInput = document.getElementById('selectMonth') || document.getElementById('inputRecapMonth');
    const yearInput = document.getElementById('selectYear') || document.getElementById('inputRecapYear');
    const monthVal = parseInt(monthInput?.value ?? currentRecapMonthIndex, 10);
    const yearVal = parseInt(yearInput?.value ?? currentRecapYear, 10);
    currentRecapMonthIndex = isNaN(monthVal) ? currentRecapMonthIndex : monthVal;
    currentRecapYear = isNaN(yearVal) ? currentRecapYear : yearVal;
    loadRecapData(currentRecapMonthIndex, currentRecapYear);
  }
}

// 3. Tombol Periode Pintas (Bulan Ini, Bulan Lalu, 2 Bulan Lalu Dinamis)
function updateQuickMonthButtons() {
  const now = new Date();
  const currentM = now.getMonth();
  const currentY = now.getFullYear();

  const btnCurrent = document.getElementById('btnQuickCurrentMonth');
  const btnPrev = document.getElementById('btnQuickPrevMonth');
  const btnTwoAgo = document.getElementById('btnQuickTwoMonthsAgo');

  if (btnCurrent) btnCurrent.textContent = 'Bulan Ini';
  if (btnPrev) btnPrev.textContent = 'Bulan Lalu';

  if (btnTwoAgo) {
    let m = currentM - 2;
    if (m < 0) {
      m += 12;
    }
    btnTwoAgo.textContent = MONTH_NAMES[m];
  }
}

function selectQuickMonth(offset) {
  const now = new Date();
  let targetMonth = now.getMonth() - offset;
  let targetYear = now.getFullYear();

  if (targetMonth < 0) {
    targetMonth += 12;
    targetYear -= 1;
  }

  currentRecapMonthIndex = targetMonth;
  currentRecapYear = targetYear;

  // Update tombol filter aktif
  ['btnQuickCurrentMonth', 'btnQuickPrevMonth', 'btnQuickTwoMonthsAgo'].forEach((btnId, idx) => {
    const btn = document.getElementById(btnId);
    if (btn) btn.classList.toggle('active', idx === offset);
  });

  // Update label dropdown jika ada
  const monthLabel = MONTH_NAMES[targetMonth] || '';
  const wrapperMonth = document.getElementById('wrapperMonth');
  if (wrapperMonth) {
    const lbl = wrapperMonth.querySelector('.trigger-label');
    if (lbl) lbl.textContent = monthLabel;
    const inp = wrapperMonth.querySelector('input[type="hidden"]');
    if (inp) inp.value = targetMonth;
  }

  const wrapperYear = document.getElementById('wrapperYear');
  if (wrapperYear) {
    const lbl = wrapperYear.querySelector('.trigger-label');
    if (lbl) lbl.textContent = String(targetYear);
    const inp = wrapperYear.querySelector('input[type="hidden"]');
    if (inp) inp.value = targetYear;
  }

  loadRecapData(currentRecapMonthIndex, currentRecapYear);
}

// 4. Kalender Kustom untuk Tanggal Izin
let calendarActiveYear = 2026;
let calendarActiveMonth = 9; // 9 = Oktober
let calendarSelectedDate = '2026-10-22';

function toggleCustomDatePicker() {
  const wrapper = document.getElementById('wrapperDatePicker');
  if (!wrapper) return;

  const isOpen = wrapper.classList.contains('open');
  closeAllCustomDropdowns();

  if (!isOpen) {
    const rect = wrapper.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < 330 && spaceAbove > 300) {
      wrapper.classList.add('open-up');
    } else {
      wrapper.classList.remove('open-up');
    }

    wrapper.classList.add('open');
    renderCalendar();

    const formGroup = wrapper.closest('.form-group');
    if (formGroup) formGroup.style.zIndex = '9999';
    const formGrid = wrapper.closest('.form-grid-2');
    if (formGrid) formGrid.style.zIndex = '9999';

    setTimeout(() => {
      const popup = wrapper.querySelector('.custom-calendar-popup');
      if (popup) {
        const popRect = popup.getBoundingClientRect();
        if (popRect.bottom > window.innerHeight) {
          window.scrollBy({ top: popRect.bottom - window.innerHeight + 24, behavior: 'smooth' });
        }
      }
    }, 50);
  }
}

function renderCalendar() {
  const monthYearText = document.getElementById('calendarMonthYearText');
  const daysGrid = document.getElementById('calendarDaysGrid');
  const selectedInfo = document.getElementById('calendarSelectedInfo');

  if (!daysGrid) return;

  const monthName = MONTH_NAMES[calendarActiveMonth] || 'Bulan';
  if (monthYearText) {
    monthYearText.textContent = `${monthName} ${calendarActiveYear}`;
  }

  const firstDayIndex = new Date(calendarActiveYear, calendarActiveMonth, 1).getDay();
  const totalDaysInMonth = new Date(calendarActiveYear, calendarActiveMonth + 1, 0).getDate();
  const prevMonthTotalDays = new Date(calendarActiveYear, calendarActiveMonth, 0).getDate();

  const today = new Date();
  const todayY = today.getFullYear();
  const todayM = today.getMonth();
  const todayD = today.getDate();

  let html = '';

  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthTotalDays - i;
    html += `<div class="calendar-day-cell other-month">${d}</div>`;
  }

  for (let d = 1; d <= totalDaysInMonth; d++) {
    const mm = String(calendarActiveMonth + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    const isoDate = `${calendarActiveYear}-${mm}-${dd}`;

    const isToday = (calendarActiveYear === todayY && calendarActiveMonth === todayM && d === todayD);
    const isSelected = (isoDate === calendarSelectedDate);

    let cellClass = 'calendar-day-cell';
    if (isToday) cellClass += ' today';
    if (isSelected) cellClass += ' selected';

    html += `<div class="${cellClass}" onclick="selectCalendarDate('${isoDate}')">${d}</div>`;
  }

  const remainingCells = (7 - ((firstDayIndex + totalDaysInMonth) % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    html += `<div class="calendar-day-cell other-month">${d}</div>`;
  }

  daysGrid.innerHTML = html;

  if (selectedInfo) {
    const parts = calendarSelectedDate.split('-');
    if (parts.length === 3) {
      const sDay = parseInt(parts[2], 10);
      const sMonth = MONTH_NAMES[parseInt(parts[1], 10) - 1] || '';
      selectedInfo.textContent = `${sDay} ${sMonth.substring(0, 3)} ${parts[0]}`;
    }
  }
}

function prevCalendarMonth() {
  calendarActiveMonth--;
  if (calendarActiveMonth < 0) {
    calendarActiveMonth = 11;
    calendarActiveYear--;
  }
  renderCalendar();
}

function nextCalendarMonth() {
  calendarActiveMonth++;
  if (calendarActiveMonth > 11) {
    calendarActiveMonth = 0;
    calendarActiveYear++;
  }
  renderCalendar();
}

function selectCalendarToday() {
  const now = new Date();
  calendarActiveYear = now.getFullYear();
  calendarActiveMonth = now.getMonth();
  const isoToday = getTodayISODate();
  selectCalendarDate(isoToday);
}

function selectCalendarDate(isoDate) {
  calendarSelectedDate = isoDate;
  const parts = isoDate.split('-');
  if (parts.length === 3) {
    calendarActiveYear = parseInt(parts[0], 10);
    calendarActiveMonth = parseInt(parts[1], 10) - 1;
  }

  const inputHidden = document.getElementById('inputTanggalIzin');
  if (inputHidden) inputHidden.value = isoDate;

  const d = new Date(calendarActiveYear, calendarActiveMonth, parseInt(parts[2], 10));
  const dayName = DAY_NAMES[d.getDay()] || '';
  const monthName = MONTH_NAMES[calendarActiveMonth] || '';
  const labelText = `${dayName}, ${parseInt(parts[2], 10)} ${monthName} ${calendarActiveYear}`;

  const labelElem = document.getElementById('datepickerDisplayLabel');
  if (labelElem) labelElem.textContent = labelText;

  renderCalendar();

  const wrapper = document.getElementById('wrapperDatePicker');
  if (wrapper) wrapper.classList.remove('open');

  showToast(`Tanggal izin: ${labelText}`, 'gold');
}

// Tutup semua dropdown custom
function closeAllCustomDropdowns() {
  document.querySelectorAll('.custom-select-wrapper.open, .custom-datepicker-wrapper.open, .custom-select-recap.open').forEach(el => {
    el.classList.remove('open');
    el.classList.remove('open-up');
  });
  document.querySelectorAll('.form-group, .form-grid-2').forEach(el => {
    el.style.zIndex = '';
  });
}

// Tutup saat user klik di luar dropdown manapun
document.addEventListener('click', (e) => {
  if (!e.target.closest('.custom-select-wrapper') && !e.target.closest('.custom-datepicker-wrapper') && !e.target.closest('.custom-select-recap')) {
    closeAllCustomDropdowns();
  }
});

// Inisialisasi Custom Date Picker untuk Form Izin
function initCustomDatePicker() {
  const inputHidden = document.getElementById('inputTanggalIzin');
  const todayStr = getTodayISODate();
  if (inputHidden && !inputHidden.value) inputHidden.value = todayStr;
  calendarSelectedDate = inputHidden?.value || todayStr;
  const parts = calendarSelectedDate.split('-');
  if (parts.length === 3) {
    calendarActiveYear = parseInt(parts[0], 10);
    calendarActiveMonth = parseInt(parts[1], 10) - 1;
  }
}

/* ==========================================================================
   6. DASHBOARD ADMIN (MONITORING HARIAN & DIREKTORI DATA ASATIDZ)
   ========================================================================== */
let adminSelectedDailyDate = getTodayISODate();
let adminCurrentShiftFilter = 'all';
let adminCurrentRecapMonth = new Date().getMonth();
let adminCurrentRecapYear = new Date().getFullYear();

let adminCalendarActiveMonth = new Date().getMonth();
let adminCalendarActiveYear = new Date().getFullYear();

async function initAdminDashboard() {
  const isViewAdmin = document.getElementById('viewAdminDaily');
  if (!isViewAdmin) return;

  const dateInput = document.getElementById('adminDailyDatePicker');
  if (dateInput) {
    dateInput.value = adminSelectedDailyDate;
  }

  // Set initial DD/MM/YYYY pada trigger kalender kustom admin
  const p = adminSelectedDailyDate.split('-').map(Number);
  const formattedDDMMYYYY = `${String(p[2]).padStart(2, '0')}/${String(p[1]).padStart(2, '0')}/${p[0]}`;
  const labelElem = document.getElementById('adminDateDisplayLabel');
  if (labelElem) labelElem.textContent = formattedDDMMYYYY;

  // Inisialisasi tombol periode rekapitulasi admin
  initAdminRecapPeriods();

  // Render semua panel admin secara asinkron dari Database
  await renderAdminDailyTable();
  await renderAdminUstadzDirectory();
  await renderAdminRecapTable(adminCurrentRecapMonth, adminCurrentRecapYear);
}

function switchAdminTab(tabName) {
  const tabDaily = document.getElementById('tabAdminDaily');
  const tabRekap = document.getElementById('tabAdminRekap');
  const tabUstadz = document.getElementById('tabAdminUstadz');

  const viewDaily = document.getElementById('viewAdminDaily');
  const viewRekap = document.getElementById('viewAdminRekap');
  const viewUstadz = document.getElementById('viewAdminUstadz');

  const tabs = [tabDaily, tabRekap, tabUstadz];
  const views = [viewDaily, viewRekap, viewUstadz];

  tabs.forEach(t => t && t.classList.remove('active'));
  views.forEach(v => v && v.classList.add('hidden'));

  if (tabName === 'daily' || tabName === 'live') {
    if (tabDaily) tabDaily.classList.add('active');
    if (viewDaily) viewDaily.classList.remove('hidden');
    renderAdminDailyTable();
  } else if (tabName === 'rekap') {
    if (tabRekap) tabRekap.classList.add('active');
    if (viewRekap) viewRekap.classList.remove('hidden');
    renderAdminRecapTable(adminCurrentRecapMonth, adminCurrentRecapYear);
  } else if (tabName === 'ustadz') {
    if (tabUstadz) tabUstadz.classList.add('active');
    if (viewUstadz) viewUstadz.classList.remove('hidden');
    renderAdminUstadzDirectory();
  }
}

function onAdminDailyDateChange(dateVal) {
  if (!dateVal) return;
  adminSelectedDailyDate = dateVal;
  renderAdminDailyTable();
}

// Handler Dropdown Kalender Kustom Administrator
function toggleAdminDatePicker() {
  const wrapper = document.getElementById('wrapperAdminDatePicker');
  if (!wrapper) return;

  const isOpen = wrapper.classList.contains('open');
  closeAllCustomDropdowns();

  if (!isOpen) {
    wrapper.classList.add('open');
    renderAdminCalendar();
  }
}

function renderAdminCalendar() {
  const monthYearText = document.getElementById('adminCalendarMonthYearText');
  const daysGrid = document.getElementById('adminCalendarDaysGrid');
  const selectedInfo = document.getElementById('adminCalendarSelectedInfo');

  if (!daysGrid) return;

  const monthName = MONTH_NAMES[adminCalendarActiveMonth] || 'Bulan';
  if (monthYearText) {
    monthYearText.textContent = `${monthName} ${adminCalendarActiveYear}`;
  }

  daysGrid.innerHTML = '';

  const firstDayIndex = new Date(adminCalendarActiveYear, adminCalendarActiveMonth, 1).getDay();
  const totalDaysInMonth = new Date(adminCalendarActiveYear, adminCalendarActiveMonth + 1, 0).getDate();
  const totalDaysPrevMonth = new Date(adminCalendarActiveYear, adminCalendarActiveMonth, 0).getDate();

  const todayStr = getTodayISODate();

  // Hari bulan sebelumnya
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = totalDaysPrevMonth - i;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'calendar-day other-month';
    btn.textContent = dayNum;
    btn.disabled = true;
    daysGrid.appendChild(btn);
  }

  // Hari bulan aktif
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const dayISO = `${adminCalendarActiveYear}-${String(adminCalendarActiveMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'calendar-day';
    btn.textContent = day;

    if (dayISO === todayStr) {
      btn.classList.add('today');
    }
    if (dayISO === adminSelectedDailyDate) {
      btn.classList.add('selected');
    }

    btn.onclick = () => selectAdminCalendarDate(dayISO);
    daysGrid.appendChild(btn);
  }

  if (selectedInfo && adminSelectedDailyDate) {
    const p = adminSelectedDailyDate.split('-').map(Number);
    selectedInfo.textContent = `${String(p[2]).padStart(2, '0')}/${String(p[1]).padStart(2, '0')}/${p[0]}`;
  }
}

function prevAdminCalendarMonth() {
  adminCalendarActiveMonth--;
  if (adminCalendarActiveMonth < 0) {
    adminCalendarActiveMonth = 11;
    adminCalendarActiveYear--;
  }
  renderAdminCalendar();
}

function nextAdminCalendarMonth() {
  adminCalendarActiveMonth++;
  if (adminCalendarActiveMonth > 11) {
    adminCalendarActiveMonth = 0;
    adminCalendarActiveYear++;
  }
  renderAdminCalendar();
}

function selectAdminCalendarToday() {
  const now = new Date();
  adminCalendarActiveYear = now.getFullYear();
  adminCalendarActiveMonth = now.getMonth();
  const isoToday = getTodayISODate();
  selectAdminCalendarDate(isoToday);
}

function selectAdminCalendarDate(dateISO) {
  adminSelectedDailyDate = dateISO;
  const p = dateISO.split('-').map(Number);
  const formattedDDMMYYYY = `${String(p[2]).padStart(2, '0')}/${String(p[1]).padStart(2, '0')}/${p[0]}`;

  const labelElem = document.getElementById('adminDateDisplayLabel');
  if (labelElem) labelElem.textContent = formattedDDMMYYYY;

  const hiddenInput = document.getElementById('adminDailyDatePicker');
  if (hiddenInput) hiddenInput.value = dateISO;

  // Status tombol pintas Hari Ini / Kemarin
  const todayStr = getTodayISODate();
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yesterdayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const btnToday = document.getElementById('btnAdminDateToday');
  const btnYesterday = document.getElementById('btnAdminDateYesterday');
  if (btnToday) {
    if (dateISO === todayStr) btnToday.classList.add('active');
    else btnToday.classList.remove('active');
  }
  if (btnYesterday) {
    if (dateISO === yesterdayStr) btnYesterday.classList.add('active');
    else btnYesterday.classList.remove('active');
  }

  const wrapper = document.getElementById('wrapperAdminDatePicker');
  if (wrapper) wrapper.classList.remove('open');

  onAdminDailyDateChange(dateISO);
}

function setAdminDailyDateToday() {
  const todayStr = getTodayISODate();
  const p = todayStr.split('-').map(Number);
  adminCalendarActiveYear = p[0];
  adminCalendarActiveMonth = p[1] - 1;
  selectAdminCalendarDate(todayStr);
}

function setAdminDailyDateYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const p = yStr.split('-').map(Number);
  adminCalendarActiveYear = p[0];
  adminCalendarActiveMonth = p[1] - 1;
  selectAdminCalendarDate(yStr);
}

function filterAdminDailyShift(shiftKey, btn) {
  adminCurrentShiftFilter = shiftKey;
  document.querySelectorAll('[data-filter-shift]').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderAdminDailyTable();
}

function searchAdminDailyTable() {
  renderAdminDailyTable();
}

// 6.1. Render Tabel Monitoring Harian Admin
async function renderAdminDailyTable() {
  const tbody = document.getElementById('tbodyAdminDaily');
  if (!tbody) return;

  const dateParts = adminSelectedDailyDate.split('-').map(Number);
  const selDateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
  const dayName = DAY_NAMES[selDateObj.getDay()] || 'Hari';
  const formattedDate = `${dayName}, ${dateParts[2]} ${MONTH_NAMES[dateParts[1] - 1]} ${dateParts[0]}`;

  const titleElem = document.getElementById('adminDailyTableTitle');
  if (titleElem) {
    titleElem.textContent = `Daftar Presensi Asatidz — ${formattedDate}`;
  }

  // Ambil user dan presensi pada tanggal terpilih
  const allUsers = (await db.getUsers()).filter(u => u.role !== 'admin');
  const allDailyRecords = await db.getPresensi({ date: adminSelectedDailyDate });

  // Filter pencarian
  const searchInput = document.getElementById('adminDailySearchInput');
  const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

  let filteredRecords = allDailyRecords;
  if (adminCurrentShiftFilter !== 'all') {
    filteredRecords = filteredRecords.filter(r => r.shift === adminCurrentShiftFilter);
  }
  if (searchTerm) {
    filteredRecords = filteredRecords.filter(r => 
      (r.name && r.name.toLowerCase().includes(searchTerm)) ||
      ((r.kegiatan || r.keterangan) && (r.kegiatan || r.keterangan).toLowerCase().includes(searchTerm))
    );
  }

  let hadirCount = 0;
  let izinCount = 0;

  tbody.innerHTML = '';

  if (filteredRecords.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--dark); margin-bottom: 0.25rem;">Belum Ada Presensi Masuk</div>
          <p style="font-size: 0.85rem; max-width: 440px; margin: 0 auto;">Belum ada asatidz yang mencatat presensi untuk tanggal ${formattedDate}.</p>
        </td>
      </tr>
    `;
  } else {
    filteredRecords.forEach((r, idx) => {
      const tr = document.createElement('tr');
      const shiftTitle = r.shift_title || SHIFT_SPECS[r.shift]?.title || r.shift || 'Shift';

      if (r.is_izin) {
        izinCount++;
        tr.innerHTML = `
          <td style="text-align: center;">${idx + 1}</td>
          <td><strong>${r.name}</strong></td>
          <td><span class="shift-name-text">${shiftTitle}</span></td>
          <td style="text-align: center; color: #0284c7; font-weight: 700;">Izin Resmi (Tanpa Jam)</td>
          <td>${r.kegiatan || r.keterangan || r.jenis_izin || 'Izin'}</td>
          <td style="text-align: center;"><span class="status-badge-table izin">${r.jenis_izin || 'Izin'}</span></td>
        `;
      } else {
        hadirCount++;
        const jamRentang = r.jam_pulang ? `${r.jam_masuk} - ${r.jam_pulang}` : `${r.jam_masuk} - (Bertugas)`;
        tr.innerHTML = `
          <td style="text-align: center;">${idx + 1}</td>
          <td><strong>${r.name}</strong></td>
          <td><span class="shift-name-text">${shiftTitle}</span></td>
          <td style="text-align: center;">${jamRentang}</td>
          <td>${r.kegiatan || r.keterangan || '-'}</td>
          <td style="text-align: center;"><span class="status-badge-table hadir">Hadir</span></td>
        `;
      }
      tbody.appendChild(tr);
    });
  }

  // Update Ringkasan Metrik Harian Admin
  const totalGuruElem = document.getElementById('statAdminTotalGuru');
  const hadirElem = document.getElementById('statAdminHadir');
  const izinElem = document.getElementById('statAdminIzin');
  const belumElem = document.getElementById('statAdminBelum');

  const totalAsatidz = allUsers.length;
  const belumHadir = Math.max(0, totalAsatidz - hadirCount - izinCount);

  if (totalGuruElem) totalGuruElem.textContent = `${totalAsatidz} Asatidz`;
  if (hadirElem) hadirElem.textContent = `${hadirCount} Asatidz`;
  if (izinElem) izinElem.textContent = `${izinCount} Asatidz`;
  if (belumElem) belumElem.textContent = `${belumHadir} Asatidz`;
}

// 6.2. Render Direktori Data Asatidz (Nama, Pelajaran, Nomor WA — Tanpa Hak Ubah/Akses & Tanpa Foto Profil)
async function renderAdminUstadzDirectory() {
  const container = document.getElementById('gridAsatidzDirectory');
  if (!container) return;

  const users = (await db.getUsers()).filter(u => u.role !== 'admin');
  container.innerHTML = '';

  if (users.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3.5rem 1.5rem; background: var(--white); border-radius: var(--radius-lg); border: 2px dashed #cbd5e1; color: var(--text-muted);">
        <h4 style="font-size: 1.15rem; color: var(--dark); margin-bottom: 0.35rem; font-weight: 800;">Belum Ada Asatidz Terdaftar</h4>
        <p style="font-size: 0.88rem; max-width: 480px; margin: 0 auto; line-height: 1.6;">
          Daftar asatidz masih kosong. Asatidz dapat mendaftarkan akun secara mandiri melalui menu <strong>Buat Akun Baru</strong> pada portal masuk presensi.
        </p>
      </div>
    `;
    return;
  }

  users.forEach(u => {
    const card = document.createElement('div');
    card.className = 'asatidz-card';

    card.innerHTML = `
      <div class="asatidz-card-top">
        <div class="asatidz-card-name">${u.name}</div>
        <div class="asatidz-card-role">Pengajar Ma'had Imam 'Ashim</div>
      </div>

      <div class="asatidz-card-body">
        <div class="asatidz-card-field">
          <span class="field-label">Jabatan</span><span class="colon">:</span>
          <span class="field-value">${u.subject || 'Pengajar Tahfidz'}</span>
        </div>

        <div class="asatidz-card-field">
          <span class="field-label">No. WhatsApp</span><span class="colon">:</span>
          <span class="field-value">${u.phone || '-'}</span>
        </div>
      </div>

      <div class="asatidz-card-footer">
        <span class="status-badge-table hadir">Akun Terdaftar</span>
        <span class="asatidz-card-username">@${u.username}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

// 6.3. Kontrol Periode Rekapitulasi Seluruh Asatidz
function initAdminRecapPeriods() {
  const now = new Date();
  const currentM = now.getMonth();
  const btnCurrent = document.getElementById('btnAdminQuickCurrentMonth');
  const btnPrev = document.getElementById('btnAdminQuickPrevMonth');
  const btnTwoAgo = document.getElementById('btnAdminQuickTwoMonthsAgo');

  if (btnCurrent) btnCurrent.textContent = 'Bulan Ini';
  if (btnPrev) btnPrev.textContent = 'Bulan Lalu';

  if (btnTwoAgo) {
    let m = currentM - 2;
    if (m < 0) {
      m += 12;
    }
    btnTwoAgo.textContent = MONTH_NAMES[m];
  }
}

function selectAdminQuickMonth(offset) {
  const now = new Date();
  let targetMonth = now.getMonth() - offset;
  let targetYear = now.getFullYear();

  if (targetMonth < 0) {
    targetMonth += 12;
    targetYear -= 1;
  }

  adminCurrentRecapMonth = targetMonth;
  adminCurrentRecapYear = targetYear;

  ['btnAdminQuickCurrentMonth', 'btnAdminQuickPrevMonth', 'btnAdminQuickTwoMonthsAgo'].forEach((btnId, idx) => {
    const btn = document.getElementById(btnId);
    if (btn) btn.classList.toggle('active', idx === offset);
  });

  renderAdminRecapTable(adminCurrentRecapMonth, adminCurrentRecapYear);
}

function selectAdminRecapMonth(mIndex, y) {
  adminCurrentRecapMonth = mIndex;
  adminCurrentRecapYear = y;
  renderAdminRecapTable(adminCurrentRecapMonth, adminCurrentRecapYear);
}

// 6.4. Render Rekapitulasi Seluruh Asatidz Bulanan (Tanpa Kolom Terlambat)
async function renderAdminRecapTable(mIndex, y) {
  const tbody = document.getElementById('tbodyAdminRecapAll');
  if (!tbody) return;

  const monthName = MONTH_NAMES[mIndex];

  // Update indikator bulan pada judul tabel
  const subtitleElem = document.getElementById('adminRecapMonthSubtitle');
  if (subtitleElem) {
    subtitleElem.textContent = `Bulan ${monthName} ${y}`;
  }

  const allUsers = (await db.getUsers()).filter(u => u.role !== 'admin');
  const allPresensi = await db.getPresensi();

  const prefix = `${y}-${String(mIndex + 1).padStart(2, '0')}`;
  const monthRecords = allPresensi.filter(r => r.date && r.date.startsWith(prefix));

  // Hitung akumulasi untuk 4 Kartu Ringkasan Rekapitulasi Seluruh Asatidz
  const totalHadir = monthRecords.filter(r => !r.is_izin).length;
  const totalIzin = monthRecords.filter(r => r.is_izin).length;
  const totalAlpha = 0; // Standar awal tanpa alpha otomatis
  const totalPresensi = totalHadir + totalIzin;
  const disiplinRate = totalPresensi > 0 ? Math.round((totalHadir / totalPresensi) * 100) : 0;

  let disiplinKategori = '-';
  if (totalPresensi > 0) {
    if (disiplinRate >= 90) disiplinKategori = 'Sangat Baik';
    else if (disiplinRate >= 75) disiplinKategori = 'Baik';
    else if (disiplinRate >= 60) disiplinKategori = 'Cukup';
    else disiplinKategori = 'Perlu Ditingkatkan';
  }

  const statDisiplin = document.getElementById('statAdminRecapDisiplin');
  const statDisiplinDesc = document.getElementById('statAdminRecapDisiplinDesc');
  const statHadir = document.getElementById('statAdminRecapHadir');
  const statIzin = document.getElementById('statAdminRecapIzin');
  const statAlpha = document.getElementById('statAdminRecapAlpha');

  if (statDisiplin) statDisiplin.textContent = totalPresensi > 0 ? `${disiplinRate}%` : '0%';
  if (statDisiplinDesc) statDisiplinDesc.textContent = totalPresensi > 0 ? `Kategori: ${disiplinKategori}` : 'Kategori: -';
  if (statHadir) statHadir.textContent = `${totalHadir} Shift`;
  if (statIzin) statIzin.textContent = `${totalIzin} Hari`;
  if (statAlpha) statAlpha.textContent = `${totalAlpha} Hari`;

  tbody.innerHTML = '';

  if (allUsers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--dark); margin-bottom: 0.25rem;">Belum Ada Data Rekapitulasi</div>
          <p style="font-size: 0.85rem; max-width: 440px; margin: 0 auto;">Belum ada asatidz yang terdaftar atau mencatat presensi pada bulan ${monthName} ${y}.</p>
        </td>
      </tr>
    `;
    return;
  }

  allUsers.forEach((u, idx) => {
    const userRecords = monthRecords.filter(r => r.username === u.username);
    const userHadir = userRecords.filter(r => !r.is_izin).length;
    const userIzin = userRecords.filter(r => r.is_izin).length;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="text-align: center;">${idx + 1}</td>
      <td><strong>${u.name}</strong></td>
      <td>${u.subject || 'Pengajar Tahfidz'}</td>
      <td style="text-align: center; font-weight: 700; color: var(--primary);">${userHadir} Sesi</td>
      <td style="text-align: center; font-weight: 700; color: #0284c7; ${userIzin > 0 ? 'cursor: pointer; text-decoration: underline;' : ''}" ${userIzin > 0 ? `onclick="openAdminIzinModal('${u.username}')" title="Klik untuk melihat rincian izin ${u.name}"` : ''}>${userIzin} Hari</td>
      <td style="text-align: center;">${u.phone || '-'}</td>
    `;
    tbody.appendChild(tr);
  });
}

function exportAdminRecapToCSV() {
  const monthName = MONTH_NAMES[adminCurrentRecapMonth];
  const filename = `Rekap_Presensi_Seluruh_Asatidz_${monthName}_${adminCurrentRecapYear}.csv`;

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "No,Nama Asatidz,Jabatan,Total Hadir,Izin / Sakit,Nomor WhatsApp\n";

  const rows = document.querySelectorAll('#tbodyAdminRecapAll tr');
  rows.forEach(row => {
    const cols = row.querySelectorAll('td');
    if (cols.length === 6) {
      const rowData = Array.from(cols).map(c => `"${c.textContent.trim().replace(/"/g, '""')}"`);
      csvContent += rowData.join(',') + "\n";
    }
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast(`Rekapitulasi seluruh asatidz berhasil diekspor ke ${filename}!`, 'success');
}

/* ==========================================================================
   6.5. Modal Overlay: Rincian Izin & Udzur Asatidz (Admin Rekap & Harian)
   ========================================================================== */
function renderIzinCardsList(izinRecords, allUsers, container) {
  const todayNow = new Date();
  const todayStr = `${todayNow.getFullYear()}-${String(todayNow.getMonth() + 1).padStart(2, '0')}-${String(todayNow.getDate()).padStart(2, '0')}`;

  let html = `<div class="modal-izin-list">`;

  izinRecords.forEach(r => {
    const user = allUsers.find(u => u.username === r.username) || {};
    const uName = r.name || user.name || r.username;
    const uSubject = user.subject || 'Pengajar Tahfidz';
    const uPhone = user.phone || '';

    // Format tanggal izin
    let formattedDate = r.date;
    if (r.date) {
      const parts = r.date.split('-').map(Number);
      if (parts.length === 3) {
        const dObj = new Date(parts[0], parts[1] - 1, parts[2]);
        const dName = DAY_NAMES[dObj.getDay()] || 'Hari';
        formattedDate = `${dName}, ${parts[2]} ${MONTH_NAMES[parts[1] - 1]} ${parts[0]}`;
      }
    }

    // Timing status: Mendatang / Hari Ini / Telah Lewat
    let timingBadge = '';
    if (r.date > todayStr) {
      timingBadge = `<span class="badge-izin-timing upcoming">Mendatang</span>`;
    } else if (r.date === todayStr) {
      timingBadge = `<span class="badge-izin-timing today">Hari Ini</span>`;
    } else {
      timingBadge = `<span class="badge-izin-timing past">Telah Lewat</span>`;
    }

    // Format created_at jika ada
    let formattedCreatedAt = '-';
    if (r.created_at) {
      try {
        const cDate = new Date(r.created_at);
        if (!isNaN(cDate.getTime())) {
          const cDay = String(cDate.getDate()).padStart(2, '0');
          const cMonth = MONTH_NAMES[cDate.getMonth()] ? MONTH_NAMES[cDate.getMonth()].substring(0, 3) : '';
          const cHours = String(cDate.getHours()).padStart(2, '0');
          const cMins = String(cDate.getMinutes()).padStart(2, '0');
          formattedCreatedAt = `${cDay} ${cMonth} ${cDate.getFullYear()} • ${cHours}:${cMins} WIB`;
        }
      } catch (e) {}
    }

    const jenisText = r.jenis_izin || 'Izin';
    const isSakit = jenisText.toLowerCase().includes('sakit');
    const jenisClass = isSakit ? 'sakit' : 'izin';

    const shiftTitle = r.shift_title || SHIFT_SPECS[r.shift]?.title || r.shift || 'Shift';
    const keterangan = r.keterangan_izin || r.kegiatan || 'Tidak ada keterangan tambahan.';

    const cleanPhone = uPhone ? uPhone.replace(/[^0-9]/g, '') : '';
    const waLink = cleanPhone ? `
      <a href="https://wa.me/${cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone}" target="_blank" rel="noopener noreferrer" class="izin-wa-btn" title="Hubungi ${uName} via WhatsApp">
        Hubungi WA
      </a>
    ` : '';

    html += `
      <div class="izin-detail-item ${isSakit ? 'border-sakit' : ''}">
        <div class="izin-detail-header">
          <div>
            <div class="izin-detail-name">${uName}</div>
            <div class="izin-detail-role">${uSubject}</div>
          </div>
          <div class="izin-badge-group">
            <span class="badge-izin-type ${jenisClass}">${jenisText}</span>
            ${timingBadge}
          </div>
        </div>

        <div class="izin-detail-grid">
          <div class="izin-grid-row">
            <span class="izin-grid-label">Tanggal Izin</span>
            <span class="izin-grid-val">${formattedDate}</span>
          </div>
          <div class="izin-grid-row">
            <span class="izin-grid-label">Sesi / Shift</span>
            <span class="izin-grid-val">${shiftTitle}</span>
          </div>
        </div>

        <div class="izin-keterangan-box">
          <div class="izin-keterangan-title">Alasan / Keterangan Udzur:</div>
          <div class="izin-keterangan-text">${keterangan}</div>
        </div>

        <div class="izin-detail-bottom">
          <span>Dikirim: ${formattedCreatedAt}</span>
          ${waLink}
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

async function openAdminIzinModal(filterUsername = null) {
  const modal = document.getElementById('modalAdminIzinRecap');
  const modalBody = document.getElementById('modalAdminIzinBody');
  const modalTitle = document.getElementById('modalAdminIzinTitle');
  const modalSubtitle = document.getElementById('modalAdminIzinSubtitle');
  if (!modal || !modalBody) return;

  const mIndex = adminCurrentRecapMonth;
  const y = adminCurrentRecapYear;
  const monthName = MONTH_NAMES[mIndex];

  modalTitle.textContent = filterUsername ? 'Rincian Izin & Udzur Asatidz' : 'Daftar Pengajuan Izin & Sakit';
  modalSubtitle.textContent = `Periode Rekap: Bulan ${monthName} ${y}`;

  modalBody.innerHTML = `
    <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
      <div>Memuat rincian pengajuan izin asatidz...</div>
    </div>
  `;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  try {
    const allUsers = (await db.getUsers()).filter(u => u.role !== 'admin');
    const allPresensi = await db.getPresensi();

    const prefix = `${y}-${String(mIndex + 1).padStart(2, '0')}`;
    let izinRecords = allPresensi.filter(r => r.date && r.date.startsWith(prefix) && Boolean(r.is_izin));

    if (filterUsername) {
      izinRecords = izinRecords.filter(r => r.username === filterUsername);
      const filteredUser = allUsers.find(u => u.username === filterUsername);
      if (filteredUser) {
        modalTitle.textContent = `Rincian Izin: ${filteredUser.name}`;
      }
    }

    // Urutkan berdasarkan tanggal (terdekat / kronologis)
    izinRecords.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

    modalSubtitle.textContent = `Periode: Bulan ${monthName} ${y} • Total ${izinRecords.length} Pengajuan`;

    if (izinRecords.length === 0) {
      modalBody.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
          <div style="font-weight: 800; font-size: 1.05rem; color: var(--dark); margin-bottom: 0.35rem;">
            Tidak Ada Pengajuan Izin
          </div>
          <p style="font-size: 0.88rem; max-width: 420px; margin: 0 auto; line-height: 1.5;">
            Belum ada permohonan izin atau udzur dari asatidz yang tercatat pada bulan ${monthName} ${y}.
          </p>
        </div>
      `;
      return;
    }

    renderIzinCardsList(izinRecords, allUsers, modalBody);
  } catch (err) {
    console.error('Error rendering izin modal:', err);
    modalBody.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #dc2626;">
        Terjadi kesalahan saat memuat rincian izin. Silakan coba lagi.
      </div>
    `;
  }
}

async function openAdminDailyIzinModal() {
  const modal = document.getElementById('modalAdminIzinRecap');
  const modalBody = document.getElementById('modalAdminIzinBody');
  const modalTitle = document.getElementById('modalAdminIzinTitle');
  const modalSubtitle = document.getElementById('modalAdminIzinSubtitle');
  if (!modal || !modalBody) return;

  const targetDate = adminSelectedDailyDate;
  const dateParts = targetDate.split('-').map(Number);
  const selDateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
  const dayName = DAY_NAMES[selDateObj.getDay()] || 'Hari';
  const formattedDate = `${dayName}, ${dateParts[2]} ${MONTH_NAMES[dateParts[1] - 1]} ${dateParts[0]}`;

  modalTitle.textContent = 'Rincian Izin & Udzur Harian';
  modalSubtitle.textContent = `Tanggal: ${formattedDate}`;

  modalBody.innerHTML = `
    <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
      <div>Memuat rincian izin tanggal ${formattedDate}...</div>
    </div>
  `;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  try {
    const allUsers = (await db.getUsers()).filter(u => u.role !== 'admin');
    const allPresensi = await db.getPresensi();

    const izinRecords = allPresensi.filter(r => r.date === targetDate && Boolean(r.is_izin));

    if (izinRecords.length === 0) {
      // Cek apakah ada izin lain di bulan yang sama (misal ada izin tanggal mendatang)
      const prefix = `${dateParts[0]}-${String(dateParts[1]).padStart(2, '0')}`;
      const otherIzinInMonth = allPresensi.filter(r => r.date && r.date.startsWith(prefix) && Boolean(r.is_izin));

      let extraTip = '';
      if (otherIzinInMonth.length > 0) {
        extraTip = `
          <div style="margin-top: 1.25rem; padding: 0.9rem 1rem; background: #e0f2fe; border: 1.5px solid #bae6fd; border-radius: 8px; font-size: 0.85rem; color: #0369a1; text-align: left;">
            <div style="font-weight: 700; margin-bottom: 0.25rem;">Informasi Izin Terjadwal:</div>
            Ditemukan <strong>${otherIzinInMonth.length} permohonan izin</strong> pada bulan ${MONTH_NAMES[dateParts[1] - 1]} ${dateParts[0]} untuk tanggal lain (termasuk izin yang diajukan lebih awal / mendatang).
            <div style="margin-top: 0.75rem; text-align: center;">
              <button type="button" class="btn btn-primary" onclick="openAdminIzinModal()" style="font-size: 0.82rem; padding: 0.45rem 1rem; border-radius: 6px;">
                Buka Semua Izin Bulan Ini
              </button>
            </div>
          </div>
        `;
      }

      modalBody.innerHTML = `
        <div style="text-align: center; padding: 2rem 1rem; color: var(--text-muted);">
          <div style="font-weight: 800; font-size: 1.05rem; color: var(--dark); margin-bottom: 0.35rem;">
            Tidak Ada Izin Pada Tanggal Ini
          </div>
          <p style="font-size: 0.88rem; max-width: 420px; margin: 0 auto; line-height: 1.5;">
            Tidak ada asatidz yang tercatat izin atau udzur pada <strong>${formattedDate}</strong>.
          </p>
          ${extraTip}
        </div>
      `;
      return;
    }

    renderIzinCardsList(izinRecords, allUsers, modalBody);
  } catch (err) {
    console.error('Error rendering daily izin modal:', err);
    modalBody.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #dc2626;">
        Terjadi kesalahan saat memuat rincian izin. Silakan coba lagi.
      </div>
    `;
  }
}

function closeAdminIzinModal() {
  const modal = document.getElementById('modalAdminIzinRecap');
  if (modal) {
    modal.classList.remove('open');
  }
  document.body.style.overflow = '';
}

function handleAdminIzinBackdrop(event) {
  if (event.target.id === 'modalAdminIzinRecap') {
    closeAdminIzinModal();
  }
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeAdminIzinModal();
  }
});

/* ==========================================================================
   7. Toast Notifikasi Global
   ========================================================================== */
let toastTimeout = null;
function showToast(message, type = 'success') {
  const toast = document.getElementById('liveToast');
  if (!toast) return;

  if (toastTimeout) clearTimeout(toastTimeout);

  toast.className = 'toast-box';
  if (type === 'error') toast.classList.add('error');
  if (type === 'gold') toast.classList.add('gold');

  toast.textContent = message;
  toast.classList.add('show');

  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3800);
}
