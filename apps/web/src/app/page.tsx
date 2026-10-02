import * as React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPageBySlug } from '@/lib/api';
import { SectionRenderer } from '@/components/cms/section-renderer';
import { JsonLd, buildOrganizationSchema } from '@/components/seo/json-ld';
import { getSiteUrl } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('home');
  if (!page) {
    return {
      title: 'Home',
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

export default async function HomePage() {
  const page = await getPageBySlug('home');

  if (!page) {
    notFound();
  }

  const siteUrl = getSiteUrl();

  const homePageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title || 'Gypsym Technology',
    description: page.description || page.seoMetadata?.metaDescription,
    url: siteUrl,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Gypsym Technology',
      url: siteUrl,
    },
  };

  const orgSchema = buildOrganizationSchema();

  return (
    <div className="w-full">
      <JsonLd data={orgSchema} />
      <JsonLd data={homePageSchema} />
      <SectionRenderer sections={page.sections} />
    </div>
  );
}
