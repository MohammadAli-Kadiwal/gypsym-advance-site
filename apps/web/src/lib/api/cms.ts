import { cache } from 'react';
import { API_CONFIG } from './config';
import { PageDto, NavigationDto, BrandSettingsDto, HeaderDataDto, FooterDataDto } from '../cms-types';

const getBaseUrl = () => API_CONFIG.baseURL;

/**
 * Fetch dynamic page with active sections by slug from NestJS CMS API.
 * Server Component data fetching with Next.js ISR tags and React render deduplication.
 */
export const getPageBySlug = cache(async (slug: string): Promise<PageDto | null> => {
  try {
    const res = await fetch(`${getBaseUrl()}/pages/${slug}`, {
      next: { tags: [`page-${slug}`, 'pages'], revalidate: 60 },
    });
    if (!res.ok) {
      return null;
    }
    const json = await res.json();
    return (json?.data as PageDto) || null;
  } catch {
    return null;
  }
});

/**
 * Fetch dynamic navigation tree by key (e.g. 'header', 'footer') from NestJS CMS API.
 */
export const getNavigation = cache(async (key: string): Promise<NavigationDto | null> => {
  try {
    const res = await fetch(`${getBaseUrl()}/navigation/${key}`, {
      next: { tags: [`nav-${key}`], revalidate: 60 },
    });
    if (!res.ok) {
      return null;
    }
    const json = await res.json();
    return (json?.data as NavigationDto) || null;
  } catch {
    return null;
  }
});

/**
 * Fetch active brand settings (theme tokens, logos, company name) from NestJS CMS API.
 */
export const getBrandSettings = cache(async (): Promise<BrandSettingsDto | null> => {
  try {
    const res = await fetch(`${getBaseUrl()}/branding`, {
      next: { tags: ['brand-settings'], revalidate: 60 },
    });
    if (!res.ok) {
      return null;
    }
    const json = await res.json();
    return (json?.data as BrandSettingsDto) || null;
  } catch {
    return null;
  }
});

/**
 * Fetch dynamic site settings dictionary from NestJS CMS API.
 */
export const getSiteSettings = cache(async (): Promise<Record<string, any>> => {
  try {
    const res = await fetch(`${getBaseUrl()}/settings`, {
      next: { tags: ['site-settings'], revalidate: 60 },
    });
    if (!res.ok) {
      return {};
    }
    const json = await res.json();
    return (json?.data as Record<string, any>) || {};
  } catch {
    return {};
  }
});

/**
 * Fetch dynamic analytics, Google Analytics, Meta Pixel, and header/footer scripts.
 */
export const getScriptSettings = cache(async (): Promise<any | null> => {
  try {
    const res = await fetch(`${getBaseUrl()}/settings/scripts`, {
      next: { tags: ['scripts-configuration'], revalidate: 60 },
    });
    if (!res.ok) {
      return null;
    }
    const json = await res.json();
    return json?.data || json || null;
  } catch {
    return null;
  }
});

/**
 * Fetch consolidated Header data (Branding, Navigation, Header Configuration)
 */
