import type { NextFunction, Request, Response } from 'express';

// Daftar origin frontend yang diizinkan, dipisah koma. Contoh:
// CORS_ORIGIN=https://roamplan.netlify.app,http://localhost:3000
// Gunakan '*' untuk mengizinkan semua origin (tidak disarankan untuk produksi).
export function getAllowedOrigins(): string[] {
  const raw = process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173';
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;
  const allowed = getAllowedOrigins();

  if (origin) {
    if (allowed.includes('*')) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    } else if (allowed.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '600');
  }

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
}
