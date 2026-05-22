import { Banner, SiteSetting, Lead, Customer, Order, ServiceContract, User } from '../../models';
import { fn, col } from 'sequelize';
import { HttpError } from '../../utils/HttpError';

export const cmsService = {
  // Banners
  listBanners: () => Banner.findAll({ order: [['orden', 'ASC']] }),
  createBanner: (data: Partial<Banner>) => Banner.create(data as never),
  async updateBanner(id: number, data: Partial<Banner>) {
    const b = await Banner.findByPk(id);
    if (!b) throw HttpError.notFound('Banner no encontrado');
    return b.update(data);
  },
  async removeBanner(id: number) {
    const b = await Banner.findByPk(id);
    if (!b) throw HttpError.notFound('Banner no encontrado');
    await b.destroy();
  },

  // Settings
  listSettings: () => SiteSetting.findAll({ order: [['clave', 'ASC']] }),
  async getSetting(clave: string) {
    const s = await SiteSetting.findByPk(clave);
    if (!s) throw HttpError.notFound(`Configuración '${clave}' no encontrada`);
    return s;
  },
  async upsertSetting(clave: string, valor: string, descripcion?: string) {
    const [s, created] = await SiteSetting.findOrCreate({
      where: { clave },
      defaults: { clave, valor, descripcion: descripcion ?? null },
    });
    if (!created) await s.update({ valor, ...(descripcion ? { descripcion } : {}) });
    return s;
  },
};

export const leadService = {
  list: (filters: { status?: string } = {}) => {
    const where: Record<string, unknown> = {};
    if (filters.status) where.status = filters.status;
    return Lead.findAll({
      where,
      include: [{ model: User, as: 'asignado', attributes: ['id', 'nombre'], required: false }],
      order: [['createdAt', 'DESC']],
    });
  },
  create: (data: Partial<Lead>) => Lead.create(data as never),
  async update(id: number, data: Partial<Lead>) {
    const l = await Lead.findByPk(id);
    if (!l) throw HttpError.notFound(`Lead ${id} no encontrado`);
    return l.update(data);
  },
  async remove(id: number) {
    const l = await Lead.findByPk(id);
    if (!l) throw HttpError.notFound(`Lead ${id} no encontrado`);
    await l.destroy();
  },
};

export const customerService = {
  async list() {
    const [customers, orderCounts, contractCounts] = await Promise.all([
      Customer.findAll({ order: [['nombre', 'ASC']] }),
      Order.findAll({ attributes: ['customer_id', [fn('COUNT', col('id')), 'total']], group: ['customer_id'], raw: true }) as unknown as Promise<{ customer_id: number; total: string }[]>,
      ServiceContract.findAll({ attributes: ['customer_id', [fn('COUNT', col('id')), 'total']], group: ['customer_id'], raw: true }) as unknown as Promise<{ customer_id: number; total: string }[]>,
    ]);
    const oc = Object.fromEntries(orderCounts.map(r => [r.customer_id, +r.total]));
    const cc = Object.fromEntries(contractCounts.map(r => [r.customer_id, +r.total]));
    return customers.map(c => ({ ...c.toJSON(), _count: { orders: oc[c.id] ?? 0, contracts: cc[c.id] ?? 0 } }));
  },
  findById: async (id: number) => {
    const c = await Customer.findByPk(id);
    if (!c) throw HttpError.notFound(`Cliente ${id} no encontrado`);
    return c;
  },
  listOrders: (id: number) => Order.findAll({ where: { customer_id: id }, order: [['createdAt', 'DESC']], limit: 20 }),
  listContracts: (id: number) => ServiceContract.findAll({ where: { customer_id: id }, order: [['createdAt', 'DESC']], limit: 20 }),
  create: (data: Partial<Customer>) => Customer.create(data as never),
  async update(id: number, data: Partial<Customer>) {
    const c = await Customer.findByPk(id);
    if (!c) throw HttpError.notFound(`Cliente ${id} no encontrado`);
    return c.update(data);
  },
};
