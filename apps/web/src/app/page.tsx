import * as React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPageBySlug } from '@/lib/api';
import { SectionRenderer } from '@/components/cms/section-renderer';

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

  return (
    <div className="w-full">
      <SectionRenderer sections={page.sections} />
    </div>
  );
}
