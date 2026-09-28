import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
  BookingsService,
  CreateBookingDto,
  BookingQueryDto,
} from './bookings.service';
import { BookingStatus } from '@gypsym/database';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  /**
   * Public: Get available 30-min discovery slots calculated zone-wise
   */
  @Get('available-slots')
  async getAvailableSlots(
    @Query('date') date: string,
    @Query('timezone') timezone?: string,
  ) {
    return this.bookingsService.getAvailableSlots(date, timezone);
  }

  /**
   * Public: Create a new discovery call appointment
   */
  @Post()
  async createBooking(@Body() dto: CreateBookingDto, @Req() req: Request) {
    const forwarded = req.headers ? req.headers['x-forwarded-for'] : undefined;
    const ip = typeof forwarded === 'string' ? (forwarded.split(',')[0]?.trim() || 'unknown') : (req.ip || 'unknown');
    return this.bookingsService.createBooking(dto, ip);
  }

  /**
   * Admin: Get dashboard KPI metrics (total, upcoming, completed, cancelled)
   */
  @Get('metrics')
  @UseGuards(AuthGuard)
  async getMetrics() {
    return this.bookingsService.getMetrics();
  }

  /**
   * Admin: List all bookings with search, status filter, and pagination
   */
  @Get()
  @UseGuards(AuthGuard)
  async getBookings(@Query() query: BookingQueryDto) {
    return this.bookingsService.getBookings(query);
  }

  /**
   * Admin: Get single booking detail by ID
   */
  @Get(':id')
  @UseGuards(AuthGuard)
  async getBookingById(@Param('id') id: string) {
    return this.bookingsService.getBookingById(id);
  }

  /**
   * Admin: Update booking status (CONFIRMED, COMPLETED, CANCELLED, NO_SHOW)
   */
  @Patch(':id/status')
  @UseGuards(AuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: BookingStatus,
    @Body('adminNotes') adminNotes?: string,
  ) {
    return this.bookingsService.updateStatus(id, status, adminNotes);
  }

  /**
   * Admin: Delete booking
   */
  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteBooking(@Param('id') id: string) {
    return this.bookingsService.deleteBooking(id);
  }
}
