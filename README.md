## Clevio Next.js Experience

Implementasi Next.js untuk tema **Clevio Kindergarten** sesuai referensi GramenTheme lengkap dengan landing page interaktif, animasi ringan, serta dasbor admin sederhana untuk mengelola konten.

### Fitur Utama

- Landing page yang meniru struktur asli (preloader, hero, program, about, fasilitas, aktivitas, galeri, event, testimoni, berita, CTA, footer).
- Seluruh markup asli diambil dari `src/templates/home.html` dan dijalankan dengan CSS/JS tema yang tersimpan di `public/assets`.
- Komponen binder (`ThemeBinder`) menginjeksi data JSON (termasuk semua gambar base64/URL) ke dalam template sehingga teks/CTA/program/testimoni, dll mengikuti konten admin.
- Admin dashboard di `/admin` untuk memperbarui hero, CTA, daftar program, event, artikel, dan detail kontak.
- API `/api/content` yang membaca/menulis `data/content.json` serta webhook opsional untuk sinkronisasi otomatis ke n8n.

### Menjalankan Projek

```bash
npm install
npm run dev
```

Kunjungi:

- `http://localhost:3000` untuk halaman publik.
- `http://localhost:3000/admin` untuk dashboard konten.
- `http://localhost:3000/login` untuk form login admin.

### Struktur & Konten

- Semua copy dan media diatur lewat `data/content.json`.
- `src/types/content.ts` mendeskripsikan struktur data sehingga mudah dikembangkan.
- `src/lib/content.ts` menyediakan helper membaca/menyimpan data JSON.
- Struktur template HTML Clevio berada di `src/templates/home.html` dan di-render mentah pada `HomePage`.
- Komponen `src/components/home/ThemeBinder.tsx` berjalan di client untuk menyisipkan data ke elemen tertentu (hero, about, program, work process, aktivitas, testimoni, CTA, instagram, footer).
- Dashboard admin (`src/components/admin/AdminDashboard.tsx`) memiliki input text dan uploader file (konversi base64) untuk setiap konten sehingga gambar bisa dipilih langsung dari file lokal.

### Proteksi Admin

Halaman `/admin` dan endpoint `PUT /api/content` dilindungi cookie sesi.

1. Set kredensial lewat environment variable berikut (opsional, sudah ada default):

```
ADMIN_EMAIL=admin@clevio.id
ADMIN_PASSWORD=clevio123
AUTH_SECRET=ganti-dengan-string-random
```

2. Login melalui `/login`, kalau berhasil token akan tersimpan sebagai cookie `clevio_admin_token` (otomatis dicek pada page/admin dan API).
3. Tombol **Logout** tersedia di header dashboard dan API juga bisa memanggil `/api/auth/logout`.

### Integrasi n8n

Set environment variable berikut agar setiap kali admin menyimpan perubahan, payload dikirim ke workflow n8n:

```
N8N_SYNC_WEBHOOK=https://workflow.n8n.cloud/webhook/xxx
```

Jika variabel tidak diisi, aplikasi hanya akan memperbarui file `data/content.json`.

### Testing & Lint

```bash
npm run lint
```

Perintah di atas memastikan seluruh komponen mengikuti aturan ESLint bawaan Next.js.
