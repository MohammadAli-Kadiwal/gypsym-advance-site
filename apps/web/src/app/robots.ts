import { MetadataRoute } from 'next';
import { getPublicRobotsRules, getPublicGlobalSeo } from '@/lib/api';
import { getSiteUrl } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  try {
    const [config, globalSeo] = await Promise.all([
      getPublicRobotsRules(),
      getPublicGlobalSeo(),
    ]);

    const siteUrl = (globalSeo?.siteUrl || getSiteUrl()).replace(/\/+$/, '');
    const sitemapUrl = config?.sitemapUrl || `${siteUrl}/sitemap.xml`;

    const rules = (config?.rules || [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: ['/api/', '/admin/'],
      },
    ]).map((r) => ({
      userAgent: r.userAgent,
      allow: r.allow,
      disallow: r.disallow,
    }));

    return {
      rules,
      sitemap: sitemapUrl,
    };
  } catch {
    return {
      rules: [
        {
          userAgent: '*',
          allow: '/',
          disallow: ['/api/', '/admin/'],
        },
      ],
      sitemap: `${getSiteUrl()}/sitemap.xml`,
    };
  }
}
