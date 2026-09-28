import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BookingStatus } from '@gypsym/database';
import { getPublicHoliday } from './public-holidays';

export interface CreateBookingDto {
  fullName: string;
  email: string;
  phone?: string;
  companyName?: string;
  websiteUrl?: string;
  serviceInterest?: string;
  storeUrl?: string;
  notes?: string;
  date: string; // YYYY-MM-DD
  slotTime: string; // formatted e.g. "10:30 AM"
  timezone: string; // IANA string e.g. "Asia/Calcutta", "America/New_York"
  utcStartTime?: string; // ISO string from frontend
}

export interface BookingQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: BookingStatus;
  date?: string;
}

export interface AvailableSlot {
  slotTime: string; // in visitor timezone, e.g. "1:30 AM"
  hostSlotTime: string; // in host timezone, e.g. "11:00 AM IST"
  utcStartTime: string; // ISO string
  available: boolean;
}

// Host working hours in Asia/Kolkata (IST: UTC +5:30)
// Monday - Friday, 10:00 AM to 7:00 PM (last slot 6:30 PM)
const HOST_TIMEZONE = 'Asia/Kolkata';
const HOST_SLOT_HOURS = [
  { hour: 10, minute: 0 },
  { hour: 10, minute: 30 },
  { hour: 11, minute: 0 },
  { hour: 11, minute: 30 },
  { hour: 12, minute: 0 },
  { hour: 12, minute: 30 },
  { hour: 13, minute: 0 },
  { hour: 13, minute: 30 },
  { hour: 14, minute: 0 },
  { hour: 14, minute: 30 },
  { hour: 15, minute: 0 },
  { hour: 15, minute: 30 },
  { hour: 16, minute: 0 },
  { hour: 16, minute: 30 },
  { hour: 17, minute: 0 },
  { hour: 17, minute: 30 },
  { hour: 18, minute: 0 },
  { hour: 18, minute: 30 },
];

