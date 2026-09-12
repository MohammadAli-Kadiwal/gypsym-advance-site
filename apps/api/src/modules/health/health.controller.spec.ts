import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { PrismaService } from '../../database/prisma.service';
import { ServiceUnavailableException } from '@nestjs/common';

describe('HealthController', () => {
  let controller: HealthController;
  let prismaService: jest.Mocked<Partial<PrismaService>>;

  beforeEach(async () => {
    prismaService = {
      isHealthy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  describe('getLiveness', () => {
    it('should return liveness status ok', () => {
      const res = controller.getLiveness();
      expect(res.status).toBe('ok');
      expect(typeof res.uptime).toBe('number');
      expect(res.timestamp).toBeDefined();
    });
  });

  describe('getReadiness', () => {
    it('should return readiness status ok when database is healthy', async () => {
      (prismaService.isHealthy as jest.Mock).mockResolvedValue(true);
      const res = await controller.getReadiness();
      expect(res.status).toBe('ok');
      expect(res.database).toBe('healthy');
      expect(res.memory).toBeDefined();
    });

    it('should throw ServiceUnavailableException when database is unhealthy', async () => {
      (prismaService.isHealthy as jest.Mock).mockResolvedValue(false);
      await expect(controller.getReadiness()).rejects.toThrow(ServiceUnavailableException);
    });
  });
});
