import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CmsService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Services
  async getServices() {
    const services = await this.prisma.service.findMany({
      where: { deletedAt: null },
      orderBy: { displayOrder: 'asc' },
    });

    return services.map((s) => ({
      id: s.id,
      slug: s.slug,
      title: s.title,
      tagline: s.tagline || '',
      shortDescription: s.shortDescription,
      detailedContent: s.detailedContent || '',
      iconName: 'Layers',
      keyFeatures: [
        'Active-Active Multi-Region Orchestration',
        'Deterministic Zero-Data-Loss Ledger (RPO=0)',
        'Sub-Millisecond Byzantine Consensus (< 2.4ms P99)',
        'Automated Chaos-Engineered Failover Protocols',
      ],
      deliverables: [
        'Production Architecture Blueprint (TOGAF / C4 model)',
        'Automated OpenTofu & Kubernetes Multi-Region Topology',
        'Sovereign Security Attestation & Hardened Perimeters',
      ],
      technologies: ['Kubernetes', 'Apache Kafka', 'PostgreSQL Distributed', 'Rust Systems', 'eBPF Mesh'],
    }));
  }

  async getServiceBySlug(slug: string) {
    const s = await this.prisma.service.findFirst({
      where: { slug, deletedAt: null },
    });
    if (!s) throw new NotFoundException(`Service '${slug}' not found`);

    return {
      id: s.id,
      slug: s.slug,
      title: s.title,
      tagline: s.tagline || '',
      shortDescription: s.shortDescription,
      detailedContent: s.detailedContent || '',
      iconName: 'Layers',
      keyFeatures: [
        'Active-Active Multi-Region Orchestration',
        'Deterministic Zero-Data-Loss Ledger (RPO=0)',
        'Sub-Millisecond Byzantine Consensus (< 2.4ms P99)',
        'Automated Chaos-Engineered Failover Protocols',
      ],
      deliverables: [
        'Production Architecture Blueprint (TOGAF / C4 model)',
        'Automated OpenTofu & Kubernetes Multi-Region Topology',
        'Sovereign Security Attestation & Hardened Perimeters',
      ],
      technologies: ['Kubernetes', 'Apache Kafka', 'PostgreSQL Distributed', 'Rust Systems', 'eBPF Mesh'],
    };
  }

  // 2. Solutions
  async getSolutions() {
    const solutions = await this.prisma.solution.findMany({
      where: { deletedAt: null },
      orderBy: { displayOrder: 'asc' },
    });

    return solutions.map((sol) => ({
      id: sol.id,
      slug: sol.slug,
      title: sol.title,
      industry: 'Global Financial Infrastructure & Critical Systems',
      summary: sol.summary,
      challenge: 'Legacy core bottlenecks, batch window failures, and geographic single points of failure.',
      solution: 'Distributed state consensus mesh, microsecond streaming settlement, and multi-region failover.',
      roi: '99.999% Availability & 85% reduction in transactional latency',
      compliance: ['PCI DSS v4.0 Level 1', 'SOC 2 Type II', 'ISO/IEC 27001:2022'],
    }));
  }

  async getSolutionBySlug(slug: string) {
    const sol = await this.prisma.solution.findFirst({
      where: { slug, deletedAt: null },
    });
    if (!sol) throw new NotFoundException(`Solution '${slug}' not found`);

    return {
      id: sol.id,
      slug: sol.slug,
      title: sol.title,
      industry: 'Global Financial Infrastructure & Critical Systems',
      summary: sol.summary,
      challenge: 'Legacy core bottlenecks, batch window failures, and geographic single points of failure.',
      solution: 'Distributed state consensus mesh, microsecond streaming settlement, and multi-region failover.',
      roi: '99.999% Availability & 85% reduction in transactional latency',
      compliance: ['PCI DSS v4.0 Level 1', 'SOC 2 Type II', 'ISO/IEC 27001:2022'],
    };
  }

  // 3. Case Studies
  async getCaseStudies() {
    const items = await this.prisma.caseStudy.findMany({
      where: { deletedAt: null },
      include: {
        client: {
          include: { industry: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((cs) => ({
      id: cs.id,
      slug: cs.slug,
      title: cs.title,
      client: cs.client?.name || 'Apex Global Financial Group',
      clientTier: cs.client?.tier || 'STRATEGIC',
      industry: cs.client?.industry?.name || 'Financial Services',
      summary: cs.summary,
      challenge: cs.challengeStatement,
      solution: cs.solutionStatement,
      impactMetrics: (cs.impactMetrics as any[]) || [
        { metric: '99.999%', label: 'Availability', description: 'Zero downtime achieved during 24 months of continuous operations' },
        { metric: '$18B/day', label: 'Volume Processed', description: 'Across 14 global financial settlement nodes' },
        { metric: '1.8ms', label: 'End-to-End Latency', description: 'Down from 8 hours batch clearance' },
      ],
      clientQuote: {
        quote: 'Gypsym Technology engineered our mission-critical distributed clearing core with zero downtime. Their technical depth in distributed consensus and deterministic recovery is unprecedented.',
        author: 'Dr. Elena Rostova',
        role: 'Chief Information Officer, Apex Global Financial Group',
      },
    }));
  }

  async getCaseStudyBySlug(slug: string) {
    const cs = await this.prisma.caseStudy.findFirst({
      where: { slug, deletedAt: null },
      include: {
        client: {
          include: { industry: true },
        },
      },
    });
    if (!cs) throw new NotFoundException(`Case study '${slug}' not found`);

    return {
      id: cs.id,
      slug: cs.slug,
      title: cs.title,
      client: cs.client?.name || 'Apex Global Financial Group',
      clientTier: cs.client?.tier || 'STRATEGIC',
      industry: cs.client?.industry?.name || 'Financial Services',
      summary: cs.summary,
      challenge: cs.challengeStatement,
      solution: cs.solutionStatement,
      impactMetrics: (cs.impactMetrics as any[]) || [
        { metric: '99.999%', label: 'Availability', description: 'Zero downtime achieved during 24 months of continuous operations' },
        { metric: '$18B/day', label: 'Volume Processed', description: 'Across 14 global financial settlement nodes' },
        { metric: '1.8ms', label: 'End-to-End Latency', description: 'Down from 8 hours batch clearance' },
      ],
      clientQuote: {
        quote: 'Gypsym Technology engineered our mission-critical distributed clearing core with zero downtime.',
        author: 'Dr. Elena Rostova',
        role: 'Chief Information Officer, Apex Global Financial Group',
      },
    };
  }

  // 4. Blog Posts
  async getBlogPosts(): Promise<any[]> {
    const posts = await this.prisma.blogPost.findMany({
      where: { deletedAt: null },
      include: {
        author: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return posts.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      category: p.category?.name || 'Distributed Systems',
      author: {
        name: p.author ? `${p.author.firstName} ${p.author.lastName}` : 'MohammadAli Kadiwal',
        role: 'Chief Technology Officer & Lead Architect',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      },
      publishedAt: p.publishedAt ? p.publishedAt.toISOString().split('T')[0] : '2026-09-01',
      readTime: `${p.readTimeMinutes || 8} min read`,
      bodyContent: p.bodyContent,
      content: [
        p.excerpt,
        'High-availability guarantees in modern financial and cloud infrastructures can no longer tolerate active-passive standby configurations.',
        'By architecting active-active multi-cloud topologies across geographically distributed regions, failure recovery times collapse from minutes to microseconds.',
        'Deterministic state synchronization requires distributed log replication with monotonic sequencing to avoid split-brain states under partitioned networks.',
      ],
    }));
  }

  async getBlogPostBySlug(slug: string): Promise<any> {
    const p = await this.prisma.blogPost.findFirst({
      where: { slug, deletedAt: null },
      include: {
        author: true,
        category: true,
      },
    });
    if (!p) throw new NotFoundException(`Blog post '${slug}' not found`);

    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      category: p.category?.name || 'Distributed Systems',
      author: {
        name: p.author ? `${p.author.firstName} ${p.author.lastName}` : 'MohammadAli Kadiwal',
        role: 'Chief Technology Officer & Lead Architect',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      },
      publishedAt: p.publishedAt ? p.publishedAt.toISOString().split('T')[0] : '2026-09-01',
      readTime: `${p.readTimeMinutes || 8} min read`,
      bodyContent: p.bodyContent,
      content: [
        p.excerpt,
        'High-availability guarantees in modern financial and cloud infrastructures can no longer tolerate active-passive standby configurations.',
        'By architecting active-active multi-cloud topologies across geographically distributed regions, failure recovery times collapse from minutes to microseconds.',
        'Deterministic state synchronization requires distributed log replication with monotonic sequencing to avoid split-brain states under partitioned networks.',
      ],
    };
  }

  // 5. Jobs / Careers
  async getJobs() {
    const jobs = await this.prisma.job.findMany({
      where: { deletedAt: null },
      include: { department: true },
      orderBy: { createdAt: 'desc' },
    });

    return jobs.map((j) => ({
      id: j.id,
      slug: j.slug,
      title: j.title,
      department: j.department?.name || 'Cloud & Distributed Systems',
      location: j.locationName || 'North America / EMEA (Remote)',
      type: j.employmentType === 'FULL_TIME' ? 'Full-time' : 'Contract',
      experience: j.experienceLevel || 'Principal',
      salaryRange: j.salaryRangeDisplay || '$240,000 - $310,000 USD + Equity',
      overview: j.overview,
      responsibilities: j.responsibilities || [],
      qualifications: j.qualifications || [],
    }));
  }

  async getJobBySlug(slug: string) {
    const j = await this.prisma.job.findFirst({
      where: { slug, deletedAt: null },
      include: { department: true },
    });
    if (!j) throw new NotFoundException(`Job '${slug}' not found`);

    return {
      id: j.id,
      slug: j.slug,
      title: j.title,
      department: j.department?.name || 'Cloud & Distributed Systems',
      location: j.locationName || 'North America / EMEA (Remote)',
      type: j.employmentType === 'FULL_TIME' ? 'Full-time' : 'Contract',
      experience: j.experienceLevel || 'Principal',
      salaryRange: j.salaryRangeDisplay || '$240,000 - $310,000 USD + Equity',
      overview: j.overview,
      responsibilities: j.responsibilities || [],
      qualifications: j.qualifications || [],
    };
  }

  // 6. Team
  async getTeam() {
    const members = await this.prisma.teamMember.findMany({
      where: { isActive: true },
      include: { department: true },
      orderBy: { displayOrder: 'asc' },
    });

    return members.map((m) => ({
      id: m.id,
      slug: m.slug,
      name: `${m.firstName} ${m.lastName}`,
      role: m.roleTitle,
      department: m.department?.name || 'Executive Leadership',
      bio: m.bio || '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      socialLinks: {
        linkedin: m.linkedinUrl || 'https://linkedin.com/company/gypsym',
        twitter: m.twitterUrl || 'https://twitter.com/gypsymtech',
        github: m.githubUrl || 'https://github.com/gypsym',
      },
    }));
  }

  // 7. Dynamic Brand Settings
  async getBrandSettings(): Promise<any> {
    const brand = await this.prisma.brandSetting.findFirst({
      where: { isActive: true },
      orderBy: { version: 'desc' },
      include: {
        logoLight: true,
        logoDark: true,
        favicon: true,
      },
    });

    if (!brand) {
      throw new NotFoundException('Active brand settings not found in database');
    }

    return {
      id: brand.id,
      companyName: brand.companyName,
      colors: brand.colors,
      typography: brand.typography,
      socialLinks: brand.socialLinks,
      logoLight: this.logoUrlFromMedia(brand.logoLight) || brand.logoLight?.storageKey || null,
      logoDark: this.logoUrlFromMedia(brand.logoDark) || brand.logoDark?.storageKey || null,
      favicon: this.logoUrlFromMedia(brand.favicon) || brand.favicon?.storageKey || null,
    };
  }

  async updateBrandSettings(body: {
    companyName?: string;
    logoLightUrl?: string;
    logoDarkUrl?: string;
    faviconUrl?: string;
    colors?: any;
    typography?: any;
    socialLinks?: any;
  }): Promise<any> {
    const active = await this.prisma.brandSetting.findFirst({
      where: { isActive: true },
      orderBy: { version: 'desc' },
    });

    const getMediaId = async (url?: string, name = 'brand-asset') => {
      if (!url) return undefined;
      const media = await this.prisma.media.create({
        data: {
          originalFilename: `${name}-${Date.now()}`,
          mimeType: url.includes('svg') ? 'image/svg+xml' : 'image/png',
          fileSizeBytes: BigInt(url.length),
          storageKey: `brand/${name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          variants: { original: url, lg: url, md: url },
        },
      });
      return media.id;
    };

    const logoLightId = body.logoLightUrl !== undefined ? await getMediaId(body.logoLightUrl, 'logo-light') : undefined;
    const logoDarkId = body.logoDarkUrl !== undefined ? await getMediaId(body.logoDarkUrl, 'logo-dark') : undefined;
    const faviconId = body.faviconUrl !== undefined ? await getMediaId(body.faviconUrl, 'favicon') : undefined;

    if (active) {
      await this.prisma.brandSetting.update({
        where: { id: active.id },
        data: {
          ...(body.companyName ? { companyName: body.companyName } : {}),
          ...(logoLightId !== undefined ? { logoLightId } : {}),
          ...(logoDarkId !== undefined ? { logoDarkId } : {}),
          ...(faviconId !== undefined ? { faviconId } : {}),
          ...(body.colors ? { colors: body.colors } : {}),
          ...(body.typography ? { typography: body.typography } : {}),
          ...(body.socialLinks ? { socialLinks: body.socialLinks } : {}),
        },
      });
    } else {
      await this.prisma.brandSetting.create({
        data: {
          companyName: body.companyName || 'Gypsym Technology',
          logoLightId: logoLightId || null,
          logoDarkId: logoDarkId || null,
          faviconId: faviconId || null,
          colors: body.colors || {},
          typography: body.typography || {},
          socialLinks: body.socialLinks || [],
          isActive: true,
        },
      });
    }

    return this.getBrandSettings();
  }

  // 8. Site Settings
  async getSiteSettings(): Promise<Record<string, any>> {
    const settings = await this.prisma.siteSetting.findMany({
      where: { isPublic: true },
    });

    const result: Record<string, any> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    return result;
  }

  // 9. Dynamic Pages & Sections
  async getPageBySlug(slug: string): Promise<any> {
    const page = await this.prisma.page.findFirst({
      where: {
        slug,
        status: 'PUBLISHED',
        deletedAt: null,
      },
      include: {
        sections: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
        seoMetadata: true,
      },
    });

    if (!page) {
      throw new NotFoundException(`Page '${slug}' not found or not published`);
    }

    // Load live dependencies concurrently
    const [liveClients, livePartners, livePortfolioProjects, siteSettingsRow, brandSettingsRow] = await Promise.all([
      this.getClients(),
      this.getPartners({ status: 'PUBLISHED', showOnHomepage: true }),
      (this.prisma as any).portfolioProjectItem.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
        include: { category: true },
      }),
      this.prisma.siteSetting.findUnique({ where: { key: 'site_settings' } }).catch(() => null),
      this.prisma.brandSetting.findFirst({ where: { isActive: true } }).catch(() => null),
    ]);

    const sections = page.sections.map((section: any) => {
      const cType = (section.componentType || '').toUpperCase();
      const sId = (section.sectionIdentifier || '').toLowerCase();

      // 1. Hero client strip
      if (cType === 'HERO') {
        const payload = (section.contentPayload as Record<string, any>) || {};
        const clientStrip = payload.clientStrip || {};
        return {
          ...section,
          contentPayload: {
            ...payload,
            clientStrip: {
              ...clientStrip,
              enabled: clientStrip.enabled ?? true,
              title: clientStrip.title || 'The agency behind ..',
              clients: liveClients
                .filter((c: any) => c.logoUrl && !c.logoUrl.includes('apex-bank-logo'))
                .map((c: any) => ({
                  id: c.id,
                  name: c.name,
                  logoUrl: c.logoUrl ?? '',
                  websiteUrl: c.websiteUrl ?? '',
                })),
            },
          },
        };
      }

      // 2. Dedicated Clients / Trusted By section (LOGO_CLOUD)
      if (cType === 'LOGO_CLOUD' && (sId === 'clients-trusted-by' || sId === 'trusted-by')) {
        const payload = (section.contentPayload as Record<string, any>) || {};

        // Show all active live clients by default from Clients module
        const seenNames = new Set<string>();
        const seenLogos = new Set<string>();

        const allClients = liveClients
          .filter((c: any) => {
            if (!c.logoUrl) return false;
            if (c.logoUrl.includes('apex-bank-logo')) return false;
            const n = (c.name || '').trim().toLowerCase();
            const l = (c.logoUrl || '').trim();
            if (seenNames.has(n) || seenLogos.has(l)) return false;
            seenNames.add(n);
            seenLogos.add(l);
            return true;
          })
          .map((c: any) => ({
            id: c.id,
            name: c.name,
            logoUrl: c.logoUrl,
            websiteUrl: c.websiteUrl ?? null,
            tier: c.tier,
            displayOrder: c.displayOrder,
          }));

        return {
          ...section,
          contentPayload: {
            ...payload,
            clients: allClients,
          },
        };
      }

      // 3. Dedicated Partners section (PARTNERS or sectionIdentifier: homepage-partners / our-partners / partners)
      if (cType === 'PARTNERS' || sId === 'homepage-partners' || sId === 'our-partners' || sId === 'partners') {
        const payload = (section.contentPayload as Record<string, any>) || {};
        return {
          ...section,
          contentPayload: {
            ...payload,
            // Sourced automatically from Partners module (no selector allowed)
            partners: livePartners,
          },
        };
      }

      // 3b. Dedicated Portfolio / Our Work section (PORTFOLIO / OUR_WORK / FEATURE_GRID with portfolio-showcase / our-work-portfolio)
      if (
        cType === 'PORTFOLIO' ||
        cType === 'OUR_WORK' ||
        sId === 'portfolio-showcase' ||
        sId === 'our-work-portfolio' ||
        sId === 'portfolio' ||
        sId === 'our-work'
      ) {
        const payload = (section.contentPayload as Record<string, any>) || {};
        return {
          ...section,
          contentPayload: {
            ...payload,
            projects: livePortfolioProjects.map((p: any) => ({
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
            })),
          },
        };
      }

      // 4. Dedicated Contact / Inquiry section
      if (cType === 'CONTACT' || sId === 'contact-inquiry' || sId === 'contact') {
        const payload = (section.contentPayload as Record<string, any>) || {};
        const siteVal = (siteSettingsRow?.value as Record<string, any>) || {};
        return {
          ...section,
          contentPayload: {
            ...payload,
            globalContactDetails: {
              email: siteVal.primaryEmail || 'briefing@gypsym.com',
              phone: siteVal.primaryPhone || '+44 20 7946 0991',
              address: siteVal.headquarters || '100 Bishopsgate, London EC2N 4AG, United Kingdom',
              socialLinks: brandSettingsRow?.socialLinks || [],
            },
          },
        };
      }

      // 5. Dedicated CTA section
      if (cType === 'CTA' || sId === 'cta' || sId === 'cta-banner' || sId === 'homepage-cta') {
        const payload = (section.contentPayload as Record<string, any>) || {};
        return {
          ...section,
          contentPayload: {
            ...payload,
          },
        };
      }

      return section;
    });

    return { ...page, sections };
  }


  // 10. Dynamic Navigation
  async getNavigationByKey(key: string): Promise<any> {
    const nav = await this.prisma.navigation.findUnique({
      where: { key },
      include: {
        items: {
          where: { isActive: true, parentId: null },
          orderBy: { displayOrder: 'asc' },
          include: {
            children: {
              where: { isActive: true },
              orderBy: { displayOrder: 'asc' },
            },
          },
        },
      },
    });

    if (!nav) {
      throw new NotFoundException(`Navigation '${key}' not found in database`);
    }

    return nav;
  }

  // 11. Consolidated Dynamic Header
  async getHeaderData(): Promise<any> {
    const [branding, navigation, headerSetting] = await Promise.all([
      this.getBrandSettings().catch(() => null),
      this.getNavigationByKey('header').catch(() => null),
      this.prisma.siteSetting
        .findUnique({ where: { key: 'header_config' } })
        .then((s) => s?.value || null),
    ]);

    return {
      branding,
      navigation,
      config: headerSetting,
    };
  }

  // 12. CMS Updates (Admin Endpoints)
  async updateSiteSetting(key: string, value: any): Promise<any> {
    return this.prisma.siteSetting.upsert({
      where: { key },
      create: {
        key,
        category: 'system',
        value,
        isPublic: true,
      },
      update: {
        value,
      },
    });
  }

  async updateNavigation(key: string, items: any[]): Promise<any> {
    const nav = await this.prisma.navigation.findUnique({
      where: { key },
    });
    if (!nav) throw new NotFoundException(`Navigation '${key}' not found`);

    await this.prisma.$transaction(async (tx) => {
      await tx.navigationItem.deleteMany({
        where: { navigationId: nav.id },
      });

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const createdParent = await tx.navigationItem.create({
          data: {
            navigationId: nav.id,
            label: item.label,
            url: item.url || item.href || '#',
            icon: item.icon || null,
            badgeText: item.badgeText || null,
            isExternal: item.isExternal || false,
            displayOrder: item.displayOrder ?? i,
            megaMenuConfig: item.megaMenuConfig || null,
            isActive: item.isActive ?? true,
          },
        });

        if (item.children && Array.isArray(item.children)) {
          for (let j = 0; j < item.children.length; j++) {
            const child = item.children[j];
            await tx.navigationItem.create({
              data: {
                navigationId: nav.id,
                parentId: createdParent.id,
                label: child.label,
                url: child.url || child.href || '#',
                icon: child.icon || null,
                badgeText: child.badgeText || null,
                isExternal: child.isExternal || false,
                displayOrder: child.displayOrder ?? j,
                isActive: child.isActive ?? true,
              },
            });
          }
        }
      }
    });

    return this.getNavigationByKey(key);
  }

  async updateSection(id: string, payload: any): Promise<any> {
    const section = await this.prisma.pageSection.findUnique({ where: { id } });
    if (!section) throw new NotFoundException(`Section '${id}' not found`);

    return this.prisma.pageSection.update({
      where: { id },
      data: {
        ...(payload.contentPayload !== undefined ? { contentPayload: payload.contentPayload } : {}),
        ...(payload.stylesOverride !== undefined ? { stylesOverride: payload.stylesOverride } : {}),
        ...(payload.displayOrder !== undefined ? { displayOrder: payload.displayOrder } : {}),
        ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
      },
    });
  }

  async createSection(slug: string, payload: any): Promise<any> {
    const page = await this.prisma.page.findFirst({
      where: { slug, deletedAt: null },
    });
    if (!page) throw new NotFoundException(`Page '${slug}' not found`);

    return this.prisma.pageSection.create({
      data: {
        pageId: page.id,
        sectionIdentifier: payload.sectionIdentifier || `sec-${Date.now()}`,
        componentType: payload.componentType,
        displayOrder: payload.displayOrder ?? 0,
        contentPayload: payload.contentPayload || {},
        stylesOverride: payload.stylesOverride || null,
        isActive: payload.isActive ?? true,
      },
    });
  }

  async deleteSection(id: string): Promise<any> {
    return this.prisma.pageSection.delete({ where: { id } });
  }

  // ── Clients ──────────────────────────────────────────────────────────────────

  /** Extract the logo URL we stored in media.variants.original */
  private logoUrlFromMedia(media: { variants: any } | null): string | null {
    if (!media?.variants) return null;
    const v = media.variants as Record<string, string>;
    return v.original ?? v.lg ?? v.md ?? null;
  }

  async getClients(): Promise<any[]> {
    const clients = await this.prisma.client.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        logoLight: { select: { variants: true } },
      },
    });
    return clients.map((c) => ({
      id: c.id,
      name: c.name,
      logoUrl: this.logoUrlFromMedia(c.logoLight),
      websiteUrl: c.websiteUrl ?? null,
      tier: c.tier,
      isFeatured: c.isFeatured,
      displayOrder: c.displayOrder,
      isActive: true,
      createdAt: c.createdAt,
    }));
  }

  async createClient(body: {
    name: string;
    logoUrl?: string;
    websiteUrl?: string;
  }): Promise<any> {
    // Persist logoUrl in media.variants JSON so it survives without S3 upload
    const mediaRow = await this.prisma.media.create({
      data: {
        originalFilename: `${body.name.toLowerCase().replace(/\s+/g, '-')}-logo`,
        mimeType: 'image/svg+xml',
        fileSizeBytes: BigInt(0),
        storageKey: `clients/logo-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        altText: `${body.name} logo`,
        variants: body.logoUrl ? { original: body.logoUrl } : {},
      },
    });

    const lastClient = await this.prisma.client.findFirst({
      orderBy: { displayOrder: 'desc' },
      select: { displayOrder: true },
    });
    const nextOrder = (lastClient?.displayOrder ?? 0) + 10;

    const slug =
      body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') +
      '-' +
      Date.now();

    const client = await this.prisma.client.create({
      data: {
        slug,
        name: body.name,
        logoLightId: mediaRow.id,
        logoDarkId: mediaRow.id,
        websiteUrl: body.websiteUrl || null,
        displayOrder: nextOrder,
      },
      include: { logoLight: { select: { variants: true } } },
    });

    return {
      id: client.id,
      name: client.name,
      logoUrl: this.logoUrlFromMedia(client.logoLight),
      websiteUrl: client.websiteUrl ?? null,
      tier: client.tier,
      isFeatured: client.isFeatured,
      displayOrder: client.displayOrder,
      isActive: true,
      createdAt: client.createdAt,
    };
  }

  async updateClient(
    id: string,
    body: { name?: string; logoUrl?: string; websiteUrl?: string },
  ): Promise<any> {
    const existing = await this.prisma.client.findUnique({
      where: { id },
      select: { logoLightId: true },
    });
    if (!existing) throw new NotFoundException(`Client '${id}' not found`);

    // Update logo URL stored in variants JSON
    if (body.logoUrl !== undefined) {
      await this.prisma.media.update({
        where: { id: existing.logoLightId },
        data: { variants: { original: body.logoUrl } },
      });
    }

    const client = await this.prisma.client.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.websiteUrl !== undefined && { websiteUrl: body.websiteUrl }),
      },
      include: { logoLight: { select: { variants: true } } },
    });

    return {
      id: client.id,
      name: client.name,
      logoUrl: this.logoUrlFromMedia(client.logoLight),
      websiteUrl: client.websiteUrl ?? null,
      tier: client.tier,
      isFeatured: client.isFeatured,
      displayOrder: client.displayOrder,
      isActive: true,
      createdAt: client.createdAt,
    };
  }

  async deleteClient(id: string): Promise<void> {
    const existing = await this.prisma.client.findUnique({
      where: { id },
      select: { logoLightId: true, logoDarkId: true },
    });
    if (!existing) throw new NotFoundException(`Client '${id}' not found`);
    await this.prisma.client.delete({ where: { id } });
    const mediaIds = [...new Set([existing.logoLightId, existing.logoDarkId])];
    await this.prisma.media.deleteMany({ where: { id: { in: mediaIds } } });
  }

  // ── Partners ──────────────────────────────────────────────────────────────────

  async getPartners(filters?: {
    status?: string;
    showOnHomepage?: boolean | string;
    partnerType?: string;
    search?: string;
  }): Promise<any[]> {
    const where: any = {};

    if (filters?.status && filters.status !== 'ALL') {
      where.status = filters.status;
    }
    if (filters?.showOnHomepage !== undefined && filters.showOnHomepage !== 'ALL') {
      where.showOnHomepage = filters.showOnHomepage === true || filters.showOnHomepage === 'true';
    }
    if (filters?.partnerType && filters.partnerType !== 'ALL') {
      where.partnerType = filters.partnerType;
    }
    if (filters?.search && filters.search.trim()) {
      where.OR = [
        { name: { contains: filters.search.trim(), mode: 'insensitive' } },
        { shortDescription: { contains: filters.search.trim(), mode: 'insensitive' } },
        { partnerType: { contains: filters.search.trim(), mode: 'insensitive' } },
        { industry: { contains: filters.search.trim(), mode: 'insensitive' } },
      ];
    }

    const partners = await this.prisma.partner.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
      include: {
        logo: { select: { variants: true } },
        logoDark: { select: { variants: true } },
      },
    });

    return partners.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      tier: p.tier,
      logoUrl: this.logoUrlFromMedia(p.logo),
      logoDarkUrl: this.logoUrlFromMedia(p.logoDark),
      partnershipOverview: p.partnershipOverview,
      shortDescription: p.shortDescription,
      description: p.description,
      websiteUrl: p.websiteUrl ?? null,
      partnerType: p.partnerType ?? null,
      industry: p.industry ?? null,
      displayOrder: p.displayOrder,
      status: p.status,
      showOnHomepage: p.showOnHomepage,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  async getPartnerById(id: string): Promise<any> {
    const p = await this.prisma.partner.findUnique({
      where: { id },
      include: {
        logo: { select: { variants: true } },
        logoDark: { select: { variants: true } },
      },
    });
    if (!p) throw new NotFoundException(`Partner '${id}' not found`);

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      tier: p.tier,
      logoUrl: this.logoUrlFromMedia(p.logo),
      logoDarkUrl: this.logoUrlFromMedia(p.logoDark),
      partnershipOverview: p.partnershipOverview,
      shortDescription: p.shortDescription,
      description: p.description,
      websiteUrl: p.websiteUrl ?? null,
      partnerType: p.partnerType ?? null,
      industry: p.industry ?? null,
      displayOrder: p.displayOrder,
      status: p.status,
      showOnHomepage: p.showOnHomepage,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  async createPartner(body: {
    name: string;
    slug?: string;
    tier?: any;
    logoUrl?: string;
    logoDarkUrl?: string;
    shortDescription?: string;
    description?: string;
    websiteUrl?: string;
    partnerType?: string;
    industry?: string;
    displayOrder?: number;
    status?: any;
    showOnHomepage?: boolean;
  }): Promise<any> {
    const slugBase = (body.slug || body.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const slug = slugBase || `partner-${Date.now()}`;

    // Ensure unique slug
    const existingSlug = await this.prisma.partner.findUnique({ where: { slug } });
    const finalSlug = existingSlug ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

    // Create logo Media record
    const logoMedia = await this.prisma.media.create({
      data: {
        originalFilename: `${body.name.toLowerCase().replace(/\s+/g, '-')}-logo`,
        mimeType: 'image/svg+xml',
        fileSizeBytes: BigInt(0),
        storageKey: `partners/logo-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        altText: `${body.name} logo`,
        variants: body.logoUrl ? { original: body.logoUrl } : {},
      },
    });

    // Create dark logo Media record if provided
    let logoDarkMediaId: string | null = null;
    if (body.logoDarkUrl) {
      const darkMedia = await this.prisma.media.create({
        data: {
          originalFilename: `${body.name.toLowerCase().replace(/\s+/g, '-')}-logo-dark`,
          mimeType: 'image/svg+xml',
          fileSizeBytes: BigInt(0),
          storageKey: `partners/logo-dark-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          altText: `${body.name} dark logo`,
          variants: { original: body.logoDarkUrl },
        },
      });
      logoDarkMediaId = darkMedia.id;
    }

    let displayOrder = body.displayOrder;
    if (displayOrder === undefined || displayOrder === null) {
      const lastPartner = await this.prisma.partner.findFirst({
        orderBy: { displayOrder: 'desc' },
        select: { displayOrder: true },
      });
      displayOrder = (lastPartner?.displayOrder ?? 0) + 1;
    }

    const partner = await this.prisma.partner.create({
      data: {
        slug: finalSlug,
        name: body.name,
        tier: body.tier || 'TECHNOLOGY',
        logoId: logoMedia.id,
        logoDarkId: logoDarkMediaId,
        shortDescription: body.shortDescription || null,
        description: body.description || null,
        websiteUrl: body.websiteUrl || null,
        partnerType: body.partnerType || null,
        industry: body.industry || null,
        displayOrder,
        status: body.status || 'PUBLISHED',
        showOnHomepage: body.showOnHomepage ?? true,
      },
      include: {
        logo: { select: { variants: true } },
        logoDark: { select: { variants: true } },
      },
    });

    return {
      id: partner.id,
      slug: partner.slug,
      name: partner.name,
      tier: partner.tier,
      logoUrl: this.logoUrlFromMedia(partner.logo),
      logoDarkUrl: this.logoUrlFromMedia(partner.logoDark),
      shortDescription: partner.shortDescription,
      description: partner.description,
      websiteUrl: partner.websiteUrl ?? null,
      partnerType: partner.partnerType ?? null,
      industry: partner.industry ?? null,
      displayOrder: partner.displayOrder,
      status: partner.status,
      showOnHomepage: partner.showOnHomepage,
      createdAt: partner.createdAt,
      updatedAt: partner.updatedAt,
    };
  }

  async updatePartner(
    id: string,
    body: {
      name?: string;
      slug?: string;
      tier?: any;
      logoUrl?: string;
      logoDarkUrl?: string;
      shortDescription?: string;
      description?: string;
      websiteUrl?: string;
      partnerType?: string;
      industry?: string;
      displayOrder?: number;
      status?: any;
      showOnHomepage?: boolean;
    },
  ): Promise<any> {
    const existing = await this.prisma.partner.findUnique({
      where: { id },
      select: { id: true, logoId: true, logoDarkId: true },
    });
    if (!existing) throw new NotFoundException(`Partner '${id}' not found`);

    // Update logo media
    if (body.logoUrl !== undefined) {
      if (existing.logoId) {
        await this.prisma.media.update({
          where: { id: existing.logoId },
          data: { variants: { original: body.logoUrl } },
        });
      }
    }

    // Update or create logoDark media
    let logoDarkId = existing.logoDarkId;
    if (body.logoDarkUrl !== undefined) {
      if (body.logoDarkUrl) {
        if (existing.logoDarkId) {
          await this.prisma.media.update({
            where: { id: existing.logoDarkId },
            data: { variants: { original: body.logoDarkUrl } },
          });
        } else {
          const darkMedia = await this.prisma.media.create({
            data: {
              originalFilename: `partner-dark-logo-${id}`,
              mimeType: 'image/svg+xml',
              fileSizeBytes: BigInt(0),
              storageKey: `partners/logo-dark-${Date.now()}`,
              variants: { original: body.logoDarkUrl },
            },
          });
          logoDarkId = darkMedia.id;
        }
      } else if (existing.logoDarkId) {
        logoDarkId = null;
      }
    }

    const partner = await this.prisma.partner.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.tier !== undefined && { tier: body.tier }),
        ...(body.shortDescription !== undefined && { shortDescription: body.shortDescription }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.websiteUrl !== undefined && { websiteUrl: body.websiteUrl }),
        ...(body.partnerType !== undefined && { partnerType: body.partnerType }),
        ...(body.industry !== undefined && { industry: body.industry }),
        ...(body.displayOrder !== undefined && { displayOrder: body.displayOrder }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.showOnHomepage !== undefined && { showOnHomepage: body.showOnHomepage }),
        ...(logoDarkId !== existing.logoDarkId && { logoDarkId }),
      },
      include: {
        logo: { select: { variants: true } },
        logoDark: { select: { variants: true } },
      },
    });

    return {
      id: partner.id,
      slug: partner.slug,
      name: partner.name,
      tier: partner.tier,
      logoUrl: this.logoUrlFromMedia(partner.logo),
      logoDarkUrl: this.logoUrlFromMedia(partner.logoDark),
      shortDescription: partner.shortDescription,
      description: partner.description,
      websiteUrl: partner.websiteUrl ?? null,
      partnerType: partner.partnerType ?? null,
      industry: partner.industry ?? null,
      displayOrder: partner.displayOrder,
      status: partner.status,
      showOnHomepage: partner.showOnHomepage,
      createdAt: partner.createdAt,
      updatedAt: partner.updatedAt,
    };
  }

  async deletePartner(id: string): Promise<void> {
    const existing = await this.prisma.partner.findUnique({
      where: { id },
      select: { logoId: true, logoDarkId: true },
    });
    if (!existing) throw new NotFoundException(`Partner '${id}' not found`);

    await this.prisma.partner.delete({ where: { id } });

    const mediaIds = [existing.logoId, existing.logoDarkId].filter(Boolean) as string[];
    if (mediaIds.length > 0) {
      await this.prisma.media.deleteMany({ where: { id: { in: mediaIds } } }).catch(() => {});
    }
  }

  async reorderPartners(items: Array<{ id: string; displayOrder: number }>): Promise<void> {
    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.partner.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        }),
      ),
    );
  }

  async updatePartnerHomepageVisibility(id: string, showOnHomepage: boolean): Promise<any> {
    return this.prisma.partner.update({
      where: { id },
      data: { showOnHomepage },
      select: { id: true, name: true, showOnHomepage: true },
    });
  }

  async bulkUpdatePartnerStatus(ids: string[], status: any): Promise<{ count: number }> {
    return this.prisma.partner.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });
  }

  async bulkDeletePartners(ids: string[]): Promise<{ count: number }> {
    const existing = await this.prisma.partner.findMany({
      where: { id: { in: ids } },
      select: { logoId: true, logoDarkId: true },
    });
    const mediaIds = existing.flatMap((e) => [e.logoId, e.logoDarkId]).filter(Boolean) as string[];

    const result = await this.prisma.partner.deleteMany({
      where: { id: { in: ids } },
    });

    if (mediaIds.length > 0) {
      await this.prisma.media.deleteMany({ where: { id: { in: mediaIds } } }).catch(() => {});
    }

    return result;
  }
}
