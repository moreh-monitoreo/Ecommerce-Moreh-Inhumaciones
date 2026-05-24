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
              COALESCE(vo.total, 0) AS ventas_ordenes,
              COALESCE(vc.total, 0) AS ventas_contratos
       FROM Branches b
       LEFT JOIN (
           SELECT branch_id, SUM(total) AS total
           FROM Orders
           WHERE status != 'cancelada'
           GROUP BY branch_id
       ) vo ON vo.branch_id = b.id
       LEFT JOIN (
           SELECT branch_id, SUM(total) AS total
           FROM ServiceContracts
           WHERE status != 'cancelado'
           GROUP BY branch_id
       ) vc ON vc.branch_id = b.id
       WHERE b.activo = 1
       ORDER BY COALESCE(vo.total, 0) + COALESCE(vc.total, 0) DESC`,
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

  async auditLogsFiltered(opts: {
    page?: number; perPage?: number; entidad?: string;
    accion?: string; desde?: string; hasta?: string; q?: string;
  }) {
    const { page = 1, perPage = 50, entidad, accion, desde, hasta, q } = opts;
    const where: Record<string, unknown> = {};
    if (entidad) where.entidad = entidad;
    if (accion) where.accion = accion;
    if (desde || hasta) {
      where.createdAt = {
        ...(desde ? { [Op.gte]: new Date(desde) } : {}),
        ...(hasta ? { [Op.lte]: new Date(hasta + 'T23:59:59') } : {}),
      };
    }
    if (q) {
      (where as any)[Op.or] = [
        { user_email: { [Op.like]: `%${q}%` } },
        { entidad: { [Op.like]: `%${q}%` } },
        { accion: { [Op.like]: `%${q}%` } },
      ];
    }
    const offset = (page - 1) * perPage;
    const { rows, count } = await AuditLog.findAndCountAll({
      where: where as any,
      order: [['createdAt', 'DESC']],
      limit: perPage,
      offset,
    });
    return { data: rows, total: count, page, perPage };
  },

  async auditStats() {
    const rows = await AuditLog.findAll({
      attributes: ['accion', [fn('COUNT', col('id')), 'total']],
      group: ['accion'],
      raw: true,
    }) as unknown as Array<{ accion: string; total: string }>;
    const result: Record<string, number> = { CREATE: 0, UPDATE: 0, DELETE: 0, LOGIN: 0 };
    rows.forEach(r => { result[r.accion] = Number(r.total); });
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    result.usuarios_activos = await AuditLog.count({
      distinct: true,
      col: 'user_email',
      where: { createdAt: { [Op.gte]: thirtyDaysAgo } },
    });
    return result;
  },
};
