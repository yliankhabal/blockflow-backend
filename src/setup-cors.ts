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
  if (isDevelopment) {
    app.enableCors({
      origin: true,
      credentials: true,
    });
    return;
  }

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const normalized = normalizeOrigin(origin);
      const isAllowed = originList.some(o => normalizeOrigin(o) === normalized);
      if (isAllowed) return callback(null, true);
      return callback(new Error('CORS: Origin not allowed'));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['Content-Disposition'],
  });
}
