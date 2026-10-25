import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { createRequireAuth } from './middleware/auth.js';
import { errorHandler, notFoundHandler } from './middleware/errors.js';
import { authRoutes } from './routes/auth.js';
import { profileRoutes } from './routes/profile.js';
import { tripRoutes } from './routes/trips.js';
import { userRoutes } from './routes/users.js';
import { ok } from './lib/response.js';

/** Membangun aplikasi Express. `db` adalah klien libSQL yang sudah siap (lihat openDatabase). */
export function createApp({ db }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: config.corsOrigins }));
  app.use(express.json({ limit: '100kb' }));

  const requireAuth = createRequireAuth(db);

  app.get('/api/health', (_req, res) => ok(res, { status: 'ok', time: new Date().toISOString() }));
  app.use('/api/auth', authRoutes({ db, requireAuth }));
  app.use('/api/users', userRoutes({ db, requireAuth }));
  app.use('/api/profile', profileRoutes({ db, requireAuth }));
  app.use('/api/trips', tripRoutes({ db, requireAuth }));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
