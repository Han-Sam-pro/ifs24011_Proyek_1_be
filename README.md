# RoamPlan — Backend (API)

API Express.js dengan database SQLite lokal (`node:sqlite`, butuh Node.js ≥ 22.13). Frontend ada di repo `roamplan-frontend`.

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

## Menjalankan

```bash
npm install
cp .env.example .env
npm run dev          # development (tsx watch)
# atau produksi:
npm run build
npm start
```

## Konfigurasi

- `PORT` — port server (default `3001`)
- `SQLITE_PATH` — lokasi file database (default `./data/roamplan.db`)
- `CORS_ORIGIN` — origin frontend yang diizinkan, dipisah koma. Wajib diisi dengan URL frontend saat produksi.

## Test

```bash
npm test
npm run test:coverage
```
