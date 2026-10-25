import { AppError } from '../lib/errors.js';

export function notFoundHandler(req, _res, next) {
  next(new AppError(404, 'NOT_FOUND', `Rute ${req.method} ${req.path} tidak ditemukan`));
}

/** Mengubah semua galat menjadi respons { success: false, error: { code, message, details } }. */
export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      error: { code: err.code, message: err.message, details: err.details },
    });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, error: { code: 'BAD_JSON', message: 'Format JSON tidak valid' } });
  }
  console.error('[ERROR]', err);
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan pada server' },
  });
}
