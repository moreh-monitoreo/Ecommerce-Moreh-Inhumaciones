import { NextFunction, Request, Response } from 'express';
import { AuditLog } from '../models';
import { logger } from '../utils/logger';

export function auditMiddleware(entidad: string) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    res.json = function (body: unknown) {
      if (res.statusCode < 400 && _req.user) {
        const accion = methodToAction(_req.method);
        const idMatch = _req.params.id ?? extractId(body);
        AuditLog.create({
          user_id: _req.user.userId,
          user_email: _req.user.email,
          accion,
          entidad,
          entidad_id: idMatch ? String(idMatch) : null,
          antes: _req.method !== 'POST' ? JSON.stringify(_req.body) : null,
          despues: _req.method !== 'DELETE' ? JSON.stringify(body) : null,
          ip: _req.ip ?? null,
          user_agent: _req.headers['user-agent'] ?? null,
        }).catch((err) => logger.error('AuditLog error:', err));
      }
      return originalJson(body);
    };
    next();
  };
}

function methodToAction(method: string): string {
  const map: Record<string, string> = { GET: 'listar', POST: 'crear', PUT: 'actualizar', PATCH: 'actualizar', DELETE: 'eliminar' };
  return map[method] ?? method.toLowerCase();
}

function extractId(body: unknown): unknown {
  if (body && typeof body === 'object') {
    const b = body as Record<string, unknown>;
    const d = b.data as Record<string, unknown> | undefined;
    return d?.id ?? (b as Record<string, unknown>).id ?? null;
  }
  return null;
}
