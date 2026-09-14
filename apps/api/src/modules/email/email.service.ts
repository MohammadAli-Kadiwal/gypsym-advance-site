import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../../database/prisma.service';

export interface SmtpConfigDto {
  host?: string;
  port?: number;
  security?: 'none' | 'starttls' | 'tls';
  user?: string;
  password?: string;
  fromName?: string;
  fromEmail?: string;
  replyTo?: string;
  notificationsEnabled?: boolean;
  notificationRecipients?: string[];
  notificationSubject?: string;
  sendAutoReply?: boolean;
  autoReplySubject?: string;
  autoReplyBody?: string;
}

export interface PublicSmtpConfig {
  host: string;
  port: number;
  security: 'none' | 'starttls' | 'tls';
  user: string;
  hasPassword: boolean;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  isConfigured: boolean;
  notificationsEnabled: boolean;
  notificationRecipients: string[];
  notificationSubject: string;
  sendAutoReply: boolean;
  autoReplySubject: string;
  autoReplyBody: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Resolve active SMTP credentials and configuration.
   * Precedence: Database (site_settings: 'smtp_settings') -> Environment variables.
   * INTERNAL ONLY: Raw password is kept inside this method on the server.
   */
  private async getResolvedSmtpConfig(): Promise<{
    host: string;
    port: number;
    secure: boolean;
    requireTLS: boolean;
    ignoreTLS: boolean;
    security: 'none' | 'starttls' | 'tls';
    user: string;
    pass: string;
    fromName: string;
    fromEmail: string;
    replyTo: string;
    isConfigured: boolean;
    notificationsEnabled: boolean;
    notificationRecipients: string[];
    notificationSubject: string;
    sendAutoReply: boolean;
    autoReplySubject: string;
    autoReplyBody: string;
  }> {
    const dbSetting = await this.prisma.siteSetting
      .findUnique({ where: { key: 'smtp_settings' } })
      .catch(() => null);

    const dbVal = (dbSetting?.value as Record<string, any>) || {};

    const envHost = this.configService.get<string>('SMTP_HOST') || process.env.SMTP_HOST || '';
    const envPort = parseInt(this.configService.get<string>('SMTP_PORT') || process.env.SMTP_PORT || '587', 10);
    const envUser = this.configService.get<string>('SMTP_USER') || process.env.SMTP_USER || '';
    const envPass = this.configService.get<string>('SMTP_PASSWORD') || process.env.SMTP_PASSWORD || '';
    const envFrom = this.configService.get<string>('SMTP_FROM') || process.env.SMTP_FROM || 'advisory@gypsym.com';
    const envFromName = process.env.SMTP_FROM_NAME || 'Gypsym Technology';

    const host = dbVal.host?.trim() || envHost || 'localhost';
    const port = typeof dbVal.port === 'number' ? dbVal.port : envPort;
    const security = (dbVal.security as 'none' | 'starttls' | 'tls') || (port === 465 ? 'tls' : 'starttls');
    const user = dbVal.user !== undefined ? dbVal.user : envUser;
    const pass = dbVal.password !== undefined ? dbVal.password : envPass;
    const fromName = dbVal.fromName || envFromName;
    const fromEmail = dbVal.fromEmail || envFrom;
    const replyTo = dbVal.replyTo || fromEmail;

    const secure = security === 'tls' || port === 465;
    const requireTLS = security === 'starttls';
    const ignoreTLS = security === 'none';

    const isConfigured = Boolean(host && host !== 'localhost' && fromEmail);

    const notificationsEnabled = dbVal.notificationsEnabled !== false;
    const notificationRecipients: string[] = Array.isArray(dbVal.notificationRecipients)
      ? dbVal.notificationRecipients
      : typeof dbVal.notificationRecipients === 'string'
      ? dbVal.notificationRecipients.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [fromEmail];
    const notificationSubject = dbVal.notificationSubject || 'New Enterprise Contact Inquiry Received';
    const sendAutoReply = Boolean(dbVal.sendAutoReply);
    const autoReplySubject = dbVal.autoReplySubject || 'Thank you for contacting Gypsym Technology';
    const autoReplyBody =
      dbVal.autoReplyBody ||
      'Thank you for reaching out to Gypsym Technology. We have received your inquiry and our enterprise advisory team will respond shortly.';

    return {
      host,
      port,
      secure,
      requireTLS,
      ignoreTLS,
      security,
      user,
      pass,
      fromName,
      fromEmail,
      replyTo,
      isConfigured,
      notificationsEnabled,
      notificationRecipients,
      notificationSubject,
      sendAutoReply,
      autoReplySubject,
      autoReplyBody,
    };
  }

