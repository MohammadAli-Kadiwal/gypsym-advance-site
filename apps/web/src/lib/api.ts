import axios from 'axios';
import { PageDto, NavigationDto, BrandSettingsDto, HeaderDataDto } from './cms-types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch dynamic page with active sections by slug from NestJS CMS API.
 * ZERO fallbacks. Returns null if page is not found or not published.
 */
export async function getPageBySlug(slug: string): Promise<PageDto | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/pages/${slug}`, {
      cache: 'no-store',
      next: { tags: [`page-${slug}`], revalidate: 0 },
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
 * ZERO fallbacks. Returns null if navigation is not found.
 */
export async function getNavigation(key: string): Promise<NavigationDto | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/navigation/${key}`, {
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
}

/**
 * Fetch active brand settings (theme tokens, logos, company name) from NestJS CMS API.
 * ZERO hardcoded fallbacks. Returns null if unconfigured in database.
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
 * ZERO fallbacks. Returns empty object if unconfigured.
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
 * Fetch consolidated Header data (Branding, Navigation, Header Configuration)
 * Directly from NestJS API / PostgreSQL.
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

/**
 * Fetch portfolio categories from NestJS API.
 * Server-side, zero hardcoded fallback data.
 */
export async function getPortfolioCategories(): Promise<PortfolioCategoryItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio/categories`, {
      cache: 'no-store',
      next: { tags: ['portfolio-categories'], revalidate: 0 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/**
 * Fetch published portfolio projects from NestJS API with optional category filter.
 * Server-side, zero hardcoded fallback data.
 */
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
    return Array.isArray(json?.projects) ? json.projects : [];
  } catch {
    return [];
  }
}

