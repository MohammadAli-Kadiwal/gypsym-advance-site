import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export type ContentStatusType = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED' | 'TRASHED';

@Injectable()
export class PortfolioService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Public Categories ───────────────────────────────────────────────────────

  async getCategories() {
    const categories = await this.prisma.portfolioCategory.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: {
            projects: {
              where: { status: 'PUBLISHED' },
            },
          },
        },
      },
    });

    return categories.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      displayOrder: cat.displayOrder,
      status: cat.status,
      projectCount: cat._count?.projects ?? 0,
    }));
  }

  // ─── Admin Categories ────────────────────────────────────────────────────────

  async getAllCategoriesForAdmin() {
    const categories = await this.prisma.portfolioCategory.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });

    return categories.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      displayOrder: cat.displayOrder,
      status: cat.status,
      projectCount: cat._count?.projects ?? 0,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    }));
  }

  async createCategory(data: {
    name: string;
    slug?: string;
    description?: string;
    displayOrder?: number;
    status?: ContentStatusType;
  }) {
    if (!data.name || !data.name.trim()) {
      throw new BadRequestException('Category name is required.');
    }

    const slugBase = (data.slug || data.name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const slug = slugBase || `cat-${Date.now()}`;

    const existing = await this.prisma.portfolioCategory.findUnique({
      where: { slug },
    });
    const finalSlug = existing ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

    let displayOrder = data.displayOrder;
    if (displayOrder === undefined || displayOrder === null) {
      const last = await this.prisma.portfolioCategory.findFirst({
        orderBy: { displayOrder: 'desc' },
        select: { displayOrder: true },
      });
      displayOrder = (last?.displayOrder ?? 0) + 1;
    }

    return this.prisma.portfolioCategory.create({
      data: {
        name: data.name.trim(),
        slug: finalSlug,
        description: data.description?.trim() || null,
        displayOrder,
        status: (data.status as any) || 'PUBLISHED',
      },
    });
  }

  async updateCategory(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      displayOrder?: number;
      status?: ContentStatusType;
    },
  ) {
    const existing = await this.prisma.portfolioCategory.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Category with ID '${id}' not found.`);
    }

    let finalSlug: string | undefined = undefined;
    if (data.slug && data.slug !== existing.slug) {
      const slugCandidate = data.slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      const duplicate = await this.prisma.portfolioCategory.findUnique({
        where: { slug: slugCandidate },
      });
      if (duplicate && duplicate.id !== id) {
        throw new BadRequestException(`Category slug '${slugCandidate}' is already in use.`);
      }
      finalSlug = slugCandidate;
    }

    return this.prisma.portfolioCategory.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name.trim() }),
        ...(finalSlug !== undefined && { slug: finalSlug }),
        ...(data.description !== undefined && { description: data.description?.trim() || null }),
        ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
        ...(data.status !== undefined && { status: data.status as any }),
      },
    });
  }

  async deleteCategory(id: string) {
    const existing = await this.prisma.portfolioCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { projects: true },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException(`Category with ID '${id}' not found.`);
    }

    // Rule 51: Delete protection - check if projects are associated
    const projectCount = existing._count?.projects ?? 0;
    if (projectCount > 0) {
      throw new BadRequestException(
        `This category is currently used by ${projectCount} project(s). Please reassign or remove those projects before deleting this category.`,
      );
    }

    return this.prisma.portfolioCategory.delete({
      where: { id },
    });
  }

  async reorderCategories(items: Array<{ id: string; displayOrder: number }>) {
    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.portfolioCategory.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        }),
      ),
    );
  }

  // ─── Portfolio Projects ──────────────────────────────────────────────────────

  async getProjects(query: {
    category?: string;
    status?: ContentStatusType;
    page?: number;
    limit?: number;
  }) {
    const status = (query.status as any) || 'PUBLISHED';
    const categorySlug = query.category?.trim().toLowerCase();

    const where: any = {
      status,
    };

    if (categorySlug && categorySlug !== 'all') {
      where.category = {
        slug: categorySlug,
      };
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 50));
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      this.prisma.portfolioProjectItem.findMany({
        where,
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      this.prisma.portfolioProjectItem.count({ where }),
    ]);

    return {
      projects: projects.map((p: any) => ({
        id: p.id,
        orderNumber: p.orderNumber,
        title: p.title,
        slug: p.slug,
        client: p.client,
        category: p.category?.name || '',
        categorySlug: p.category?.slug || '',
        categoryId: p.categoryId,
        description: p.description,
        imageUrl: p.imageUrl,
        altText: p.altText || p.title,
        projectUrl: p.projectUrl || `/portfolio/${p.slug}`,
        tags: p.tags,
        metrics: p.metrics,
        displayOrder: p.displayOrder,
        status: p.status,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAllProjectsForAdmin() {
    const projects = await this.prisma.portfolioProjectItem.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return projects.map((p: any) => ({
      id: p.id,
      orderNumber: p.orderNumber,
      title: p.title,
      slug: p.slug,
      client: p.client,
      category: p.category?.name || '',
      categorySlug: p.category?.slug || '',
      categoryId: p.categoryId,
      description: p.description,
      imageUrl: p.imageUrl,
      altText: p.altText || p.title,
      projectUrl: p.projectUrl || `/portfolio/${p.slug}`,
      tags: p.tags,
      metrics: p.metrics,
      displayOrder: p.displayOrder,
      status: p.status,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  async getProjectBySlug(slug: string) {
    const project = await this.prisma.portfolioProjectItem.findFirst({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with slug '${slug}' not found.`);
    }

    return {
      id: project.id,
      orderNumber: project.orderNumber,
      title: project.title,
      slug: project.slug,
      client: project.client,
      category: project.category?.name || '',
      categorySlug: project.category?.slug || '',
      categoryId: project.categoryId,
      description: project.description,
      imageUrl: project.imageUrl,
      altText: project.altText || project.title,
      projectUrl: project.projectUrl || `/portfolio/${project.slug}`,
      tags: project.tags,
      metrics: project.metrics,
      displayOrder: project.displayOrder,
      status: project.status,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  async createProject(data: {
    orderNumber?: string;
    title: string;
    slug?: string;
    client?: string;
    categoryId?: string;
    description?: string;
    imageUrl: string;
    altText?: string;
    projectUrl?: string;
    tags?: string[];
    metrics?: string;
    displayOrder?: number;
    status?: ContentStatusType;
  }) {
    if (!data.title || !data.title.trim()) {
      throw new BadRequestException('Project title is required.');
    }
    if (!data.imageUrl || !data.imageUrl.trim()) {
      throw new BadRequestException('Project cover image URL is required.');
    }

    const slugBase = (data.slug || data.title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const slug = slugBase || `project-${Date.now()}`;

    const existing = await this.prisma.portfolioProjectItem.findUnique({
      where: { slug },
    });
    const finalSlug = existing ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

    let displayOrder = data.displayOrder;
    if (displayOrder === undefined || displayOrder === null) {
      const last = await this.prisma.portfolioProjectItem.findFirst({
        orderBy: { displayOrder: 'desc' },
        select: { displayOrder: true },
      });
      displayOrder = (last?.displayOrder ?? 0) + 1;
    }

    return this.prisma.portfolioProjectItem.create({
      data: {
        orderNumber: data.orderNumber?.trim() || null,
        title: data.title.trim(),
        slug: finalSlug,
        client: data.client?.trim() || null,
        categoryId: data.categoryId || null,
        description: data.description?.trim() || null,
        imageUrl: data.imageUrl.trim(),
        altText: data.altText?.trim() || data.title.trim(),
        projectUrl: data.projectUrl?.trim() || `/portfolio/${finalSlug}`,
        tags: data.tags || [],
        metrics: data.metrics?.trim() || null,
        displayOrder,
        status: (data.status as any) || 'PUBLISHED',
      },
      include: {
        category: true,
      },
    });
  }

  async updateProject(
    id: string,
    data: {
      orderNumber?: string;
      title?: string;
      slug?: string;
      client?: string;
      categoryId?: string;
      description?: string;
      imageUrl?: string;
      altText?: string;
      projectUrl?: string;
      tags?: string[];
      metrics?: string;
      displayOrder?: number;
      status?: ContentStatusType;
    },
  ) {
    const existing = await this.prisma.portfolioProjectItem.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Project with ID '${id}' not found.`);
    }

    let finalSlug: string | undefined = undefined;
    if (data.slug && data.slug !== existing.slug) {
      const slugCandidate = data.slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      const duplicate = await this.prisma.portfolioProjectItem.findUnique({
        where: { slug: slugCandidate },
      });
      if (duplicate && duplicate.id !== id) {
        throw new BadRequestException(`Project slug '${slugCandidate}' is already in use.`);
      }
      finalSlug = slugCandidate;
    }

    return this.prisma.portfolioProjectItem.update({
      where: { id },
      data: {
        ...(data.orderNumber !== undefined && { orderNumber: data.orderNumber?.trim() || null }),
        ...(data.title !== undefined && { title: data.title.trim() }),
        ...(finalSlug !== undefined && { slug: finalSlug }),
        ...(data.client !== undefined && { client: data.client?.trim() || null }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId || null }),
        ...(data.description !== undefined && { description: data.description?.trim() || null }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl.trim() }),
        ...(data.altText !== undefined && { altText: data.altText?.trim() || null }),
        ...(data.projectUrl !== undefined && { projectUrl: data.projectUrl?.trim() || null }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.metrics !== undefined && { metrics: data.metrics?.trim() || null }),
        ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
        ...(data.status !== undefined && { status: data.status as any }),
      },
      include: {
        category: true,
      },
    });
  }

  async deleteProject(id: string) {
    const existing = await this.prisma.portfolioProjectItem.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Project with ID '${id}' not found.`);
    }

    return this.prisma.portfolioProjectItem.delete({
      where: { id },
    });
  }

  async reorderProjects(items: Array<{ id: string; displayOrder: number }>) {
    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.portfolioProjectItem.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        }),
      ),
    );
  }
}
