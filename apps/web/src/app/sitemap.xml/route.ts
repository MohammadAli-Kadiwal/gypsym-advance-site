import { NextRequest, NextResponse } from 'next/server';
import { getPublicSitemapUrls, getPublicGlobalSeo } from '@/lib/api';
import { getSiteUrl } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedLang = searchParams.get('lang')?.toLowerCase().trim();

    const [rawUrls, globalSeo] = await Promise.all([
      getPublicSitemapUrls(),
      getPublicGlobalSeo(),
    ]);

    const baseUrl = globalSeo?.siteUrl?.replace(/\/+$/, '') || getSiteUrl();

    let items = Array.isArray(rawUrls) ? rawUrls : [];

    // Optional language filtering if ?lang=de or ?lang=en is requested
    if (requestedLang && items.length > 0) {
      items = items.filter((item) => {
        const itemUrl = item.url.toLowerCase();
        if (requestedLang === 'default' || requestedLang === 'en') {
          return !itemUrl.includes('/de/') && !itemUrl.includes('/en-us/') && !itemUrl.includes('/en-gb/') && !itemUrl.includes('/en-au/') && !itemUrl.includes('/en-ca/');
        }
        return itemUrl.includes(`/${requestedLang}/`) || itemUrl.endsWith(`/${requestedLang}`);
      });
    }

    if (items.length === 0) {
      items = [
        {
          url: baseUrl,
          lastModified: new Date().toISOString(),
          changeFrequency: 'daily',
          priority: 1.0,
        },
      ];
    }

    const xmlLines: string[] = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ];

    for (const item of items) {
      xmlLines.push('  <url>');
      xmlLines.push(`    <loc>${escapeXml(item.url)}</loc>`);

      if (item.lastModified) {
        xmlLines.push(`    <lastmod>${new Date(item.lastModified).toISOString()}</lastmod>`);
      }

      if (item.changeFrequency) {
        xmlLines.push(`    <changefreq>${escapeXml(item.changeFrequency)}</changefreq>`);
      }

      if (typeof item.priority === 'number') {
        xmlLines.push(`    <priority>${item.priority.toFixed(1)}</priority>`);
      }

      xmlLines.push('  </url>');
    }

    xmlLines.push('</urlset>');

    const xml = xmlLines.join('\n');

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    });
  } catch {
    const fallbackXml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      '  <url>',
      `    <loc>${escapeXml(getSiteUrl())}</loc>`,
      `    <lastmod>${new Date().toISOString()}</lastmod>`,
      '    <changefreq>daily</changefreq>',
      '    <priority>1.0</priority>',
      '  </url>',
      '</urlset>',
    ].join('\n');

    return new NextResponse(fallbackXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    });
  }
}
