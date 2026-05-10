import { getSafeEnv } from '@app/common/utils';

export const getConfig = () => ({
  node_env: getSafeEnv('NODE_ENV', 'development'),
  port: parseInt(getSafeEnv('PORT', '3000'), 10),
  allowedOrigins: getSafeEnv('ALLOWED_ORIGINS', '*'),
  database_url: getSafeEnv('DATABASE_URL'),
});

export type AppConfig = ReturnType<typeof getConfig>;
