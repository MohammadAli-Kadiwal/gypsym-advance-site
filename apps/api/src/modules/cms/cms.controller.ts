import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CmsService } from './cms.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleType } from '@gypsym/database';

@Controller()
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Get('services')
  async getServices(@Query('status') status?: string) {
    return this.cmsService.getServices(status);
  }

  @Post('services')
  @UseGuards(AuthGuard)
  async createService(@Body() body: any) {
    return this.cmsService.createService(body);
  }

  @Put('services/reorder')
  @UseGuards(AuthGuard)
  async reorderServices(@Body() body: { items: Array<{ id: string; displayOrder: number }> }) {
    return this.cmsService.reorderServices(body.items);
  }

  @Put('services/bulk-status')
  @UseGuards(AuthGuard)
  async bulkUpdateServiceStatus(@Body() body: { ids: string[]; status: any }) {
    return this.cmsService.bulkUpdateServiceStatus(body.ids, body.status);
  }

  @Post('services/bulk-delete')
  @UseGuards(AuthGuard)
  async bulkDeleteServices(@Body() body: { ids: string[] }) {
    return this.cmsService.bulkDeleteServices(body.ids);
  }

  @Get('services/:slug')
  async getServiceBySlug(@Param('slug') slug: string, @Query('status') status?: string) {
    return this.cmsService.getServiceBySlug(slug, status);
  }

  @Put('services/:id')
  @UseGuards(AuthGuard)
  async updateService(@Param('id') id: string, @Body() body: any) {
    return this.cmsService.updateService(id, body);
  }

  @Delete('services/:id')
  @UseGuards(AuthGuard)
  async deleteService(@Param('id') id: string) {
    return this.cmsService.deleteService(id);
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
  async getBlogPosts(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: number,
  ): Promise<any[]> {
    return this.cmsService.getBlogPosts({ category, search, limit });
  }

  @Get('blog/categories')
  async getBlogCategories(): Promise<any[]> {
    return this.cmsService.getBlogCategories();
  }

  @Get('cms/blog/categories')
  @UseGuards(AuthGuard)
  async getCmsBlogCategories(): Promise<any[]> {
    return this.cmsService.getBlogCategories();
  }

  @Post('cms/blog/categories')
  @UseGuards(AuthGuard)
  async createBlogCategory(
    @Body() body: { name: string; slug?: string; description?: string },
  ): Promise<any> {
    return this.cmsService.createBlogCategory(body);
  }

  @Put('cms/blog/categories/:id')
  @UseGuards(AuthGuard)
  async updateBlogCategory(
    @Param('id') id: string,
    @Body() body: { name?: string; slug?: string; description?: string },
  ): Promise<any> {
    return this.cmsService.updateBlogCategory(id, body);
  }

  @Post('cms/blog/categories/bulk-delete')
  @UseGuards(AuthGuard)
  async bulkDeleteBlogCategories(
    @Body() body: { ids: string[]; reassignToId?: string },
  ): Promise<{ count: number }> {
    return this.cmsService.bulkDeleteBlogCategories(body.ids, { reassignToId: body.reassignToId });
  }

  @Delete('cms/blog/categories/:id')
  @UseGuards(AuthGuard)
  async deleteBlogCategory(
    @Param('id') id: string,
    @Query('reassignToId') reassignToId?: string,
  ): Promise<any> {
    return this.cmsService.deleteBlogCategory(id, { reassignToId });
  }

  @Get('blog/:slug')
  async getBlogPostBySlug(@Param('slug') slug: string): Promise<any> {
    return this.cmsService.getBlogPostBySlug(slug);
  }

  // Admin CMS Endpoints
  @Get('cms/blog')
  @UseGuards(AuthGuard)
  async getCmsBlogPosts(
    @Query('search') search?: string,
    @Query('status') status?: string,
  ): Promise<any[]> {
    return this.cmsService.getCmsBlogPosts({ search, status });
  }

  @Post('cms/blog')
  @UseGuards(AuthGuard)
  async createBlogPost(@Body() body: any): Promise<any> {
    return this.cmsService.createBlogPost(body);
  }

  @Put('cms/blog/bulk-status')
  @UseGuards(AuthGuard)
  async bulkUpdateBlogPostStatus(@Body() body: { ids: string[]; status: any }) {
    return this.cmsService.bulkUpdateBlogPostStatus(body.ids, body.status);
  }

  @Post('cms/blog/bulk-delete')
  @UseGuards(AuthGuard)
  async bulkDeleteBlogPosts(@Body() body: { ids: string[] }) {
    return this.cmsService.bulkDeleteBlogPosts(body.ids);
  }

  @Put('cms/blog/:id')
  @UseGuards(AuthGuard)
  async updateBlogPost(@Param('id') id: string, @Body() body: any): Promise<any> {
    return this.cmsService.updateBlogPost(id, body);
  }

  @Delete('cms/blog/:id')
  @UseGuards(AuthGuard)
  async deleteBlogPost(@Param('id') id: string): Promise<any> {
    return this.cmsService.deleteBlogPost(id);
  }

  @Get('author-settings')
  async getPublicAuthorSettings(): Promise<any> {
    return this.cmsService.getAuthorSettings();
  }

  @Get('cms/author-settings')
  @UseGuards(AuthGuard)
  async getCmsAuthorSettings(): Promise<any> {
    return this.cmsService.getAuthorSettings();
  }

  @Put('cms/author-settings')
  @UseGuards(AuthGuard)
  async updateCmsAuthorSettings(@Body() body: any): Promise<any> {
    return this.cmsService.updateAuthorSettings(body);
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

  // ── Team Admin CRUD ────────────────────────────────────────────────────────

  @Get('team/admin/all')
  @UseGuards(AuthGuard)
  async getAllTeamAdmin() {
    return this.cmsService.getAllTeamAdmin();
  }

  @Post('team')
  @UseGuards(AuthGuard)
  async createTeamMember(@Body() body: any) {
    return this.cmsService.createTeamMember(body);
  }

  @Put('team/bulk-status')
  @UseGuards(AuthGuard)
  async bulkUpdateTeamStatus(@Body() body: { ids: string[]; isActive: boolean }) {
    return this.cmsService.bulkUpdateTeamStatus(body.ids, body.isActive);
  }

  @Post('team/bulk-delete')
  @UseGuards(AuthGuard)
  async bulkDeleteTeam(@Body() body: { ids: string[] }) {
    return this.cmsService.bulkDeleteTeamMembers(body.ids);
  }

  @Put('team/:id')
  @UseGuards(AuthGuard)
  async updateTeamMember(@Param('id') id: string, @Body() body: any) {
    return this.cmsService.updateTeamMember(id, body);
  }

  @Delete('team/:id')
  @UseGuards(AuthGuard)
  async deleteTeamMember(@Param('id') id: string) {
    return this.cmsService.deleteTeamMember(id);
  }

  @Get('branding')
  async getBranding(): Promise<any> {
    return this.cmsService.getBrandSettings();
  }

  @Put('branding')
  @UseGuards(AuthGuard)
  async updateBranding(@Body() body: any): Promise<any> {
    return this.cmsService.updateBrandSettings(body);
  }

  @Get('socials')
  async getSocials(): Promise<any> {
    return this.cmsService.getSocialLinks();
  }

  @Put('socials')
  @UseGuards(AuthGuard)
  async updateSocials(@Body() body: { socialLinks: any[] }): Promise<any> {
    return this.cmsService.updateSocialLinks(body.socialLinks);
  }

  @Get('settings')
  async getSettings() {
    return this.cmsService.getSiteSettings();
  }

  @Get('settings/seo')
  async getSeoSettings() {
    return this.cmsService.getSeoSettings();
  }

  @Put('settings/seo')
  @UseGuards(AuthGuard)
  async updateSeoSettings(@Body() body: any): Promise<any> {
    return this.cmsService.updateSeoSettings(body);
  }

  @Get('settings/scripts')
  async getScriptSettings() {
    return this.cmsService.getScriptSettings();
  }

  @Put('settings/scripts')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN, RoleType.SYSTEM_ADMIN)
  async updateScriptSettings(@Body() body: any): Promise<any> {
    return this.cmsService.updateScriptSettings(body);
  }

  @Put('settings/:key')
  @UseGuards(AuthGuard)
  async updateSetting(@Param('key') key: string, @Body() body: { value: any }): Promise<any> {
    return this.cmsService.updateSiteSetting(key, body.value);
  }

  @Get('pages')
  async getAllPages(): Promise<any[]> {
    return this.cmsService.getAllPages();
  }

  @Post('pages')
  @UseGuards(AuthGuard)
  async createPage(@Body() body: any): Promise<any> {
    return this.cmsService.createPage(body);
  }

  @Get('pages/:slug')
  async getPageBySlug(@Param('slug') slug: string): Promise<any> {
    return this.cmsService.getPageBySlug(slug);
  }

  @Put('pages/:slug')
  @UseGuards(AuthGuard)
  async updatePage(@Param('slug') slug: string, @Body() body: any): Promise<any> {
    return this.cmsService.updatePage(slug, body);
  }

  @Delete('pages/:slug')
  @UseGuards(AuthGuard)
  async deletePage(@Param('slug') slug: string): Promise<any> {
    return this.cmsService.deletePage(slug);
  }

  @Post('pages/:slug/sections')
  @UseGuards(AuthGuard)
  async createSection(@Param('slug') slug: string, @Body() body: any): Promise<any> {
    return this.cmsService.createSection(slug, body);
  }

  @Put('sections/:id')
  @UseGuards(AuthGuard)
  async updateSection(@Param('id') id: string, @Body() body: any): Promise<any> {
    return this.cmsService.updateSection(id, body);
  }

  @Delete('sections/:id')
  @UseGuards(AuthGuard)
  async deleteSection(@Param('id') id: string): Promise<any> {
    return this.cmsService.deleteSection(id);
  }

  @Get('navigation/:key')
  async getNavigationByKey(@Param('key') key: string): Promise<any> {
    return this.cmsService.getNavigationByKey(key);
  }

  @Put('navigation/:key')
  @UseGuards(AuthGuard)
  async updateNavigation(@Param('key') key: string, @Body() body: { items: any[] }): Promise<any> {
    return this.cmsService.updateNavigation(key, body.items);
  }

  @Get('header')
  async getHeader(): Promise<any> {
    return this.cmsService.getHeaderData();
  }

  @Get('footer')
  async getFooter(): Promise<any> {
    return this.cmsService.getFooterData();
  }

  @Get('admin/footer')
  @UseGuards(AuthGuard)
  async getAdminFooter(): Promise<any> {
    return this.cmsService.getAdminFooterData();
  }

  @Put('admin/footer')
  @UseGuards(AuthGuard)
  async updateAdminFooter(@Body() body: { config?: any; navigation?: any; contact?: any }): Promise<any> {
    return this.cmsService.updateFooterData(body);
  }

  @Put('footer')
  @UseGuards(AuthGuard)
  async updateFooter(@Body() body: { config?: any; navigation?: any; contact?: any }): Promise<any> {
    return this.cmsService.updateFooterData(body);
  }

  // ── Clients ────────────────────────────────────────────────────────────────

  @Get('clients')
  async getClients(@Query('status') status?: string): Promise<any[]> {
    return this.cmsService.getClients(status);
  }

  @Post('clients')
  @UseGuards(AuthGuard)
  async createClient(
    @Body() body: { name: string; logoUrl?: string; websiteUrl?: string; status?: string; isActive?: boolean },
  ): Promise<any> {
    return this.cmsService.createClient(body);
  }

  @Put('clients/:id')
  @UseGuards(AuthGuard)
  async updateClient(
    @Param('id') id: string,
    @Body() body: { name?: string; logoUrl?: string; websiteUrl?: string; status?: string; isActive?: boolean },
  ): Promise<any> {
    return this.cmsService.updateClient(id, body);
  }

  @Put('clients/bulk-status')
  @UseGuards(AuthGuard)
  async bulkUpdateClientStatus(@Body() body: { ids: string[]; status: any }): Promise<{ count: number }> {
    return this.cmsService.bulkUpdateClientStatus(body.ids, body.status);
  }

  @Post('clients/bulk-delete')
  @UseGuards(AuthGuard)
  async bulkDeleteClients(@Body() body: { ids: string[] }): Promise<{ count: number }> {
    return this.cmsService.bulkDeleteClients(body.ids);
  }

  @Delete('clients/:id')
  @UseGuards(AuthGuard)
  async deleteClient(@Param('id') id: string): Promise<void> {
    return this.cmsService.deleteClient(id);
  }

  // ── Partners ────────────────────────────────────────────────────────────────

  @Get('partners')
  async getPartners(@Query() query: any): Promise<any[]> {
    return this.cmsService.getPartners(query);
  }

  @Put('partners/reorder')
  @UseGuards(AuthGuard)
  async reorderPartners(@Body() body: { items: Array<{ id: string; displayOrder: number }> }): Promise<void> {
    return this.cmsService.reorderPartners(body.items);
  }

  @Put('partners/bulk-status')
  @UseGuards(AuthGuard)
  async bulkUpdatePartnerStatus(@Body() body: { ids: string[]; status: any }): Promise<{ count: number }> {
    return this.cmsService.bulkUpdatePartnerStatus(body.ids, body.status);
  }

  @Post('partners/bulk-delete')
  @UseGuards(AuthGuard)
  async bulkDeletePartners(@Body() body: { ids: string[] }): Promise<{ count: number }> {
    return this.cmsService.bulkDeletePartners(body.ids);
  }

  @Get('partners/:id')
  async getPartnerById(@Param('id') id: string): Promise<any> {
    return this.cmsService.getPartnerById(id);
  }

  @Post('partners')
  @UseGuards(AuthGuard)
  async createPartner(@Body() body: any): Promise<any> {
    return this.cmsService.createPartner(body);
  }

  @Put('partners/:id')
  @UseGuards(AuthGuard)
  async updatePartner(@Param('id') id: string, @Body() body: any): Promise<any> {
    return this.cmsService.updatePartner(id, body);
  }

  @Patch('partners/:id/homepage')
  @UseGuards(AuthGuard)
  async updatePartnerHomepageVisibility(
    @Param('id') id: string,
    @Body() body: { showOnHomepage: boolean },
  ): Promise<any> {
    return this.cmsService.updatePartnerHomepageVisibility(id, body.showOnHomepage);
  }

  @Delete('partners/:id')
  @UseGuards(AuthGuard)
  async deletePartner(@Param('id') id: string): Promise<void> {
    return this.cmsService.deletePartner(id);
  }
}
