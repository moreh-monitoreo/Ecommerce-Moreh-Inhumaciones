import { Role, Permission } from '../../models';
import { HttpError } from '../../utils/HttpError';
import { invalidatePermCache } from '../../middlewares/rbac.middleware';

export const roleService = {
  async list() {
    return Role.findAll({
      include: [{ model: Permission, as: 'permissions' }],
      order: [['nombre', 'ASC']],
    });
  },

  async findById(id: number) {
    const r = await Role.findByPk(id, { include: [{ model: Permission, as: 'permissions' }] });
    if (!r) throw HttpError.notFound(`Rol ${id} no encontrado`);
    return r;
  },

  async create(data: { nombre: string; descripcion?: string }) {
    return Role.create({ nombre: data.nombre, descripcion: data.descripcion ?? null });
  },

  async update(id: number, data: Partial<{ nombre: string; descripcion: string; activo: boolean }>) {
    const r = await Role.findByPk(id);
    if (!r) throw HttpError.notFound(`Rol ${id} no encontrado`);
    await r.update(data);
    invalidatePermCache(id);
    return r;
  },

  async setPermissions(roleId: number, permissionIds: number[]) {
    const role = await Role.findByPk(roleId);
    if (!role) throw HttpError.notFound(`Rol ${roleId} no encontrado`);
    const perms = await Permission.findAll({ where: { id: permissionIds } });
    await (role as Role & { setPermissions: (p: Permission[]) => Promise<void> }).setPermissions(perms);
    invalidatePermCache(roleId);
    return roleService.findById(roleId);
  },

  listPermissions: () => Permission.findAll({ order: [['modulo', 'ASC'], ['accion', 'ASC']] }),
};
