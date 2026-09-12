import * as React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPageBySlug } from '@/lib/api';
import { SectionRenderer } from '@/components/cms/section-renderer';

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

  return (
    <div className="w-full">
      <SectionRenderer sections={page.sections} />
    </div>
  );
}
