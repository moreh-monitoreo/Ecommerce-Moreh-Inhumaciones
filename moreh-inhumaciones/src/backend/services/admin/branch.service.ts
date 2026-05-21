import { Branch, Chapel } from '../../models';
import { HttpError } from '../../utils/HttpError';

export const branchService = {
  list: () => Branch.findAll({ order: [['estado', 'ASC'], ['nombre', 'ASC']] }),

  async findById(id: number) {
    const b = await Branch.findByPk(id, { include: [{ model: Chapel, as: 'chapels' }] });
    if (!b) throw HttpError.notFound(`Sucursal ${id} no encontrada`);
    return b;
  },

  create: (data: Partial<Branch>) => Branch.create(data as never),

  async update(id: number, data: Partial<Branch>) {
    const b = await Branch.findByPk(id);
    if (!b) throw HttpError.notFound(`Sucursal ${id} no encontrada`);
    return b.update(data);
  },

  async remove(id: number) {
    const b = await Branch.findByPk(id);
    if (!b) throw HttpError.notFound(`Sucursal ${id} no encontrada`);
    await b.update({ activo: false });
  },

  // Capillas
  listChapels: (branchId: number) => Chapel.findAll({ where: { branch_id: branchId }, order: [['nombre', 'ASC']] }),

  createChapel: (branchId: number, data: { nombre: string; capacidad?: number }) =>
    Chapel.create({ branch_id: branchId, nombre: data.nombre, capacidad: data.capacidad ?? null }),

  async updateChapel(id: number, data: Partial<Chapel>) {
    const c = await Chapel.findByPk(id);
    if (!c) throw HttpError.notFound(`Capilla ${id} no encontrada`);
    return c.update(data);
  },

  async removeChapel(id: number) {
    const c = await Chapel.findByPk(id);
    if (!c) throw HttpError.notFound(`Capilla ${id} no encontrada`);
    await c.update({ activo: false });
  },
};
