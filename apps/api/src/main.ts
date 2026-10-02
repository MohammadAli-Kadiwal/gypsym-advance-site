import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import cors from 'cors';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

// NestJS Application Bootstrap - Reloaded
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    bodyParser: false,
  });

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  const configService = app.get(ConfigService);
  const logger = app.get(Logger);
  app.useLogger(logger);

  // Security Headers
  app.use(helmet());

  // CORS with strict whitelist validation + dev LAN IP support
  const corsOrigins = configService.get<string>('CORS_ORIGINS', '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  const isAllowedDevOrigin = (originUrl: string): boolean => {
    try {
      const parsed = new URL(originUrl);
      const hostname = parsed.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
      if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
      if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
      if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
      return false;
    } catch {
      return false;
    }
  };

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const isDev = process.env.NODE_ENV !== 'production';
        if (corsOrigins.includes(origin) || (isDev && isAllowedDevOrigin(origin))) {
          return callback(null, true);
        }
        if (isDev) {
          logger.warn(`[CORS] Blocked origin: ${origin}`);
        }
        return callback(null, false);
      },
      credentials: true,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-correlation-id', 'x-request-id', 'Idempotency-Key'],
      exposedHeaders: ['x-correlation-id', 'x-request-id', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
    }),
  );

  // Global Prefix
  const apiPrefix = configService.get<string>('API_PREFIX', '/api/v1');
  app.setGlobalPrefix(apiPrefix);

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global Interceptors & Exception Filters
  app.useGlobalInterceptors(new TransformResponseInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Graceful Shutdown Hooks
  app.enableShutdownHooks();

  const port = configService.get<number>('PORT', 4000);
  await app.listen(port);
  logger.log(`🚀 Gypsym Core API running at: http://localhost:${port}${apiPrefix}`);
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrapping error:', err);
  process.exit(1);
});
