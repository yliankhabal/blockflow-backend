import { INestApplication } from '@nestjs/common';
import { getConfig } from './config';

const isDevelopment = getConfig().node_env === 'development';
const allowedOrigins = getConfig().allowedOrigins || '';

const originList = allowedOrigins
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const normalizeOrigin = (url: string) => {
  try {
    const { protocol, host } = new URL(url);
    return `${protocol}//${host}`;
  } catch {
    return url;
  }
};

export function setupCors(app: INestApplication) {
  console.log('ALLOWED ORIGINS:', originList);

  if (isDevelopment) {
    app.enableCors({
      origin: true,
      credentials: true,
    });

    return;
  }

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const normalized = normalizeOrigin(origin);

      console.log('REQUEST ORIGIN:', normalized);

      const isAllowed = originList.some(o => normalizeOrigin(o) === normalized);

      console.log('IS ALLOWED:', isAllowed);

      // IMPORTANT:
      // do NOT throw errors here
      return callback(null, isAllowed);
    },

    credentials: true,

    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],

    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],

    exposedHeaders: ['Content-Disposition'],
  });
}
