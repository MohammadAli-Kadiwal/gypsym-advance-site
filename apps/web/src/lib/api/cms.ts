import { API_CONFIG } from './config';
import { PageDto, NavigationDto, BrandSettingsDto, HeaderDataDto, FooterDataDto } from '../cms-types';

const API_BASE_URL = API_CONFIG.baseURL;

/**
 * Fetch dynamic page with active sections by slug from NestJS CMS API.
 * Server Component data fetching with Next.js ISR tags.
 */
export async function getPageBySlug(slug: string): Promise<PageDto | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/pages/${slug}`, {
      cache: 'no-store',
      next: { tags: [`page-${slug}`, 'pages'], revalidate: 0 },
    });
    if (!res.ok) {
      return null;
    }
    const json = await res.json();
    return (json?.data as PageDto) || null;
  } catch {
    return null;
  }
}

/**
 * Fetch dynamic navigation tree by key (e.g. 'header', 'footer') from NestJS CMS API.
 */
export async function getNavigation(key: string): Promise<NavigationDto | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/navigation/${key}`, {
      cache: 'no-store',
      next: { tags: [`nav-${key}`], revalidate: 0 },
    });
    if (!res.ok) {
      return null;
    }
    const json = await res.json();
    return (json?.data as NavigationDto) || null;
  } catch {
    return null;
  }
}

/**
 * Fetch active brand settings (theme tokens, logos, company name) from NestJS CMS API.
 */
export async function getBrandSettings(): Promise<BrandSettingsDto | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/branding`, {
      cache: 'no-store',
      next: { tags: ['brand-settings'], revalidate: 0 },
    });
    if (!res.ok) {
      return null;
    }
    const json = await res.json();
    return (json?.data as BrandSettingsDto) || null;
  } catch {
    return null;
  }
}

/**
 * Fetch dynamic site settings dictionary from NestJS CMS API.
 */
export async function getSiteSettings(): Promise<Record<string, any>> {
  try {
    const res = await fetch(`${API_BASE_URL}/settings`, {
      cache: 'no-store',
      next: { tags: ['site-settings'], revalidate: 0 },
    });
    if (!res.ok) {
      return {};
    }
    const json = await res.json();
    return (json?.data as Record<string, any>) || {};
  } catch {
    return {};
  }
}

/**
 * Fetch dynamic analytics, Google Analytics, Meta Pixel, and header/footer scripts.
 */
export async function getScriptSettings(): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/settings/scripts`, {
      cache: 'no-store',
      next: { tags: ['scripts-configuration'], revalidate: 0 },
    });
    if (!res.ok) {
      return null;
    }
    const json = await res.json();
    return json?.data || json || null;
  } catch {
    return null;
  }
}

/**
 * Fetch consolidated Header data (Branding, Navigation, Header Configuration)
 */
export async function getHeaderData(): Promise<HeaderDataDto> {
  try {
    const res = await fetch(`${API_BASE_URL}/header`, {
      cache: 'no-store',
      next: { tags: ['header-all'], revalidate: 0 },
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.data) {
        return json.data as HeaderDataDto;
      }
    }
  } catch {
    // Network failure
  }
  return {
    branding: null,
    navigation: null,
    config: null,
  };
}

/**
 * Fetch consolidated dynamic Footer data
 */
export async function getFooterData(): Promise<FooterDataDto> {
  try {
    const res = await fetch(`${API_BASE_URL}/footer`, {
      cache: 'no-store',
      next: { tags: ['footer-all'], revalidate: 0 },
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.data) {
        return json.data as FooterDataDto;
      }
    }
  } catch {
    // Network failure
  }
  return {
    branding: null,
    navigation: null,
    config: null,
    contact: null,
    entity: null,
  };
}

export interface PortfolioCategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  status: string;
  projectCount: number;
}

export interface PortfolioProjectItemDto {
  id: string;
  orderNumber?: string;
  title: string;
  slug: string;
  client?: string;
  category?: string;
  categorySlug?: string;
  categoryId?: string;
  description?: string;
  imageUrl: string;
  altText?: string;
  projectUrl?: string;
  tags?: string[];
  metrics?: string;
  displayOrder: number;
  status: string;
}

export async function getPortfolioCategories(): Promise<PortfolioCategoryItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio/categories`, {
      cache: 'no-store',
      next: { tags: ['portfolio-categories'], revalidate: 0 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json?.data ?? json;
    const array = Array.isArray(data) ? data : [];
    return array.filter((c: any) => c.status === 'PUBLISHED');
  } catch {
    return [];
  }
}

export async function getPortfolioProjects(categorySlug?: string): Promise<PortfolioProjectItemDto[]> {
  try {
    const url = new URL(`${API_BASE_URL}/portfolio`);
    if (categorySlug && categorySlug !== 'all') {
      url.searchParams.set('category', categorySlug);
    }
    const res = await fetch(url.toString(), {
      cache: 'no-store',
      next: { tags: ['portfolio-projects'], revalidate: 0 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const list = json?.data?.projects ?? json?.projects ?? (Array.isArray(json?.data) ? json.data : []);
    const array = Array.isArray(list) ? list : [];
    return array.filter((p: any) => p.status === 'PUBLISHED');
  } catch {
    return [];
  }
}

export interface ServiceProcessStep {
  step: string;
  title: string;
  description: string;
}

export interface ServiceBenefit {
  title: string;
  description: string;
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface ServicePriceTier {
  name: string;
  description: string;
  isPopular?: boolean;
  prices: { currency: string; symbol: string; amount: string; period?: string }[];
  features: string[];
}

export interface ServiceItemDto {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  shortDescription: string;
  detailedContent: string;
  category?: string;
  iconName?: string;
  keyFeatures?: string[];
  deliverables?: string[];
  technologies?: string[];
  process?: ServiceProcessStep[];
  benefits?: ServiceBenefit[];
  faqs?: ServiceFaq[];
  pricing?: ServicePriceTier[];
}

export async function getServices(): Promise<ServiceItemDto[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/services?status=PUBLISHED`, {
      cache: 'no-store',
      next: { tags: ['services'], revalidate: 0 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const list = json?.data ?? json;
    const array = Array.isArray(list) ? list : [];
    return array.filter((s: any) => s.status === 'PUBLISHED');
  } catch {
    return [];
  }
}

