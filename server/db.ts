import { createClient, type Client } from '@libsql/client';
import fs from 'fs';
import path from 'path';

// Database memakai libSQL (kompatibel dengan SQLite):
// - Produksi (Vercel + Turso): isi TURSO_DATABASE_URL dan TURSO_AUTH_TOKEN.
// - Lokal / test: jika TURSO_DATABASE_URL kosong, dipakai file SQLite lokal
//   di SQLITE_PATH (default ./data/roamplan.db).

function resolveDatabaseUrl(): string {
  if (process.env.TURSO_DATABASE_URL) {
    return process.env.TURSO_DATABASE_URL;
  }
  const file = process.env.SQLITE_PATH || path.resolve(process.cwd(), 'data', 'roamplan.db');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  return `file:${file}`;
}

let client: Client | null = null;
let schemaReady: Promise<void> | null = null;

// Koneksi dibuat saat pertama kali dibutuhkan (bukan saat modul di-import),
// sehingga env variable sudah terbaca dan cold start serverless tetap ringan.
export function getDb(): Client {
  if (!client) {
    client = createClient({
      url: resolveDatabaseUrl(),
      authToken: process.env.TURSO_AUTH_TOKEN || undefined,
    });
  }
  return client;
}

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    photo         TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token      TEXT PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS trips (
    id               TEXT NOT NULL,
    user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title            TEXT NOT NULL,
    destination_city TEXT NOT NULL,
    data             TEXT NOT NULL,
    updated_at       TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, id)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_trips_user ON trips(user_id)`,
];

// Membuat tabel jika belum ada. Dijalankan sekali per instance (dipanggil dari middleware /api).
export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const db = getDb();
      await db.batch(SCHEMA_STATEMENTS, 'write');
    })().catch((err) => {
      schemaReady = null; // coba lagi pada request berikutnya
      throw err;
    });
  }
  return schemaReady;
}

// Menutup koneksi. Dipakai oleh test agar file database bisa dihapus (terutama di Windows).
export function closeDb(): void {
  try {
    client?.close();
  } catch {
    // sudah tertutup
  }
  client = null;
  schemaReady = null;
}
