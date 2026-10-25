import { Router } from 'express';
import { queryAll, queryOne } from '../db.js';
import { ok } from '../lib/response.js';

/** Daftar seluruh pengguna RoamPlan (hanya data publik: nama, username, bio, tanggal bergabung). */
export function userRoutes({ db, requireAuth }) {
  const router = Router();
  router.use(requireAuth);

  router.get('/', async (req, res) => {
    const query = String(req.query.q ?? '').trim().slice(0, 50);
    const page = Math.max(1, Number.parseInt(String(req.query.page ?? ''), 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(String(req.query.limit ?? ''), 10) || 10));
    const like = `%${query}%`;

    const { total } = await queryOne(
      db,
      'SELECT COUNT(*) AS total FROM users WHERE username LIKE ? OR name LIKE ?',
      [like, like],
    );
    const rows = await queryAll(
      db,
      `SELECT id, username, name, bio, created_at FROM users
       WHERE username LIKE ? OR name LIKE ?
       ORDER BY created_at DESC, id DESC
       LIMIT ? OFFSET ?`,
      [like, like, limit, (page - 1) * limit],
    );

    return ok(
      res,
      rows.map((row) => ({
        id: row.id,
        username: row.username,
        name: row.name,
        bio: row.bio ?? null,
        created_at: row.created_at,
      })),
      { meta: { page, limit, total, total_pages: Math.max(1, Math.ceil(total / limit)) } },
    );
  });

  return router;
}
