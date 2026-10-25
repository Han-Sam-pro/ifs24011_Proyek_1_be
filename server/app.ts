import express from 'express';
import { apiRouter } from './routes/api';

export function createExpressApp() {
  const app = express();

  // Itinerary bisa cukup besar, jadi batas body dinaikkan dari default 100kb
  app.use(express.json({ limit: '1mb' }));

  // Semua endpoint backend (auth, users, trips, cities) berada di bawah /api
  app.use('/api', apiRouter);

  return app;
}
