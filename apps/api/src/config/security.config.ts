import { registerAs } from '@nestjs/config';

export const securityConfig = registerAs('security', () => ({
  cookieDomain: process.env.COOKIE_DOMAIN,
  cookieSecure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
  cookieSameSite: (process.env.COOKIE_SAME_SITE || 'lax') as 'lax' | 'strict' | 'none',
  rateLimit: {
    ttl: 60000,
    limit: 100,
  },
  authRateLimit: {
    ttl: 900000, // 15 mins
    limit: 5,
  },
}));
