# RoamPlan - Backend (Express.js)

API untuk **RoamPlan Smart Trip Planner**: menyusun rencana perjalanan per hari, menambahkan destinasi, menyusun urutan kunjungan berdasarkan waktu atau jarak, dan menghitung estimasi biaya. Frontend React ada di repository terpisah: `roamplan-frontend`.

## Teknologi
Node.js 22+, Express 5, SQLite (`node:sqlite` bawaan, tanpa dependency native), JWT (`jsonwebtoken`), bcrypt (`bcryptjs`).

## Struktur
```
src/
  app.js            membangun aplikasi Express (CORS, JSON, rute, penanganan galat)
  server.js         menjalankan server
  config.js         membaca variabel lingkungan
  db.js             koneksi SQLite dan skema tabel
  routes/           auth, users, profile, trips
  services/         trips.js: logika rencana, destinasi, dan urutan kunjungan
  lib/              validators, geo (Haversine), itinerary (urutan dan estimasi biaya), errors, response
  middleware/       auth (JWT) dan errors
tests/              api.test.js, itinerary.test.js (node:test)
```

## Menjalankan
```bash
npm install
cp .env.example .env          # ubah JWT_SECRET
npm start                     # http://localhost:4000
```

## Endpoint
| Metode | Path | Keterangan |
|---|---|---|
| GET | `/api/health` | Status server |
| POST | `/api/auth/register` | Daftar akun baru (form terpisah dari login) |
| POST | `/api/auth/login` | Masuk dengan username dan kata sandi |
| GET | `/api/auth/me` | Profil dari token (perlu token) |
| GET | `/api/users?q=&page=&limit=` | Semua pengguna (nama, username, bio; tanpa email) |
| GET / PUT | `/api/profile` | Lihat dan ubah profil sendiri |
| PUT | `/api/profile/password` | Ganti kata sandi |
| GET | `/api/trips?q=` | Daftar rencana milik sendiri, lengkap dengan ringkasan biaya |
| POST | `/api/trips` | Buat rencana (judul, destinasi, tanggal mulai dan selesai, anggaran) |
| GET / PUT / DELETE | `/api/trips/:id` | Detail (hari, destinasi, estimasi biaya), ubah, atau hapus |
| POST | `/api/trips/:id/stops` | Tambah destinasi ke hari tertentu |
| PUT / DELETE | `/api/trips/:id/stops/:stopId` | Ubah atau hapus destinasi |
| POST | `/api/trips/:id/days/:day/reorder` | Susun ulang hari: `{ "mode": "time" }` atau `{ "mode": "distance" }` |

Format respons: sukses `{ success: true, data, meta? }`; galat `{ success: false, error: { code, message, details } }`.

## Aturan bisnis
- **Urutan waktu**: destinasi ber-jam kedatangan diurutkan naik; yang tanpa jam di belakang.
- **Urutan jarak**: heuristik tetangga terdekat dengan jarak Haversine; titik awal adalah destinasi pertama pada hari itu.
- **Estimasi biaya**: biaya aktivitas (jumlah biaya destinasi) + biaya transportasi (jarak rute harian x `TRANSPORT_RATE_PER_KM`). Anggaran 0 berarti tanpa batas.
- **Hak akses**: rencana hanya dapat dibaca dan diubah oleh pemiliknya; akses pihak lain mengembalikan 404.
- Durasi perjalanan maksimal 30 hari.

## Pengujian
```bash
npm test               # node --test (api + itinerary)
npm run test:coverage  # dengan cakupan
```

## Deploy
```bash
docker build -t roamplan-backend .
docker run -p 4000:4000 -e JWT_SECRET=isi-rahasia-panjang roamplan-backend
```
Di produksi `JWT_SECRET` wajib diisi (server menolak berjalan tanpanya). Arahkan `CORS_ORIGINS` ke domain frontend.
