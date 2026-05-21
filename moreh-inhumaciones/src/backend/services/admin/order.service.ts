import { Order, OrderItem, Customer, Branch, Producto } from '../../models';
import { HttpError } from '../../utils/HttpError';
import { sequelize } from '../../models';

export const orderService = {
  async list(filters: { status?: string; branch_id?: number } = {}) {
    const where: Record<string, unknown> = {};
    if (filters.status) where.status = filters.status;
    if (filters.branch_id) where.branch_id = filters.branch_id;
    return Order.findAll({
      where,
      include: [
        { model: Customer, as: 'cliente', attributes: ['id', 'nombre', 'email', 'telefono'] },
        { model: Branch, as: 'sucursal', attributes: ['id', 'nombre', 'ciudad'] },
        { model: OrderItem, as: 'items' },
      ],
      order: [['createdAt', 'DESC']],
    });
  },

  async findById(id: number) {
    const o = await Order.findByPk(id, {
      include: [
        { model: Customer, as: 'cliente' },
        { model: Branch, as: 'sucursal' },
        { model: OrderItem, as: 'items', include: [{ model: Producto, as: 'producto', attributes: ['id', 'nombre', 'imagen_url'] }] },
      ],
    });
    if (!o) throw HttpError.notFound(`Orden ${id} no encontrada`);
    return o;
  },

  async create(data: {
    cliente_nombre: string; cliente_email?: string; cliente_telefono?: string;
    customer_id?: number; branch_id?: number; metodo_pago?: string;
    direccion_envio?: string; notas?: string;
    items: { producto_id?: number; nombre_producto: string; cantidad: number; precio_unitario: number }[];
  }) {
    return sequelize.transaction(async (t) => {
      const total = data.items.reduce((s, i) => s + i.cantidad * i.precio_unitario, 0);
      const order = await Order.create({
        cliente_nombre: data.cliente_nombre,
        cliente_email: data.cliente_email ?? null,
        cliente_telefono: data.cliente_telefono ?? null,
        customer_id: data.customer_id ?? null,
        branch_id: data.branch_id ?? null,
        metodo_pago: data.metodo_pago ?? null,
        direccion_envio: data.direccion_envio ?? null,
        notas: data.notas ?? null,
        total,
        status: 'pendiente',
      }, { transaction: t });
      await OrderItem.bulkCreate(data.items.map((i) => ({
        order_id: order.id!,
        producto_id: i.producto_id ?? null,
        nombre_producto: i.nombre_producto,
        cantidad: i.cantidad,
        precio_unitario: i.precio_unitario,
        subtotal: i.cantidad * i.precio_unitario,
      })), { transaction: t });
      return order;
    });
  },

  async updateStatus(id: number, status: string) {
    const o = await Order.findByPk(id);
    if (!o) throw HttpError.notFound(`Orden ${id} no encontrada`);
    return o.update({ status: status as never });
  },
};
