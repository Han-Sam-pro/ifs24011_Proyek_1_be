import { Router, Request, Response } from 'express';
import { db } from '../db';
import { PublicUser, requireAuth, toPublicUser } from '../auth';

export const usersRouter = Router();

usersRouter.use(requireAuth);

// GET /api/users/me
usersRouter.get('/me', (_req: Request, res: Response) => {
  return res.json({ status: 'success', data: { user: res.locals.user as PublicUser } });
});

// GET /api/users  -> daftar seluruh pengguna (tanpa password)
usersRouter.get('/', (_req: Request, res: Response) => {
  const rows = db
    .prepare('SELECT id, name, email, photo, created_at FROM users ORDER BY created_at DESC, id DESC')
    .all() as unknown as Parameters<typeof toPublicUser>[0][];
  return res.json({ status: 'success', data: { users: rows.map(toPublicUser) } });
});
