export class HttpError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, HttpError.prototype);
  }

  static badRequest(message: string, details?: unknown) {
    return new HttpError(400, 'BadRequest', message, details);
  }

  static notFound(message = 'Recurso no encontrado') {
    return new HttpError(404, 'NotFound', message);
  }

  static validation(details: unknown, message = 'Datos inválidos') {
    return new HttpError(400, 'ValidationError', message, details);
  }
}
