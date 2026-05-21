import { ServiceContract, Customer, Branch, Chapel } from '../../models';
import { HttpError } from '../../utils/HttpError';

export const contractService = {
  async list(filters: { status?: string; branch_id?: number; tipo?: string } = {}) {
    const where: Record<string, unknown> = {};
    if (filters.status) where.status = filters.status;
    if (filters.branch_id) where.branch_id = filters.branch_id;
    if (filters.tipo) where.tipo = filters.tipo;
    return ServiceContract.findAll({
      where,
      include: [
        { model: Customer, as: 'cliente', attributes: ['id', 'nombre', 'telefono'] },
        { model: Branch, as: 'sucursal', attributes: ['id', 'nombre', 'ciudad'] },
        { model: Chapel, as: 'capilla', attributes: ['id', 'nombre'] },
      ],
      order: [['createdAt', 'DESC']],
    });
  },

  async findById(id: number) {
    const c = await ServiceContract.findByPk(id, {
      include: [
        { model: Customer, as: 'cliente' },
        { model: Branch, as: 'sucursal' },
        { model: Chapel, as: 'capilla' },
      ],
    });
    if (!c) throw HttpError.notFound(`Contrato ${id} no encontrado`);
    return c;
  },

  create: (data: Partial<ServiceContract>) => ServiceContract.create(data as never),

  async update(id: number, data: Partial<ServiceContract>) {
    const c = await ServiceContract.findByPk(id);
    if (!c) throw HttpError.notFound(`Contrato ${id} no encontrado`);
    return c.update(data);
  },

  async updateStatus(id: number, status: string) {
    const c = await ServiceContract.findByPk(id);
    if (!c) throw HttpError.notFound(`Contrato ${id} no encontrado`);
    return c.update({ status: status as never });
  },
};
