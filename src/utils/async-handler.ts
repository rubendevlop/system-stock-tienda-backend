import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Envuelve handlers async para que Express 4 redirija errores al middleware final.
 */
export function asyncHandler(
  handler: (request: Request, response: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (request, response, next) => {
    void handler(request, response, next).catch(next);
  };
}
