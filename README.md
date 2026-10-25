# RoamPlan — Backend (API)

API Express.js dengan database libSQL/Turso. Di lokal memakai file SQLite, sedangkan di produksi (Vercel) memakai Turso. Frontend ada di repo `roamplan-frontend`.

## Endpoint (prefix `/api`)

| Method | Path | Keterangan |
| --- | --- | --- |
| GET | `/api/health` | Cek status server |
| POST | `/api/auth/register` | Daftar akun, mengembalikan `{ user, token }` |
| POST | `/api/auth/login` | Masuk, mengembalikan `{ user, token }` |
| POST | `/api/auth/logout` | Hapus sesi (butuh `Authorization: Bearer <token>`) |
| GET | `/api/users/me` | Profil pengguna yang sedang masuk |
| GET | `/api/users` | Daftar pengguna |
| GET | `/api/trips` | Itinerary milik pengguna |
| POST | `/api/trips` | Simpan/perbarui itinerary |
| GET | `/api/cities/suggest?q=` | Saran kota |

## Menjalankan lokal

```bash
bun install        # atau npm install
cp .env.example .env
npm run dev        # server di http://localhost:3001/api
npm test           # test (memakai file SQLite sementara)
```

## Deploy ke Vercel + Turso

1. **Buat database di Turso** (gratis, tanpa kartu kredit):
   ```bash
   turso db create roamplan
   turso db show roamplan --url          # -> TURSO_DATABASE_URL
   turso db tokens create roamplan       # -> TURSO_AUTH_TOKEN
   ```
   Tabel dibuat otomatis saat request pertama.
2. **Import repo ke Vercel**: Add New → Project, pilih repo `roamplan-backend`. Framework preset: *Other*. Tidak perlu build command.
3. **Isi Environment Variables** di Vercel:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `CORS_ORIGIN` = URL frontend (mis. `https://<site>.netlify.app`)
4. Klik **Deploy**. Tes: `https://<project>.vercel.app/api/health`.
5. Di frontend, set `VITE_API_BASE_URL=https://<project>.vercel.app/api`, lalu redeploy frontend.

Catatan: Vercel menjalankan setiap request sebagai serverless function (`api/[...slug].ts`), sehingga tidak ada file database lokal. Semua data disimpan di Turso.

Batasan paket gratis Vercel Hobby: maksimal 300 detik per request dan penggunaan non-komersial.

## Konfigurasi

- `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` — database produksi
- `SQLITE_PATH` — file SQLite lokal (hanya jika `TURSO_DATABASE_URL` kosong)
- `CORS_ORIGIN` — origin frontend yang diizinkan, dipisah koma
- `PORT` — port server lokal (default `3001`)
