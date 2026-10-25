import { Router, Request, Response } from 'express';
import { db } from '../db';
import {
  createSession,
  deleteSession,
  hashPassword,
  requireAuth,
  toPublicUser,
  verifyPassword,
} from '../auth';

export const authRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/register
authRouter.post('/register', (req: Request, res: Response) => {
  const name = String(req.body?.name ?? '').trim();
  const email = String(req.body?.email ?? '').trim();
  const password = String(req.body?.password ?? '');

  if (!name) return res.status(400).json({ status: 'fail', message: 'Nama wajib diisi.' });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ status: 'fail', message: 'Format email tidak valid.' });
  if (password.length < 6) return res.status(400).json({ status: 'fail', message: 'Password minimal 6 karakter.' });

  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) return res.status(409).json({ status: 'fail', message: 'Email sudah terdaftar.' });

  const result = db
    .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
    .run(name, email, hashPassword(password));

  const row = db.prepare('SELECT id, name, email, photo, created_at FROM users WHERE id = ?').get(result.lastInsertRowid) as unknown as Parameters<typeof toPublicUser>[0];
  const token = createSession(row.id);

  return res.status(201).json({
    status: 'success',
    message: 'Registrasi berhasil.',
    data: { user: toPublicUser(row), token },
  });
});

// POST /api/auth/login
authRouter.post('/login', (req: Request, res: Response) => {
  const email = String(req.body?.email ?? '').trim();
  const password = String(req.body?.password ?? '');

  const row = db
    .prepare('SELECT id, name, email, photo, created_at, password_hash FROM users WHERE email = ?')
    .get(email) as unknown as (Parameters<typeof toPublicUser>[0] & { password_hash: string }) | undefined;

  if (!row || !verifyPassword(password, row.password_hash)) {
    return res.status(401).json({ status: 'fail', message: 'Email atau password salah.' });
  }

  const token = createSession(row.id);
  return res.json({
    status: 'success',
    message: 'Login berhasil.',
    data: { user: toPublicUser(row), token },
  });
});

// POST /api/auth/logout
authRouter.post('/logout', requireAuth, (_req: Request, res: Response) => {
  deleteSession(res.locals.token as string);
  return res.json({ status: 'success', message: 'Logout berhasil.' });
});
