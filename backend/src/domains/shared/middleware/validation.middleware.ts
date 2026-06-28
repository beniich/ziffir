import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { ZodTypeAny, ZodError } from 'zod';
import { ApiError } from '../../../shared/errors/errorHandler.js';

type Source = 'body' | 'query' | 'params';

/**
 * Validates req[source] against a Zod schema.
 * On success, replaces the data with the parsed (coerced + transformed) version.
 */
export function validate(schema: ZodTypeAny, source: Source = 'body'): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req[source]);
      // Overwrite with parsed data (handles coercion like string→number)
      (req as any)[source] = data;
      next();
    } catch (err) {
      if (isZodError(err)) {
        const fieldErrors = err.flatten().fieldErrors;
        throw new ApiError(400, 'Validation failed', fieldErrors);
      }
      throw err;
    }
  };
}

function isZodError(err: unknown): err is ZodError {
  return err instanceof Error && err.name === 'ZodError';
}
