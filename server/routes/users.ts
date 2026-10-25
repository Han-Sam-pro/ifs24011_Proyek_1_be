import { Router, Request, Response } from 'express';
import { getDb } from '../db.js';
import { PublicUser, requireAuth, toPublicUser, UserRow } from '../auth.js';
import { asyncHandler } from '../async.js';

export const usersRouter = Router();

usersRouter.use(requireAuth);

// GET /api/users/me
usersRouter.get('/me', (_req: Request, res: Response) => {
  return res.json({ status: 'success', data: { user: res.locals.user as PublicUser } });
});

// GET /api/users  -> daftar seluruh pengguna (tanpa password)
usersRouter.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const result = await getDb().execute(
    'SELECT id, name, email, photo, created_at FROM users ORDER BY created_at DESC, id DESC'
  );
  const users = (result.rows as unknown as UserRow[]).map(toPublicUser);
  return res.json({ status: 'success', data: { users } });
}));
