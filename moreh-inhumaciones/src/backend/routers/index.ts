import { Router } from 'express';
import productoRouter from './producto.router';
import contactoRouter from './contacto.router';
import cotizacionRouter from './cotizacion.router';
import authRouter from './auth.router';
import adminRouter from './admin.router';
import { Branch, Banner, Category } from '../models';

const apiRouter = Router();

// Auth
apiRouter.use('/auth', authRouter);

// Admin (protegido por authMiddleware internamente)
apiRouter.use('/admin', adminRouter);

// Públicos existentes
apiRouter.use('/productos', productoRouter);
apiRouter.use('/contactos', contactoRouter);
apiRouter.use('/cotizaciones', cotizacionRouter);

// Públicos nuevos (para el sitio frontend)
apiRouter.get('/sucursales', async (_req, res, next) => {
  try { res.json({ data: await Branch.findAll({ where: { activo: true }, order: [['estado', 'ASC'], ['nombre', 'ASC']] }) }); }
  catch (e) { next(e); }
});
apiRouter.get('/banners', async (_req, res, next) => {
  try { res.json({ data: await Banner.findAll({ where: { activo: true }, order: [['orden', 'ASC']] }) }); }
  catch (e) { next(e); }
});
apiRouter.get('/categorias', async (_req, res, next) => {
  try { res.json({ data: await Category.findAll({ where: { activo: true }, order: [['parent_id', 'ASC'], ['nombre', 'ASC']] }) }); }
  catch (e) { next(e); }
});

export default apiRouter;
