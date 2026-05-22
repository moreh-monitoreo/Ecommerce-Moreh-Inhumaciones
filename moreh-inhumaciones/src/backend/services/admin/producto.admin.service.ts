import { Op } from 'sequelize';
import { Producto, ProductImage, Inventory } from '../../models';
import { HttpError } from '../../utils/HttpError';

export const productoAdminService = {
  async list(query: { categoria?: string; search?: string; activo?: string }) {
    const where: Record<string, unknown> = {};
    if (query.categoria) where.categoria = query.categoria;
    if (query.activo !== undefined) where.activo = query.activo === 'true';
    if (query.search) where.nombre = { [Op.like]: `%${query.search}%` };
    return Producto.findAll({
      where,
      include: [
        { model: ProductImage, as: 'imagenes', attributes: ['id', 'url', 'orden'] },
      ],
      order: [['categoria', 'ASC'], ['nombre', 'ASC']],
    });
  },

  async findById(id: number) {
    const p = await Producto.findByPk(id, {
      include: [
        { model: ProductImage, as: 'imagenes' },
        { model: Inventory, as: 'inventarios' },
      ],
    });
    if (!p) throw HttpError.notFound(`Producto ${id} no encontrado`);
    return p;
  },

  create: (data: Partial<Producto>) => Producto.create(data as never),

  async update(id: number, data: Partial<Producto>) {
    const p = await Producto.findByPk(id);
    if (!p) throw HttpError.notFound(`Producto ${id} no encontrado`);
    return p.update(data);
  },

  async remove(id: number) {
    const p = await Producto.findByPk(id);
    if (!p) throw HttpError.notFound(`Producto ${id} no encontrado`);
    await p.update({ activo: false });
  },

  addImage: (productoId: number, url: string, orden = 0) =>
    ProductImage.create({ producto_id: productoId, url, orden }),

  async removeImage(imageId: number) {
    const img = await ProductImage.findByPk(imageId);
    if (!img) throw HttpError.notFound('Imagen no encontrada');
    await img.destroy();
  },
};
