import { sequelize, Cotizacion, CotizacionItem, Producto } from '../models';
import { HttpError } from '../utils/HttpError';
import type { CreateCotizacionDTO } from '../types/dto';

export const cotizacionService = {
  async create(dto: CreateCotizacionDTO) {
    if (!dto.items || dto.items.length === 0) {
      throw HttpError.badRequest('La cotización debe incluir al menos un item');
    }

    const ids = dto.items.map((i) => i.producto_id);
    const productos = await Producto.findAll({
      where: { id: ids, activo: true },
    });
    const byId = new Map(productos.map((p) => [p.id, p]));

    const itemsCalculados = dto.items.map((it) => {
      const prod = byId.get(it.producto_id);
      if (!prod) {
        throw HttpError.badRequest(
          `Producto ${it.producto_id} no existe o no está disponible`
        );
      }
      const precio = Number(prod.precio);
      const subtotal = Number((precio * it.cantidad).toFixed(2));
      return {
        producto_id: prod.id,
        nombre_producto: prod.nombre,
        precio_unitario: precio,
        cantidad: it.cantidad,
        subtotal,
      };
    });

    const total = Number(
      itemsCalculados.reduce((acc, it) => acc + it.subtotal, 0).toFixed(2)
    );

    return sequelize.transaction(async (t) => {
      const cotizacion = await Cotizacion.create(
        {
          cliente_nombre: dto.cliente.nombre,
          cliente_email: dto.cliente.email,
          cliente_telefono: dto.cliente.telefono ?? null,
          total,
          estado: 'pendiente',
        },
        { transaction: t }
      );

      await CotizacionItem.bulkCreate(
        itemsCalculados.map((it) => ({ ...it, cotizacion_id: cotizacion.id })),
        { transaction: t }
      );

      return Cotizacion.findByPk(cotizacion.id, {
        include: [{ model: CotizacionItem, as: 'items' }],
        transaction: t,
      });
    });
  },

  async findById(id: number) {
    return Cotizacion.findByPk(id, {
      include: [{ model: CotizacionItem, as: 'items' }],
    });
  },
};
