import { NextFunction, Request, Response } from 'express';
import { ContextRunner, validationResult } from 'express-validator';
import { HttpError } from '../utils/HttpError';

export function validate(chains: ContextRunner[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    for (const chain of chains) {
      await chain.run(req);
    }
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    const details = errors.array().map((e) => ({
      field: (e as { path?: string }).path ?? (e as { param?: string }).param,
      message: e.msg,
    }));
    return next(HttpError.validation(details));
  };
}
