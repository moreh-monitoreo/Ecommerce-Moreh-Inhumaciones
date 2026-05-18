import { Router } from 'express';
import productoRouter from './producto.router';
import contactoRouter from './contacto.router';
import cotizacionRouter from './cotizacion.router';

const apiRouter = Router();

apiRouter.use('/productos', productoRouter);
apiRouter.use('/contactos', contactoRouter);
apiRouter.use('/cotizaciones', cotizacionRouter);

export default apiRouter;
