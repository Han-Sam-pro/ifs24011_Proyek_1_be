<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/d8a6abfd-6720-46f6-ab41-934a5bbea202

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Backend & Database (SQLite)

Data pengguna dan itinerary disimpan di database SQLite lokal yang dikelola
oleh backend Express sendiri (`server/`). Tidak ada lagi ketergantungan pada
API pihak ketiga (open-api.delcom.org).

- File database: `./data/roamplan.db` (bisa diubah lewat env `SQLITE_PATH`)
- Endpoint API:
  - `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`
  - `GET /api/users/me`, `GET /api/users`
  - `GET /api/trips`, `POST /api/trips` (upsert berdasarkan `id`)
  - `GET /api/cities/suggest?q=...`, `GET /api/health`

Menjalankan:

```bash
npm install
npm run dev            # development (Express + Vite)
# atau production:
npm run build && npm start
```

Catatan: backend membutuhkan host Node.js yang menjalankan proses terus-menerus
(VPS, Render, Railway, dll.). Netlify hanya men-host frontend statis, sehingga
fitur akun dan sinkronisasi itinerary tidak berjalan di sana.
