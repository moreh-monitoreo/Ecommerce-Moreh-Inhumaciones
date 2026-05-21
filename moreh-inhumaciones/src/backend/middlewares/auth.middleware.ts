import { NextFunction, Request, Response } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { HttpError } from '../utils/HttpError';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Unauthorized', 'Token requerido'));
  }
  try {
    req.user = verifyToken(header.slice(7));
    return next();
  } catch {
    return next(new HttpError(401, 'Unauthorized', 'Token inválido o expirado'));
  }
}
