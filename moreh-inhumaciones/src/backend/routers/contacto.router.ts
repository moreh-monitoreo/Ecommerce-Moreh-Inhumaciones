import { Router } from 'express';
import { contactoController } from '../controllers/contacto.controller';
import { validate } from '../middlewares/validate';
import { contactoCreateRules } from '../validators/contacto.validator';

const router = Router();

router.post('/', validate(contactoCreateRules), contactoController.create);

export default router;
