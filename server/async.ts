import type { NextFunction, Request, Response } from 'express';

// Express 4 tidak meneruskan error dari handler async ke error middleware.
// Pembungkus ini memastikan setiap error diteruskan ke next(err).
type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export function asyncHandler(fn: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
