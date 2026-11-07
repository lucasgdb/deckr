import type { ApiError } from '@deckr/shared';
import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import { env } from './env.ts';
import { HttpError } from './http-error.ts';
import { chestsRouter } from './routes/chests.ts';
import { decksRouter } from './routes/decks.ts';
import { playersRouter } from './routes/players.ts';

export function createApp() {
   const app = express();

   app.disable('x-powered-by');
   app.use(helmet());
   app.use(cors(env.CORS_ORIGIN.length > 0 ? { origin: env.CORS_ORIGIN } : undefined));
   app.use(express.json({ limit: '16kb' }));

   app.get('/api/health', (_req, res) => {
      res.json({ status: 'ok' });
   });
   app.use('/api/decks', decksRouter);
   app.use('/api/chests', chestsRouter);
   app.use('/api', playersRouter);

   app.use((_req, _res, next) => {
      next(new HttpError(404, 'not_found', 'Not found.'));
   });

   const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
      const status = error instanceof HttpError ? error.status : 500;

      if (status >= 500 && !(error instanceof HttpError)) console.error(error);

      const body: ApiError =
         error instanceof HttpError
            ? { code: error.code, message: error.message, params: error.params }
            : { code: 'internal', message: 'Something went wrong.' };

      res.status(status).json(body);
   };

   app.use(errorHandler);

   return app;
}