  /**
   * Return safe, masked SMTP settings to the admin frontend.
   * NEVER returns plaintext password.
   */
  async getPublicSmtpConfig(): Promise<PublicSmtpConfig> {
    const resolved = await this.getResolvedSmtpConfig();

    return {
      host: resolved.host === 'localhost' ? '' : resolved.host,
      port: resolved.port,
      security: resolved.security,
      user: resolved.user,
      hasPassword: Boolean(resolved.pass && resolved.pass.length > 0),
      fromName: resolved.fromName,
      fromEmail: resolved.fromEmail,
      replyTo: resolved.replyTo,
      isConfigured: resolved.isConfigured,
      notificationsEnabled: resolved.notificationsEnabled,
      notificationRecipients: resolved.notificationRecipients,
      notificationSubject: resolved.notificationSubject,
      sendAutoReply: resolved.sendAutoReply,
      autoReplySubject: resolved.autoReplySubject,
      autoReplyBody: resolved.autoReplyBody,
    };
  }

  /**
   * Save SMTP configuration to database (SiteSetting: 'smtp_settings').
   * Preserves existing password if new password is masked or omitted.
   */
  async saveSmtpConfig(dto: SmtpConfigDto, actorId?: string): Promise<PublicSmtpConfig> {
    const existing = await this.getResolvedSmtpConfig();

    let password = existing.pass;
    if (dto.password && dto.password.trim() && !dto.password.includes('••••')) {
      password = dto.password.trim();
    }

    const payload = {
      host: dto.host?.trim() || '',
      port: dto.port || 587,
      security: dto.security || 'starttls',
      user: dto.user?.trim() || '',
      password,
      fromName: dto.fromName?.trim() || 'Gypsym Technology',
      fromEmail: dto.fromEmail?.trim() || 'hello@gypsym.com',
      replyTo: dto.replyTo?.trim() || dto.fromEmail?.trim() || 'hello@gypsym.com',
      notificationsEnabled: dto.notificationsEnabled !== false,
      notificationRecipients: dto.notificationRecipients || [dto.fromEmail || 'admin@gypsym.com'],
      notificationSubject: dto.notificationSubject || 'New Enterprise Contact Inquiry Received',
      sendAutoReply: Boolean(dto.sendAutoReply),
      autoReplySubject: dto.autoReplySubject || 'Thank you for contacting Gypsym Technology',
      autoReplyBody: dto.autoReplyBody || 'Thank you for reaching out. We will review your inquiry shortly.',
    };

    await this.prisma.siteSetting.upsert({
      where: { key: 'smtp_settings' },
      create: {
        key: 'smtp_settings',
        category: 'email',
        value: payload,
        isPublic: false,
        ...(actorId ? { updatedBy: actorId } : {}),
      },
      update: {
        value: payload,
        ...(actorId ? { updatedBy: actorId } : {}),
      },
    });

    this.logger.log(`SMTP settings updated by user ${actorId || 'system'}`);
    return this.getPublicSmtpConfig();
  }

  /**
   * Build a Nodemailer Transporter using resolved configuration.
   */
  private async createTransporter(): Promise<{
    transporter: nodemailer.Transporter;
    from: string;
  }> {
    const config = await this.getResolvedSmtpConfig();

    if (!config.host || config.host === 'localhost') {
      throw new BadRequestException('SMTP host is not configured. Please configure SMTP settings.');
    }

    const transportOptions: any = {
      host: config.host,
      port: config.port,
      secure: config.secure,
    };

    if (config.user && config.pass) {
      transportOptions.auth = {
        user: config.user,
        pass: config.pass,
      };
    }

    if (config.requireTLS) {
      transportOptions.requireTLS = true;
    }
    if (config.ignoreTLS) {
      transportOptions.ignoreTLS = true;
    }

    // Connection timeouts
    transportOptions.connectionTimeout = 10000;
    transportOptions.greetingTimeout = 10000;
    transportOptions.socketTimeout = 15000;

    const transporter = nodemailer.createTransport(transportOptions);
    const from = `"${config.fromName}" <${config.fromEmail}>`;

    return { transporter, from };
  }

