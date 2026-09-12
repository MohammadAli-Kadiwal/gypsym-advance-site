import { z } from 'zod';

export const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_NAME: z.string().default('Gypsym Technology Core API'),
  PORT: z.coerce.number().default(4000),
  API_PREFIX: z.string().default('/api/v1'),
  APP_URL: z.string().url().default('http://localhost:4000'),
  WEB_URL: z.string().url().default('http://localhost:3000'),
  ADMIN_URL: z.string().url().default('http://localhost:3001'),

  // Database (PostgreSQL & Prisma)
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_DATABASE_URL: z.string().optional(),

  // Authentication & Security Tokens
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters long for cryptographic safety'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long for cryptographic safety'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('900s'), // 15 minutes
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Cross-Origin Resource Sharing (CORS)
  CORS_ORIGINS: z.string().default('http://localhost:3000,http://localhost:3001'),

  // Admin Bootstrap Credentials (Optional in normal runtime, required only for seed)
  SEED_ADMIN_NAME: z.string().default('MohammadAli Kadiwal'),
  SEED_ADMIN_EMAIL: z.string().email().default('chief.architect@gypsym.com'),
  SEED_ADMIN_PASSWORD: z.string().min(8).optional().default('GypsymEnterprise2026!'),

  // Redis & Session Caching
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional().default(''),

  // Object & Media Storage
  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  S3_BUCKET: z.string().optional().default('gypsym-media'),
  S3_REGION: z.string().optional().default('us-east-1'),
  S3_ENDPOINT: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),

  // Transactional Email (SMTP / SES)
  SMTP_HOST: z.string().optional().default('localhost'),
  SMTP_PORT: z.coerce.number().optional().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().email().optional().default('advisory@gypsym.com'),

  // Security Cookie Settings
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),

  // Observability
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnvironment(config: Record<string, unknown>): EnvConfig {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - [${i.path.join('.')}]: ${i.message}`)
      .join('\n');
    throw new Error(`\n❌ [Gypsym Security Guard] Fatal Environment Validation Failure:\n${issues}\n`);
  }

  // Production-Specific Security Guardrails
  if (parsed.data.NODE_ENV === 'production') {
    if (parsed.data.CORS_ORIGINS.includes('*')) {
      throw new Error('❌ [Gypsym Security Guard] Wildcard CORS_ORIGINS ("*") is strictly prohibited in production when credentials are enabled.');
    }
    if (parsed.data.JWT_ACCESS_SECRET.includes('dev') || parsed.data.JWT_ACCESS_SECRET.includes('test')) {
      throw new Error('❌ [Gypsym Security Guard] Insecure/development JWT_ACCESS_SECRET detected in production environment.');
    }
  }

  return parsed.data;
}
