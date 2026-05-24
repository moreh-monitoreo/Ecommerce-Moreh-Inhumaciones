import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/rbac.middleware';
import { auditMiddleware } from '../middlewares/audit.middleware';
import { HttpError } from '../utils/HttpError';
import { uploadToFirebase } from '../services/admin/upload.service';

// Services
import { userService } from '../services/admin/user.service';
import { roleService } from '../services/admin/role.service';
import { branchService } from '../services/admin/branch.service';
import { productoAdminService } from '../services/admin/producto.admin.service';
import { inventoryService } from '../services/admin/inventory.service';
import { orderService } from '../services/admin/order.service';
import { contractService } from '../services/admin/contract.service';
import { cmsService, leadService, customerService } from '../services/admin/cms.service';
import { dashboardService } from '../services/admin/dashboard.service';
import { reportesService } from '../services/admin/reportes.service';
import { Category } from '../models';

const router = Router();

// ── Upload de imágenes (multer memoryStorage → Firebase Storage) ──────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('Solo se permiten imágenes'));
  },
});

// Todos los endpoints admin requieren autenticación
router.use(authMiddleware);

// ─── Helpers ───────────────────────────────────────────────────────────────────
const ok = (res: Response, data: unknown, status = 200) => res.status(status).json({ data });
const wrap = (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get('/dashboard/kpis', wrap(async (_req, res) => ok(res, await dashboardService.kpis())));
router.get('/dashboard/activity', wrap(async (_req, res) => ok(res, await dashboardService.recentActivity())));
router.get('/dashboard/sales-by-branch', wrap(async (_req, res) => ok(res, await dashboardService.salesByBranch())));
router.get('/dashboard/top-products', wrap(async (_req, res) => ok(res, await dashboardService.topProducts())));
router.get('/dashboard/contracts-by-type', wrap(async (_req, res) => ok(res, await dashboardService.contractsByType())));

// ─── Auditoría ────────────────────────────────────────────────────────────────
router.get('/audit', requirePermission('auditoria', 'ver'), wrap(async (req, res) => {
  const page = parseInt(req.query.page as string ?? '1', 10);
  const limit = parseInt(req.query.limit as string ?? '50', 10);
  const entidad = req.query.entidad as string | undefined;
  ok(res, await dashboardService.auditLogs(page, limit, entidad));
}));

// ─── Usuarios ─────────────────────────────────────────────────────────────────
router.get('/usuarios', requirePermission('usuarios', 'ver'), wrap(async (_req, res) => ok(res, await userService.list())));
router.get('/usuarios/:id', requirePermission('usuarios', 'ver'), wrap(async (req, res) => ok(res, await userService.findById(+req.params.id))));
router.post('/usuarios', requirePermission('usuarios', 'crear'), auditMiddleware('Usuario'), wrap(async (req, res) => ok(res, await userService.create(req.body), 201)));
router.put('/usuarios/:id', requirePermission('usuarios', 'editar'), auditMiddleware('Usuario'), wrap(async (req, res) => ok(res, await userService.update(+req.params.id, req.body))));
router.delete('/usuarios/:id', requirePermission('usuarios', 'eliminar'), auditMiddleware('Usuario'), wrap(async (req, res) => { await userService.remove(+req.params.id); ok(res, { ok: true }); }));

// ─── Roles y Permisos ─────────────────────────────────────────────────────────
router.get('/roles', requirePermission('roles', 'ver'), wrap(async (_req, res) => ok(res, await roleService.list())));
router.get('/roles/permisos', requirePermission('roles', 'ver'), wrap(async (_req, res) => ok(res, await roleService.listPermissions())));
router.get('/roles/:id/permisos', requirePermission('roles', 'ver'), wrap(async (req, res) => {
  const role = await roleService.findById(+req.params.id);
  ok(res, (role as any).permissions ?? []);
}));
router.get('/roles/:id', requirePermission('roles', 'ver'), wrap(async (req, res) => ok(res, await roleService.findById(+req.params.id))));
router.post('/roles', requirePermission('roles', 'crear'), wrap(async (req, res) => ok(res, await roleService.create(req.body), 201)));
router.put('/roles/:id', requirePermission('roles', 'editar'), wrap(async (req, res) => ok(res, await roleService.update(+req.params.id, req.body))));
router.put('/roles/:id/permisos', requirePermission('roles', 'editar'), wrap(async (req, res) => ok(res, await roleService.setPermissions(+req.params.id, req.body.permission_ids))));

// ─── Sucursales ───────────────────────────────────────────────────────────────
router.get('/sucursales', requirePermission('sucursales', 'ver'), wrap(async (_req, res) => ok(res, await branchService.list())));
router.get('/sucursales/:id', requirePermission('sucursales', 'ver'), wrap(async (req, res) => ok(res, await branchService.findById(+req.params.id))));
router.post('/sucursales', requirePermission('sucursales', 'crear'), auditMiddleware('Branch'), wrap(async (req, res) => ok(res, await branchService.create(req.body), 201)));
router.put('/sucursales/:id', requirePermission('sucursales', 'editar'), auditMiddleware('Branch'), wrap(async (req, res) => ok(res, await branchService.update(+req.params.id, req.body))));
router.delete('/sucursales/:id', requirePermission('sucursales', 'eliminar'), auditMiddleware('Branch'), wrap(async (req, res) => { await branchService.remove(+req.params.id); ok(res, { ok: true }); }));

// Capillas
router.get('/sucursales/:id/capillas', requirePermission('sucursales', 'ver'), wrap(async (req, res) => ok(res, await branchService.listChapels(+req.params.id))));
router.post('/sucursales/:id/capillas', requirePermission('sucursales', 'editar'), wrap(async (req, res) => ok(res, await branchService.createChapel(+req.params.id, req.body), 201)));
router.put('/capillas/:id', requirePermission('sucursales', 'editar'), wrap(async (req, res) => ok(res, await branchService.updateChapel(+req.params.id, req.body))));
router.delete('/capillas/:id', requirePermission('sucursales', 'editar'), wrap(async (req, res) => { await branchService.removeChapel(+req.params.id); ok(res, { ok: true }); }));

// ─── Categorías ───────────────────────────────────────────────────────────────
router.get('/categorias', wrap(async (_req, res) => ok(res, await Category.findAll({ order: [['nombre', 'ASC']] }))));
router.post('/categorias', requirePermission('productos', 'crear'), wrap(async (req, res) => ok(res, await Category.create(req.body), 201)));
router.put('/categorias/:id', requirePermission('productos', 'editar'), wrap(async (req, res) => {
  const c = await Category.findByPk(+req.params.id);
  if (!c) throw HttpError.notFound('Categoría no encontrada');
  ok(res, await c.update(req.body));
}));
router.delete('/categorias/:id', requirePermission('productos', 'eliminar'), wrap(async (req, res) => {
  const c = await Category.findByPk(+req.params.id);
  if (!c) throw HttpError.notFound('Categoría no encontrada');
  await c.destroy();
  ok(res, { ok: true });
}));

// ─── Upload imágenes → Firebase Storage ──────────────────────────────────────
router.post('/upload', requirePermission('productos', 'editar'), upload.single('file'),
  wrap(async (req, res) => {
    if (!req.file) { res.status(400).json({ error: 'Sin archivo' }); return; }
    const url = await uploadToFirebase(req.file.buffer, req.file.originalname, req.file.mimetype);
    res.json({ url });
  })
);

// ─── Productos (admin) ────────────────────────────────────────────────────────
router.get('/productos', requirePermission('productos', 'ver'), wrap(async (req, res) => ok(res, await productoAdminService.list(req.query as never))));
router.get('/productos/:id', requirePermission('productos', 'ver'), wrap(async (req, res) => ok(res, await productoAdminService.findById(+req.params.id))));
router.post('/productos', requirePermission('productos', 'crear'), auditMiddleware('Producto'), wrap(async (req, res) => ok(res, await productoAdminService.create(req.body), 201)));
router.put('/productos/:id', requirePermission('productos', 'editar'), auditMiddleware('Producto'), wrap(async (req, res) => ok(res, await productoAdminService.update(+req.params.id, req.body))));
router.delete('/productos/:id', requirePermission('productos', 'eliminar'), auditMiddleware('Producto'), wrap(async (req, res) => { await productoAdminService.remove(+req.params.id); ok(res, { ok: true }); }));
router.post('/productos/:id/imagenes', requirePermission('productos', 'editar'), wrap(async (req, res) => ok(res, await productoAdminService.addImage(+req.params.id, req.body.url, req.body.orden), 201)));
router.delete('/imagenes/:id', requirePermission('productos', 'editar'), wrap(async (req, res) => { await productoAdminService.removeImage(+req.params.id); ok(res, { ok: true }); }));

// Variantes
router.get('/productos/:id/variantes', requirePermission('productos', 'ver'), wrap(async (req, res) => ok(res, await productoAdminService.listVariants(+req.params.id))));
router.post('/productos/:id/variantes', requirePermission('productos', 'editar'), wrap(async (req, res) => ok(res, await productoAdminService.createVariant(+req.params.id, req.body), 201)));
router.put('/variantes/:id', requirePermission('productos', 'editar'), wrap(async (req, res) => ok(res, await productoAdminService.updateVariant(+req.params.id, req.body))));
router.delete('/variantes/:id', requirePermission('productos', 'eliminar'), wrap(async (req, res) => { await productoAdminService.removeVariant(+req.params.id); ok(res, { ok: true }); }));

// ─── Inventario ───────────────────────────────────────────────────────────────
router.get('/inventario', requirePermission('inventario', 'ver'), wrap(async (req, res) => ok(res, await inventoryService.list(req.query.branch_id ? +req.query.branch_id : undefined))));
router.get('/inventario/stock-bajo', requirePermission('inventario', 'ver'), wrap(async (_req, res) => ok(res, await inventoryService.lowStock())));
router.get('/inventario/movimientos', requirePermission('inventario', 'ver'), wrap(async (req, res) => ok(res, await inventoryService.movements(req.query.producto_id ? +req.query.producto_id : undefined, req.query.branch_id ? +req.query.branch_id : undefined))));
router.post('/inventario/movimientos', requirePermission('inventario', 'editar'), auditMiddleware('Inventario'), wrap(async (req, res) => ok(res, await inventoryService.registerMovement({ ...req.body, user_id: req.user!.userId }), 201)));

// ─── Clientes ─────────────────────────────────────────────────────────────────
router.get('/clientes', requirePermission('clientes', 'ver'), wrap(async (_req, res) => ok(res, await customerService.list())));
router.get('/clientes/:id/ordenes', requirePermission('clientes', 'ver'), wrap(async (req, res) => ok(res, await customerService.listOrders(+req.params.id))));
router.get('/clientes/:id/contratos', requirePermission('clientes', 'ver'), wrap(async (req, res) => ok(res, await customerService.listContracts(+req.params.id))));
router.get('/clientes/:id', requirePermission('clientes', 'ver'), wrap(async (req, res) => ok(res, await customerService.findById(+req.params.id))));
router.post('/clientes', requirePermission('clientes', 'crear'), wrap(async (req, res) => ok(res, await customerService.create(req.body), 201)));
router.put('/clientes/:id', requirePermission('clientes', 'editar'), wrap(async (req, res) => ok(res, await customerService.update(+req.params.id, req.body))));

// ─── Leads ────────────────────────────────────────────────────────────────────
router.get('/leads', requirePermission('leads', 'ver'), wrap(async (req, res) => ok(res, await leadService.list(req.query as never))));
router.post('/leads', requirePermission('leads', 'crear'), wrap(async (req, res) => ok(res, await leadService.create(req.body), 201)));
router.put('/leads/:id', requirePermission('leads', 'editar'), wrap(async (req, res) => ok(res, await leadService.update(+req.params.id, req.body))));
router.delete('/leads/:id', requirePermission('leads', 'eliminar'), wrap(async (req, res) => { await leadService.remove(+req.params.id); ok(res, { ok: true }); }));

// ─── Órdenes ─────────────────────────────────────────────────────────────────
router.get('/ordenes', requirePermission('ordenes', 'ver'), wrap(async (req, res) => ok(res, await orderService.list(req.query as never))));
router.get('/ordenes/:id', requirePermission('ordenes', 'ver'), wrap(async (req, res) => ok(res, await orderService.findById(+req.params.id))));
router.post('/ordenes', requirePermission('ordenes', 'crear'), auditMiddleware('Order'), wrap(async (req, res) => ok(res, await orderService.create(req.body), 201)));
router.patch('/ordenes/:id/status', requirePermission('ordenes', 'editar'), auditMiddleware('Order'), wrap(async (req, res) => ok(res, await orderService.updateStatus(+req.params.id, req.body.status))));

// ─── Contratos ────────────────────────────────────────────────────────────────
router.get('/contratos', requirePermission('contratos', 'ver'), wrap(async (req, res) => ok(res, await contractService.list(req.query as never))));
router.get('/contratos/:id', requirePermission('contratos', 'ver'), wrap(async (req, res) => ok(res, await contractService.findById(+req.params.id))));
router.post('/contratos', requirePermission('contratos', 'crear'), auditMiddleware('Contrato'), wrap(async (req, res) => ok(res, await contractService.create(req.body), 201)));
router.put('/contratos/:id', requirePermission('contratos', 'editar'), auditMiddleware('Contrato'), wrap(async (req, res) => ok(res, await contractService.update(+req.params.id, req.body))));
router.patch('/contratos/:id/status', requirePermission('contratos', 'editar'), wrap(async (req, res) => ok(res, await contractService.updateStatus(+req.params.id, req.body.status))));

// ─── CMS — Banners ────────────────────────────────────────────────────────────
router.get('/banners', wrap(async (_req, res) => ok(res, await cmsService.listBanners())));
router.post('/banners', requirePermission('cms', 'crear'), wrap(async (req, res) => ok(res, await cmsService.createBanner(req.body), 201)));
router.put('/banners/:id', requirePermission('cms', 'editar'), wrap(async (req, res) => ok(res, await cmsService.updateBanner(+req.params.id, req.body))));
router.delete('/banners/:id', requirePermission('cms', 'eliminar'), wrap(async (req, res) => { await cmsService.removeBanner(+req.params.id); ok(res, { ok: true }); }));

// ─── CMS — Settings ──────────────────────────────────────────────────────────
router.get('/settings', wrap(async (_req, res) => ok(res, await cmsService.listSettings())));
router.put('/settings/:clave', requirePermission('cms', 'editar'), wrap(async (req, res) => ok(res, await cmsService.upsertSetting(req.params.clave, req.body.valor, req.body.descripcion))));

// ─── Auditoría (endpoint completo con filtros) ────────────────────────────────
router.get('/auditoria/stats', requirePermission('auditoria', 'ver'), wrap(async (_req, res) => {
  ok(res, await dashboardService.auditStats());
}));
router.get('/auditoria', requirePermission('auditoria', 'ver'), wrap(async (req, res) => {
  const q = req.query;
  ok(res, await dashboardService.auditLogsFiltered({
    page:    parseInt(q.page    as string ?? '1',  10),
    perPage: parseInt(q.per_page as string ?? '50', 10),
    entidad: q.entidad as string | undefined,
    accion:  q.accion  as string | undefined,
    desde:   q.desde   as string | undefined,
    hasta:   q.hasta   as string | undefined,
    q:       q.q       as string | undefined,
  }));
}));

// ─── Reportes ─────────────────────────────────────────────────────────────────
const rp = (req: Request) => ({
  desde:    req.query.desde    as string | undefined,
  hasta:    req.query.hasta    as string | undefined,
  branchId: req.query.branch_id ? +(req.query.branch_id as string) : undefined,
});

router.get('/reportes/kpis',              requirePermission('reportes', 'ver'), wrap(async (req, res) => { const p = rp(req); ok(res, await reportesService.kpis(p.desde, p.hasta, p.branchId)); }));
router.get('/reportes/ventas-por-sucursal', requirePermission('reportes', 'ver'), wrap(async (req, res) => { const p = rp(req); ok(res, await reportesService.ventasPorSucursal(p.desde, p.hasta, p.branchId)); }));
router.get('/reportes/ventas-mensuales',  requirePermission('reportes', 'ver'), wrap(async (req, res) => { const p = rp(req); ok(res, await reportesService.ventasMensuales(p.desde, p.hasta, p.branchId)); }));
router.get('/reportes/contratos-por-tipo', requirePermission('reportes', 'ver'), wrap(async (req, res) => { const p = rp(req); ok(res, await reportesService.contratosPorTipo(p.desde, p.hasta, p.branchId)); }));
router.get('/reportes/leads-por-fuente', requirePermission('reportes', 'ver'), wrap(async (req, res) => { const p = rp(req); ok(res, await reportesService.leadsPorFuente(p.desde, p.hasta)); }));
router.get('/reportes/top-productos',    requirePermission('reportes', 'ver'), wrap(async (req, res) => { const p = rp(req); ok(res, await reportesService.topProductos(p.desde, p.hasta, p.branchId)); }));
router.get('/reportes/export', requirePermission('reportes', 'ver'), wrap(async (req, res) => {
  const p = rp(req);
  const buffer = await reportesService.exportExcel(p.desde, p.hasta, p.branchId);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="reporte-moreh-${p.desde ?? 'all'}-${p.hasta ?? 'all'}.xlsx"`);
  res.send(buffer);
}));

export default router;
