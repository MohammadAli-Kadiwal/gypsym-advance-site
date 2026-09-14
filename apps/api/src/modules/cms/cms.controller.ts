import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { CmsService } from './cms.service';

@Controller()
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Get('services')
  async getServices() {
    return this.cmsService.getServices();
  }

  @Get('services/:slug')
  async getServiceBySlug(@Param('slug') slug: string) {
    return this.cmsService.getServiceBySlug(slug);
  }

  @Get('solutions')
  async getSolutions() {
    return this.cmsService.getSolutions();
  }

  @Get('solutions/:slug')
  async getSolutionBySlug(@Param('slug') slug: string) {
    return this.cmsService.getSolutionBySlug(slug);
  }

  @Get('case-studies')
  async getCaseStudies() {
    return this.cmsService.getCaseStudies();
  }

  @Get('case-studies/:slug')
  async getCaseStudyBySlug(@Param('slug') slug: string) {
    return this.cmsService.getCaseStudyBySlug(slug);
  }

  @Get('blog')
  async getBlogPosts(): Promise<any[]> {
    return this.cmsService.getBlogPosts();
  }

  @Get('blog/:slug')
  async getBlogPostBySlug(@Param('slug') slug: string): Promise<any> {
    return this.cmsService.getBlogPostBySlug(slug);
  }

  @Get('jobs')
  async getJobs() {
    return this.cmsService.getJobs();
  }

  @Get('jobs/:slug')
  async getJobBySlug(@Param('slug') slug: string) {
    return this.cmsService.getJobBySlug(slug);
  }

  @Get('team')
  async getTeam() {
    return this.cmsService.getTeam();
  }

  @Get('branding')
  async getBranding(): Promise<any> {
    return this.cmsService.getBrandSettings();
  }

  @Put('branding')
  async updateBranding(@Body() body: any): Promise<any> {
    return this.cmsService.updateBrandSettings(body);
  }

  @Get('settings')
  async getSettings() {
    return this.cmsService.getSiteSettings();
  }

  @Put('settings/:key')
  async updateSetting(@Param('key') key: string, @Body() body: { value: any }): Promise<any> {
    return this.cmsService.updateSiteSetting(key, body.value);
  }

  @Get('pages/:slug')
  async getPageBySlug(@Param('slug') slug: string): Promise<any> {
    return this.cmsService.getPageBySlug(slug);
  }

  @Post('pages/:slug/sections')
  async createSection(@Param('slug') slug: string, @Body() body: any): Promise<any> {
    return this.cmsService.createSection(slug, body);
  }

  @Put('sections/:id')
  async updateSection(@Param('id') id: string, @Body() body: any): Promise<any> {
    return this.cmsService.updateSection(id, body);
  }

  @Delete('sections/:id')
  async deleteSection(@Param('id') id: string): Promise<any> {
    return this.cmsService.deleteSection(id);
  }

  @Get('navigation/:key')
  async getNavigationByKey(@Param('key') key: string): Promise<any> {
    return this.cmsService.getNavigationByKey(key);
  }

  @Put('navigation/:key')
  async updateNavigation(@Param('key') key: string, @Body() body: { items: any[] }): Promise<any> {
    return this.cmsService.updateNavigation(key, body.items);
  }

  @Get('header')
  async getHeader(): Promise<any> {
    return this.cmsService.getHeaderData();
  }

  // ── Clients ────────────────────────────────────────────────────────────────

  @Get('clients')
  async getClients(): Promise<any[]> {
    return this.cmsService.getClients();
  }

  @Post('clients')
  async createClient(@Body() body: { name: string; logoUrl?: string; websiteUrl?: string }): Promise<any> {
    return this.cmsService.createClient(body);
  }

  @Put('clients/:id')
  async updateClient(
    @Param('id') id: string,
    @Body() body: { name?: string; logoUrl?: string; websiteUrl?: string },
  ): Promise<any> {
    return this.cmsService.updateClient(id, body);
  }

  @Delete('clients/:id')
  async deleteClient(@Param('id') id: string): Promise<void> {
    return this.cmsService.deleteClient(id);
  }

  // ── Partners ────────────────────────────────────────────────────────────────

  @Get('partners')
  async getPartners(@Query() query: any): Promise<any[]> {
    return this.cmsService.getPartners(query);
  }

  @Put('partners/reorder')
  async reorderPartners(@Body() body: { items: Array<{ id: string; displayOrder: number }> }): Promise<void> {
    return this.cmsService.reorderPartners(body.items);
  }

  @Put('partners/bulk-status')
  async bulkUpdatePartnerStatus(@Body() body: { ids: string[]; status: any }): Promise<{ count: number }> {
    return this.cmsService.bulkUpdatePartnerStatus(body.ids, body.status);
  }

  @Post('partners/bulk-delete')
  async bulkDeletePartners(@Body() body: { ids: string[] }): Promise<{ count: number }> {
    return this.cmsService.bulkDeletePartners(body.ids);
  }

  @Get('partners/:id')
  async getPartnerById(@Param('id') id: string): Promise<any> {
    return this.cmsService.getPartnerById(id);
  }

  @Post('partners')
  async createPartner(@Body() body: any): Promise<any> {
    return this.cmsService.createPartner(body);
  }

  @Put('partners/:id')
  async updatePartner(@Param('id') id: string, @Body() body: any): Promise<any> {
    return this.cmsService.updatePartner(id, body);
  }

  @Patch('partners/:id/homepage')
  async updatePartnerHomepageVisibility(
    @Param('id') id: string,
    @Body() body: { showOnHomepage: boolean },
  ): Promise<any> {
    return this.cmsService.updatePartnerHomepageVisibility(id, body.showOnHomepage);
  }

  @Delete('partners/:id')
  async deletePartner(@Param('id') id: string): Promise<void> {
    return this.cmsService.deletePartner(id);
  }
}
