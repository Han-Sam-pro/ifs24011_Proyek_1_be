import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { unauthorized } from '../lib/errors.js';

export function signToken(user) {
  return jwt.sign({ sub: String(user.id), username: user.username }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

/** Membaca `Authorization: Bearer <token>`, memverifikasi JWT, lalu menaruh pengguna di `req.user`. */
export function createRequireAuth(db) {
  const findUser = db.prepare('SELECT id, username, name, email FROM users WHERE id = ?');

  return function requireAuth(req, _res, next) {
    const [scheme, token] = (req.headers.authorization || '').split(' ');
    if (scheme !== 'Bearer' || !token) return next(unauthorized());
    try {
      const payload = jwt.verify(token, config.jwtSecret);
      const user = findUser.get(Number(payload.sub));
      if (!user) return next(unauthorized());
      req.user = { id: user.id, username: user.username, name: user.name, email: user.email };
      return next();
    } catch {
      return next(unauthorized());
    }
  };
}
