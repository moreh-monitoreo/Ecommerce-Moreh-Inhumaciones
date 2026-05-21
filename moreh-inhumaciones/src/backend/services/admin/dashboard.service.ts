import { Op, fn, col, literal } from 'sequelize';
import { Order, ServiceContract, Lead, Inventory, AuditLog, Producto, Branch } from '../../models';
import { sequelize } from '../../models';

export const dashboardService = {
  async kpis() {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const [
      ordenesHoy,
      ordenesMes,
      contratosMes,
      ordenesActivas,
      contratosActivos,
      leadsNuevos,
      stockBajo,
      totalProductos,
    ] = await Promise.all([
      Order.count({ where: { createdAt: { [Op.gte]: new Date(hoy.toDateString()) } } }),
      Order.sum('total', { where: { createdAt: { [Op.gte]: inicioMes }, status: { [Op.notIn]: ['cancelada'] } } }),
      ServiceContract.sum('total', { where: { createdAt: { [Op.gte]: inicioMes }, status: { [Op.notIn]: ['cancelado'] } } }),
      Order.count({ where: { status: { [Op.in]: ['pendiente', 'pagada', 'en_preparacion'] } } }),
      ServiceContract.count({ where: { status: { [Op.in]: ['firmado', 'en_curso'] } } }),
      Lead.count({ where: { status: 'nuevo' } }),
      Inventory.count({ where: { stock: { [Op.lte]: col('stock_minimo') } } }),
      Producto.count({ where: { activo: true } }),
    ]);
    return {
      ordenes_hoy: ordenesHoy,
      ventas_mes: Number(ordenesMes ?? 0) + Number(contratosMes ?? 0),
      ordenes_activas: ordenesActivas,
      contratos_activos: contratosActivos,
      leads_nuevos: leadsNuevos,
      stock_bajo: stockBajo,
      total_productos: totalProductos,
    };
  },

  async recentActivity() {
    return AuditLog.findAll({
      order: [['createdAt', 'DESC']],
      limit: 15,
      attributes: ['id', 'user_email', 'accion', 'entidad', 'entidad_id', 'createdAt'],
    });
  },

  async salesByBranch() {
    return sequelize.query(
      `SELECT b.nombre AS sucursal, b.ciudad,
              COALESCE(SUM(o.total), 0) AS ventas_ordenes,
              COALESCE(SUM(sc.total), 0) AS ventas_contratos
       FROM Branches b
       LEFT JOIN Orders o ON o.branch_id = b.id AND o.status != 'cancelada'
       LEFT JOIN ServiceContracts sc ON sc.branch_id = b.id AND sc.status != 'cancelado'
       WHERE b.activo = 1
       GROUP BY b.id, b.nombre, b.ciudad
       ORDER BY ventas_ordenes + ventas_contratos DESC`,
      { type: 'SELECT' as never }
    );
  },

  async topProducts() {
    return sequelize.query(
      `SELECT p.nombre, p.categoria, p.imagen_url, SUM(oi.cantidad) AS unidades_vendidas
       FROM Productos p
       JOIN OrderItems oi ON oi.producto_id = p.id
       JOIN Orders o ON o.id = oi.order_id AND o.status != 'cancelada'
       GROUP BY p.id, p.nombre, p.categoria, p.imagen_url
       ORDER BY unidades_vendidas DESC
       OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY`,
      { type: 'SELECT' as never }
    );
  },

  async contractsByType() {
    return ServiceContract.findAll({
      attributes: ['tipo', [fn('COUNT', col('id')), 'total']],
      where: { status: { [Op.notIn]: ['cancelado'] } },
      group: ['tipo'],
      raw: true,
    });
  },

  async auditLogs(page = 1, limit = 50, entidad?: string) {
    const where: Record<string, unknown> = {};
    if (entidad) where.entidad = entidad;
    const offset = (page - 1) * limit;
    const { rows, count } = await AuditLog.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    return { data: rows, total: count, page, limit };
  },
};
