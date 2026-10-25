import { createClient } from '@libsql/client';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { config } from './config.js';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  phone         TEXT,
  bio           TEXT,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS trips (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date  TEXT NOT NULL,
  end_date    TEXT NOT NULL,
  budget      INTEGER NOT NULL DEFAULT 0 CHECK (budget >= 0),
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (end_date >= start_date)
);
CREATE INDEX IF NOT EXISTS idx_trips_user ON trips(user_id);

CREATE TABLE IF NOT EXISTS stops (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_id      INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_number   INTEGER NOT NULL CHECK (day_number >= 1),
  position     INTEGER NOT NULL DEFAULT 0,
  name         TEXT NOT NULL,
  category     TEXT NOT NULL DEFAULT 'wisata'
               CHECK (category IN ('wisata', 'kuliner', 'transportasi', 'penginapan', 'lainnya')),
  lat          REAL NOT NULL CHECK (lat BETWEEN -90 AND 90),
  lng          REAL NOT NULL CHECK (lng BETWEEN -180 AND 180),
  arrival_time TEXT,
  duration_min INTEGER NOT NULL DEFAULT 60 CHECK (duration_min >= 0),
  cost         INTEGER NOT NULL DEFAULT 0 CHECK (cost >= 0),
  notes        TEXT
);
CREATE INDEX IF NOT EXISTS idx_stops_trip_day ON stops(trip_id, day_number, position);
`;

/**
 * Membuka koneksi libSQL (Turso di produksi, file lokal saat pengembangan) lalu memastikan skema ada.
 * Skema memakai IF NOT EXISTS sehingga aman dijalankan ulang setiap kali fungsi serverless dinyalakan.
 * Catatan: foreign key tidak diaktifkan; penghapusan berantai dilakukan eksplisit di layanan.
 */
export async function openDatabase({ url = config.dbUrl, authToken = config.dbAuthToken } = {}) {
  if (url.startsWith('file:') && !url.includes(':memory:')) {
    mkdirSync(dirname(url.slice('file:'.length)), { recursive: true });
  }
  const db = createClient({ url, authToken: authToken || undefined });
  await db.executeMultiple(SCHEMA);
  return db;
}

export async function queryOne(db, sql, args = []) {
  const { rows } = await db.execute({ sql, args });
  return rows[0];
}

export async function queryAll(db, sql, args = []) {
  const { rows } = await db.execute({ sql, args });
  return rows;
}
