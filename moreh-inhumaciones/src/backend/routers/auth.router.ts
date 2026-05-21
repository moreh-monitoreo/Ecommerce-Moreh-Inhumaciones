import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';
import { body } from 'express-validator';

const router = Router();

router.post('/login', validate([
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isString().isLength({ min: 6 }).withMessage('Contraseña mínimo 6 caracteres'),
]), authController.login);

router.get('/me', authMiddleware, authController.me);

router.put('/change-password', authMiddleware, validate([
  body('oldPassword').isString().isLength({ min: 6 }),
  body('newPassword').isString().isLength({ min: 6 }),
]), authController.changePassword);

export default router;
