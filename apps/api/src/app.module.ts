import * as path from 'path';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { validateEnvironment } from './config/env.schema';
import {
  appConfig,
  databaseConfig,
  authConfig,
  corsConfig,
  securityConfig,
  storageConfig,
  emailConfig,
} from './config';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './modules/health/health.module';
import { CmsModule } from './modules/cms/cms.module';
import { EmailModule } from './modules/email/email.module';
import { InquiriesModule } from './modules/inquiries/inquiries.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
      load: [
        appConfig,
        databaseConfig,
        authConfig,
        corsConfig,
        securityConfig,
        storageConfig,
        emailConfig,
      ],
      envFilePath: [
        path.resolve(process.cwd(), '.env'),
        path.resolve(process.cwd(), '../../.env'),
        path.resolve(__dirname, '../../../.env'),
        '.env.local',
        '.env',
      ],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                },
              }
            : undefined,
      },
    }),
    DatabaseModule,
    HealthModule,
    CmsModule,
    EmailModule,
    InquiriesModule,
    PortfolioModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