export const getHeaderData = cache(async (): Promise<HeaderDataDto> => {
  try {
    const res = await fetch(`${getBaseUrl()}/header`, {
      next: { tags: ['header-all'], revalidate: 60 },
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
});

/**
 * Fetch consolidated dynamic Footer data
 */
export const getFooterData = cache(async (): Promise<FooterDataDto> => {
  try {
    const res = await fetch(`${getBaseUrl()}/footer`, {
      next: { tags: ['footer-all'], revalidate: 60 },
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
});

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
  createdAt?: string;
  updatedAt?: string;
  projectDate?: string;
}

export const getPortfolioCategories = cache(async (): Promise<PortfolioCategoryItem[]> => {
  try {
    const res = await fetch(`${getBaseUrl()}/portfolio/categories`, {
      next: { tags: ['portfolio-categories'], revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json?.data ?? json;
    const array = Array.isArray(data) ? data : [];
    return array.filter((c: any) => c.status === 'PUBLISHED');
  } catch {
    return [];
  }
});

export const getPortfolioProjects = cache(async (categorySlug?: string): Promise<PortfolioProjectItemDto[]> => {
  try {
    const url = new URL(`${getBaseUrl()}/portfolio`);
    if (categorySlug && categorySlug !== 'all') {
      url.searchParams.set('category', categorySlug);
    }
    const res = await fetch(url.toString(), {
      next: { tags: ['portfolio-projects'], revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const list = json?.data?.projects ?? json?.projects ?? (Array.isArray(json?.data) ? json.data : []);
    const array = Array.isArray(list) ? list : [];
    return array.filter((p: any) => p.status === 'PUBLISHED');
  } catch {
    return [];
  }
});

export const getPortfolioProjectBySlug = cache(async (slug: string): Promise<PortfolioProjectItemDto | null> => {
  try {
    const res = await fetch(`${getBaseUrl()}/portfolio/${encodeURIComponent(slug)}`, {
      next: { tags: [`portfolio-project-${slug}`], revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data ?? json;
    return data || null;
  } catch {
    return null;
  }
});

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
  imageUrl?: string;
  heroBackgroundImage?: string;
  backgroundImage?: string;
  backgroundImageUrl?: string;
  keyFeatures?: string[];
  deliverables?: string[];
  technologies?: string[];
  process?: ServiceProcessStep[];
  benefits?: ServiceBenefit[];
  faqs?: ServiceFaq[];
  pricing?: ServicePriceTier[];
  seoMetadata?: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImageUrl?: string;
    noIndex?: boolean;
    structuredData?: any;
  } | null;
}

export const getServices = cache(async (): Promise<ServiceItemDto[]> => {
  try {
    const res = await fetch(`${getBaseUrl()}/services?status=PUBLISHED`, {
      next: { tags: ['services'], revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const list = json?.data ?? json;
    const array = Array.isArray(list) ? list : [];
    return array.filter((s: any) => s.status === 'PUBLISHED');
  } catch {
    return [];
  }
});

export const getServiceBySlug = cache(async (slug: string): Promise<ServiceItemDto | null> => {
  try {
    const res = await fetch(`${getBaseUrl()}/services/${slug}?status=PUBLISHED`, {
      next: { tags: [`service-${slug}`], revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const item = (json?.data ?? json) || null;
    if (item && item.status !== 'PUBLISHED') return null;
    return item;
  } catch {
    return null;
  }
});

export interface CmsPageSummary {
  id: string;
  slug: string;
  title: string;
  status: string;
}

export const getPublishedPages = cache(async (): Promise<CmsPageSummary[]> => {
  try {
    const res = await fetch(`${getBaseUrl()}/pages`, {
      next: { tags: ['cms-pages'], revalidate: 60 },
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
});

export const getClients = cache(async (): Promise<any[]> => {
  try {
    const res = await fetch(`${getBaseUrl()}/clients?status=PUBLISHED`, {
      next: { tags: ['clients'], revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const list = json?.data ?? json;
    const array = Array.isArray(list) ? list : [];
    return array.filter((c: any) => c.status !== 'DRAFT' && c.isFeatured !== false && c.isActive !== false);
  } catch {
    return [];
  }
});

export const getTeamMembers = cache(async (): Promise<any[]> => {
  try {
    const res = await fetch(`${getBaseUrl()}/team`, {
      next: { tags: ['team'], revalidate: 60 },
    });
    if (!res.ok) {
      const fallback = await fetch(`${getBaseUrl()}/cms/collections/team`, { next: { tags: ['team'], revalidate: 60 } }).catch(() => null);
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
});

export interface BlogCategoryDto {
  id: string;
  slug: string;
  name: string;
  description?: string;
  postCount: number;
}

export interface BlogFaqItem {
  question: string;
  answer: string;
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
  faqs?: BlogFaqItem[];
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
    faqs?: BlogFaqItem[];
  };
  faqs?: BlogFaqItem[];
  related?: BlogPostItemDto[];
}

export const getBlogCategories = cache(async (): Promise<BlogCategoryDto[]> => {
  try {
    const res = await fetch(`${getBaseUrl()}/blog/categories`, {
      next: { tags: ['blog-categories'], revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const list = json?.data ?? json;
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
});

export const getBlogPosts = cache(async (options?: {
  category?: string;
  search?: string;
  limit?: number;
}): Promise<BlogPostItemDto[]> => {
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
    const res = await fetch(`${getBaseUrl()}/blog${qs}`, {
      next: { tags: ['blog-posts'], revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const list = json?.data ?? json;
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
});

export const getBlogPostBySlug = cache(async (slug: string): Promise<BlogPostDetailDto | null> => {
  try {
    const res = await fetch(`${getBaseUrl()}/blog/${slug}`, {
      next: { tags: [`blog-${slug}`], revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data ?? json) || null;
  } catch {
    return null;
  }
});

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

export const getSeoSettings = cache(async (): Promise<SeoDefaultsDto | null> => {
  try {
    const res = await fetch(`${getBaseUrl()}/settings/seo`, {
      next: { tags: ['seo-settings'], revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data ?? json) || null;
  } catch {
    return null;
  }
});

export interface ContactSettingsDto {
  primaryEmail: string;
  primaryPhone: string;
  secondaryPhone?: string;
  whatsappNumber: string;
  whatsappMessage?: string;
  whatsappUrl?: string;
  bookingUrl: string;
  projectEmail?: string;
  advisoryEmail?: string;
  securityEmail?: string;
  supportEmail?: string;
  headquartersAddress: string;
  secondaryAddress?: string;
  officeHours: string;
  timezone: string;
  companyName: string;
  legalName: string;
  tagline: string;
  legalJurisdiction: string;
  country: string;
  googleMapsUrl?: string;
}

export const DEFAULT_CONTACT_SETTINGS: ContactSettingsDto = {
  primaryEmail: 'hello@gypsym.com',
  primaryPhone: '+1 (800) 928-4019',
  secondaryPhone: '+44 20 7946 0991',
  whatsappNumber: '+91 73397 26403',
  whatsappMessage: "Hi Gypsym team, I'd like to discuss a Shopify project.",
  whatsappUrl: 'https://wa.me/917339726403?text=Hi%20Gypsym%20team%2C%20I%27d%20like%20to%20discuss%20a%20Shopify%20project.',
  bookingUrl: '/book',
  projectEmail: 'project@gypsym.com',
  advisoryEmail: 'advisory@gypsym.com',
  securityEmail: 'security@gypsym.com',
  supportEmail: 'support@gypsym.com',
  headquartersAddress: '100 Bishopsgate, London EC2N 4AG, United Kingdom',
  secondaryAddress: 'Surat, Gujarat, India (Engineering Hub)',
  officeHours: 'Mon – Fri: 08:00 – 18:00 EST',
  timezone: 'America/New_York (EST)',
  companyName: 'Gypsym Technology',
  legalName: 'Gypsym Global Enterprises Inc.',
  tagline: 'Shopify & Shopify Plus Engineering Agency',
  legalJurisdiction: 'Delaware, United States & London, United Kingdom',
  country: 'United Kingdom',
};

export const getContactSettings = cache(async (): Promise<ContactSettingsDto> => {
  try {
    const res = await fetch(`${getBaseUrl()}/settings/contact`, {
      next: { tags: ['contact-settings'], revalidate: 60 },
    });
    if (!res.ok) return DEFAULT_CONTACT_SETTINGS;
    const json = await res.json();
    const data = (json?.data ?? json) || {};
    return { ...DEFAULT_CONTACT_SETTINGS, ...data };
  } catch {
    return DEFAULT_CONTACT_SETTINGS;
  }
});

