import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getBlogPosts, getBlogCategories, getPageBySlug } from '@/lib/api';
import { BlogHubClient } from './blog-hub-client';
import { SubpageHero } from '@/components/ui/subpage-hero';
import { ContactSection } from '@/components/cms/contact-section';
import { CtaSection } from '@/components/cms/cta-section';
import { PageSectionDto } from '@/lib/cms-types';
import { ScrollReveal } from '@/components/motion';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Engineering Publications & Architecture Deep Dives | Gypsym Technology',
  description:
    'Peer-reviewed systems architecture, headless commerce topologies, sovereign AI infrastructure, and high-throughput distributed engineering from the Gypsym Technology engineering team.',
  openGraph: {
    title: 'Engineering Publications & Architecture Deep Dives | Gypsym Technology',
    description:
      'Peer-reviewed systems architecture, headless commerce topologies, sovereign AI infrastructure, and high-throughput distributed engineering.',
    url: 'https://gypsym.com/blog',
    siteName: 'Gypsym Technology',
    type: 'website',
  },
};

export default async function BlogPage() {
  const [posts, categories, homePage] = await Promise.all([
    getBlogPosts(),
    getBlogCategories(),
    getPageBySlug('home'),
  ]);

  // Extract Homepage DIRECT ENGAGEMENT (Contact) and CTA sections
  const rawContactSection = homePage?.sections?.find(
    (s: any) =>
      s.componentType === 'CONTACT' ||
      s.sectionIdentifier === 'contact-inquiry' ||
      s.sectionIdentifier === 'contact'
  );

  const rawCtaSection = homePage?.sections?.find(
    (s: any) =>
      s.componentType === 'CTA' ||
      s.sectionIdentifier === 'homepage-cta' ||
      s.sectionIdentifier === 'cta-banner'
  );

  const contactSectionToRender: PageSectionDto = rawContactSection || {
    id: 'blog-contact-section',
    pageId: 'blog',
    sectionIdentifier: 'contact-inquiry',
    componentType: 'CONTACT',
    displayOrder: 11,
    isActive: true,
    contentPayload: {
      eyebrow: 'DIRECT ENGAGEMENT',
      title: 'Initiate an Executive Technical Consultation',
      titleHighlight: 'Technical',
      description: 'Schedule a technical architecture review with our Senior Technical Fellows and Principal Engineers.',
    },
  };

  const ctaSectionToRender: PageSectionDto = rawCtaSection || {
    id: 'blog-cta-section',
    pageId: 'blog',
    sectionIdentifier: 'homepage-cta',
    componentType: 'CTA',
    displayOrder: 12,
    isActive: true,
    contentPayload: {
      eyebrow: 'ENTERPRISE ENGINEERING',
      title: 'Ready to Architect Resilient Systems at Scale?',
      titleHighlight: 'Resilient',
      description:
        'Partner with our systems engineers and cloud architects to build zero-downtime, distributed digital infrastructure engineered for uncompromising performance.',
      primaryButton: {
        label: 'Schedule Architecture Review',
        url: '/contact',
        variant: 'primary',
      },
    },
  };

  const credentials = [
    { label: 'Technical Depth', value: `${posts.length}+ Articles`, sub: 'Peer-reviewed architecture' },
    { label: 'Engineering Domains', value: `${categories.length} Categories`, sub: 'From Commerce to Sovereign AI' },
    { label: 'Edge Latency', value: '< 50ms', sub: 'Sub-second global TTFB' },
    { label: 'Technical Signal', value: '100% Free', sub: 'Zero paywalls or sales gates' },
  ];

  return (
    <div className="w-full">
      {/* ── 1. Editorial Image-Based Hero Section (Exact Site Identity) ── */}
      <SubpageHero
        ariaLabel="Editorial Architecture Hero"
        backgroundImageUrl="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=2000&auto=format&fit=crop&q=80"
        imageAlt="Gypsym Systems Architecture Server Racks Background"
        eyebrow="Systems Architecture · Technical Editorial"
        eyebrowBulletColor="bg-emerald-400"
        titlePrefix="Engineering Insights &"
        titleHighlight="Architecture"
        titleSuffix="Blueprints"
        description="A curated repository of deep-dive architectural blueprints, headless commerce benchmarks, and sovereign AI telemetry engineered by Gypsym systems architects."
        credentials={credentials}
        showHeroStrip={true}
        actions={
          <>
            <a
              href="#publications-grid"
              className="inline-flex items-center px-6 sm:px-7 py-3 rounded-full bg-white text-neutral-950 font-semibold text-xs sm:text-sm hover:bg-neutral-100 hover:scale-105 transition-all shadow-xl shadow-black/20"
            >
              <span>Explore Publications ({posts.length})</span>
              <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center px-5 sm:px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/25 text-white font-medium text-xs sm:text-sm transition-all"
            >
              <span>Request Custom Blueprint</span>
            </Link>
          </>
        }
      />

      {/* ── 2. Interactive Publications Hub with Filter & Search ── */}
      <main id="publications-grid" className="w-full flex-1">
        <BlogHubClient initialPosts={posts} categories={categories} />
      </main>

      {/* ── 3. DIRECT ENGAGEMENT (Contact) Section ── */}
      <section id="blog-contact" className="w-full relative overflow-x-clip">
        <ScrollReveal direction="up" intensity="subtle" className="w-full">
          <ContactSection section={contactSectionToRender} />
        </ScrollReveal>
      </section>

      {/* ── 4. Call to Action (CTA) Section ── */}
      <section id="blog-cta" className="w-full relative overflow-x-clip">
        <ScrollReveal direction="up" intensity="subtle" className="w-full">
          <CtaSection section={ctaSectionToRender} />
        </ScrollReveal>
      </section>
    </div>
  );
}
