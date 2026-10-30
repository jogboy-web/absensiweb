/**
 * Database Lokal Mandiri (Standalone LocalStorage)
 * Khusus Lingkungan Uji Coba (Folder Tes)
 * 
 * 100% Berjalan Lokal di Browser Komputer Anda
 * TIDAK TERHUBUNG KE CLOUDFLARE, SUPABASE, MAUPUN WEBSITE ONLINE
 */

const db = {
  // 1. Ambil Semua Asatidz Terdaftar
  async getUsers() {
    try {
      const local = localStorage.getItem('ashim_db_users');
      let users = local ? JSON.parse(local) : [];
      return users.filter(u => {
        const name = String(u.name || '').toLowerCase();
        const username = String(u.username || '').toLowerCase();
        return !name.includes('jogja') && !username.includes('jogja');
      });
    } catch (err) {
      console.error("Gagal membaca database user lokal:", err);
      return [];
    }
  },

  // 2. Tambah Asatidz Baru (Registrasi)
  async addUser(user) {
    // Validasi kode registrasi lembaga
    if (user.passcode && String(user.passcode).trim().toUpperCase() !== 'MTIA2026') {
      throw new Error("Kode Registrasi Lembaga tidak valid! Hanya asatidz resmi Ma'had yang dapat mendaftar.");
    }

    const cleanUser = String(user.username || '').trim().toLowerCase();
    const users = await this.getUsers();

    if (users.some(u => String(u.username || '').trim().toLowerCase() === cleanUser)) {
      throw new Error("Username sudah terdaftar! Silakan gunakan username lain.");
    }

    const savedUser = {
      ...user,
      id: user.id || 'user_' + Date.now(),
      username: cleanUser,
      created_at: user.created_at || new Date().toISOString()
    };

    users.unshift(savedUser);
    localStorage.setItem('ashim_db_users', JSON.stringify(users));
    return savedUser;
  },

  // 3. Cari User Berdasarkan Username (Untuk Login)
  async getUserByUsername(username) {
    const cleanUser = String(username).trim().toLowerCase();
    const users = await this.getUsers();
    return users.find(u => String(u.username).trim().toLowerCase() === cleanUser) || null;
  },

  // 4. Ambil Data Presensi
  async getPresensi(filter = {}) {
    try {
      const local = localStorage.getItem('ashim_db_presensi');
      let list = local ? JSON.parse(local) : [];
      let filtered = list.filter(r => !String(r.username || '').toLowerCase().includes('jogja'));

      if (filter.username) {
        filtered = filtered.filter(p => String(p.username || '').toLowerCase() === String(filter.username).toLowerCase());
      }
      if (filter.date) {
        filtered = filtered.filter(p => String(p.date || '').slice(0, 10) === String(filter.date).slice(0, 10));
      }
      return filtered;
    } catch (err) {
      console.error("Gagal membaca database presensi lokal:", err);
      return [];
    }
  },

  // 5. Tambah Log Presensi (Check-In / Izin)
  async addPresensi(record) {
    try {
      const local = localStorage.getItem('ashim_db_presensi');
      let list = local ? JSON.parse(local) : [];

      const rec = {
        ...record,
        id: record.id || Date.now(),
        created_at: record.created_at || new Date().toISOString()
      };

      list.unshift(rec);
      localStorage.setItem('ashim_db_presensi', JSON.stringify(list));
      return rec;
    } catch (err) {
      console.error("Gagal menyimpan presensi lokal:", err);
      throw err;
    }
  },

  // 6. Update Presensi (Check-Out)
  async updatePresensi(id, updates) {
    try {
      const local = localStorage.getItem('ashim_db_presensi');
      let list = local ? JSON.parse(local) : [];
      const idx = list.findIndex(p => String(p.id) === String(id));

      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updates };
        localStorage.setItem('ashim_db_presensi', JSON.stringify(list));
        return list[idx];
      }
      return null;
    } catch (err) {
      console.error("Gagal update presensi lokal:", err);
      return null;
    }
  }
};
