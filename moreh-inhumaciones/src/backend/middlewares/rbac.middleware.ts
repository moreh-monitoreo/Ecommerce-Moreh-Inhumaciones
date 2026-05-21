import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/HttpError';
import { Role, Permission } from '../models';

// Cache simple en memoria para permisos por role (se invalida en reinicio)
const permCache: Record<number, Set<string>> = {};

async function getPermissions(roleId: number): Promise<Set<string>> {
  if (permCache[roleId]) return permCache[roleId];
  const role = await Role.findByPk(roleId, {
    include: [{ model: Permission, as: 'permissions' }],
  });
  const set = new Set<string>();
  if (role) {
    const perms = (role as Role & { permissions?: Permission[] }).permissions ?? [];
    for (const p of perms) {
      set.add(`${p.modulo}:${p.accion}`);
      set.add(`${p.modulo}:*`);
    }
  }
  permCache[roleId] = set;
  return set;
}

export function invalidatePermCache(roleId?: number) {
  if (roleId !== undefined) delete permCache[roleId];
  else Object.keys(permCache).forEach((k) => delete permCache[+k]);
}

export function requirePermission(modulo: string, accion: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new HttpError(401, 'Unauthorized', 'No autenticado'));
    try {
      const perms = await getPermissions(req.user.roleId);
      if (perms.has(`${modulo}:${accion}`) || perms.has(`${modulo}:*`) || perms.has('*:*')) {
        return next();
      }
      return next(new HttpError(403, 'Forbidden', 'No tiene permiso para esta acción'));
    } catch (err) {
      return next(err);
    }
  };
}
