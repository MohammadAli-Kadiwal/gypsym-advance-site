import { Controller, Get, Put, Post, Body, UseGuards } from '@nestjs/common';
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
  async updateSmtpConfig(@Body() body: SmtpConfigDto): Promise<PublicSmtpConfig> {
    return this.emailService.saveSmtpConfig(body);
  }

  @Post('test')
  async sendTestEmail(@Body('toEmail') toEmail: string): Promise<{ success: boolean; message: string }> {
    return this.emailService.sendTestEmail(toEmail);
  }
}
