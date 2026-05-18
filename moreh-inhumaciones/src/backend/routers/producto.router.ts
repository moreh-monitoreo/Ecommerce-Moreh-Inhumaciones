import { Router } from 'express';
import { productoController } from '../controllers/producto.controller';

const router = Router();

router.get('/', productoController.list);
router.get('/:id', productoController.getById);

export default router;
