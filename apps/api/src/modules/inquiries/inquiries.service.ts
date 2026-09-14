import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from '../email/email.service';
import { InquiryStatus } from '@gypsym/database';

export interface SubmitInquiryDto {
  formId?: string;
  source?: string;
  data: Record<string, any>;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  ipAddress?: string;
}

export interface InquiryQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

@Injectable()
export class InquiriesService {
  private readonly logger = new Logger(InquiriesService.name);

  // In-memory rate limiting map: ip -> timestamps[]
  private readonly rateLimitMap = new Map<string, number[]>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Rate limiting check: Max 5 submissions per 10 minutes per IP.
   */
  private checkRateLimit(ip: string): void {
    if (!ip) return;
    const now = Date.now();
    const windowMs = 10 * 60 * 1000;
    const maxRequests = 5;

    const timestamps = (this.rateLimitMap.get(ip) || []).filter((t) => now - t < windowMs);

    if (timestamps.length >= maxRequests) {
      this.logger.warn(`Rate limit exceeded for IP: ${ip}`);
      throw new BadRequestException('Too many submission attempts. Please try again later.');
    }

    timestamps.push(now);
    this.rateLimitMap.set(ip, timestamps);
  }

  /**
   * Public submission of a contact inquiry.
   */
  async submitInquiry(dto: SubmitInquiryDto, ipAddress?: string): Promise<any> {
    const clientIp = ipAddress || dto.ipAddress || 'unknown';
    this.checkRateLimit(clientIp);

    const rawData =
      dto.data && typeof dto.data === 'object' && Object.keys(dto.data).length > 0
        ? dto.data
        : (dto as any).submittedData && typeof (dto as any).submittedData === 'object' && Object.keys((dto as any).submittedData).length > 0
        ? (dto as any).submittedData
        : (dto as any);

    if (!rawData || typeof rawData !== 'object' || Object.keys(rawData).length === 0) {
      throw new BadRequestException('Form submission data cannot be empty.');
    }

    // Extract core identity fields flexibly
    const fullName = String(
      rawData.fullName || rawData.name || rawData.firstName || 'Inquiry Contact'
    ).trim().slice(0, 120);

    const businessEmail = String(
      rawData.email || rawData.businessEmail || rawData.workEmail || ''
    ).trim().toLowerCase();

    if (!businessEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessEmail)) {
      throw new BadRequestException('A valid email address is required.');
    }

    const phone = rawData.phone || rawData.tel ? String(rawData.phone || rawData.tel).trim().slice(0, 40) : null;
    const companyName = rawData.company || rawData.companyName || rawData.organization
      ? String(rawData.company || rawData.companyName || rawData.organization).trim().slice(0, 150)
      : null;
    const projectDescription = rawData.message || rawData.projectDescription || rawData.description
      ? String(rawData.message || rawData.projectDescription || rawData.description).trim()
      : null;
    const serviceId = rawData.serviceId && typeof rawData.serviceId === 'string' ? rawData.serviceId : null;

    // Persist to database
    const submission = await this.prisma.contactSubmission.create({
      data: {
        fullName,
        businessEmail,
        phone,
        companyName,
        projectDescription,
        serviceId,
        formId: dto.formId || 'homepage-contact',
        source: dto.source || 'Homepage Contact Form',
        submittedData: rawData,
        status: InquiryStatus.NEW,
        utmSource: dto.utmSource ? String(dto.utmSource).slice(0, 100) : null,
        utmMedium: dto.utmMedium ? String(dto.utmMedium).slice(0, 100) : null,
        utmCampaign: dto.utmCampaign ? String(dto.utmCampaign).slice(0, 100) : null,
        ipAddress: clientIp,
      },
    });

    this.logger.log(`New contact submission created with ID: ${submission.id}`);

    // Trigger async email notifications (do not await to avoid blocking user response)
    Promise.all([
      this.emailService.sendInquiryNotification({
        fullName: submission.fullName,
        businessEmail: submission.businessEmail,
        phone: submission.phone,
        companyName: submission.companyName,
        projectDescription: submission.projectDescription,
        submittedData: rawData,
        createdAt: submission.createdAt,
      }),
      this.emailService.sendAutoReply(submission.businessEmail, submission.fullName, rawData),
    ]).catch((err) => {
      this.logger.error(`Error in async email dispatch: ${err?.message || err}`);
    });

    return {
      success: true,
      id: submission.id,
      message: 'Inquiry submitted successfully.',
    };
  }

  /**
   * Admin: List all contact submissions with pagination, search, and status filter.
   */
  async getInquiries(query: InquiryQueryDto): Promise<any> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status && query.status !== 'ALL') {
      where.status = query.status as InquiryStatus;
    }

    if (query.search && query.search.trim()) {
      const s = query.search.trim();
      where.OR = [
        { fullName: { contains: s, mode: 'insensitive' } },
        { businessEmail: { contains: s, mode: 'insensitive' } },
        { companyName: { contains: s, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.contactSubmission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          service: { select: { id: true, title: true } },
          assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      this.prisma.contactSubmission.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Admin: Get single contact submission detail.
   */
  async getInquiryById(id: string): Promise<any> {
    const item = await this.prisma.contactSubmission.findUnique({
      where: { id },
      include: {
        service: { select: { id: true, title: true } },
        assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (!item) {
      throw new NotFoundException(`Inquiry with ID '${id}' not found.`);
    }

    return item;
  }

  /**
   * Admin: Update status of a submission.
   */
  async updateStatus(id: string, status: InquiryStatus): Promise<any> {
    const item = await this.prisma.contactSubmission.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Inquiry with ID '${id}' not found.`);
    }

    return this.prisma.contactSubmission.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Admin: Delete a submission.
   */
  async deleteInquiry(id: string): Promise<any> {
    const item = await this.prisma.contactSubmission.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Inquiry with ID '${id}' not found.`);
    }

    await this.prisma.contactSubmission.delete({ where: { id } });
    return { success: true };
  }
}
