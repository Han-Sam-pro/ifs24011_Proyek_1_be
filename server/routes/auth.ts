import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import {
  createSession,
  deleteSession,
  hashPassword,
  requireAuth,
  toPublicUser,
  UserRow,
  verifyPassword,
} from '../auth';
import { asyncHandler } from '../async';

export const authRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/register
authRouter.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const name = String(req.body?.name ?? '').trim();
  const email = String(req.body?.email ?? '').trim();
  const password = String(req.body?.password ?? '');

  if (!name) return void res.status(400).json({ status: 'fail', message: 'Nama wajib diisi.' });
  if (!EMAIL_RE.test(email)) return void res.status(400).json({ status: 'fail', message: 'Format email tidak valid.' });
  if (password.length < 6) return void res.status(400).json({ status: 'fail', message: 'Password minimal 6 karakter.' });

  const db = getDb();
  const exists = await db.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: [email] });
  if (exists.rows.length > 0) {
    return void res.status(409).json({ status: 'fail', message: 'Email sudah terdaftar.' });
  }

  const inserted = await db.execute({
    sql: 'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    args: [name, email, hashPassword(password)],
  });

  const result = await db.execute({
    sql: 'SELECT id, name, email, photo, created_at FROM users WHERE id = ?',
    args: [Number(inserted.lastInsertRowid)],
  });
  const row = result.rows[0] as unknown as UserRow;
  const token = await createSession(Number(row.id));

  return res.status(201).json({
    status: 'success',
    message: 'Registrasi berhasil.',
    data: { user: toPublicUser(row), token },
  });
}));

// POST /api/auth/login
authRouter.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const email = String(req.body?.email ?? '').trim();
  const password = String(req.body?.password ?? '');

  const result = await getDb().execute({
    sql: 'SELECT id, name, email, photo, created_at, password_hash FROM users WHERE email = ?',
    args: [email],
  });
  const row = result.rows[0] as unknown as (UserRow & { password_hash: string }) | undefined;

  if (!row || !verifyPassword(password, row.password_hash)) {
    return void res.status(401).json({ status: 'fail', message: 'Email atau password salah.' });
  }

  const token = await createSession(Number(row.id));
  return res.json({
    status: 'success',
    message: 'Login berhasil.',
    data: { user: toPublicUser(row), token },
  });
}));

// POST /api/auth/logout
authRouter.post('/logout', requireAuth, asyncHandler(async (_req: Request, res: Response) => {
  await deleteSession(res.locals.token as string);
  return res.json({ status: 'success', message: 'Logout berhasil.' });
}));
