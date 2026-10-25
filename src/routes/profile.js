import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { badRequest, conflict } from '../lib/errors.js';
import { ok } from '../lib/response.js';
import { validatePasswordChange, validateProfile } from '../lib/validators.js';

/** Profil pengguna yang sedang masuk: lihat, ubah data diri, dan ganti kata sandi. */
export function profileRoutes({ db, requireAuth }) {
  const router = Router();
  router.use(requireAuth);

  const findById = db.prepare(
    'SELECT id, username, name, email, phone, bio, created_at, updated_at FROM users WHERE id = ?',
  );
  const countTrips = db.prepare('SELECT COUNT(*) AS total FROM trips WHERE user_id = ?');
  const findEmailOwner = db.prepare('SELECT id FROM users WHERE email = ? AND id <> ?');
  const updateProfile = db.prepare(
    "UPDATE users SET name = ?, email = ?, phone = ?, bio = ?, updated_at = datetime('now') WHERE id = ?",
  );
  const findPasswordHash = db.prepare('SELECT password_hash FROM users WHERE id = ?');
  const updatePassword = db.prepare(
    "UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?",
  );

  const buildProfile = (userId) => {
    const row = findById.get(userId);
    return {
      id: row.id,
      username: row.username,
      name: row.name,
      email: row.email,
      phone: row.phone ?? null,
      bio: row.bio ?? null,
      created_at: row.created_at,
      updated_at: row.updated_at,
      trip_count: countTrips.get(userId).total,
    };
  };

  router.get('/', (req, res) => ok(res, buildProfile(req.user.id)));

  router.put('/', (req, res) => {
    const { errors, values } = validateProfile(req.body);
    if (Object.keys(errors).length > 0) throw badRequest('Data tidak valid', errors);

    if (findEmailOwner.get(values.email, req.user.id)) {
      throw conflict('Data sudah digunakan', { email: 'Email sudah dipakai akun lain' });
    }
    updateProfile.run(values.name, values.email, values.phone, values.bio, req.user.id);
    return ok(res, buildProfile(req.user.id));
  });

  router.put('/password', async (req, res) => {
    const { errors, values } = validatePasswordChange(req.body);
    if (Object.keys(errors).length > 0) throw badRequest('Data tidak valid', errors);

    const { password_hash: hash } = findPasswordHash.get(req.user.id);
    if (!(await bcrypt.compare(values.current_password, hash))) {
      throw badRequest('Data tidak valid', { current_password: 'Kata sandi saat ini salah' });
    }
    updatePassword.run(await bcrypt.hash(values.new_password, 10), req.user.id);
    return ok(res, { updated: true });
  });

  return router;
}