export async function getServiceBySlug(slug: string): Promise<ServiceItemDto | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/services/${slug}?status=PUBLISHED`, {
      cache: 'no-store',
      next: { tags: [`service-${slug}`], revalidate: 0 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const item = (json?.data ?? json) || null;
    if (item && item.status !== 'PUBLISHED') return null;
    return item;
  } catch {
    return null;
  }
}

export interface CmsPageSummary {
  id: string;
  slug: string;
  title: string;
  status: string;
}

export async function getPublishedPages(): Promise<CmsPageSummary[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/pages`, {
      cache: 'no-store',
      next: { tags: ['cms-pages'], revalidate: 0 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const list: any[] = json?.data ?? json;
    if (!Array.isArray(list)) return [];
    return list
      .filter((p) => p.status === 'published')
      .map((p) => ({ id: p.id, slug: p.slug, title: p.title, status: p.status }));
  } catch {
    return [];
  }
}

export async function getClients(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/clients?status=PUBLISHED`, {
      cache: 'no-store',
      next: { tags: ['clients'], revalidate: 0 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const list = json?.data ?? json;
    const array = Array.isArray(list) ? list : [];
    return array.filter((c: any) => c.status !== 'DRAFT' && c.isFeatured !== false && c.isActive !== false);
  } catch {
    return [];
  }
}

export async function getTeamMembers(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/team`, {
      cache: 'no-store',
      next: { tags: ['team'], revalidate: 0 },
    });
    if (!res.ok) {
      const fallback = await fetch(`${API_BASE_URL}/cms/collections/team`, { cache: 'no-store', next: { tags: ['team'], revalidate: 0 } }).catch(() => null);
      if (fallback?.ok) {
        const fj = await fallback.json();
        const flist = fj?.data ?? fj;
        const array = Array.isArray(flist) ? flist : [];
        return array.filter((m: any) => m.isActive !== false && m.status !== 'DRAFT');
      }
      return [];
    }
    const json = await res.json();
    const list = json?.data ?? json;
    const array = Array.isArray(list) ? list : [];
    return array.filter((m: any) => m.isActive !== false && m.status !== 'DRAFT');
  } catch {
    return [];
  }
}

export interface BlogCategoryDto {
  id: string;
  slug: string;
  name: string;
  description?: string;
  postCount: number;
}

export interface BlogPostItemDto {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  status: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  author: {
    name: string;
    role: string;
    avatar?: string;
    bio?: string;
    extendedBio?: string;
    socials?: {
      linkedin?: string;
      twitter?: string;
      github?: string;
      website?: string;
    };
  };
  coverImage: string;
  readTimeMinutes: number;
  readTime: string;
  publishedAt: string;
  publishedDate: string;
  viewCount: number;
  tags: string[];
}

export interface BlogPostDetailDto extends BlogPostItemDto {
  bodyContent?: {
    sections?: Array<{
      heading?: string;
      subheading?: string;
      paragraphs?: string[];
      callout?: {
        title: string;
        text: string;
      };
      quote?: {
        text: string;
        citation: string;
      };
      bulletPoints?: string[];
      codeSnippet?: {
        language: string;
        code: string;
      };
    }>;
  };
  related?: BlogPostItemDto[];
}

export async function getBlogCategories(): Promise<BlogCategoryDto[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/blog/categories`, {
      cache: 'no-store',
      next: { tags: ['blog-categories'], revalidate: 0 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const list = json?.data ?? json;
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function getBlogPosts(options?: {
  category?: string;
  search?: string;
  limit?: number;
}): Promise<BlogPostItemDto[]> {
  try {
    const params = new URLSearchParams();
    if (options?.category && options.category !== 'all') {
      params.set('category', options.category);
    }
    if (options?.search && options.search.trim()) {
      params.set('search', options.search.trim());
    }
    if (options?.limit) {
      params.set('limit', String(options.limit));
    }

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/blog${qs}`, {
      cache: 'no-store',
      next: { tags: ['blog-posts'], revalidate: 0 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const list = json?.data ?? json;
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPostDetailDto | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/blog/${slug}`, {
      cache: 'no-store',
      next: { tags: [`blog-${slug}`], revalidate: 0 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data ?? json) || null;
  } catch {
    return null;
  }
}

export interface SeoDefaultsDto {
  metaTitleTemplate?: string;
  defaultTitle?: string;
  defaultDescription?: string;
  defaultKeywords?: string[];
  canonicalBaseUrl?: string;
  ogDefaultImage?: string;
  twitterCard?: string;
  twitterHandle?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  googleVerification?: string;
  bingVerification?: string;
  yandexVerification?: string;
  baiduVerification?: string;
}

export async function getSeoSettings(): Promise<SeoDefaultsDto | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/settings/seo`, {
      cache: 'no-store',
      next: { tags: ['seo-settings'], revalidate: 0 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data ?? json) || null;
  } catch {
    return null;
  }
}