  /**
   * Send test email to verify SMTP configuration.
   */
  async sendTestEmail(toEmail: string): Promise<{ success: boolean; message: string }> {
    if (!toEmail || !toEmail.includes('@')) {
      throw new BadRequestException('Valid recipient email address is required.');
    }

    try {
      const { transporter, from } = await this.createTransporter();

      await transporter.verify();

      await transporter.sendMail({
        from,
        to: toEmail,
        subject: 'Gypsym Technology - SMTP Configuration Test',
        text: 'This is a test email confirming that your Gypsym Technology SMTP configuration is active and functional.',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
            <div style="margin-bottom: 20px;">
              <span style="display: inline-block; padding: 4px 12px; background: rgba(217, 40, 124, 0.1); color: #d9287c; font-size: 11px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;">
                SMTP Operational Test
              </span>
            </div>
            <h2 style="color: #0f172a; margin: 0 0 12px; font-size: 22px; font-weight: 700;">Connection Verified Successfully</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
              Your SMTP mail transport is operational. Inbound contact inquiries and system notifications will be dispatched through this gateway.
            </p>
            <div style="padding: 16px; background: #f8fafc; border-radius: 12px; border: 1px solid #f1f5f9; font-size: 12px; color: #64748b;">
              <strong>Timestamp:</strong> ${new Date().toUTCString()}<br/>
              <strong>Server:</strong> Gypsym Enterprise API
            </div>
          </div>
        `,
      });

      return { success: true, message: 'Test email sent successfully.' };
    } catch (err: any) {
      this.logger.error(`SMTP Test Email Failed: ${err?.message || err}`);
      throw new BadRequestException(
        err?.message?.includes('Invalid login') || err?.message?.includes('authentication')
          ? 'SMTP authentication failed. Please check your username and password.'
          : 'Unable to send test email. Check your SMTP configuration and network connectivity.'
      );
    }
  }

  /**
   * Send Inbound Contact Notification to Admin.
   */
  async sendInquiryNotification(
    submission: {
      fullName: string;
      businessEmail: string;
      phone?: string | null;
      companyName?: string | null;
      serviceName?: string | null;
      projectDescription?: string | null;
      submittedData?: Record<string, any>;
      createdAt: Date;
    },
    overrideRecipients?: string[]
  ): Promise<void> {
    try {
      const config = await this.getResolvedSmtpConfig();
      if (!config.notificationsEnabled || !config.isConfigured) {
        return;
      }

      const recipients =
        overrideRecipients && overrideRecipients.length > 0
          ? overrideRecipients
          : config.notificationRecipients;

      if (!recipients || recipients.length === 0) {
        return;
      }

      const { transporter, from } = await this.createTransporter();

      const rawData = submission.submittedData || {};
      const fieldsListHtml = Object.entries(rawData)
        .map(([key, val]) => {
          const displayVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
          return `
            <tr>
              <td style="padding: 8px 12px; font-weight: 600; color: #475569; border-bottom: 1px solid #f1f5f9; text-transform: capitalize; width: 35%;">
                ${key.replace(/([A-Z])/g, ' $1').trim()}
              </td>
              <td style="padding: 8px 12px; color: #0f172a; border-bottom: 1px solid #f1f5f9;">
                ${displayVal}
              </td>
            </tr>
          `;
        })
        .join('');

      await transporter.sendMail({
        from,
        to: recipients.join(', '),
        replyTo: submission.businessEmail,
        subject: `${config.notificationSubject} - ${submission.fullName}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
            <div style="margin-bottom: 16px;">
              <span style="display: inline-block; padding: 4px 12px; background: rgba(217, 40, 124, 0.1); color: #d9287c; font-size: 11px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;">
                Inbound Lead
              </span>
            </div>
            <h2 style="color: #0f172a; margin: 0 0 8px; font-size: 20px; font-weight: 700;">New Inquiry: ${submission.fullName}</h2>
            <p style="color: #64748b; font-size: 13px; margin: 0 0 20px;">
              Submitted on ${new Date(submission.createdAt).toUTCString()}
            </p>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px;">
              ${fieldsListHtml}
            </table>
            <div style="padding: 12px 16px; background: #f8fafc; border-radius: 8px; font-size: 12px; color: #64748b;">
              Reply directly to this email to contact <strong>${submission.fullName}</strong> (${submission.businessEmail}).
            </div>
          </div>
        `,
      });

      this.logger.log(`Inquiry notification sent to ${recipients.join(', ')}`);
    } catch (err: any) {
      this.logger.warn(`Failed to dispatch inquiry notification email: ${err?.message || err}`);
    }
  }

  /**
   * Send automated reply to user if enabled and user provided an email.
   */
  async sendAutoReply(
    userEmail: string,
    userName: string,
    submittedFields: Record<string, any> = {}
  ): Promise<void> {
    try {
      if (!userEmail || !userEmail.includes('@')) return;

      const config = await this.getResolvedSmtpConfig();
      if (!config.sendAutoReply || !config.isConfigured) return;

      const { transporter, from } = await this.createTransporter();

      // Simple template interpolation: {{fullName}}, {{email}}, etc.
      let bodyText = config.autoReplyBody;
      for (const [k, v] of Object.entries({ fullName: userName, email: userEmail, ...submittedFields })) {
        if (typeof v === 'string' || typeof v === 'number') {
          bodyText = bodyText.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
        }
      }

      await transporter.sendMail({
        from,
        to: userEmail,
        replyTo: config.replyTo,
        subject: config.autoReplySubject,
        text: bodyText,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
            <div style="margin-bottom: 16px;">
              <span style="display: inline-block; padding: 4px 12px; background: rgba(217, 40, 124, 0.1); color: #d9287c; font-size: 11px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;">
                ${config.fromName}
              </span>
            </div>
            <h2 style="color: #0f172a; margin: 0 0 12px; font-size: 20px; font-weight: 700;">${config.autoReplySubject}</h2>
            <div style="color: #334155; font-size: 14px; line-height: 1.6; white-space: pre-line; margin-bottom: 24px;">
              ${bodyText}
            </div>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">
              This is an automated confirmation sent from ${config.fromName}.
            </p>
          </div>
        `,
      });

      this.logger.log(`Auto-reply sent to ${userEmail}`);
    } catch (err: any) {
      this.logger.warn(`Failed to dispatch auto-reply email: ${err?.message || err}`);
    }
  }
}
