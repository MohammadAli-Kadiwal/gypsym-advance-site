import { registerAs } from '@nestjs/config';

export const corsConfig = registerAs('cors', () => {
  const defaultOrigins = process.env.NODE_ENV === 'production'
    ? 'https://gypsym.com,https://www.gypsym.com,https://admin.gypsym.com'
    : 'http://localhost:3000,http://localhost:3001';
  return {
    origins: (process.env.CORS_ORIGINS || defaultOrigins)
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  };
});
