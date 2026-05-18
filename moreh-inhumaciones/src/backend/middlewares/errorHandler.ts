import { NextFunction, Request, Response } from 'express';
import { ValidationError as SequelizeValidationError } from 'sequelize';
import { HttpError } from '../utils/HttpError';
import { logger } from '../utils/logger';
import { isDev } from '../config/env';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: err.code,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  if (err instanceof SequelizeValidationError) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Datos inválidos',
      details: err.errors.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  logger.error('Unhandled error:', err);
  return res.status(500).json({
    error: 'InternalServerError',
    message: 'Ocurrió un error inesperado en el servidor',
    ...(isDev && err instanceof Error ? { stack: err.stack } : {}),
  });
}
