import * as React from 'react';
import type { Metadata } from 'next';
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
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center space-y-3 p-8 max-w-lg border border-border/80 rounded-xl bg-card/50 shadow-sm">
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-muted text-muted-foreground">
            CMS Status: Not Published
          </div>
          <h1 className="text-lg font-semibold text-foreground">
            Required CMS Page Unavailable
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            No published CMS page found for slug &apos;home&apos;. Configure and publish the page in the administration panel to render sections.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <SectionRenderer sections={page.sections} />
    </div>
  );
}
