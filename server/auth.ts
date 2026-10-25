import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { db } from './db';

export interface PublicUser {
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

export function createSession(userId: number): string {
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(token, userId);
  return token;
}

export function deleteSession(token: string): void {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

export function toPublicUser(row: {
  id: number;
  name: string;
  email: string;
  photo: string | null;
  created_at: string;
}): PublicUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    photo: row.photo,
    created_at: row.created_at,
  };
}

const findUserByTokenStmt = db.prepare(`
  SELECT u.id, u.name, u.email, u.photo, u.created_at
  FROM sessions s
  JOIN users u ON u.id = s.user_id
  WHERE s.token = ?
`);

// Middleware: membaca "Authorization: Bearer <token>" dan menaruh user di res.locals.user
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) {
    return res.status(401).json({ status: 'fail', message: 'Token tidak ditemukan. Silakan masuk kembali.' });
  }
  const row = findUserByTokenStmt.get(token) as unknown as Parameters<typeof toPublicUser>[0] | undefined;
  if (!row) {
    return res.status(401).json({ status: 'fail', message: 'Sesi tidak valid atau sudah berakhir.' });
  }
  res.locals.user = toPublicUser(row);
  res.locals.token = token;
  next();
}