import { EmailService } from '../email/email.service';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  // In-memory rate limiting map: ip -> timestamps[] (Max 5 booking requests per 15 minutes)
  private readonly rateLimitMap = new Map<string, number[]>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  private checkRateLimit(ip?: string): void {
    if (!ip || ip === 'unknown') return;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    const maxRequests = 5;

    const timestamps = (this.rateLimitMap.get(ip) || []).filter((t) => now - t < windowMs);

    if (timestamps.length >= maxRequests) {
      this.logger.warn(`Booking rate limit exceeded for IP: ${ip}`);
      throw new BadRequestException('Too many booking requests. Please wait a few minutes before trying again.');
    }

    timestamps.push(now);
    this.rateLimitMap.set(ip, timestamps);
  }

  /**
   * Helper: Convert Host (IST) slot on given date to UTC Date
   */
  private getUtcDateForHostSlot(dateStr: string, hour: number, minute: number): Date {
    const parts = dateStr.split('-');
    const year = Number(parts[0]) || 2026;
    const month = Number(parts[1]) || 1;
    const day = Number(parts[2]) || 1;
    // IST is UTC +5:30. Subtract 5h 30m to get UTC.
    const utcDate = new Date(Date.UTC(year, month - 1, day, hour - 5, minute - 30, 0, 0));
    return utcDate;
  }

  /**
   * Helper: Format Date in a given IANA timezone
   */
  private formatTimeInZone(date: Date, timeZone: string): string {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(date);
    } catch {
      // Fallback if timezone string is not standard
      return new Intl.DateTimeFormat('en-US', {
        timeZone: HOST_TIMEZONE,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(date);
    }
  }

  /**
   * Public: Get available slots calculated zone-wise
   */
  async getAvailableSlots(dateStr: string, visitorTimezone = HOST_TIMEZONE): Promise<AvailableSlot[]> {
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      throw new BadRequestException('Invalid date format. Expected YYYY-MM-DD.');
    }

    // Check day of week in host timezone (0 = Sunday, 6 = Saturday)
    const dateParts = dateStr.split('-');
    const year = Number(dateParts[0]) || 2026;
    const month = Number(dateParts[1]) || 1;
    const day = Number(dateParts[2]) || 1;
    const dateObj = new Date(Date.UTC(year, month - 1, day));
    const dayOfWeek = dateObj.getUTCDay();

    // If weekend (Sunday = 0, Saturday = 6) or public holiday, return empty slots (closed)
    const holidayName = getPublicHoliday(dateStr);
    if (dayOfWeek === 0 || dayOfWeek === 6 || holidayName) {
      return [];
    }

    // Generate slots for each working interval
    const slots: AvailableSlot[] = [];
    const utcDates: Date[] = [];

    for (const hostTime of HOST_SLOT_HOURS) {
      const utcDate = this.getUtcDateForHostSlot(dateStr, hostTime.hour, hostTime.minute);
      utcDates.push(utcDate);

      const slotTimeVisitor = this.formatTimeInZone(utcDate, visitorTimezone);
      const hostSlotTime = `${this.formatTimeInZone(utcDate, HOST_TIMEZONE)} IST`;

      slots.push({
        slotTime: slotTimeVisitor,
        hostSlotTime,
        utcStartTime: utcDate.toISOString(),
        available: true,
      });
    }

    // Query existing confirmed or pending bookings that overlap with these slots
    if (utcDates.length > 0 && utcDates[0]) {
      const minUtc = utcDates[0];
      const lastDate = utcDates[utcDates.length - 1] || minUtc;
      const maxUtc = new Date(lastDate.getTime() + 30 * 60 * 1000);

      const existingBookings = await this.prisma.booking.findMany({
        where: {
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
          utcStartTime: {
            gte: minUtc,
            lte: maxUtc,
          },
        },
        select: {
          utcStartTime: true,
        },
      });

      const bookedTimestamps = new Set(
        existingBookings.map((b) => b.utcStartTime.toISOString())
      );

      for (const slot of slots) {
        if (bookedTimestamps.has(slot.utcStartTime)) {
          slot.available = false;
        }
      }
    }

    return slots;
  }

  /**
   * Public: Create a new discovery call booking
   */
  async createBooking(dto: CreateBookingDto, ip?: string) {
    this.checkRateLimit(ip);

    if (!dto.fullName?.trim()) {
      throw new BadRequestException('Full name is required.');
    }
    if (!dto.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.email)) {
      throw new BadRequestException('Valid email address is required.');
    }
    if (!dto.date || !dto.slotTime) {
      throw new BadRequestException('Date and time slot are required.');
    }

    // Validate that the requested date is not on a public holiday
    const holidayName = getPublicHoliday(dto.date);
    if (holidayName) {
      throw new BadRequestException(
        `Cannot schedule discovery call on an official public holiday (${holidayName}). Please pick an open business day.`
      );
    }

    // Validate not on weekend
    const datePartsForCheck = dto.date.split('-');
    const checkYear = Number(datePartsForCheck[0]) || 2026;
    const checkMonth = Number(datePartsForCheck[1]) || 1;
    const checkDay = Number(datePartsForCheck[2]) || 1;
    const checkDateObj = new Date(Date.UTC(checkYear, checkMonth - 1, checkDay));
    if (checkDateObj.getUTCDay() === 0 || checkDateObj.getUTCDay() === 6) {
      throw new BadRequestException('Cannot schedule discovery call on weekends. Please pick a Monday - Friday slot.');
    }

    const timezone = dto.timezone || HOST_TIMEZONE;

    // Determine UTC start time
    let utcDate: Date;
    if (dto.utcStartTime) {
      utcDate = new Date(dto.utcStartTime);
    } else {
      // Fallback compute
      const dateParts = dto.date.split('-');
      const year = Number(dateParts[0]) || 2026;
      const month = Number(dateParts[1]) || 1;
      const day = Number(dateParts[2]) || 1;
      utcDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    }

    // Check conflict: booking in the same 30-min window
    const windowStart = new Date(utcDate.getTime() - 25 * 60 * 1000);
    const windowEnd = new Date(utcDate.getTime() + 25 * 60 * 1000);

    const conflicting = await this.prisma.booking.findFirst({
      where: {
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
        utcStartTime: {
          gt: windowStart,
          lt: windowEnd,
        },
      },
    });

    if (conflicting) {
      throw new BadRequestException(
        'This time slot was just booked by another client. Please choose another time.'
      );
    }

    // Compute host slot time
    const hostSlotTime = `${this.formatTimeInZone(utcDate, HOST_TIMEZONE)} IST`;

    // Generate unique booking number (e.g. BK-202609-4821)
    const datePrefix = dto.date.replace(/-/g, '').slice(0, 6);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingNumber = `BK-${datePrefix}-${randomSuffix}`;

    // Generate Google Meet placeholder link
    const meetingCode = `${Math.random().toString(36).substring(2, 5)}-${Math.random()
      .toString(36)
      .substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
    const meetingLink = `https://meet.google.com/${meetingCode}`;

    const booking = await this.prisma.booking.create({
      data: {
        bookingNumber,
        fullName: dto.fullName.trim(),
        email: dto.email.trim().toLowerCase(),
        phone: dto.phone?.trim() || null,
        storeUrl: dto.storeUrl?.trim() || null,
        notes: dto.notes?.trim() || null,
        date: dto.date,
        slotTime: dto.slotTime,
        timezone,
        hostTimezone: HOST_TIMEZONE,
        hostSlotTime,
        utcStartTime: utcDate,
        durationMinutes: 30,
        status: BookingStatus.CONFIRMED,
        meetingLink,
      },
    });

    this.logger.log(`Created booking ${booking.bookingNumber} for ${booking.email}`);

    // Asynchronously dispatch confirmation emails via configured HTML templates
    this.emailService
      .sendBookingConfirmation({
        fullName: booking.fullName,
        email: booking.email,
        bookingNumber: booking.bookingNumber,
        scheduledAt: booking.utcStartTime,
        durationMinutes: booking.durationMinutes,
        phone: booking.phone,
        companyName: dto.companyName || null,
        websiteUrl: dto.websiteUrl || null,
        serviceInterest: dto.serviceInterest || null,
        notes: booking.notes,
        meetingUrl: booking.meetingLink,
      })
      .catch((err) => {
        this.logger.warn(`Failed to dispatch booking emails: ${err?.message || err}`);
      });

    return booking;
  }

  /**
   * Admin: List bookings with filters & pagination
   */
  async getBookings(query: BookingQueryDto = {}) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.date) {
      where.date = query.date;
    }

    if (query.search?.trim()) {
      const s = query.search.trim();
      where.OR = [
        { fullName: { contains: s, mode: 'insensitive' } },
        { email: { contains: s, mode: 'insensitive' } },
        { storeUrl: { contains: s, mode: 'insensitive' } },
        { bookingNumber: { contains: s, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.booking.count({ where }),
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { utcStartTime: 'desc' },
      }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin: Get single booking by ID
   */
  async getBookingById(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found.`);
    }
    return booking;
  }

  /**
   * Admin: Update booking status
   */
  async updateStatus(id: string, status: BookingStatus, adminNotes?: string) {
    const existing = await this.prisma.booking.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Booking with ID ${id} not found.`);
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        status,
        ...(adminNotes !== undefined ? { adminNotes } : {}),
      },
    });

    return updated;
  }

  /**
   * Admin: Delete booking
   */
  async deleteBooking(id: string) {
    const existing = await this.prisma.booking.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Booking with ID ${id} not found.`);
    }

    await this.prisma.booking.delete({ where: { id } });

    return {
      success: true,
      message: `Booking ${existing.bookingNumber} deleted.`,
    };
  }

  /**
   * Admin: Get booking KPI metrics
   */
  async getMetrics() {
    const now = new Date();

    const [total, upcoming, completed, cancelled] = await Promise.all([
      this.prisma.booking.count(),
      this.prisma.booking.count({
        where: {
          status: BookingStatus.CONFIRMED,
          utcStartTime: { gte: now },
        },
      }),
      this.prisma.booking.count({
        where: { status: BookingStatus.COMPLETED },
      }),
      this.prisma.booking.count({
        where: { status: BookingStatus.CANCELLED },
      }),
    ]);

    return {
      total,
      upcoming,
      completed,
      cancelled,
    };
  }
}
