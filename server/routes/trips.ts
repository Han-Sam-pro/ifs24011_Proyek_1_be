import { Router, Request, Response } from 'express';
import { db } from '../db';
import { PublicUser, requireAuth } from '../auth';

export const tripsRouter = Router();

tripsRouter.use(requireAuth);

interface TripRow {
  id: string;
  title: string;
  destination_city: string;
  data: string;
  updated_at: string;
}

// GET /api/trips  -> seluruh itinerary milik user yang sedang login
tripsRouter.get('/', (_req: Request, res: Response) => {
  const user = res.locals.user as PublicUser;
  const rows = db
    .prepare('SELECT id, title, destination_city, data, updated_at FROM trips WHERE user_id = ? ORDER BY updated_at DESC')
    .all(user.id) as unknown as TripRow[];

  const trips = rows.map((r) => JSON.parse(r.data));
  return res.json({ status: 'success', data: { trips } });
});

// POST /api/trips  -> simpan / perbarui satu itinerary (upsert berdasarkan trip.id)
tripsRouter.post('/', (req: Request, res: Response) => {
  const user = res.locals.user as PublicUser;
  const trip = req.body;

  if (!trip || typeof trip !== 'object' || typeof trip.id !== 'string' || !trip.id) {
    return res.status(400).json({ status: 'fail', message: 'Data itinerary tidak valid (id wajib).' });
  }
  if (typeof trip.title !== 'string' || typeof trip.destinationCity !== 'string' || !Array.isArray(trip.days)) {
    return res.status(400).json({ status: 'fail', message: 'Data itinerary tidak lengkap.' });
  }

  db.prepare(`
    INSERT INTO trips (id, user_id, title, destination_city, data, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, id) DO UPDATE SET
      title = excluded.title,
      destination_city = excluded.destination_city,
      data = excluded.data,
      updated_at = excluded.updated_at
  `).run(trip.id, user.id, trip.title, trip.destinationCity, JSON.stringify(trip));

  return res.json({ status: 'success', message: 'Itinerary tersimpan.', data: { trip } });
});
