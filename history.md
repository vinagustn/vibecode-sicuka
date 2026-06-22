# Project History & Progress Resume - Si Cuka (Sistem Cuti Karyawan)

Dokumen ini mencatat seluruh riwayat permintaan pengguna, progress implementasi, temuan teknis utama, status saat ini, serta langkah penyelesaian berikutnya untuk proyek **Si Cuka**.

---

## 1. Riwayat Permintaan Pengguna (User Requests)

Berikut adalah daftar permintaan pengguna dari awal percakapan hingga saat ini:

1. **Pengecekan Halaman Hilang (404):** Memeriksa mengapa halaman mengembalikan pesan "was not found" dan mendokumentasikan tempat perbaikannya.
2. **Filter Pengajuan & Menu Persetujuan Terpisah:** 
   - Pengguna biasa (`REQUESTOR` dan `APPROVER`) hanya dapat melihat pengajuan cuti yang diajukan oleh diri mereka sendiri pada menu utama.
   - Pihak penyetuju (`APPROVER` & `ADMIN`) dapat mengelola persetujuan masuk serta melihat riwayat persetujuan yang telah disetujui/ditolak di menu terpisah.
3. **Audit Kode (Code Review):** Melakukan tinjauan kode pada sumber aplikasi berdasarkan aturan proyek (`AI_Project_Rules.md`) dan standar keamanan/regulasi aplikasi.
4. **Laporan Audit:** Menuliskan laporan hasil peninjauan kode ke dalam file markdown (`code_review_report.md`) pada direktori proyek.
5. **Dashboard Code Review Publik:** Menambahkan pilihan pada halaman login untuk mengakses Dashboard Code Review publik dan rincian audit berdasarkan file `code_review_report.md` secara bebas tanpa melakukan login terlebih dahulu.
6. **Desain Ulang Halaman Login:** Mendesain ulang halaman login meniru gaya [Bootstrap Login Form 07](https://preview.colorlib.com/theme/bootstrap/login-form-07/) dengan menghapus opsi login sosial (Facebook, Twitter, Google) dan teks lorem ipsum.
7. **Perbaikan Keamanan & Rescan:** Melakukan perbaikan kode sesuai temuan pada laporan audit (`code_review_report.md`), memindai ulang sistem, dan memperbarui dokumen laporan.
8. **Pembaruan Desain Login Form 07:** Menyempurnakan layout halaman login agar sepenuhnya sesuai dengan template form 07.
9. **Penyesuaian Warna Login:** Memperbarui palet warna halaman login menjadi lebih cerah sesuai dengan skema warna pada contoh link.
10. **Masalah Akses Halaman Code Review:** Menangani kendala di mana halaman `/code-review` mengembalikan pesan error 404 (tidak dapat diakses).

---

## 2. Progress Implementasi (Completed)

* **Hashing Kata Sandi Mandiri:** Menggunakan pustaka `bcryptjs` untuk mengamankan data kata sandi di dalam database melalui skrip seeding (`seed.ts`).
* **Proteksi Sesi Cookie Aman:** Membangun enkripsi dan dekripsi berbasis AES-256-CBC pada `session.ts` untuk melindungi data cookie sesi agar tidak dapat dimodifikasi di sisi klien.
* **Keamanan Server Actions:** Mengamankan file tindakan backend (`auth.ts`, `employee.ts`, `leave.ts`) dengan otentikasi sisi server, otorisasi berbasis peran, dan pemeriksaan kuota sisa cuti.
* **Pembersihan Tipe Data Any:** Menghapus penggunaan tipe `any` pada form input di komponen `EmployeeForm.tsx` dan `LeaveRequestForm.tsx` untuk mematuhi regulasi TypeScript ketat.
* **Desain Halaman Login Cerah:** Mengimplementasikan layout login terpisah dengan gambar ilustrasi khusus `/public/login_illustration.jpg` bergaya modern.
* **Penyajian Dashboard Code Review Publik:** Membuat halaman `/code-review` yang merender konten berkas laporan markdown secara dinamis dan dapat diakses bebas tanpa login.
* **Penyelesaian Masalah 404 Halaman Code Review:** Menghapus cache build `.next` yang usang dan melakukan kompilasi ulang dev server untuk mengaktifkan rute baru.

---

## 3. Temuan Teknis Utama & Solusi (Key Findings)

1. **Masalah Lock Engine Prisma (Windows EPERM):**
   * *Masalah:* Menjalankan perintah database (`npx prisma db push` / `generate`) saat server Next.js aktif di Windows sering kali terkunci oleh sistem file.
   * *Solusi:* Matikan server dev sementara sebelum menjalankan perintah Prisma, kemudian jalankan kembali.
2. **Caching Next.js Dev Server (Stale 404):**
   * *Masalah:* Rute baru atau perubahan Server Actions terkadang tidak langsung dimuat oleh dev server Next.js (mengembalikan 404).
   * *Solusi:* Hentikan dev server, hapus folder cache `.next` (`Remove-Item -Recurse -Force .next`), lalu jalankan kembali `npm run dev`.
3. **Resolusi Schema Resolver Hook Form:**
   * *Masalah:* Validasi gabungan Zod Union di resolver terkadang memicu ketidakcocokan tipe internal.
   * *Solusi:* Melakukan type casting aman ke resolver Zod untuk memastikan kompatibilitas form.

---

## 4. Status Konteks Aktif (Active Context)

* **Lokasi Proyek:** `D:\TRAINING\Vibe Coding\TaskVibeCoding\sicuka`
* **Development Server:** Aktif berjalan di port `3000`.
* **Database Status:** Menggunakan Neon DB (PostgreSQL) yang telah dimigrasi dan di-seed dengan data profil terenkripsi.

---

## 5. Langkah Penyelesaian Berikutnya (Next Steps)

1. **Modifikasi Skema Database (Prisma Schema):**
   - Menambahkan relasi `processedById` di model `LeaveRequest` untuk merekam siapa `Employee` (Approver) yang memproses (menolak/menyetujui) pengajuan cuti.
   - Menambahkan relasi timbal balik `processedRequests` di model `Employee`.
   - Menjalankan `npx prisma db push` dan `npx prisma generate` (server dimatikan terlebih dahulu).
2. **Pembaruan Backend Logic (Leave Action):**
   - Memperbarui fungsi `updateLeaveRequestStatus` di `src/app/actions/leave.ts` agar menerima parameter `processedById` dan menyimpannya ke database.
3. **Filter Pengajuan Pribadi:**
   - Memperbarui halaman `/leave` utama agar hanya menampilkan daftar cuti milik pengguna yang sedang aktif (kecuali admin yang dapat melihat semua).
4. **Implementasi Halaman Persetujuan Terpisah (`/leave/approvals`):**
   - Membuat rute baru dan komponen tabel persetujuan dengan dua tab: **Pending Approvals** (pengajuan belum diproses dari staf dengan level di bawah pengguna) dan **Approval History** (riwayat pengajuan yang pernah diproses oleh pengguna tersebut).
5. **Pembaruan Navigasi:**
   - Menambahkan menu "Approvals" ke `Navbar.tsx` khusus untuk peran `ADMIN` dan `APPROVER`.
