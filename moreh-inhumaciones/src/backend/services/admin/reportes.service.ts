import { Op, fn, col, QueryTypes } from 'sequelize';
import { Order, ServiceContract, Lead } from '../../models';
import { sequelize } from '../../models';
import ExcelJS from 'exceljs';

function dateWhere(desde?: string, hasta?: string, branchId?: number) {
  const where: Record<string, unknown> = {};
  if (desde || hasta) {
    where.createdAt = {
      ...(desde ? { [Op.gte]: new Date(desde!) } : {}),
      ...(hasta ? { [Op.lte]: new Date(hasta! + 'T23:59:59') } : {}),
    };
  }
  if (branchId) where.branch_id = branchId;
  return where;
}

export const reportesService = {
  async kpis(desde?: string, hasta?: string, branchId?: number) {
    const base = dateWhere(desde, hasta, branchId);
    const [ventas, cntOrdenes, ventasC, cntContratos] = await Promise.all([
      Order.sum('total', { where: { ...base, status: { [Op.ne]: 'cancelada' } } }) as Promise<number | null>,
      Order.count({ where: { ...base, status: { [Op.ne]: 'cancelada' } } }),
      ServiceContract.sum('total', { where: { ...base, status: { [Op.ne]: 'cancelado' } } }) as Promise<number | null>,
      ServiceContract.count({ where: { ...base, status: { [Op.ne]: 'cancelado' } } }),
    ]);
    return {
      totalVentas: (ventas ?? 0) + (ventasC ?? 0),
      totalOrdenes: cntOrdenes,
      totalContratos: cntContratos,
    };
  },

  async ventasPorSucursal(desde?: string, hasta?: string, branchId?: number) {
    const repl: Record<string, unknown> = {};
    let dateClause = '';
    if (desde) { repl.desde = new Date(desde); dateClause += ' AND o.createdAt >= :desde'; }
    if (hasta) { repl.hasta = new Date(hasta + 'T23:59:59'); dateClause += ' AND o.createdAt <= :hasta'; }
    const branchClause = branchId ? ` AND b.id = ${Number(branchId)}` : '';
    const rows = await sequelize.query(
      `SELECT b.nombre, b.ciudad,
              COALESCE(SUM(o.total), 0) AS total
       FROM Branches b
       LEFT JOIN Orders o ON o.branch_id = b.id AND o.status != 'cancelada' ${dateClause}
       WHERE b.activo = 1 ${branchClause}
       GROUP BY b.id, b.nombre, b.ciudad
       ORDER BY total DESC`,
      { type: QueryTypes.SELECT, replacements: repl }
    );
    return rows;
  },

  async ventasMensuales(desde?: string, hasta?: string, branchId?: number) {
    const repl: Record<string, unknown> = {};
    let dateClause = '';
    if (desde) { repl.desde = new Date(desde); dateClause += ' AND o.createdAt >= :desde'; }
    if (hasta) { repl.hasta = new Date(hasta + 'T23:59:59'); dateClause += ' AND o.createdAt <= :hasta'; }
    const branchClause = branchId ? ` AND o.branch_id = ${Number(branchId)}` : '';
    const rows = await sequelize.query(
      `SELECT FORMAT(o.createdAt, 'yyyy-MM') AS mes, SUM(o.total) AS total
       FROM Orders o
       WHERE o.status != 'cancelada' ${dateClause} ${branchClause}
       GROUP BY FORMAT(o.createdAt, 'yyyy-MM')
       ORDER BY mes ASC`,
      { type: QueryTypes.SELECT, replacements: repl }
    );
    return rows;
  },

  async contratosPorTipo(desde?: string, hasta?: string, branchId?: number) {
    const where = {
      ...dateWhere(desde, hasta, branchId),
      status: { [Op.ne]: 'cancelado' },
    };
    return ServiceContract.findAll({
      attributes: ['tipo', [fn('COUNT', col('id')), 'total']],
      where: where as any,
      group: ['tipo'],
      raw: true,
    });
  },

  async leadsPorFuente(desde?: string, hasta?: string) {
    const where: Record<string, unknown> = {};
    if (desde || hasta) {
      where.createdAt = {
        ...(desde ? { [Op.gte]: new Date(desde!) } : {}),
        ...(hasta ? { [Op.lte]: new Date(hasta! + 'T23:59:59') } : {}),
      };
    }
    return Lead.findAll({
      attributes: ['fuente', [fn('COUNT', col('id')), 'total']],
      where,
      group: ['fuente'],
      raw: true,
    });
  },

  async topProductos(desde?: string, hasta?: string, branchId?: number) {
    const repl: Record<string, unknown> = {};
    let dateClause = '';
    if (desde) { repl.desde = new Date(desde); dateClause += ' AND o.createdAt >= :desde'; }
    if (hasta) { repl.hasta = new Date(hasta + 'T23:59:59'); dateClause += ' AND o.createdAt <= :hasta'; }
    const branchClause = branchId ? ` AND o.branch_id = ${Number(branchId)}` : '';
    const rows = await sequelize.query(
      `SELECT p.nombre, p.categoria, SUM(oi.cantidad) AS unidades, SUM(oi.subtotal) AS ingresos
       FROM Productos p
       JOIN OrderItems oi ON oi.producto_id = p.id
       JOIN Orders o ON o.id = oi.order_id AND o.status != 'cancelada' ${dateClause} ${branchClause}
       GROUP BY p.id, p.nombre, p.categoria
       ORDER BY unidades DESC
       OFFSET 0 ROWS FETCH NEXT 20 ROWS ONLY`,
      { type: QueryTypes.SELECT, replacements: repl }
    );
    return rows;
  },

  async exportExcel(desde?: string, hasta?: string, branchId?: number) {
    const [kpis, topProds, contratos] = await Promise.all([
      reportesService.kpis(desde, hasta, branchId),
      reportesService.topProductos(desde, hasta, branchId),
      ServiceContract.findAll({
        where: { ...dateWhere(desde, hasta, branchId), status: { [Op.ne]: 'cancelado' } } as any,
        order: [['createdAt', 'DESC']],
        limit: 500,
        raw: true,
      }),
    ]);

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Moreh Admin';
    wb.created = new Date();

    const ws1 = wb.addWorksheet('Resumen');
    ws1.addRow(['Reporte Moreh Inhumaciones']);
    ws1.addRow(['Periodo', `${desde ?? 'inicio'} — ${hasta ?? 'hoy'}`]);
    ws1.addRow([]);
    ws1.addRow(['Métrica', 'Valor']);
    ws1.addRow(['Ventas Totales (MXN)', kpis.totalVentas]);
    ws1.addRow(['Total Órdenes', kpis.totalOrdenes]);
    ws1.addRow(['Total Contratos', kpis.totalContratos]);
    ws1.getColumn(2).numFmt = '#,##0.00';

    const ws2 = wb.addWorksheet('Top Productos');
    ws2.addRow(['Producto', 'Categoría', 'Unidades Vendidas', 'Ingresos (MXN)']);
    (topProds as Array<Record<string, unknown>>).forEach(p => {
      ws2.addRow([p.nombre, p.categoria ?? '', Number(p.unidades ?? 0), Number(p.ingresos ?? 0)]);
    });
    ws2.getColumn(4).numFmt = '#,##0.00';

    const ws3 = wb.addWorksheet('Contratos');
    ws3.addRow(['ID', 'Tipo', 'Responsable', 'Total (MXN)', 'Anticipo (MXN)', 'Estado', 'Fecha']);
    (contratos as any[]).forEach(c => {
      ws3.addRow([c.id, c.tipo, c.responsable_nombre, Number(c.total ?? 0), Number(c.anticipo ?? 0), c.status, c.createdAt]);
    });
    ws3.getColumn(4).numFmt = '#,##0.00';
    ws3.getColumn(5).numFmt = '#,##0.00';

    return wb.xlsx.writeBuffer();
  },
};
