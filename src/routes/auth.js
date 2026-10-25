import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { queryOne } from '../db.js';
import { badRequest, conflict, unauthorized } from '../lib/errors.js';
import { ok } from '../lib/response.js';
import { validateLogin, validateRegister } from '../lib/validators.js';
import { signToken } from '../middleware/auth.js';

const toPublicUser = (row) => ({
  id: row.id,
  username: row.username,
  name: row.name,
  email: row.email,
  phone: row.phone ?? null,
  bio: row.bio ?? null,
  created_at: row.created_at,
});

/** Pendaftaran dan masuk dipisah: /register hanya membuat akun, /login hanya memverifikasi kredensial. */
export function authRoutes({ db, requireAuth }) {
  const router = Router();
  const findById = (id) => queryOne(db, 'SELECT * FROM users WHERE id = ?', [id]);

  router.post('/register', async (req, res) => {
    const { errors, values } = validateRegister(req.body);
    if (Object.keys(errors).length > 0) throw badRequest('Data tidak valid', errors);

    const taken = {};
    if (await queryOne(db, 'SELECT id FROM users WHERE username = ?', [values.username])) {
      taken.username = 'Username sudah dipakai';
    }
    if (await queryOne(db, 'SELECT id FROM users WHERE email = ?', [values.email])) {
      taken.email = 'Email sudah terdaftar';
    }
    if (Object.keys(taken).length > 0) throw conflict('Data sudah terdaftar', taken);

    const passwordHash = await bcrypt.hash(values.password, 10);
    const result = await db.execute({
      sql: 'INSERT INTO users (username, name, email, password_hash) VALUES (?, ?, ?, ?)',
      args: [values.username, values.name, values.email, passwordHash],
    });
    const user = toPublicUser(await findById(Number(result.lastInsertRowid)));
    return ok(res, { token: signToken(user), user }, { status: 201 });
  });

  router.post('/login', async (req, res) => {
    const { errors, values } = validateLogin(req.body);
    if (Object.keys(errors).length > 0) throw badRequest('Data tidak valid', errors);

    const row = await queryOne(db, 'SELECT * FROM users WHERE username = ?', [values.username]);
    const matches = row ? await bcrypt.compare(values.password, row.password_hash) : false;
    if (!matches) throw unauthorized('Username atau kata sandi salah');

    const user = toPublicUser(row);
    return ok(res, { token: signToken(user), user });
  });

  router.get('/me', requireAuth, async (req, res) => ok(res, toPublicUser(await findById(req.user.id))));

  return router;
}
