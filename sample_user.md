# Daftar Akun Pengguna (Sample Users) - Si Cuka

Gunakan akun-akun di bawah ini untuk menguji berbagai peran, tingkat jabatan, dan hak akses persetujuan cuti pada sistem **Si Cuka (Sistem Cuti Karyawan)**.

| Nama Karyawan | Username | Password | Departemen | Jabatan (Level) | Peran (Role) | Jatah Cuti Awal |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **System Administrator** | `admin` | `admin123` | IT / HR | General Manager (Lvl 5) | `ADMIN` | 12 hari |
| **Alice Johnson** | `alice` | `password123` | Executive Office | General Manager (Lvl 5) | `APPROVER` | 12 hari |
| **Bob Smith** | `bob` | `password123` | Engineering | Department Head (Lvl 4) | `APPROVER` | 12 hari |
| **Charlie Brown** | `charlie` | `password123` | Engineering | Manager (Lvl 3) | `APPROVER` | 12 hari |
| **Diana Prince** | `diana` | `password123` | Engineering | Team Lead (Lvl 2) | `APPROVER` | 12 hari |
| **Evan Wright** | `evan` | `password123` | Engineering | Staff (Lvl 1) | `REQUESTOR` | 12 hari |

---

### Aturan Tingkat Persetujuan Cuti (Hierarchy Approval Rules)

1. **Staff (Level 1):** Hanya dapat mengajukan cuti dan melihat riwayat cuti miliknya sendiri. Tidak memiliki tombol persetujuan.
2. **Atasan (Level 2 - 5):** Hanya dapat menyetujui (`APPROVED`) atau menolak (`REJECTED`) pengajuan cuti dari bawahan yang memiliki **Level Jabatan yang lebih rendah secara mutlak** (Strictly Lower Level).
   - *Contoh:* Manager (Level 3) dapat menyetujui pengajuan cuti dari Team Lead (Level 2) dan Staff (Level 1), tetapi tidak dapat menyetujui pengajuan dari Department Head (Level 4) atau sesama Manager.
3. **Admin (System Administrator):** Memiliki kontrol penuh, dapat membuat/mengedit data karyawan, serta dapat menyetujui atau menolak semua pengajuan cuti tanpa batasan hierarki jabatan.
