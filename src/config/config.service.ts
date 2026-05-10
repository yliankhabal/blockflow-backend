import { getSafeEnv } from '@app/common/utils';

export const getConfig = () => ({
  node_env: getSafeEnv('NODE_ENV', 'development'),
  allowedOrigins: getSafeEnv('ALLOWED_ORIGINS', '*'),

  base_url: parseInt(getSafeEnv('BASE_URL', 'localhost')),
  port: parseInt(getSafeEnv('PORT', '3000'), 10),

  database_url: getSafeEnv('DATABASE_URL'),
});

export type AppConfig = ReturnType<typeof getConfig>;
