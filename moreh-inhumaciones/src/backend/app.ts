import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env, isDev } from './config/env';
import apiRouter from './routers';
import healthRouter from './routers/health.router';
import { notFound } from './middlewares/notFound';
import { errorHandler } from './middlewares/errorHandler';
import { morganStream } from './utils/logger';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (env.corsOrigin.includes('*') || env.corsOrigin.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origen no permitido por CORS: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(isDev ? 'dev' : 'combined', { stream: morganStream }));

app.use('/health', healthRouter);
app.use('/api', apiRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
