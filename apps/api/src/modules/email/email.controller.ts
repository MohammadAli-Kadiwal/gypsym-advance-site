import { Controller, Get, Put, Patch, Post, Body, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { EmailService, SmtpConfigDto, PublicSmtpConfig } from './email.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('settings/smtp')
@UseGuards(AuthGuard)
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get()
  async getSmtpConfig(): Promise<PublicSmtpConfig> {
    return this.emailService.getPublicSmtpConfig();
  }

  @Put()
  async updateSmtpConfig(@Body() body: SmtpConfigDto, @Req() req: Request): Promise<PublicSmtpConfig> {
    const actorId = (req as any).user?.id || (req as any).user?.sub;
    return this.emailService.saveSmtpConfig(body, actorId);
  }

  @Patch()
  async patchSmtpConfig(@Body() body: SmtpConfigDto, @Req() req: Request): Promise<PublicSmtpConfig> {
    const actorId = (req as any).user?.id || (req as any).user?.sub;
    return this.emailService.saveSmtpConfig(body, actorId);
  }

  @Post('test')
  async sendTestEmail(@Body('toEmail') toEmail: string): Promise<{ success: boolean; message: string }> {
    return this.emailService.sendTestEmail(toEmail);
  }
}
