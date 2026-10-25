// Entry point Vercel: semua request /api/* diteruskan ke aplikasi Express.
// Koneksi Turso dibuat sekali per instance fungsi (cold start) lalu dipakai ulang.
import { createApp } from '../src/app.js';
import { openDatabase } from '../src/db.js';

let appPromise = null;

function getApp() {
  if (!appPromise) {
    appPromise = openDatabase().then((db) => createApp({ db }));
    // Bila gagal membuka database, percobaan berikutnya mencoba lagi dari awal.
    appPromise.catch(() => { appPromise = null; });
  }
  return appPromise;
}

export default async function handler(req, res) {
  const app = await getApp();
  return app(req, res);
}
