import { NextFunction, Request, Response } from 'express';
import { contactoService } from '../services/contacto.service';
import type { CreateContactoDTO } from '../types/dto';

export const contactoController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as CreateContactoDTO;
      const contacto = await contactoService.create(dto);
      res.status(201).json({ data: contacto });
    } catch (err) {
      next(err);
    }
  },
};
