import { Banner, SiteSetting, Lead, Customer } from '../../models';
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
    return Lead.findAll({ where, order: [['createdAt', 'DESC']] });
  },
  create: (data: Partial<Lead>) => Lead.create(data as never),
  async update(id: number, data: Partial<Lead>) {
    const l = await Lead.findByPk(id);
    if (!l) throw HttpError.notFound(`Lead ${id} no encontrado`);
    return l.update(data);
  },
};

export const customerService = {
  list: () => Customer.findAll({ order: [['nombre', 'ASC']] }),
  findById: async (id: number) => {
    const c = await Customer.findByPk(id);
    if (!c) throw HttpError.notFound(`Cliente ${id} no encontrado`);
    return c;
  },
  create: (data: Partial<Customer>) => Customer.create(data as never),
  async update(id: number, data: Partial<Customer>) {
    const c = await Customer.findByPk(id);
    if (!c) throw HttpError.notFound(`Cliente ${id} no encontrado`);
    return c.update(data);
  },
};
