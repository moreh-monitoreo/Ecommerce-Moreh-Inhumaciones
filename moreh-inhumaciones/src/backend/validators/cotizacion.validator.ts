import { body } from 'express-validator';

export const cotizacionCreateRules = [
  body('cliente').isObject().withMessage('cliente requerido'),
  body('cliente.nombre').isString().trim().isLength({ min: 2, max: 120 })
    .withMessage('Nombre del cliente inválido'),
  body('cliente.email').isEmail().withMessage('Email del cliente inválido').normalizeEmail(),
  body('cliente.telefono').optional({ values: 'falsy' }).isString().trim().isLength({ max: 30 })
    .withMessage('Teléfono inválido'),
  body('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un item'),
  body('items.*.producto_id').isInt({ min: 1 }).withMessage('producto_id inválido'),
  body('items.*.cantidad').isInt({ min: 1, max: 1000 }).withMessage('cantidad inválida (1-1000)'),
];
