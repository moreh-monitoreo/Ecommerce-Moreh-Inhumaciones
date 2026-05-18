import { Op, WhereOptions } from 'sequelize';
import { Producto } from '../models';
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
    return Producto.findAll({ where, order: [['categoria', 'ASC'], ['precio', 'ASC']] });
  },

  async findById(id: number) {
    return Producto.findByPk(id);
  },
};
