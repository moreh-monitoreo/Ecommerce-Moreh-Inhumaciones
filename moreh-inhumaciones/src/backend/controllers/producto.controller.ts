import { NextFunction, Request, Response } from 'express';
import { productoService } from '../services/producto.service';
import { HttpError } from '../utils/HttpError';
import type { CategoriaProducto } from '../models/Producto';

export const productoController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const categoriaRaw = typeof req.query.categoria === 'string' ? req.query.categoria : undefined;
      const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;

      let categoria: CategoriaProducto | undefined;
      if (categoriaRaw) {
        if (categoriaRaw !== 'ataud' && categoriaRaw !== 'urna') {
          throw HttpError.badRequest("Parámetro 'categoria' inválido. Use 'ataud' o 'urna'.");
        }
        categoria = categoriaRaw;
      }

      const productos = await productoService.list({ categoria, search });
      res.json({ data: productos });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id) || id <= 0) {
        throw HttpError.badRequest('ID de producto inválido');
      }
      const producto = await productoService.findById(id);
      if (!producto) {
        throw HttpError.notFound(`Producto ${id} no encontrado`);
      }
      res.json({ data: producto });
    } catch (err) {
      next(err);
    }
  },
};
