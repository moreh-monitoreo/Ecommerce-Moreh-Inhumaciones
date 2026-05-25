import { Op, WhereOptions } from 'sequelize';
import { Producto, ProductImage, ProductVariant } from '../models';
import type { CategoriaProducto } from '../models/Producto';
import type { ProductoListQuery } from '../types/dto';

export const productoService = {
  async list({ categoria, search }: ProductoListQuery) {
    const where: WhereOptions = { activo: true };
    if (categoria) {
      (where as Record<string, unknown>).categoria = categoria as CategoriaProducto;
    }
    if (search) {
      (where as Record<string, unknown>).nombre = { [Op.like]: `%${search}%` };
    }
    return Producto.findAll({
      where,
      include: [
        { model: ProductImage, as: 'imagenes', attributes: ['id', 'url', 'orden'],
          required: false, separate: true, order: [['orden', 'ASC']] },
        { model: ProductVariant, as: 'variantes', attributes: ['id', 'nombre', 'precio', 'orden'],
          where: { activo: true }, required: false, separate: true, order: [['orden', 'ASC']] },
      ],
      order: [['categoria', 'ASC'], ['precio', 'ASC']],
    });
  },

  async findById(id: number) {
    return Producto.findByPk(id, {
      include: [
        { model: ProductImage, as: 'imagenes', attributes: ['id', 'url', 'orden'],
          required: false, separate: true, order: [['orden', 'ASC']] },
        { model: ProductVariant, as: 'variantes', attributes: ['id', 'nombre', 'precio', 'stock', 'activo', 'orden'],
          where: { activo: true }, required: false, separate: true, order: [['orden', 'ASC']] },
      ],
    });
  },
};
