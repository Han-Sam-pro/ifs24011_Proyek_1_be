import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { queryOne } from '../db.js';
import { unauthorized } from '../lib/errors.js';

export function signToken(user) {
  return jwt.sign({ sub: String(user.id), username: user.username }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

/** Membaca `Authorization: Bearer <token>`, memverifikasi JWT, lalu menaruh pengguna di `req.user`. */
export function createRequireAuth(db) {
  return async function requireAuth(req, _res, next) {
    const [scheme, token] = (req.headers.authorization || '').split(' ');
    if (scheme !== 'Bearer' || !token) return next(unauthorized());

    let payload;
    try {
      payload = jwt.verify(token, config.jwtSecret);
    } catch {
      return next(unauthorized());
    }

    try {
      const user = await queryOne(db, 'SELECT id, username, name, email FROM users WHERE id = ?', [Number(payload.sub)]);
      if (!user) return next(unauthorized());
      req.user = { id: Number(user.id), username: user.username, name: user.name, email: user.email };
      return next();
    } catch (err) {
      return next(err);
    }
  };
}
