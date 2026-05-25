import { NextFunction, Request, Response } from 'express';
import { cotizacionService } from '../services/cotizacion.service';
import { HttpError } from '../utils/HttpError';
import type { CreateCotizacionDTO } from '../types/dto';

export const cotizacionController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as CreateCotizacionDTO;
      const cotizacion = await cotizacionService.create(dto);
      res.status(201).json({ data: cotizacion });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (Number.isNaN(id) || id <= 0) {
        throw HttpError.badRequest('ID de cotización inválido');
      }
      const cotizacion = await cotizacionService.findById(id);
      if (!cotizacion) {
        throw HttpError.notFound(`Cotización ${id} no encontrada`);
      }
      res.json({ data: cotizacion });
    } catch (err) {
      next(err);
    }
  },
};
