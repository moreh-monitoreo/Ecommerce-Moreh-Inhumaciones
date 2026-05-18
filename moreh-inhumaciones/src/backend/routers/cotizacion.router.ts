import { Router } from 'express';
import { cotizacionController } from '../controllers/cotizacion.controller';
import { validate } from '../middlewares/validate';
import { cotizacionCreateRules } from '../validators/cotizacion.validator';

const router = Router();

router.post('/', validate(cotizacionCreateRules), cotizacionController.create);
router.get('/:id', cotizacionController.getById);

export default router;
