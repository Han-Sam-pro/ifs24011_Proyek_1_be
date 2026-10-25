import 'dotenv/config';

const toNumber = (value, fallback) => {
  if (value === undefined || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const isProduction = process.env.NODE_ENV === 'production';
if (isProduction && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET wajib diisi di lingkungan produksi');
}

export const config = Object.freeze({
  port: toNumber(process.env.PORT, 4000),
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-ganti-di-produksi',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  dbPath: process.env.DB_PATH || './data/roamplan.db',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:4173,http://localhost:8080')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  transportRatePerKm: toNumber(process.env.TRANSPORT_RATE_PER_KM, 2500),
});
