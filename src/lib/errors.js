/** Galat aplikasi yang sudah berbentuk respons API (status HTTP, kode, dan detail). */
export class AppError extends Error {
  constructor(status, code, message, details = null) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message = 'Data tidak valid', details = null) =>
  new AppError(400, 'VALIDATION_ERROR', message, details);

export const unauthorized = (message = 'Sesi tidak valid atau sudah berakhir') =>
  new AppError(401, 'UNAUTHORIZED', message);

export const notFound = (message = 'Data tidak ditemukan') =>
  new AppError(404, 'NOT_FOUND', message);

export const conflict = (message = 'Data sudah ada', details = null) =>
  new AppError(409, 'CONFLICT', message, details);
