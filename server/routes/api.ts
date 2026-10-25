import { Router, Request, Response } from 'express';
import { authRouter } from './auth';
import { usersRouter } from './users';
import { tripsRouter } from './trips';

export const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    framework: 'Express.js (Modular Backend)',
    message: 'RoamPlan Backend Express API Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Auth, pengguna, dan itinerary (data disimpan di SQLite lokal)
apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/trips', tripsRouter);

// Cities search & geocoding helper endpoint
apiRouter.get('/cities/suggest', (req: Request, res: Response) => {
  const query = String(req.query.q || '').toLowerCase().trim();
  if (!query) {
    return res.json({ cities: [] });
  }

  const cityDatabase = [
    { cityName: 'Yogyakarta', country: 'Indonesia', lat: -7.7956, lng: 110.3695 },
    { cityName: 'Bali', country: 'Indonesia', lat: -8.4095, lng: 115.1889 },
    { cityName: 'Bandung', country: 'Indonesia', lat: -6.9175, lng: 107.6191 },
    { cityName: 'Jakarta', country: 'Indonesia', lat: -6.2088, lng: 106.8456 },
    { cityName: 'Surabaya', country: 'Indonesia', lat: -7.2575, lng: 112.7521 },
    { cityName: 'Lombok', country: 'Indonesia', lat: -8.5833, lng: 116.1167 },
    { cityName: 'Labuan Bajo', country: 'Indonesia', lat: -8.4539, lng: 119.8728 },
    { cityName: 'Medan', country: 'Indonesia', lat: 3.5952, lng: 98.6722 },
    { cityName: 'Semarang', country: 'Indonesia', lat: -6.9667, lng: 110.4167 },
    { cityName: 'Makassar', country: 'Indonesia', lat: -5.1477, lng: 119.4327 },
    { cityName: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198 },
    { cityName: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
  ];

  const matches = cityDatabase.filter(
    (c) =>
      c.cityName.toLowerCase().includes(query) ||
      c.country.toLowerCase().includes(query)
  );

  res.json({ cities: matches });
});
