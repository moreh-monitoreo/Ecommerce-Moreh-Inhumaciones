import { Op } from 'sequelize';
import { Producto, ProductImage, ProductVariant, Inventory } from '../../models';
import { HttpError } from '../../utils/HttpError';
import { deleteFromFirebase } from './upload.service';

export const productoAdminService = {
  async list(query: { categoria?: string; search?: string; activo?: string }) {
    const where: Record<string, unknown> = {};
    if (query.categoria) where.categoria = query.categoria;
    if (query.activo !== undefined) where.activo = query.activo === 'true';
    if (query.search) where.nombre = { [Op.like]: `%${query.search}%` };
    return Producto.findAll({
      where,
      include: [
        { model: ProductImage,   as: 'imagenes',  attributes: ['id', 'url', 'orden'] },
        { model: ProductVariant, as: 'variantes', attributes: ['id', 'nombre', 'precio', 'stock', 'activo', 'orden'], where: { activo: true }, required: false },
      ],
      order: [['categoria', 'ASC'], ['nombre', 'ASC']],
    });
  },

  async findById(id: number) {
    const p = await Producto.findByPk(id, {
      include: [
        { model: ProductImage,   as: 'imagenes' },
        { model: ProductVariant, as: 'variantes', order: [['orden', 'ASC']] as any },
        { model: Inventory,      as: 'inventarios' },
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
    await deleteFromFirebase(img.url);
    await img.destroy();
  },

  // ── Variantes ────────────────────────────────────────────────────────────────
  listVariants: (productoId: number) =>
    ProductVariant.findAll({ where: { producto_id: productoId }, order: [['orden', 'ASC'], ['nombre', 'ASC']] }),

  async createVariant(productoId: number, data: { nombre: string; precio: number; stock?: number; orden?: number }) {
    const p = await Producto.findByPk(productoId);
    if (!p) throw HttpError.notFound(`Producto ${productoId} no encontrado`);
    return ProductVariant.create({ producto_id: productoId, ...data } as never);
  },

  async updateVariant(variantId: number, data: Partial<{ nombre: string; precio: number; stock: number; activo: boolean; orden: number }>) {
    const v = await ProductVariant.findByPk(variantId);
    if (!v) throw HttpError.notFound(`Variante ${variantId} no encontrada`);
    return v.update(data);
  },

  async removeVariant(variantId: number) {
    const v = await ProductVariant.findByPk(variantId);
    if (!v) throw HttpError.notFound(`Variante ${variantId} no encontrada`);
    await v.destroy();
  },
};
