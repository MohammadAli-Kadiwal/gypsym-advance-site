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
  adminNotificationRecipients?: string[];
  notificationsEnabled?: boolean;
  notificationRecipients?: string[];
  notificationSubject?: string;
  bookingNotificationsEnabled?: boolean;
  bookingNotificationRecipients?: string[];
  bookingNotificationSubject?: string;
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
  adminNotificationRecipients: string[];
  notificationsEnabled: boolean;
  notificationRecipients: string[];
  notificationSubject: string;
  bookingNotificationsEnabled: boolean;
  bookingNotificationRecipients: string[];
  bookingNotificationSubject: string;
  sendAutoReply: boolean;
  autoReplySubject: string;
  autoReplyBody: string;
}

import { EmailTemplatesService } from './email-templates.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly templatesService: EmailTemplatesService,
  ) {}

  /**
   * Generic mail dispatch using configured SMTP transport.
   */
  async sendGenericEmail(options: {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    replyTo?: string;
  }): Promise<{ success: boolean; messageId?: string }> {
    const config = await this.getResolvedSmtpConfig();
    if (!config.isConfigured) {
      this.logger.warn(`SMTP is not configured. Suppressing email to: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
      return { success: false };
    }

    const { transporter, from } = await this.createTransporter();
    const info = await transporter.sendMail({
      from,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      replyTo: options.replyTo || config.replyTo,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    return { success: true, messageId: info.messageId };
  }

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
    adminNotificationRecipients: string[];
    notificationsEnabled: boolean;
    notificationRecipients: string[];
    notificationSubject: string;
    bookingNotificationsEnabled: boolean;
    bookingNotificationRecipients: string[];
    bookingNotificationSubject: string;
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

    // Master Admin Notification Recipients (multiple admin notification list)
    const adminNotificationRecipients: string[] = Array.isArray(dbVal.adminNotificationRecipients) && dbVal.adminNotificationRecipients.length > 0
      ? dbVal.adminNotificationRecipients.map((s: string) => String(s).trim()).filter(Boolean)
      : typeof dbVal.adminNotificationRecipients === 'string' && dbVal.adminNotificationRecipients.trim()
      ? dbVal.adminNotificationRecipients.split(',').map((s: string) => s.trim()).filter(Boolean)
      : Array.isArray(dbVal.notificationRecipients) && dbVal.notificationRecipients.length > 0
      ? dbVal.notificationRecipients.map((s: string) => String(s).trim()).filter(Boolean)
      : [fromEmail];

    const notificationsEnabled = dbVal.notificationsEnabled !== false;
    const notificationRecipients: string[] = Array.isArray(dbVal.notificationRecipients) && dbVal.notificationRecipients.length > 0
      ? dbVal.notificationRecipients.map((s: string) => String(s).trim()).filter(Boolean)
      : typeof dbVal.notificationRecipients === 'string' && dbVal.notificationRecipients.trim()
      ? dbVal.notificationRecipients.split(',').map((s: string) => s.trim()).filter(Boolean)
      : adminNotificationRecipients;
    const notificationSubject = dbVal.notificationSubject || 'New Enterprise Contact Inquiry Received';

    const bookingNotificationsEnabled = dbVal.bookingNotificationsEnabled !== false;
    const bookingNotificationRecipients: string[] = Array.isArray(dbVal.bookingNotificationRecipients) && dbVal.bookingNotificationRecipients.length > 0
      ? dbVal.bookingNotificationRecipients.map((s: string) => String(s).trim()).filter(Boolean)
      : typeof dbVal.bookingNotificationRecipients === 'string' && dbVal.bookingNotificationRecipients.trim()
      ? dbVal.bookingNotificationRecipients.split(',').map((s: string) => s.trim()).filter(Boolean)
      : adminNotificationRecipients;
    const bookingNotificationSubject = dbVal.bookingNotificationSubject || 'New Discovery Call Scheduled';

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
      adminNotificationRecipients,
      notificationsEnabled,
      notificationRecipients,
      notificationSubject,
      bookingNotificationsEnabled,
      bookingNotificationRecipients,
      bookingNotificationSubject,
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
      adminNotificationRecipients: resolved.adminNotificationRecipients,
      notificationsEnabled: resolved.notificationsEnabled,
      notificationRecipients: resolved.notificationRecipients,
      notificationSubject: resolved.notificationSubject,
      bookingNotificationsEnabled: resolved.bookingNotificationsEnabled,
      bookingNotificationRecipients: resolved.bookingNotificationRecipients,
      bookingNotificationSubject: resolved.bookingNotificationSubject,
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

    const adminNotificationRecipients = dto.adminNotificationRecipients && dto.adminNotificationRecipients.length > 0
      ? dto.adminNotificationRecipients.map((s) => s.trim()).filter(Boolean)
      : dto.notificationRecipients || [dto.fromEmail || 'advisory@gypsym.com'];

    const payload = {
      host: dto.host?.trim() || '',
      port: dto.port || 587,
      security: dto.security || 'starttls',
      user: dto.user?.trim() || '',
      password,
      fromName: dto.fromName?.trim() || 'Gypsym Technology',
      fromEmail: dto.fromEmail?.trim() || 'hello@gypsym.com',
      replyTo: dto.replyTo?.trim() || dto.fromEmail?.trim() || 'hello@gypsym.com',
      adminNotificationRecipients,
      notificationsEnabled: dto.notificationsEnabled !== false,
      notificationRecipients: dto.notificationRecipients || adminNotificationRecipients,
      notificationSubject: dto.notificationSubject || 'New Enterprise Contact Inquiry Received',
      bookingNotificationsEnabled: dto.bookingNotificationsEnabled !== false,
      bookingNotificationRecipients: dto.bookingNotificationRecipients || adminNotificationRecipients,
      bookingNotificationSubject: dto.bookingNotificationSubject || 'New Discovery Call Scheduled',
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
   * Send Inbound Contact Notification to Admin using dynamic inquiry_admin_alert template.
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
          : config.notificationRecipients && config.notificationRecipients.length > 0
          ? config.notificationRecipients
          : config.adminNotificationRecipients;

      if (!recipients || recipients.length === 0) {
        return;
      }

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

      let subject = `${config.notificationSubject} - ${submission.fullName}`;
      let html = '';

      try {
        const tpl = await this.templatesService.getTemplate('inquiry_admin_alert');
        if (tpl && tpl.isActive) {
          const rendered = this.templatesService.render(tpl, {
            fullName: submission.fullName,
            businessEmail: submission.businessEmail,
            phone: submission.phone || 'Not provided',
            companyName: submission.companyName || 'Not specified',
            serviceName: submission.serviceName || 'General Inquiry',
            projectDescription: submission.projectDescription || 'No details provided.',
            submittedFieldsTable: fieldsListHtml ? `<table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0;">${fieldsListHtml}</table>` : '',
            adminDashboardUrl: process.env.ADMIN_URL
              ? `${process.env.ADMIN_URL.replace(/\/+$/, '')}/content/submissions`
              : (process.env.NODE_ENV === 'production' ? 'https://admin.gypsym.com/content/submissions' : 'http://localhost:3001/content/submissions'),
            receivedAt: new Date(submission.createdAt).toUTCString(),
          });
          subject = rendered.subject;
          html = rendered.html;
        }
      } catch (tplErr) {
        this.logger.debug(`Using fallback template for inquiry notification: ${tplErr}`);
      }

      if (!html) {
        html = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
            <h2 style="color: #0f172a; margin: 0 0 8px; font-size: 20px; font-weight: 700;">New Inquiry: ${submission.fullName}</h2>
            <p style="color: #64748b; font-size: 13px; margin: 0 0 20px;">Submitted on ${new Date(submission.createdAt).toUTCString()}</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px;">${fieldsListHtml}</table>
            <div style="padding: 12px 16px; background: #f8fafc; border-radius: 8px; font-size: 12px; color: #64748b;">
              Reply directly to this email to contact <strong>${submission.fullName}</strong> (${submission.businessEmail}).
            </div>
          </div>
        `;
      }

      await this.sendGenericEmail({
        to: recipients,
        replyTo: submission.businessEmail,
        subject,
        html,
      });

      this.logger.log(`Inquiry notification sent to ${recipients.join(', ')}`);
    } catch (err: any) {
      this.logger.warn(`Failed to dispatch inquiry notification email: ${err?.message || err}`);
    }
  }

  /**
   * Send automated reply to lead using dynamic inquiry_auto_reply template.
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

      let subject = config.autoReplySubject || 'Thank you for contacting Gypsym Technology';
      let html = '';

      try {
        const tpl = await this.templatesService.getTemplate('inquiry_auto_reply');
        if (tpl && tpl.isActive) {
          const rendered = this.templatesService.render(tpl, {
            fullName: userName,
            businessEmail: userEmail,
            companyName: submittedFields.companyName || 'Your Company',
            serviceName: submittedFields.serviceName || submittedFields.service || 'Solutions Architecture',
            projectDescription: submittedFields.projectDescription || submittedFields.message || 'Consultation request',
            bookingCalendarUrl: process.env.WEB_URL
              ? `${process.env.WEB_URL.replace(/\/+$/, '')}/booking/calendar`
              : (process.env.NODE_ENV === 'production' ? 'https://gypsym.com/booking/calendar' : 'http://localhost:3000/booking/calendar'),
          });
          subject = rendered.subject;
          html = rendered.html;
        }
      } catch (tplErr) {
        this.logger.debug(`Using fallback template for auto-reply: ${tplErr}`);
      }

      if (!html) {
        let bodyText = config.autoReplyBody;
        for (const [k, v] of Object.entries({ fullName: userName, email: userEmail, ...submittedFields })) {
          if (typeof v === 'string' || typeof v === 'number') {
            bodyText = bodyText.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
          }
        }
        html = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
            <h2 style="color: #0f172a; margin: 0 0 12px; font-size: 20px; font-weight: 700;">${subject}</h2>
            <div style="color: #334155; font-size: 14px; line-height: 1.6; white-space: pre-line; margin-bottom: 24px;">${bodyText}</div>
          </div>
        `;
      }

      await this.sendGenericEmail({
        to: userEmail,
        replyTo: config.replyTo,
        subject,
        html,
      });

      this.logger.log(`Auto-reply sent to ${userEmail}`);
    } catch (err: any) {
      this.logger.warn(`Failed to dispatch auto-reply email: ${err?.message || err}`);
    }
  }

  /**
   * Send booking confirmation to client and alert to internal team.
   */
  async sendBookingConfirmation(booking: {
    fullName: string;
    email: string;
    bookingNumber: string;
    scheduledAt: Date;
    durationMinutes: number;
    phone?: string | null;
    companyName?: string | null;
    websiteUrl?: string | null;
    serviceInterest?: string | null;
    notes?: string | null;
    meetingUrl?: string | null;
  }): Promise<void> {
    try {
      const config = await this.getResolvedSmtpConfig();
      if (!config.isConfigured) return;

      const dateStr = new Date(booking.scheduledAt).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      const timeStr = new Date(booking.scheduledAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const meetingLink = booking.meetingUrl || 'https://meet.google.com/gypsym-advisory-session';
      const rescheduleLink = process.env.WEB_URL
        ? `${process.env.WEB_URL.replace(/\/+$/, '')}/booking/calendar`
        : (process.env.NODE_ENV === 'production' ? 'https://gypsym.com/booking/calendar' : 'http://localhost:3000/booking/calendar');
      const adminDashboardUrl = process.env.ADMIN_URL
        ? `${process.env.ADMIN_URL.replace(/\/+$/, '')}/content/submissions`
        : (process.env.NODE_ENV === 'production' ? 'https://admin.gypsym.com/content/submissions' : 'http://localhost:3001/content/submissions');

      // 1. Send confirmation to client
      try {
        const clientTpl = await this.templatesService.getTemplate('booking_confirmed');
        if (clientTpl && clientTpl.isActive) {
          const rendered = this.templatesService.render(clientTpl, {
            fullName: booking.fullName,
            businessEmail: booking.email,
            companyName: booking.companyName || 'Your Organization',
            date: dateStr,
            time: timeStr,
            duration: `${booking.durationMinutes}m Strategy Session`,
            bookingNumber: booking.bookingNumber,
            serviceInterest: booking.serviceInterest || 'Enterprise Architecture',
            meetingLink,
            rescheduleLink,
          });

          await this.sendGenericEmail({
            to: booking.email,
            subject: rendered.subject,
            html: rendered.html,
          });
          this.logger.log(`Booking confirmation sent to client ${booking.email}`);
        }
      } catch (err: any) {
        this.logger.warn(`Failed to send client booking confirmation: ${err?.message}`);
      }

      // 2. Send internal alert to team (multi-account recipients supported)
      try {
        const recipients =
          config.bookingNotificationRecipients && config.bookingNotificationRecipients.length > 0
            ? config.bookingNotificationRecipients
            : config.adminNotificationRecipients;

        if (config.bookingNotificationsEnabled && recipients && recipients.length > 0) {
          let subject = `${config.bookingNotificationSubject || 'New Discovery Call Scheduled'} - ${booking.fullName}`;
          let html = '';

          try {
            const adminTpl = await this.templatesService.getTemplate('booking_admin_alert');
            if (adminTpl && adminTpl.isActive) {
              const rendered = this.templatesService.render(adminTpl, {
                fullName: booking.fullName,
                businessEmail: booking.email,
                companyName: booking.companyName || 'Not specified',
                phone: booking.phone || 'Not provided',
                websiteUrl: booking.websiteUrl || 'Not provided',
                serviceInterest: booking.serviceInterest || 'General Strategy',
                date: dateStr,
                time: timeStr,
                bookingNumber: booking.bookingNumber,
                projectScope: booking.notes || 'No preliminary notes provided.',
                adminDashboardUrl,
              });
              subject = rendered.subject;
              html = rendered.html;
            }
          } catch (tplErr) {
            this.logger.debug(`Using fallback template for booking alert: ${tplErr}`);
          }

          if (!html) {
            html = `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
                <div style="margin-bottom: 16px;">
                  <span style="display: inline-block; padding: 4px 12px; background: rgba(59, 130, 246, 0.1); color: #2563eb; font-size: 11px; font-weight: 700; border-radius: 9999px; text-transform: uppercase;">
                    Client Booking Alert
                  </span>
                </div>
                <h2 style="color: #0f172a; margin: 0 0 8px; font-size: 20px; font-weight: 700;">New Discovery Call Scheduled</h2>
                <p style="color: #64748b; font-size: 13px; margin: 0 0 16px;">Booking Number: <strong>${booking.bookingNumber}</strong></p>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
                  <tr><td style="padding: 8px 0; color: #64748b;">Client Name:</td><td style="padding: 8px 0; font-weight: 600; color: #0f172a;">${booking.fullName}</td></tr>
                  <tr><td style="padding: 8px 0; color: #64748b;">Client Email:</td><td style="padding: 8px 0; font-weight: 600; color: #0f172a;">${booking.email}</td></tr>
                  <tr><td style="padding: 8px 0; color: #64748b;">Phone:</td><td style="padding: 8px 0; color: #0f172a;">${booking.phone || 'N/A'}</td></tr>
                  <tr><td style="padding: 8px 0; color: #64748b;">Company:</td><td style="padding: 8px 0; color: #0f172a;">${booking.companyName || 'N/A'}</td></tr>
                  <tr><td style="padding: 8px 0; color: #64748b;">Scheduled Time:</td><td style="padding: 8px 0; font-weight: 600; color: #2563eb;">${dateStr} at ${timeStr}</td></tr>
                  <tr><td style="padding: 8px 0; color: #64748b;">Notes:</td><td style="padding: 8px 0; color: #0f172a;">${booking.notes || 'None'}</td></tr>
                </table>
              </div>
            `;
          }

          await this.sendGenericEmail({
            to: recipients,
            replyTo: booking.email,
            subject,
            html,
          });
          this.logger.log(`Booking admin alert sent to ${recipients.join(', ')}`);
        }
      } catch (err: any) {
        this.logger.warn(`Failed to send admin booking alert: ${err?.message}`);
      }
    } catch (err: any) {
      this.logger.warn(`Error in sendBookingConfirmation: ${err?.message}`);
    }
  }

  /**
   * Send System or Security alert to all configured Admin Notification Recipients.
   */
  async sendAdminSystemAlert(alert: {
    title: string;
    level?: 'info' | 'warning' | 'critical';
    message: string;
    actionUrl?: string;
    actionLabel?: string;
    sourceDetails?: string;
  }): Promise<void> {
    try {
      const config = await this.getResolvedSmtpConfig();
      if (!config.isConfigured || !config.adminNotificationRecipients.length) return;

      const level = alert.level || 'info';
      const levelColors: Record<string, string> = {
        info: '#2563eb',
        warning: '#d97706',
        critical: '#dc2626',
      };
      const badgeColor = levelColors[level] || '#2563eb';

      let subject = `[${level.toUpperCase()}] ${alert.title} - Gypsym Enterprise`;
      let html = '';

      try {
        const tpl = await this.templatesService.getTemplate('admin_system_alert');
        if (tpl && tpl.isActive) {
          const rendered = this.templatesService.render(tpl, {
            alertTitle: alert.title,
            alertLevel: level.toUpperCase(),
            alertMessage: alert.message,
            sourceDetails: alert.sourceDetails || 'Gypsym Technology Cloud Platform',
            actionUrl: alert.actionUrl || process.env.ADMIN_URL || (process.env.NODE_ENV === 'production' ? 'https://admin.gypsym.com' : 'http://localhost:3001'),
            actionLabel: alert.actionLabel || 'Access Workstation Console',
            timestamp: new Date().toUTCString(),
          });
          subject = rendered.subject;
          html = rendered.html;
        }
      } catch {
        // Fallback below
      }

      if (!html) {
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="display: inline-block; padding: 4px 10px; background: ${badgeColor}15; color: ${badgeColor}; font-size: 11px; font-weight: 700; border-radius: 9999px; text-transform: uppercase;">
              ${level}
            </div>
            <h2 style="color: #0f172a; margin: 12px 0 8px;">${alert.title}</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">${alert.message}</p>
            ${alert.actionUrl ? `<p style="margin-top: 20px;"><a href="${alert.actionUrl}" style="background: #0f172a; color: #fff; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600;">${alert.actionLabel || 'View Details'}</a></p>` : ''}
          </div>
        `;
      }

      await this.sendGenericEmail({
        to: config.adminNotificationRecipients,
        subject,
        html,
      });

      this.logger.log(`Admin system alert sent to ${config.adminNotificationRecipients.join(', ')}`);
    } catch (err: any) {
      this.logger.warn(`Failed to dispatch admin system alert: ${err?.message || err}`);
    }
  }
}
