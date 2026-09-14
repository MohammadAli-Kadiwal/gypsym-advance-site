import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { PortfolioService } from './portfolio.service';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  // ─── Public Endpoints ────────────────────────────────────────────────────────

  @Get()
  async getProjects(@Query() query: any) {
    return this.portfolioService.getProjects(query);
  }

  @Get('categories')
  async getCategories() {
    return this.portfolioService.getCategories();
  }

  // ─── Admin Listing Endpoints ─────────────────────────────────────────────────

  @Get('admin/categories')
  async getAllCategoriesForAdmin() {
    return this.portfolioService.getAllCategoriesForAdmin();
  }

  @Get('admin/projects')
  async getAllProjectsForAdmin() {
    return this.portfolioService.getAllProjectsForAdmin();
  }

  // ─── Category Admin CRUD ─────────────────────────────────────────────────────

  @Post('categories')
  async createCategory(@Body() body: any) {
    return this.portfolioService.createCategory(body);
  }

  @Put('categories/reorder')
  async reorderCategories(@Body() body: { items: Array<{ id: string; displayOrder: number }> }) {
    await this.portfolioService.reorderCategories(body.items);
    return { success: true };
  }

  @Put('categories/:id')
  async updateCategory(@Param('id') id: string, @Body() body: any) {
    return this.portfolioService.updateCategory(id, body);
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    await this.portfolioService.deleteCategory(id);
    return { success: true };
  }

  // ─── Project Detail & CRUD ───────────────────────────────────────────────────

  @Put('reorder')
  async reorderProjects(@Body() body: { items: Array<{ id: string; displayOrder: number }> }) {
    await this.portfolioService.reorderProjects(body.items);
    return { success: true };
  }

  @Get(':slug')
  async getProjectBySlug(@Param('slug') slug: string) {
    return this.portfolioService.getProjectBySlug(slug);
  }

  @Post()
  async createProject(@Body() body: any) {
    return this.portfolioService.createProject(body);
  }

  @Put(':id')
  async updateProject(@Param('id') id: string, @Body() body: any) {
    return this.portfolioService.updateProject(id, body);
  }

  @Delete(':id')
  async deleteProject(@Param('id') id: string) {
    await this.portfolioService.deleteProject(id);
    return { success: true };
  }
}
