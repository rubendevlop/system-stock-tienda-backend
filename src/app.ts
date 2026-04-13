import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { ZodError } from 'zod';
import { storeFrontendUrl } from './config/env.js';
import { router } from './routes.js';

export function createApp() {
  const app = express();
  const allowedOrigins = new Set([storeFrontendUrl, 'https://manolotienda.netlify.app']);
  const localhostPattern = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          callback(null, true);
          return;
        }

        if (allowedOrigins.has(origin) || localhostPattern.test(origin)) {
          callback(null, true);
          return;
        }

        callback(null, false);
      },
    }),
  );

  app.use(express.json({ limit: '5mb' }));
  app.use(morgan('dev'));
  app.use('/', router);

  // Centraliza errores conocidos y evita filtrar detalles internos.
  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err instanceof ZodError) {
      res.status(400).json({
        message: 'La solicitud es invalida.',
        issues: err.flatten(),
      });
      return;
    }

    const status = typeof err === 'object' && err && 'status' in err ? Number(err.status) : 500;
    const message =
      typeof err === 'object' && err && 'message' in err && typeof err.message === 'string'
        ? err.message
        : 'Error interno.';

    res.status(Number.isFinite(status) ? status : 500).json({ message });
  });

  return app;
}
