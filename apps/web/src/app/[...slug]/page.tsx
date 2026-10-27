import * as React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPageBySlug } from '@/lib/api';
import { SectionRenderer } from '@/components/cms/section-renderer';
import { JsonLd, buildBreadcrumbsSchema, buildWebPageSchema } from '@/components/seo/json-ld';
import { getSiteUrl, resolveSiteUrl } from '@/lib/site-url';

// Always fetch fresh from the API — never serve a stale ISR-cached version.
export const dynamic = 'force-dynamic';


interface DynamicPageProps {
  params: {
    slug: string[];
  };
}

export async function generateMetadata({ params }: DynamicPageProps): Promise<Metadata> {
  const slugPath = params.slug.join('/');
  const [page, siteUrl] = await Promise.all([
    getPageBySlug(slugPath),
    resolveSiteUrl(),
  ]);
  if (!page) {
    return {
      title: 'Page Not Found',
    };
  }

  const seo = page.seoMetadata;
  const canonicalUrl = seo?.canonicalUrl || `${siteUrl}/${slugPath}`;
  const resolvedTitle = seo?.metaTitle || page.title || 'Gypsym Technology';

  return {
    title: { absolute: resolvedTitle },
    description: seo?.metaDescription || page.description || undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: seo?.ogTitle || resolvedTitle,
      description: seo?.ogDescription || seo?.metaDescription || page.description || undefined,
      images: seo?.ogImageUrl ? [{ url: seo.ogImageUrl }] : undefined,
    },
    robots: seo?.noIndex ? { index: false, follow: false } : undefined,
  };
}

export default async function DynamicCmsPage({ params }: DynamicPageProps) {
  const slugPath = params.slug.join('/');
  const page = await getPageBySlug(slugPath);

  if (!page) {
    notFound();
  }

  const breadcrumbSchema = buildBreadcrumbsSchema([
    { name: 'Home', item: '/' },
    ...params.slug.map((segment, idx) => ({
      name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      item: `/${params.slug.slice(0, idx + 1).join('/')}`,
    })),
  ]);

  const webPageSchema = buildWebPageSchema({
    name: page.title,
    description: page.description || page.seoMetadata?.metaDescription || undefined,
    url: `${getSiteUrl()}/${slugPath}`,
  });

  let customStructuredData = null;
  if (page.seoMetadata?.structuredData) {
    try {
      customStructuredData =
        typeof page.seoMetadata.structuredData === 'string'
          ? JSON.parse(page.seoMetadata.structuredData)
          : page.seoMetadata.structuredData;
    } catch {
      customStructuredData = null;
    }
  }

  return (
    <div className="w-full">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={customStructuredData || webPageSchema} />
      <SectionRenderer sections={page.sections} />
    </div>
  );
}
