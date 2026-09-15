import { Controller, Get, Put, Post, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { RecaptchaService, UpdateRecaptchaDto } from './recaptcha.service';

@Controller('settings/recaptcha')
export class RecaptchaController {
  constructor(private readonly recaptchaService: RecaptchaService) {}

  /**
   * Public: Get reCAPTCHA siteKey and enabled status for web clients.
   */
  @Get('public')
  async getPublicConfig() {
    return this.recaptchaService.getPublicConfig();
  }

  /**
   * Admin: Get full configuration (secret key masked).
   */
  @Get()
  async getAdminConfig() {
    return this.recaptchaService.getAdminConfig();
  }

  /**
   * Admin: Update reCAPTCHA configuration.
   */
  @Put()
  async updateConfig(@Body() dto: UpdateRecaptchaDto, @Req() req: Request) {
    const actorId = (req as any).user?.id || (req as any).user?.sub;
    return this.recaptchaService.saveConfig(dto, actorId);
  }

  /**
   * Admin: Test verification token.
   */
  @Post('test')
  async testVerify(@Body('token') token: string, @Req() req: Request) {
    const forwarded = req.headers ? req.headers['x-forwarded-for'] : undefined;
    const ip = typeof forwarded === 'string' ? (forwarded.split(',')[0]?.trim() || 'unknown') : (req.ip || 'unknown');
    return this.recaptchaService.verifyToken(token, ip);
  }
}
