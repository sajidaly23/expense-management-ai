import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { config } from '../config/env.js';

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({
    status: 'error',
    message: 'Requested API endpoint not found.',
  });
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  console.error('[Unhandled Server Error]:', err);
  res.status(500).json({
    status: 'error',
    message: config.nodeEnv === 'development' ? err.message : 'Internal Server Error',
  });
}
