# Si Cuka - Sistem Cuti Karyawan

**Si Cuka** adalah aplikasi monolitik berbasis web untuk mempermudah karyawan dalam mengajukan, melacak, dan menyetujui permohonan cuti (Leave Request Management System). Aplikasi ini dirancang menggunakan standar performa modern, keamanan berlapis, dan tampilan antarmuka yang cerah, bersih, dan responsif.

---

## 🚀 Tumpukan Teknologi (Tech Stack)

Aplikasi ini dibangun menggunakan teknologi mutakhir berikut:

### 1. Core Framework & Language
* **Framework:** **Next.js 16.2.9 (App Router & Turbopack)**
  * Menjadi dasar arsitektur monolithic, pemetaan rute dinamis (Routing), serta server-side rendering (SSR) dan Server Actions untuk komunikasi backend-frontend yang aman.
* **Library UI:** **React 19.2.4 & React DOM 19.2.4**
  * Versi terbaru React dengan dukungan Server Components dan Server Actions yang optimal.
* **Bahasa Pemrograman:** **TypeScript 5.x**
  * Memberikan validasi tipe data statis yang ketat (Strict Type checking, 0 `any` rules) demi keandalan kode.

### 2. Database & ORM (Object-Relational Mapping)
* **DBMS:** **PostgreSQL (Neon DB)**
  * Database relasional tangguh yang di-host di cloud (Serverless Postgres) melalui Neon DB untuk mengelola data karyawan, posisi, dan pengajuan cuti.
* **ORM:** **Prisma ORM 6.2.1**
  * Digunakan untuk pemodelan skema database (`schema.prisma`), migrasi schema, seeding database, dan relasi tabel terstruktur.
* **Execution Utility:** **tsx 4.22.4**
  * Eksekutor TypeScript untuk menjalankan skrip seeding database (`seed.ts`) secara langsung pada runtime Node.js.

### 3. Styling & Desain UI (User Interface)
* **CSS Framework:** **Tailwind CSS v4**
  * CSS utility framework berkinerja tinggi untuk membangun tata letak responsif, efek hover, transisi, dan visual bergaya premium.
* **UI Components:** **ShadCN UI 4.11.0 & Radix UI Slot**
  * Kumpulan komponen antarmuka mandiri (seperti Button, Card, Input, Label, Select, Form, Dialog) yang dibangun di atas primitif Radix UI demi aksesibilitas tinggi.
* **Icons:** **Lucide React 1.20.0**
  * Library ikon SVG yang konsisten untuk menghias navigasi dan status.
* **Toast Notification:** **Sonner 2.0.7**
  * Sistem notifikasi melayang (toasts) yang responsif dan estetik untuk memberikan umpan balik aksi pengguna.

### 4. Validasi Data & Form Handling
* **Form Manager:** **React Hook Form 7.79.0**
  * Mengelola state form input secara efisien tanpa re-render yang tidak perlu.
* **Validation Schema:** **Zod 4.4.3**
  * Pembuatan skema validasi tipe data di sisi klien maupun server secara terpadu.
* **Bridge Resolver:** **@hookform/resolvers 5.4.0**
  * Menghubungkan skema validasi Zod dengan React Hook Form.

### 5. Keamanan & Manajemen Sesi (Security)
* **Password Hashing:** **bcryptjs 3.0.3**
  * Mengenkripsi kata sandi karyawan dengan *salt* sebelum disimpan ke database, mencegah kebocoran kredensial mentah.
* **Session Encryption:** **Custom AES-256-CBC Module** (`src/lib/session.ts`)
  * Algoritma enkripsi simetris AES-256-CBC standar industri yang mengenkripsi cookie sesi JWT di sisi server sehingga aman dari eksploitasi oleh klien.
* **Transport Session:** **HttpOnly Secure Cookies**
  * Mengirimkan data token sesi terenkripsi dengan atribut `httpOnly` dan `secure` guna meminimalkan risiko serangan XSS.

---

## 🛠️ Langkah-Langkah Memulai (Getting Started)

### 1. Prasyarat (Prerequisites)
Pastikan Node.js (versi 18+) dan npm sudah terinstal di komputer Anda.

### 2. Pengaturan Environment (.env)
Buat berkas `.env` di dalam folder ini (`sicuka`) dan tambahkan string koneksi PostgreSQL Anda dari Neon DB:
```env
DATABASE_URL="postgresql://username:password@hostname/databasename?sslmode=require"
```

### 3. Instalasi Dependensi
Jalankan perintah berikut untuk menginstal semua dependensi proyek:
```bash
npm install
```

### 4. Sinkronisasi Database (Prisma Migrations & Seeding)
Jalankan migrasi database ke Neon DB serta seed data awal (opsional jika database belum disinkronkan):
```bash
# Sinkronkan skema Prisma dengan Neon DB
npx prisma db push

# Generate client Prisma baru
npx prisma generate

# Lakukan seeding akun-akun default ke database
npx prisma db seed
```

### 5. Menjalankan Server Pengembangan (Dev Server)
Jalankan server lokal:
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat aplikasi berjalan.

---

## 📂 Struktur Folder Utama
```text
sicuka/
├── prisma/                 # Konfigurasi database & Seeding
│   ├── schema.prisma       # Skema database ORM Prisma
│   └── seed.ts             # Script seeding akun default
├── public/                 # File aset statis & gambar ilustrasi
├── src/
│   ├── app/                # Next.js App Router (Rute & Halaman)
│   │   ├── actions/        # Server Actions (Auth, Employee, Leave)
│   │   ├── code-review/    # Halaman Dashboard Code Review Publik
│   │   ├── dashboard/      # Halaman utama setelah masuk (RBAC)
│   │   ├── employees/      # CRUD data Karyawan (Admin)
│   │   └── leave/          # Pengajuan & Riwayat Cuti
│   ├── components/         # Komponen React (Formulir, Tabel, Shared Layout)
│   ├── lib/                # Library utilitas (Koneksi DB, AES Session)
│   ├── types/              # Definisi interface TypeScript
│   └── validators/         # Skema validasi Zod
```
