import { Contacto } from '../models';
import type { CreateContactoDTO } from '../types/dto';

export const contactoService = {
  async create(dto: CreateContactoDTO) {
    return Contacto.create({
      nombre: dto.nombre,
      email: dto.email,
      telefono: dto.telefono ?? null,
      mensaje: dto.mensaje,
    });
  },
};
