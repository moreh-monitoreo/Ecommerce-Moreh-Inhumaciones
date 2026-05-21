import { Op } from 'sequelize';
import { Inventory, InventoryMovement, Producto, Branch } from '../../models';
import { HttpError } from '../../utils/HttpError';
import { sequelize } from '../../models';

export const inventoryService = {
  async list(branchId?: number) {
    const where: Record<string, unknown> = {};
    if (branchId) where.branch_id = branchId;
    return Inventory.findAll({
      where,
      include: [
        { model: Producto, as: 'producto', attributes: ['id', 'nombre', 'categoria', 'imagen_url'] },
        { model: Branch, as: 'sucursal', attributes: ['id', 'nombre', 'ciudad'] },
      ],
      order: [[{ model: Producto, as: 'producto' }, 'nombre', 'ASC']],
    });
  },

  async lowStock() {
    const all = await Inventory.findAll({
      include: [
        { model: Producto, as: 'producto', attributes: ['id', 'nombre', 'imagen_url'] },
        { model: Branch, as: 'sucursal', attributes: ['id', 'nombre', 'ciudad'] },
      ],
    });
    return all.filter((i) => i.stock <= i.stock_minimo);
  },

  async registerMovement(data: {
    producto_id: number;
    branch_id: number;
    tipo: string;
    cantidad: number;
    motivo?: string;
    user_id?: number;
  }) {
    return sequelize.transaction(async (t) => {
      const [inv] = await Inventory.findOrCreate({
        where: { producto_id: data.producto_id, branch_id: data.branch_id },
        defaults: { producto_id: data.producto_id, branch_id: data.branch_id, stock: 0, stock_minimo: 1 },
        transaction: t,
      });
      const delta = ['entrada', 'traslado_entrada', 'ajuste'].includes(data.tipo)
        ? Math.abs(data.cantidad)
        : -Math.abs(data.cantidad);
      const newStock = inv.stock + delta;
      if (newStock < 0) throw HttpError.badRequest('Stock insuficiente para esta operación');
      await inv.update({ stock: newStock }, { transaction: t });
      return InventoryMovement.create({
        producto_id: data.producto_id,
        branch_id: data.branch_id,
        tipo: data.tipo as never,
        cantidad: data.cantidad,
        motivo: data.motivo ?? null,
        user_id: data.user_id ?? null,
      }, { transaction: t });
    });
  },

  movements: (productoId?: number, branchId?: number) => {
    const where: Record<string, unknown> = {};
    if (productoId) where.producto_id = productoId;
    if (branchId) where.branch_id = branchId;
    return InventoryMovement.findAll({
      where,
      include: [
        { model: Producto, as: 'producto', attributes: ['id', 'nombre'] },
        { model: Branch, as: 'sucursal', attributes: ['id', 'nombre'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: 200,
    });
  },
};
