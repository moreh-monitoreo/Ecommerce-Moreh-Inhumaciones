export interface CreateContactoDTO {
  nombre: string;
  email: string;
  telefono?: string;
  mensaje: string;
}

export interface CotizacionItemInput {
  producto_id: number;
  cantidad: number;
}

export interface CreateCotizacionDTO {
  cliente: {
    nombre: string;
    email: string;
    telefono?: string;
  };
  items: CotizacionItemInput[];
}

export interface ProductoListQuery {
  categoria?: 'ataud' | 'urna';
  search?: string;
}
