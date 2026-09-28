import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface EmailTemplateDefinition {
  key: string;
  name: string;
  description: string;
  subject: string;
  variables: string[];
  htmlContent: string;
  isActive: boolean;
  updatedAt?: string;
}

export const DEFAULT_EMAIL_TEMPLATES: Record<string, EmailTemplateDefinition> = {
  booking_confirmed: {
    key: 'booking_confirmed',
    name: 'Discovery Call Confirmed (Client)',
    description: 'Dispatched to the prospective client immediately upon securing a calendar slot.',
    subject: 'Discovery Call Confirmed: {{fullName}} & Gypsym Advisory',
    variables: [
      'fullName',
      'businessEmail',
      'companyName',
      'date',
      'time',
      'duration',
      'bookingNumber',
      'serviceInterest',
      'meetingLink',
      'rescheduleLink',
    ],
    isActive: true,
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Discovery Call Confirmed</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f3ef; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f3ef; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px -4px rgba(0,0,0,0.04);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; border-bottom: 1px solid #f1f5f9; background: linear-gradient(180deg, #fafaf9 0%, #ffffff 100%);">
              <div style="display: inline-block; padding: 4px 12px; background: rgba(217, 40, 124, 0.08); color: #d9287c; font-size: 11px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
                Booking Confirmed • Ref #{{bookingNumber}}
              </div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.02em;">
                Your Discovery Session is Scheduled
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 28px 32px;">
              <p style="font-size: 15px; color: #334155; line-height: 1.6; margin: 0 0 16px;">
                Hello <strong>{{fullName}}</strong>,
              </p>
              <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px;">
                Thank you for scheduling a strategy consultation with Gypsym Technology. We have reserved your dedicated session with our solutions architecture and engineering advisory group for <strong>{{companyName}}</strong>.
              </p>

              <!-- Session Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid #edf2f7; width: 38%; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase;">
                    Date
                  </td>
                  <td style="padding: 14px 20px; border-bottom: 1px solid #edf2f7; font-size: 14px; font-weight: 700; color: #0f172a;">
                    {{date}}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid #edf2f7; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase;">
                    Time Slot
                  </td>
                  <td style="padding: 14px 20px; border-bottom: 1px solid #edf2f7; font-size: 14px; font-weight: 700; color: #0f172a;">
                    {{time}} ({{duration}})
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid #edf2f7; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase;">
                    Area of Interest
                  </td>
                  <td style="padding: 14px 20px; border-bottom: 1px solid #edf2f7; font-size: 13px; color: #334155; font-weight: 500;">
                    {{serviceInterest}}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 20px; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase;">
                    Meeting Access
                  </td>
                  <td style="padding: 14px 20px; font-size: 13px; color: #2563eb; font-weight: 600;">
                    <a href="{{meetingLink}}" style="color: #2563eb; text-decoration: underline;">Open Google Meet Room</a>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="{{meetingLink}}" style="display: inline-block; background-color: #d9287c; color: #ffffff; text-decoration: none; padding: 13px 28px; border-radius: 12px; font-size: 13px; font-weight: 700; box-shadow: 0 4px 12px rgba(217, 40, 124, 0.25);">
                      Join Video Meeting Room &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <div style="background-color: #fff1f2; border: 1px solid #ffe4e6; border-radius: 12px; padding: 14px 18px; font-size: 12px; color: #9f1239; line-height: 1.5; margin-bottom: 24px;">
                <strong>Session Guarantee:</strong> 100% technical and CRO architecture focused. Zero sales pressure. Need to reschedule or invite colleagues? Use the <a href="{{rescheduleLink}}" style="color: #9f1239; font-weight: 700; text-decoration: underline;">reschedule link</a> or reply directly to this email.
              </div>

              <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin: 0;">
                Warm regards,<br/>
                <strong style="color: #0f172a;">Gypsym Advisory Engineering Group</strong><br/>
                <span style="font-size: 12px; color: #94a3b8;">High-Volume Commerce Architecture & Headless Systems</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafaf9; border-top: 1px solid #f1f5f9; padding: 20px 32px; text-align: center;">
              <p style="font-size: 11px; color: #94a3b8; margin: 0 0 6px;">
                &copy; 2026 Gypsym Technology. Confidential & Privileged Communication.
              </p>
              <p style="font-size: 10px; color: #cbd5e1; margin: 0;">
                Reference: #{{bookingNumber}} &bull; Registered Client: {{businessEmail}}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  booking_admin_alert: {
    key: 'booking_admin_alert',
    name: 'Internal Booking Scheduled (Advisory Team)',
    description: 'Dispatched to the admin notification email list whenever a prospective client books a session.',
    subject: 'New Discovery Call Scheduled: {{fullName}} ({{companyName}})',
    variables: [
      'fullName',
      'businessEmail',
      'companyName',
      'phone',
      'websiteUrl',
      'serviceInterest',
      'date',
      'time',
      'bookingNumber',
      'projectScope',
      'adminDashboardUrl',
    ],
    isActive: true,
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>New Discovery Call Scheduled</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 28px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
          <tr>
            <td>
              <span style="display: inline-block; padding: 4px 10px; background: #ecfdf5; color: #059669; font-size: 11px; font-weight: 700; border-radius: 9999px; text-transform: uppercase;">
                Incoming Discovery Session
              </span>
              <h2 style="font-size: 20px; color: #0f172a; margin: 12px 0 6px; font-weight: 800;">{{fullName}} has booked a call</h2>
              <p style="font-size: 13px; color: #64748b; margin: 0 0 20px;">Reference: #{{bookingNumber}} &bull; Account: {{companyName}}</p>

              <table width="100%" style="font-size: 13px; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 10px 0; color: #64748b; width: 35%; border-bottom: 1px solid #f1f5f9;">Date & Time</td>
                  <td style="padding: 10px 0; color: #0f172a; font-weight: 700; border-bottom: 1px solid #f1f5f9;">{{date}} at {{time}}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #f1f5f9;">Company / Brand</td>
                  <td style="padding: 10px 0; color: #0f172a; font-weight: 600; border-bottom: 1px solid #f1f5f9;">{{companyName}}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #f1f5f9;">Contact Email</td>
                  <td style="padding: 10px 0; color: #2563eb; border-bottom: 1px solid #f1f5f9;"><a href="mailto:{{businessEmail}}" style="color: #2563eb;">{{businessEmail}}</a></td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #f1f5f9;">Phone / WhatsApp</td>
                  <td style="padding: 10px 0; color: #0f172a; border-bottom: 1px solid #f1f5f9;">{{phone}}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #f1f5f9;">Store / Website URL</td>
                  <td style="padding: 10px 0; color: #2563eb; border-bottom: 1px solid #f1f5f9;"><a href="{{websiteUrl}}" style="color: #2563eb;">{{websiteUrl}}</a></td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #f1f5f9;">Focus Track</td>
                  <td style="padding: 10px 0; color: #0f172a; font-weight: 600; border-bottom: 1px solid #f1f5f9;">{{serviceInterest}}</td>
                </tr>
              </table>

              <div style="background: #f8fafc; padding: 16px; border-radius: 10px; border: 1px solid #f1f5f9; margin-bottom: 24px;">
                <strong style="font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Project Scope & Client Notes:</strong>
                <p style="margin: 8px 0 0; font-size: 13px; color: #334155; line-height: 1.6;">{{projectScope}}</p>
              </div>

              <div style="display: flex; gap: 12px;">
                <a href="mailto:{{businessEmail}}?subject=Re:%20Discovery%20Call%20with%20Gypsym%20Technology" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 11px 22px; border-radius: 8px; font-size: 12px; font-weight: 600;">
                  Reply to Client Directly
                </a>
                <a href="{{adminDashboardUrl}}" style="display: inline-block; background: #f1f5f9; color: #334155; text-decoration: none; padding: 11px 22px; border-radius: 8px; font-size: 12px; font-weight: 600; border: 1px solid #e2e8f0; margin-left: 8px;">
                  View in Admin Portal
                </a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  inquiry_auto_reply: {
    key: 'inquiry_auto_reply',
    name: 'Contact Form Auto-Reply (Lead Confirmation)',
    description: 'Sent automatically to client upon submitting the enterprise contact form.',
    subject: 'Thank you for contacting Gypsym Technology: {{fullName}}',
    variables: ['fullName', 'businessEmail', 'companyName', 'serviceName', 'projectDescription', 'bookingCalendarUrl'],
    isActive: true,
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Thank You for Contacting Gypsym</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f3ef; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #ffffff; border-radius: 18px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 16px rgba(0,0,0,0.03);">
          <tr>
            <td>
              <div style="display: inline-block; padding: 4px 12px; background: rgba(217, 40, 124, 0.08); color: #d9287c; font-size: 11px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; margin-bottom: 12px;">
                Inquiry Received
              </div>
              <h1 style="font-size: 22px; color: #0f172a; margin: 0 0 16px; font-weight: 800;">
                We've received your message, {{fullName}}
              </h1>
              <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px;">
                Thank you for reaching out to Gypsym Technology. Our solutions architecture and engineering advisory team has received your project inquiry regarding <strong>{{serviceName}}</strong> for <strong>{{companyName}}</strong>.
              </p>
              <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px;">
                A senior solutions lead will inspect your notes and respond within <strong>&lt; 60 minutes</strong> during active business hours.
              </p>

              <div style="background: #fafaf9; border-left: 3px solid #d9287c; padding: 14px 18px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Your Submitted Scope:</span>
                <p style="margin: 6px 0 0; font-size: 13px; color: #334155; line-height: 1.5; font-style: italic;">
                  "{{projectDescription}}"
                </p>
              </div>

              <div style="background: #eff6ff; border: 1px solid #dbeafe; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                <h4 style="margin: 0 0 6px; font-size: 13px; font-weight: 700; color: #1e40af;">Fast-Track With a Live Strategy Call</h4>
                <p style="margin: 0 0 12px; font-size: 12px; color: #3b82f6; line-height: 1.5;">
                  If your project timeline is urgent, you can reserve an immediate technical review session on our calendar right away.
                </p>
                <a href="{{bookingCalendarUrl}}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 9px 18px; border-radius: 8px; font-size: 12px; font-weight: 700;">
                  Open Advisory Calendar &rarr;
                </a>
              </div>

              <p style="font-size: 13px; color: #0f172a; font-weight: 600; margin: 0;">
                Best regards,<br/>
                The Gypsym Technology Advisory Team
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  inquiry_admin_alert: {
    key: 'inquiry_admin_alert',
    name: 'Inbound Lead Alert (Advisory Team)',
    description: 'Dispatched to team email recipients upon contact form submission.',
    subject: 'New Enterprise Lead: {{fullName}} - {{serviceName}}',
    variables: [
      'fullName',
      'businessEmail',
      'phone',
      'companyName',
      'serviceName',
      'projectDescription',
      'submittedFieldsTable',
      'adminDashboardUrl',
      'receivedAt',
    ],
    isActive: true,
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Inbound Lead Notification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 24px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 16px rgba(0,0,0,0.03);">
          <tr>
            <td>
              <span style="display: inline-block; padding: 4px 10px; background: rgba(217, 40, 124, 0.1); color: #d9287c; font-size: 11px; font-weight: 700; border-radius: 9999px; text-transform: uppercase;">
                Inbound Lead Alert
              </span>
              <h2 style="font-size: 20px; color: #0f172a; margin: 12px 0 6px; font-weight: 800;">{{fullName}} from {{companyName}}</h2>
              <p style="font-size: 13px; color: #64748b; margin: 0 0 20px;">Requested Track: <strong>{{serviceName}}</strong> &bull; Received: {{receivedAt}}</p>

              <table width="100%" style="font-size: 13px; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 10px 0; color: #64748b; width: 35%; border-bottom: 1px solid #f1f5f9;">Business Email</td>
                  <td style="padding: 10px 0; color: #2563eb; border-bottom: 1px solid #f1f5f9;"><a href="mailto:{{businessEmail}}" style="color: #2563eb;">{{businessEmail}}</a></td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #f1f5f9;">Phone Number</td>
                  <td style="padding: 10px 0; color: #0f172a; border-bottom: 1px solid #f1f5f9;">{{phone}}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #f1f5f9;">Company Name</td>
                  <td style="padding: 10px 0; color: #0f172a; font-weight: 600; border-bottom: 1px solid #f1f5f9;">{{companyName}}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #64748b; border-bottom: 1px solid #f1f5f9;">Service Track</td>
                  <td style="padding: 10px 0; color: #0f172a; font-weight: 600; border-bottom: 1px solid #f1f5f9;">{{serviceName}}</td>
                </tr>
              </table>

              <div style="background: #f8fafc; padding: 14px 18px; border-radius: 8px; border: 1px solid #f1f5f9; margin-bottom: 20px;">
                <strong style="font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Inquiry Details:</strong>
                <p style="margin: 6px 0 0; font-size: 13px; color: #334155; line-height: 1.5;">{{projectDescription}}</p>
              </div>

              {{submittedFieldsTable}}

              <div style="margin-top: 24px; display: flex; gap: 12px;">
                <a href="mailto:{{businessEmail}}?subject=Re:%20Gypsym%20Technology%20Inquiry%20-%20{{fullName}}" style="display: inline-block; background: #d9287c; color: #ffffff; text-decoration: none; padding: 11px 22px; border-radius: 8px; font-size: 12px; font-weight: 700;">
                  Reply to {{fullName}}
                </a>
                <a href="{{adminDashboardUrl}}" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 11px 22px; border-radius: 8px; font-size: 12px; font-weight: 700; margin-left: 8px;">
                  Open in Submissions CRM
                </a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  booking_cancelled: {
    key: 'booking_cancelled',
    name: 'Discovery Call Cancelled (Client & Team)',
    description: 'Dispatched when a scheduled consultation or strategy session is cancelled.',
    subject: 'Discovery Call Cancelled: {{fullName}} (Ref: #{{bookingNumber}})',
    variables: [
      'fullName',
      'businessEmail',
      'companyName',
      'bookingNumber',
      'date',
      'time',
      'cancellationReason',
      'rescheduleLink',
    ],
    isActive: true,
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Discovery Session Cancelled</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 16px rgba(0,0,0,0.03);">
          <tr>
            <td>
              <div style="display: inline-block; padding: 4px 12px; background: #fee2e2; color: #dc2626; font-size: 11px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; margin-bottom: 12px;">
                Session Cancelled • Ref #{{bookingNumber}}
              </div>
              <h2 style="font-size: 20px; color: #0f172a; margin: 0 0 14px; font-weight: 800;">
                Discovery Call Cancellation Notice
              </h2>
              <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px;">
                Hello <strong>{{fullName}}</strong>,
              </p>
              <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px;">
                This confirms that your upcoming discovery session scheduled for <strong>{{date}} at {{time}}</strong> for <strong>{{companyName}}</strong> has been cancelled.
              </p>

              <div style="background: #fafaf9; border-left: 3px solid #64748b; padding: 14px 18px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Cancellation Details:</span>
                <p style="margin: 6px 0 0; font-size: 13px; color: #334155; line-height: 1.5;">
                  {{cancellationReason}}
                </p>
              </div>

              <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 20px;">
                If you would like to reschedule at a more convenient time, our calendar is always open:
              </p>

              <a href="{{rescheduleLink}}" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 11px 22px; border-radius: 8px; font-size: 12px; font-weight: 700;">
                Reschedule Session &rarr;
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  admin_system_alert: {
    key: 'admin_system_alert',
    name: 'Administrative System & Security Alert',
    description: 'Dispatched to all admin notification recipients for security, uptime, or system events.',
    subject: '[{{alertLevel}}] {{alertTitle}} - Gypsym Enterprise Alert',
    variables: [
      'alertTitle',
      'alertLevel',
      'alertMessage',
      'sourceDetails',
      'actionUrl',
      'actionLabel',
      'timestamp',
    ],
    isActive: true,
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Gypsym Enterprise System Alert</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 28px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 16px rgba(0,0,0,0.03);">
          <tr>
            <td>
              <div style="display: inline-block; padding: 4px 12px; background: rgba(37, 99, 235, 0.1); color: #2563eb; font-size: 11px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; margin-bottom: 12px;">
                System Level: {{alertLevel}}
              </div>
              <h2 style="font-size: 20px; color: #0f172a; margin: 0 0 10px; font-weight: 800;">
                {{alertTitle}}
              </h2>
              <p style="font-size: 12px; color: #64748b; margin: 0 0 18px;">
                Dispatched to Admin Notification Recipients &bull; {{timestamp}}
              </p>

              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin-bottom: 22px;">
                <p style="font-size: 13px; color: #334155; line-height: 1.6; margin: 0;">
                  {{alertMessage}}
                </p>
                <div style="margin-top: 12px; font-size: 11px; color: #94a3b8;">
                  Source / Target: {{sourceDetails}}
                </div>
              </div>

              <a href="{{actionUrl}}" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 11px 22px; border-radius: 8px; font-size: 12px; font-weight: 700;">
                {{actionLabel}}
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
};

@Injectable()
export class EmailTemplatesService implements OnModuleInit {
  private readonly logger = new Logger(EmailTemplatesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * On application bootstrap, automatically ensure templates exist in DB.
   */
  async onModuleInit() {
    await this.seedTemplatesIfEmpty();
  }

  /**
   * Ensure templates exist in DB under site_settings (key: 'email_templates').
   * If not present, seeds all default templates. If present, backfills any missing keys.
   */
  async seedTemplatesIfEmpty(): Promise<void> {
    try {
      const setting = await this.prisma.siteSetting
        .findUnique({ where: { key: 'email_templates' } })
        .catch(() => null);

      if (!setting || !setting.value || Object.keys(setting.value as any).length === 0) {
        await this.prisma.siteSetting.upsert({
          where: { key: 'email_templates' },
          create: {
            key: 'email_templates',
            category: 'email',
            value: DEFAULT_EMAIL_TEMPLATES as any,
            isPublic: false,
          },
          update: {
            value: DEFAULT_EMAIL_TEMPLATES as any,
          },
        });
        this.logger.log('Successfully seeded default email templates into database.');
      } else {
        const current = (setting.value as unknown as Record<string, EmailTemplateDefinition>) || {};
        let hasMissing = false;
        const merged: Record<string, EmailTemplateDefinition> = { ...DEFAULT_EMAIL_TEMPLATES };

        for (const [k, v] of Object.entries(current)) {
          merged[k] = { ...merged[k], ...v };
        }

        for (const k of Object.keys(DEFAULT_EMAIL_TEMPLATES)) {
          if (!current[k]) {
            hasMissing = true;
            break;
          }
        }

        if (hasMissing) {
          await this.prisma.siteSetting.update({
            where: { key: 'email_templates' },
            data: { value: merged as any },
          });
          this.logger.log('Backfilled missing default email templates into database.');
        }
      }
    } catch (err: any) {
      this.logger.error(`Error during template auto-seeding: ${err?.message || err}`);
    }
  }

  /**
   * Explicitly seed or reset templates in the database.
   */
  async seedTemplates(force = false): Promise<Record<string, EmailTemplateDefinition>> {
    if (force) {
      await this.prisma.siteSetting.upsert({
        where: { key: 'email_templates' },
        create: {
          key: 'email_templates',
          category: 'email',
          value: DEFAULT_EMAIL_TEMPLATES as any,
          isPublic: false,
        },
        update: {
          value: DEFAULT_EMAIL_TEMPLATES as any,
        },
      });
      this.logger.log('Force re-seeded all email templates to default values.');
      return DEFAULT_EMAIL_TEMPLATES;
    }

    await this.seedTemplatesIfEmpty();
    return this.getTemplates();
  }

  /**
   * Fetch all email templates. Loads from site_settings (key: 'email_templates')
   * with fallback to DEFAULT_EMAIL_TEMPLATES.
   */
  async getTemplates(): Promise<Record<string, EmailTemplateDefinition>> {
    const setting = await this.prisma.siteSetting
      .findUnique({ where: { key: 'email_templates' } })
      .catch(() => null);

    const saved = (setting?.value as unknown as Record<string, EmailTemplateDefinition>) || {};

    // Merge saved on top of default so new templates are always represented
    const merged: Record<string, EmailTemplateDefinition> = { ...DEFAULT_EMAIL_TEMPLATES };
    for (const [key, tpl] of Object.entries(saved)) {
      if (merged[key]) {
        merged[key] = { ...merged[key], ...tpl };
      } else {
        merged[key] = tpl;
      }
    }

    return merged;
  }

  /**
   * Get single template by key.
   */
  async getTemplate(key: string): Promise<EmailTemplateDefinition> {
    const all = await this.getTemplates();
    const tpl = all[key];
    if (!tpl) {
      throw new NotFoundException(`Email template '${key}' not found.`);
    }
    return tpl;
  }

  /**
   * Update a template's HTML content, subject, or active state.
   */
  async updateTemplate(
    key: string,
    payload: { subject?: string; htmlContent?: string; isActive?: boolean }
  ): Promise<EmailTemplateDefinition> {
    const all = await this.getTemplates();
    const existing = all[key] || DEFAULT_EMAIL_TEMPLATES[key];

    if (!existing) {
      throw new NotFoundException(`Email template '${key}' does not exist.`);
    }

    const updated: EmailTemplateDefinition = {
      ...existing,
      subject: payload.subject !== undefined ? payload.subject : existing.subject,
      htmlContent: payload.htmlContent !== undefined ? payload.htmlContent : existing.htmlContent,
      isActive: payload.isActive !== undefined ? payload.isActive : existing.isActive,
      updatedAt: new Date().toISOString(),
    };

    all[key] = updated;

    await this.prisma.siteSetting.upsert({
      where: { key: 'email_templates' },
      update: { value: all as any },
      create: {
        category: 'email',
        key: 'email_templates',
        value: all as any,
        isPublic: false,
      },
    });
    this.logger.log(`Email template '${key}' updated successfully.`);
    return updated;
  }

  /**
   * Render dynamic HTML and subject by replacing {{variable}} tokens.
   */
  render(
    template: EmailTemplateDefinition,
    data: Record<string, any>
  ): { subject: string; html: string } {
    let html = template.htmlContent;
    let subject = template.subject;

    for (const [k, v] of Object.entries(data)) {
      const displayVal = v === undefined || v === null ? '' : String(v);
      const tokenRegex = new RegExp(`{{${k}}}`, 'g');
      html = html.replace(tokenRegex, displayVal);
      subject = subject.replace(tokenRegex, displayVal);
    }

    // Clean any un-substituted tokens
    html = html.replace(/{{[a-zA-Z0-9_-]+}}/g, '');
    subject = subject.replace(/{{[a-zA-Z0-9_-]+}}/g, '');

    return { subject, html };
  }
}

