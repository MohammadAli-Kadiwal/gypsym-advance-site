import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { EmailTemplatesService } from './email-templates.service';
import { EmailService } from './email.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('settings/email-templates')
@UseGuards(AuthGuard)
export class EmailTemplatesController {
  constructor(
    private readonly templatesService: EmailTemplatesService,
    private readonly emailService: EmailService
  ) {}

  @Get()
  async getAll() {
    const templates = await this.templatesService.getTemplates();
    return {
      success: true,
      data: templates,
    };
  }

  @Post('seed')
  async seed(@Body('force') force?: boolean) {
    const data = await this.templatesService.seedTemplates(Boolean(force));
    return {
      success: true,
      message: force
        ? 'All email templates reset to defaults successfully.'
        : 'Email templates seeded successfully.',
      data,
    };
  }

  @Get(':key')
  async getOne(@Param('key') key: string) {
    const template = await this.templatesService.getTemplate(key);
    return {
      success: true,
      data: template,
    };
  }

  @Put(':key')
  async update(
    @Param('key') key: string,
    @Body() payload: { subject?: string; htmlContent?: string; isActive?: boolean }
  ) {
    const updated = await this.templatesService.updateTemplate(key, payload);
    return {
      success: true,
      data: updated,
    };
  }

  @Post(':key/test')
  async sendTest(
    @Param('key') key: string,
    @Body() body: { recipientEmail: string; sampleData?: Record<string, any> }
  ) {
    const recipient = body.recipientEmail;
    if (!recipient || !recipient.includes('@')) {
      throw new BadRequestException('Valid recipient email is required.');
    }

    const template = await this.templatesService.getTemplate(key);

    const defaultSampleData: Record<string, any> = {
      fullName: 'Sarah Jenkins',
      businessEmail: recipient,
      companyName: 'Lumina Couture D2C',
      phone: '+1 (415) 890-1234',
      websiteUrl: 'https://luminacouture.com',
      serviceInterest: 'Custom Shopify Plus Architecture',
      serviceName: 'Custom Shopify Plus Architecture',
      date: 'Thursday, October 15, 2026',
      time: '02:30 PM EST',
      duration: '30m Strategy Session',
      bookingNumber: 'BK-2026-8941',
      meetingLink: 'https://meet.google.com/gypsym-strategy-session',
      rescheduleLink: 'http://localhost:3000/booking/calendar',
      bookingCalendarUrl: 'http://localhost:3000/booking/calendar',
      adminDashboardUrl: 'http://localhost:3001/content/submissions',
      receivedAt: new Date().toUTCString(),
      cancellationReason: 'Client requested reschedule due to executive board review meeting.',
      alertTitle: 'Database Connection Pool Near Capacity',
      alertLevel: 'WARNING',
      alertMessage: 'Primary PostgreSQL pool connection utilization exceeded 85% for 3 consecutive minutes.',
      sourceDetails: 'gypsym-production-db-cluster-01.us-east-1',
      actionUrl: 'http://localhost:3001/system/health',
      actionLabel: 'Inspect Database Metrics',
      timestamp: new Date().toUTCString(),
      projectDescription: 'Scaling past $15M ARR, seeking sub-second theme speed & checkout extensibility.',
      projectScope: 'Scaling past $15M ARR; seeking sub-second headless migration & custom CRO checkout apps.',
      submittedFieldsTable: `
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0;">
          <tr><td style="padding: 6px 12px; color: #64748b; font-weight: 600;">Monthly GMV</td><td style="padding: 6px 12px; color: #0f172a;">$1.2M</td></tr>
          <tr><td style="padding: 6px 12px; color: #64748b; font-weight: 600;">Current Platform</td><td style="padding: 6px 12px; color: #0f172a;">Shopify Plus Vintage</td></tr>
        </table>
      `,
    };

    const mergedData = { ...defaultSampleData, ...(body.sampleData || {}) };
    const rendered = this.templatesService.render(template, mergedData);

    const result = await this.emailService.sendGenericEmail({
      to: recipient,
      subject: `[TEST PREVIEW] ${rendered.subject}`,
      html: rendered.html,
    });

    return {
      message: `Test email for template '${template.name}' dispatched to ${recipient}.`,
      ...result,
    };
  }
}

