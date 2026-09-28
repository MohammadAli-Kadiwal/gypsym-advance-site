import { MetadataRoute } from 'next';
import { getPublicSitemapUrls, getPublicGlobalSeo } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [urls, globalSeo] = await Promise.all([
      getPublicSitemapUrls(),
      getPublicGlobalSeo(),
    ]);

    if (urls && urls.length > 0) {
      return urls.map((item) => ({
        url: item.url,
        lastModified: item.lastModified ? new Date(item.lastModified) : new Date(),
        changeFrequency: item.changeFrequency,
        priority: item.priority,
      }));
    }

    // Dynamic minimal fallback to configured Site URL if DB has no pages yet
    const baseUrl = globalSeo?.siteUrl?.replace(/\/+$/, '') || 'https://gypsym.com';
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
    ];
  } catch {
    return [
      {
        url: 'https://gypsym.com',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
    ];
  }
}
