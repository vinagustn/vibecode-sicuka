# Technology Stack - Si Cuka (Sistem Cuti Karyawan)

Dokumen ini menjelaskan secara rinci tentang tumpukan teknologi (tech stack) yang digunakan pada aplikasi **Si Cuka** beserta versi, pustaka pendukung, dan fungsinya.

---

## 1. Core Framework & Language
* **Framework:** **Next.js 16.2.9 (App Router & Turbopack)**
  * Next.js App Router digunakan sebagai dasar arsitektur monolithic, pemetaan rute dinamis (Routing), serta server-side rendering (SSR) dan Server Actions untuk komunikasi backend-frontend yang aman.
* **Library UI:** **React 19.2.4 & React DOM 19.2.4**
  * Versi terbaru React dengan dukungan Server Components dan aksi asinkronus yang dioptimalkan secara native.
* **Bahasa Pemrograman:** **TypeScript 5.x**
  * Memberikan validasi tipe data statis yang ketat (Strict Type checking, 0 `any` rules) untuk meningkatkan skalabilitas dan keandalan kode.

---

## 2. Database & ORM (Object-Relational Mapping)
* **DBMS:** **PostgreSQL (Neon DB)**
  * Database relasional tangguh yang di-host di cloud (Serverless Postgres) melalui Neon DB untuk mengelola data karyawan, posisi, dan pengajuan cuti.
* **ORM:** **Prisma ORM 6.2.1**
  * Digunakan untuk pemodelan skema database (`schema.prisma`), migrasi schema, seeding database, dan relasi tabel terstruktur.
* **Execution Utility:** **tsx 4.22.4**
  * Eksekutor TypeScript untuk menjalankan skrip seeding database (`seed.ts`) secara langsung pada runtime Node.js.

---

## 3. Styling & Desain UI (User Interface)
* **CSS Framework:** **Tailwind CSS v4**
  * Framework CSS berbasis utilitas modern yang sangat optimal untuk membangun tata letak responsif, efek hover, transisi, dan visual bergaya premium (glassmorphism & light/dark variables).
* **UI Components:** **ShadCN UI 4.11.0 & Radix UI Slot**
  * Kumpulan komponen antarmuka mandiri (seperti Button, Card, Input, Label, Select, Form) yang dibangun di atas primitif Radix UI demi aksesibilitas tinggi dan desain modern.
* **Icons:** **Lucide React 1.20.0**
  * Library ikon SVG yang konsisten untuk menghias antarmuka navigasi, kartu metrik, dan status.
* **Toast Notification:** **Sonner 2.0.7**
  * Sistem notifikasi melayang (toasts) yang responsif dan estetik untuk memberikan umpan balik aksi pengguna (sukses login, gagal submit, dll).
* **Utility Pendukung:**
  * **clsx & tailwind-merge:** Untuk penggabungan kelas CSS Tailwind secara dinamis tanpa konflik.
  * **tw-animate-css:** Pustaka animasi ringan untuk efek transisi antarmuka.

---

## 4. Validasi Data & Form Handling
* **Form Manager:** **React Hook Form 7.79.0**
  * Mengelola state form input secara efisien tanpa re-render yang tidak perlu.
* **Validation Schema:** **Zod 4.4.3**
  * Pembuatan skema validasi tipe data di sisi klien maupun server secara terpadu.
* **Bridge Resolver:** **@hookform/resolvers 5.4.0**
  * Menghubungkan skema validasi Zod dengan React Hook Form.

---

## 5. Security & Session Management (Keamanan)
* **Password Hashing:** **bcryptjs 3.0.3**
  * Digunakan untuk melakukan *hashing* kata sandi karyawan dengan *salt* sebelum disimpan ke database, mencegah kebocoran kredensial mentah.
* **Session Encryption:** **Custom AES-256-CBC Module** (`src/lib/session.ts`)
  * Algoritma enkripsi simetris AES-256-CBC standar industri yang mengenkripsi cookie sesi JWT di sisi server sehingga aman dari eksploitasi tampering oleh klien.
* **Transport Session:** **HttpOnly Secure Cookies**
  * Mengirimkan data token sesi terenkripsi dengan atribut `httpOnly` dan `secure` guna meminimalkan risiko serangan XSS (Cross-Site Scripting).
