import { User, Role, Branch } from '../../models';
import { hashPassword } from '../../utils/password';
import { HttpError } from '../../utils/HttpError';

export const userService = {
  async list() {
    return User.findAll({
      attributes: { exclude: ['password_hash'] },
      include: [
        { model: Role, as: 'role', attributes: ['id', 'nombre'] },
        { model: Branch, as: 'branch', attributes: ['id', 'nombre', 'ciudad'] },
      ],
      order: [['nombre', 'ASC']],
    });
  },

  async findById(id: number) {
    const u = await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] },
      include: [
        { model: Role, as: 'role' },
        { model: Branch, as: 'branch' },
      ],
    });
    if (!u) throw HttpError.notFound(`Usuario ${id} no encontrado`);
    return u;
  },

  async create(data: { nombre: string; email: string; password: string; role_id: number; branch_id?: number | null }) {
    const exists = await User.findOne({ where: { email: data.email.toLowerCase() } });
    if (exists) throw HttpError.badRequest('Ya existe un usuario con ese email');
    return User.create({
      nombre: data.nombre,
      email: data.email.toLowerCase(),
      password_hash: await hashPassword(data.password),
      role_id: data.role_id,
      branch_id: data.branch_id ?? null,
      activo: true,
      ultimo_acceso: null,
    });
  },

  async update(id: number, data: Partial<{ nombre: string; email: string; role_id: number; branch_id: number | null; activo: boolean; password: string }>) {
    const u = await User.findByPk(id);
    if (!u) throw HttpError.notFound(`Usuario ${id} no encontrado`);
    const updates: Partial<User> = {};
    if (data.nombre !== undefined) updates.nombre = data.nombre;
    if (data.email !== undefined) updates.email = data.email.toLowerCase();
    if (data.role_id !== undefined) updates.role_id = data.role_id;
    if (data.branch_id !== undefined) updates.branch_id = data.branch_id;
    if (data.activo !== undefined) updates.activo = data.activo;
    if (data.password) updates.password_hash = await hashPassword(data.password);
    return u.update(updates);
  },

  async remove(id: number) {
    const u = await User.findByPk(id);
    if (!u) throw HttpError.notFound(`Usuario ${id} no encontrado`);
    await u.update({ activo: false });
  },
};
