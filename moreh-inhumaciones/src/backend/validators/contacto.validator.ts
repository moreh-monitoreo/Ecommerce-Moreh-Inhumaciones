import { body } from 'express-validator';

export const contactoCreateRules = [
  body('nombre').isString().trim().isLength({ min: 2, max: 120 })
    .withMessage('El nombre debe tener entre 2 y 120 caracteres'),
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('telefono').optional({ values: 'falsy' }).isString().trim().isLength({ max: 30 })
    .withMessage('Teléfono inválido'),
  body('mensaje').isString().trim().isLength({ min: 5, max: 2000 })
    .withMessage('El mensaje debe tener entre 5 y 2000 caracteres'),
];
