import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { queryOne } from '../db.js';
import { badRequest, conflict } from '../lib/errors.js';
import { ok } from '../lib/response.js';
import { validatePasswordChange, validateProfile } from '../lib/validators.js';

/** Profil pengguna yang sedang masuk: lihat, ubah data diri, dan ganti kata sandi. */
export function profileRoutes({ db, requireAuth }) {
  const router = Router();
  router.use(requireAuth);

  const buildProfile = async (userId) => {
    const row = await queryOne(
      db,
      'SELECT id, username, name, email, phone, bio, created_at, updated_at FROM users WHERE id = ?',
      [userId],
    );
    const { total } = await queryOne(db, 'SELECT COUNT(*) AS total FROM trips WHERE user_id = ?', [userId]);
    return {
      id: row.id,
      username: row.username,
      name: row.name,
      email: row.email,
      phone: row.phone ?? null,
      bio: row.bio ?? null,
      created_at: row.created_at,
      updated_at: row.updated_at,
      trip_count: total,
    };
  };

  router.get('/', async (req, res) => ok(res, await buildProfile(req.user.id)));

  router.put('/', async (req, res) => {
    const { errors, values } = validateProfile(req.body);
    if (Object.keys(errors).length > 0) throw badRequest('Data tidak valid', errors);

    const emailOwner = await queryOne(db, 'SELECT id FROM users WHERE email = ? AND id <> ?', [values.email, req.user.id]);
    if (emailOwner) throw conflict('Data sudah digunakan', { email: 'Email sudah dipakai akun lain' });

    await db.execute({
      sql: "UPDATE users SET name = ?, email = ?, phone = ?, bio = ?, updated_at = datetime('now') WHERE id = ?",
      args: [values.name, values.email, values.phone, values.bio, req.user.id],
    });
    return ok(res, await buildProfile(req.user.id));
  });

  router.put('/password', async (req, res) => {
    const { errors, values } = validatePasswordChange(req.body);
    if (Object.keys(errors).length > 0) throw badRequest('Data tidak valid', errors);

    const row = await queryOne(db, 'SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    if (!(await bcrypt.compare(values.current_password, row.password_hash))) {
      throw badRequest('Data tidak valid', { current_password: 'Kata sandi saat ini salah' });
    }
    const hash = await bcrypt.hash(values.new_password, 10);
    await db.execute({
      sql: "UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?",
      args: [hash, req.user.id],
    });
    return ok(res, { updated: true });
  });

  return router;
}
