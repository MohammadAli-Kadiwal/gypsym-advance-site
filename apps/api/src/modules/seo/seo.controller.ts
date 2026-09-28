import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SeoService } from './seo.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('seo')
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  // ────────────────────────────────────────────────────────────
  // PUBLIC SSR ENDPOINTS (Consumed by Next.js apps/web & crawlers)
  // ────────────────────────────────────────────────────────────
  @Get('public/global')
  async getPublicGlobal() {
    return this.seoService.getPublicGlobalSeo();
  }

  @Get('public/sitemap-urls')
  async getPublicSitemapUrls() {
    return this.seoService.getPublicSitemapUrls();
  }

  @Get('public/robots-rules')
  async getPublicRobotsRules() {
    return this.seoService.getPublicRobotsRules();
  }

  @Get('public/redirects')
  async getPublicRedirects() {
    return this.seoService.getPublicRedirects();
  }

  @Get('public/aeo')
  async getPublicAeo(@Query('pageSlug') pageSlug?: string) {
    return this.seoService.getPublicAeoForPage(pageSlug);
  }

  // ────────────────────────────────────────────────────────────
  // ADMIN AUTHENTICATED ENDPOINTS
  // ────────────────────────────────────────────────────────────
  @Get('dashboard')
  @UseGuards(AuthGuard)
  async getDashboard() {
    return this.seoService.getDashboard();
  }

  @Get('global')
  @UseGuards(AuthGuard)
  async getGlobalSeo() {
    return this.seoService.getGlobalSeo();
  }

  @Put('global')
  @UseGuards(AuthGuard)
  async updateGlobalSeo(@Body() body: any, @Req() req: any) {
    return this.seoService.updateGlobalSeo(body, req?.user);
  }

  @Get('pages')
  @UseGuards(AuthGuard)
  async getPages(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('missingSeoOnly') missingSeoOnly?: string
  ) {
    return this.seoService.getPages({
      search,
      status,
      missingSeoOnly: missingSeoOnly === 'true',
    });
  }

  @Get('pages/:id')
  @UseGuards(AuthGuard)
  async getPageSeo(@Param('id') id: string) {
    return this.seoService.getPageSeo(id);
  }

  @Put('pages/:id')
  @UseGuards(AuthGuard)
  async updatePageSeo(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.seoService.updatePageSeo(id, body, req?.user);
  }

  @Get('audit/:pageId')
  @UseGuards(AuthGuard)
  async auditPage(@Param('pageId') pageId: string) {
    return this.seoService.auditPage(pageId);
  }

  @Get('templates')
  @UseGuards(AuthGuard)
  async getTemplates() {
    return this.seoService.getTemplates();
  }

  @Put('templates')
  @UseGuards(AuthGuard)
  async updateTemplates(@Body() body: any, @Req() req: any) {
    return this.seoService.updateTemplates(body, req?.user);
  }

  @Get('robots')
  @UseGuards(AuthGuard)
  async getRobots() {
    return this.seoService.getRobotsConfig();
  }

  @Put('robots')
  @UseGuards(AuthGuard)
  async updateRobots(@Body() body: any, @Req() req: any) {
    return this.seoService.updateRobotsConfig(body, req?.user);
  }

  @Get('sitemap')
  @UseGuards(AuthGuard)
  async getSitemap() {
    return this.seoService.getSitemapConfig();
  }

  @Put('sitemap')
  @UseGuards(AuthGuard)
  async updateSitemap(@Body() body: any, @Req() req: any) {
    return this.seoService.updateSitemapConfig(body, req?.user);
  }

  @Get('redirects')
  @UseGuards(AuthGuard)
  async getRedirects() {
    return this.seoService.getRedirects();
  }

  @Post('redirects')
  @UseGuards(AuthGuard)
  async createRedirect(@Body() body: any, @Req() req: any) {
    return this.seoService.createRedirect(body, req?.user);
  }

  @Put('redirects/:id')
  @UseGuards(AuthGuard)
  async updateRedirect(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.seoService.updateRedirect(id, body, req?.user);
  }

  @Delete('redirects/:id')
  @UseGuards(AuthGuard)
  async deleteRedirect(@Param('id') id: string, @Req() req: any) {
    return this.seoService.deleteRedirect(id, req?.user);
  }

  @Get('aeo')
  @UseGuards(AuthGuard)
  async getAeo() {
    return this.seoService.getAeoItems();
  }

  @Post('aeo')
  @UseGuards(AuthGuard)
  async createAeoItem(@Body() body: any, @Req() req: any) {
    return this.seoService.createAeoItem(body, req?.user);
  }

  @Put('aeo/:id')
  @UseGuards(AuthGuard)
  async updateAeoItem(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.seoService.updateAeoItem(id, body, req?.user);
  }

  @Delete('aeo/:id')
  @UseGuards(AuthGuard)
  async deleteAeoItem(@Param('id') id: string, @Req() req: any) {
    return this.seoService.deleteAeoItem(id, req?.user);
  }

  @Get('geo')
  @UseGuards(AuthGuard)
  async getGeo() {
    return this.seoService.getGeoProfile();
  }

  @Put('geo')
  @UseGuards(AuthGuard)
  async updateGeo(@Body() body: any, @Req() req: any) {
    return this.seoService.updateGeoProfile(body, req?.user);
  }

  @Get('hreflang')
  @UseGuards(AuthGuard)
  async getHreflang() {
    return this.seoService.getHreflangConfig();
  }

  @Put('hreflang')
  @UseGuards(AuthGuard)
  async updateHreflang(@Body() body: any, @Req() req: any) {
    return this.seoService.updateHreflangConfig(body, req?.user);
  }
}
