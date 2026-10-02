import * as React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPageBySlug } from '@/lib/api';
import { SectionRenderer } from '@/components/cms/section-renderer';
import { JsonLd, buildBreadcrumbsSchema, buildWebPageSchema } from '@/components/seo/json-ld';
import { getSiteUrl } from '@/lib/site-url';

// Always fetch fresh from the API — never serve a stale ISR-cached version.
export const dynamic = 'force-dynamic';


interface DynamicPageProps {
  params: {
    slug: string[];
  };
}

export async function generateMetadata({ params }: DynamicPageProps): Promise<Metadata> {
  const slugPath = params.slug.join('/');
  const page = await getPageBySlug(slugPath);
  if (!page) {
    return {
      title: 'Page Not Found',
    };
  }

  const seo = page.seoMetadata;
  return {
    title: seo?.metaTitle || page.title,
    description: seo?.metaDescription || page.description || undefined,
    openGraph: {
      title: seo?.ogTitle || seo?.metaTitle || page.title,
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

  return (
    <div className="w-full">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={webPageSchema} />
      <SectionRenderer sections={page.sections} />
    </div>
  );
}
