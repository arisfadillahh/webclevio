# Setup production Clevio CMS

Dashboard mendukung PostgreSQL biasa, Supabase, Neon, atau provider lain yang menyediakan connection string PostgreSQL.

## 1. Environment variables

Salin nilai pada `.env.example` ke environment deployment. Nilai berikut wajib diganti:

- `ADMIN_USERNAME`: username admin.
- `ADMIN_PASSWORD`: password admin yang panjang dan unik.
- `AUTH_SECRET`: minimal 32 karakter acak.
- `DATABASE_URL`: connection string PostgreSQL. Gunakan connection pooler jika deployment berjalan secara serverless.
- `DATABASE_SSL=require`: gunakan bila provider mewajibkan TLS.

Jangan commit `.env.local` atau kredensial production ke Git.

## 2. Migration dan seed

Jalankan dari environment yang dapat mengakses database:

```bash
npm run db:migrate
npm run db:check
```

Migration bersifat idempotent. Eksekusi pertama membuat tabel `site_content`, `articles`, dan `events`, lalu mengimpor data awal dari `data/content.json`. Eksekusi berikutnya tidak menimpa konten yang sudah dikelola dari dashboard.

## 3. Deployment

Urutan deployment yang aman:

```bash
npm ci
npm run db:migrate
npm run build
npm start
```

Pada platform yang menyediakan pre-deploy command, jalankan `npm run db:migrate` sebelum versi baru menerima traffic.

### Deployment `test.clev.io` di VPS

`test.clev.io` berjalan sebagai container Docker `webclevio-test` di belakang Traefik. Deployment harus memakai commit penuh yang sama dengan `origin/main`:

```bash
bash scripts/deploy-test-vps.sh <40-character-origin-main-sha>
```

Jika checkout VPS memiliki perubahan lokal, jangan checkout atau pull. Jalankan script langsung dari object Git agar working tree tetap tidak tersentuh:

```bash
git -C /root/web/webclevio fetch --prune origin main
git -C /root/web/webclevio show origin/main:scripts/deploy-test-vps.sh \
  | bash -s -- <40-character-origin-main-sha>
```

Script tersebut memakai deployment lock, membangun release dan image terpisah, mempertahankan environment container aktif tanpa mencetak nilainya, menjalankan smoke test sebelum dan sesudah pergantian container, serta mengembalikan image sebelumnya secara otomatis jika pergantian gagal. Script tidak menjalankan migration atau mengubah database.

Nilai `rollback_image` pada keluaran deployment adalah target rollback manual. Untuk rollback, jalankan kembali image tersebut memakai konfigurasi container yang sama; jangan mengubah source di `/root/web/webclevio` dan jangan menggunakan workflow LMS.

## 4. Penyimpanan gambar

Folder `public/uploads` hanya cocok untuk development atau server dengan persistent disk. Pada Vercel/serverless, unggah gambar ke Supabase Storage, Cloudinary, S3, atau CDN lain lalu tempel URL-nya di dashboard.

Upload lokal otomatis ditolak pada `NODE_ENV=production`, kecuali `ALLOW_LOCAL_UPLOADS=true` diaktifkan secara eksplisit pada server dengan persistent disk.

## 5. Area data

- `/admin/content`: hanya konten landing page yang aman diedit.
- `/admin/articles`: CRUD Artikel, slug unik, draft/publish, dan batas karakter.
- `/admin/events`: CRUD Event dan link menuju landing page yang sudah tersedia.
- Layout, ID database, konfigurasi auth, dan schema database tidak tersedia di UI admin.

Jika `DATABASE_URL` tidak tersedia, aplikasi memakai `data/content.json` sebagai fallback development dan menampilkan peringatan di dashboard.
