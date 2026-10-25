import express, { NextFunction, Request, Response } from 'express';
import { apiRouter } from './routes/api';
import { corsMiddleware } from './cors';
import { ensureSchema } from './db';

export function createExpressApp() {
  const app = express();

  // Frontend berada di origin lain (domain/port berbeda), jadi CORS perlu diaktifkan
  app.use(corsMiddleware);

  // Itinerary bisa cukup besar, jadi batas body dinaikkan dari default 100kb
  app.use(express.json({ limit: '1mb' }));

  // Pastikan tabel database sudah ada sebelum request /api diproses
  app.use('/api', async (_req: Request, _res: Response, next: NextFunction) => {
    try {
      await ensureSchema();
      next();
    } catch (err) {
      next(err);
    }
  });

  // Semua endpoint backend (auth, users, trips, cities) berada di bawah /api
  app.use('/api', apiRouter);

  // Error handler: selalu membalas JSON (bukan halaman HTML default Express)
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const status = (err as { status?: number })?.status;
    if (status && status >= 400 && status < 500) {
      return void res.status(status).json({ status: 'fail', message: 'Permintaan tidak valid.' });
    }
    console.error(err);
    return void res.status(500).json({ status: 'fail', message: 'Terjadi kesalahan pada server.' });
  });

  return app;
}
