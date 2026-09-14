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
} from '@nestjs/common';
import { Request } from 'express';
import { InquiriesService, SubmitInquiryDto, InquiryQueryDto } from './inquiries.service';
import { InquiryStatus } from '@gypsym/database';

@Controller('inquiries')
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  /**
   * Public: Submit contact inquiry
   */
  @Post()
  async submitInquiry(@Body() dto: SubmitInquiryDto, @Req() req: Request) {
    const forwarded = req.headers ? req.headers['x-forwarded-for'] : undefined;
    const ip = typeof forwarded === 'string' ? (forwarded.split(',')[0]?.trim() || 'unknown') : (req.ip || 'unknown');
    return this.inquiriesService.submitInquiry(dto, ip);
  }

  /**
   * Admin: List inquiries with filters and search
   */
  @Get()
  async getInquiries(@Query() query: InquiryQueryDto): Promise<any> {
    return this.inquiriesService.getInquiries(query);
  }

  /**
   * Admin: Get inquiry detail by ID
   */
  @Get(':id')
  async getInquiryById(@Param('id') id: string): Promise<any> {
    return this.inquiriesService.getInquiryById(id);
  }

  /**
   * Admin: Update inquiry status
   */
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: InquiryStatus
  ): Promise<any> {
    return this.inquiriesService.updateStatus(id, status);
  }

  /**
   * Admin: Delete inquiry
   */
  @Delete(':id')
  async deleteInquiry(@Param('id') id: string): Promise<any> {
    return this.inquiriesService.deleteInquiry(id);
  }
}
