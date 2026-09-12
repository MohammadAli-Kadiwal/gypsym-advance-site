import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get('liveness')
  getLiveness() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('readiness')
  async getReadiness() {
    const isDbHealthy = await this.prismaService.isHealthy();
    const memoryUsage = process.memoryUsage();

    if (!isDbHealthy) {
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'unhealthy',
        message: 'Database connection failed',
      });
    }

    return {
      status: 'ok',
      database: 'healthy',
      memory: {
        heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
      },
      timestamp: new Date().toISOString(),
    };
  }
}
