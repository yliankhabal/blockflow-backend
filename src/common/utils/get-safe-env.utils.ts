export const getSafeEnv = (key: string, defaultValue?: string): string => {
  const raw = process.env[key];

  if (raw != null && raw.trim() !== '') {
    return raw.trim();
  }

  if (defaultValue !== undefined) {
    return defaultValue;
  }

  throw new Error(`Env variable "${key}" is required`);
};
