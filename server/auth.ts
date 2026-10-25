import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { getDb } from './db';
import { asyncHandler } from './async';

export interface PublicUser {
  id: number;
  name: string;
  email: string;
  photo: string | null;
  created_at: string;
}

export interface UserRow {
  id: number;
  name: string;
  email: string;
  photo: string | null;
  created_at: string;
}

const SCRYPT_KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'hex');
  const actual = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

export async function createSession(userId: number): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  await getDb().execute({
    sql: 'INSERT INTO sessions (token, user_id) VALUES (?, ?)',
    args: [token, userId],
  });
  return token;
}

export async function deleteSession(token: string): Promise<void> {
  await getDb().execute({ sql: 'DELETE FROM sessions WHERE token = ?', args: [token] });
}

export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: Number(row.id),
    name: row.name,
    email: row.email,
    photo: row.photo ?? null,
    created_at: row.created_at,
  };
}

// Middleware: membaca "Authorization: Bearer <token>" dan menaruh user di res.locals.user
export const requireAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) {
    return void res.status(401).json({ status: 'fail', message: 'Token tidak ditemukan. Silakan masuk kembali.' });
  }

  const result = await getDb().execute({
    sql: `SELECT u.id, u.name, u.email, u.photo, u.created_at
          FROM sessions s
          JOIN users u ON u.id = s.user_id
          WHERE s.token = ?`,
    args: [token],
  });
  const row = result.rows[0] as unknown as UserRow | undefined;
  if (!row) {
    return void res.status(401).json({ status: 'fail', message: 'Sesi tidak valid atau sudah berakhir.' });
  }

  res.locals.user = toPublicUser(row);
  res.locals.token = token;
  next();
});
