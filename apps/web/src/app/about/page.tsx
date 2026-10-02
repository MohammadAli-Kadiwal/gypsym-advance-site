import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getPageBySlug, getClients, getTeamMembers } from '@/lib/api';
import { SubpageHero, CredentialItem } from '@/components/ui/subpage-hero';
import { CtaSection } from '@/components/cms/cta-section';
import { ClientsTrustedBySection } from '@/components/cms/clients-trusted-by-section';
import { ScrollReveal } from '@/components/motion';
import { PageSectionDto } from '@/lib/cms-types';
import { renderTitleWithHighlight } from '@/lib/render-title-highlight';
import { JsonLd, buildBreadcrumbsSchema, buildWebPageSchema } from '@/components/seo/json-ld';
import { getSiteUrl } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('about');
  const seo = page?.seoMetadata;

  return {
    title: seo?.metaTitle || 'About Us | Shopify Plus & E-Commerce Engineering | Gypsym',
    description:
      seo?.metaDescription ||
      'Learn about Gypsym Technology, our engineering-first philosophy, senior specialists, and client-proven track record building high-growth Shopify Plus storefronts.',
    openGraph: {
      title: seo?.ogTitle || seo?.metaTitle || 'About Us | Gypsym Technology',
      description:
        seo?.ogDescription ||
        seo?.metaDescription ||
        'Engineering high-growth Shopify Plus storefronts, custom themes, sub-second speed optimization, and 24/7 proactive retainers.',
      images: seo?.ogImageUrl ? [{ url: seo.ogImageUrl }] : [{ url: '/assets/editorial/agency-hero-editorial.png' }],
    },
    robots: seo?.noIndex ? { index: false, follow: false } : undefined,
  };
}

const DEFAULT_STATS: CredentialItem[] = [
  { label: 'Shopify Projects', value: '120+', sub: 'Enterprise D2C brands' },
  { label: 'Senior Engineers', value: '25+', sub: 'Liquid & Hydrogen Specialists' },
  { label: 'Emergency SLA', value: '< 60m', sub: 'Critical Bug Turnaround' },
  { label: 'Years in E-Commerce', value: '8+', sub: 'Deep Industry Experience' },
];

const DEFAULT_PILLARS = [
  {
    title: 'Engineering-Led, Not Account-Heavy',
    desc: 'You speak directly with senior engineers who understand Liquid syntax, GraphQL Storefront API, and checkout extensibility without layers of middlemen.',
  },
  {
    title: 'Zero App Bloat Philosophy',
    desc: 'We replace costly, script-heavy third-party Shopify apps with lean native OS 2.0 sections, keeping mobile Lighthouse scores 90+.',
  },
  {
    title: '40–60% Global Cost Advantage',
    desc: 'Boutique engineering quality matching elite London and NYC agencies at a fraction of the billable hourly overhead.',
  },
  {
    title: 'Transparent Deliverables & SLA',
    desc: 'Strict milestone commitments, transparent code repository access, and guaranteed sub-60m emergency response SLAs.',
  },
];


export default async function AboutPage() {
  const [aboutPage, homePage, clients, teamList] = await Promise.all([
    getPageBySlug('about').catch(() => null),
    getPageBySlug('home').catch(() => null),
    getClients().catch(() => []),
    getTeamMembers().catch(() => []),
  ]);

  // Extract Hero
  const rawHero = aboutPage?.sections?.find(
    (s: any) => s.sectionIdentifier === 'about-hero' || s.componentType === 'HERO'
  );
  const heroPayload = (rawHero?.contentPayload as Record<string, any>) || {};

  // Extract Story / Pillars
  const rawStory = aboutPage?.sections?.find(
    (s: any) => s.sectionIdentifier === 'about-story' || s.componentType === 'FEATURE_GRID'
  );
  const storyPayload = (rawStory?.contentPayload as Record<string, any>) || {};

  // Extract Team
  const rawTeam = aboutPage?.sections?.find(
    (s: any) => s.sectionIdentifier === 'about-team' || s.componentType === 'CAPABILITIES'
  );
  const teamPayload = (rawTeam?.contentPayload as Record<string, any>) || {};

  // Extract CTA
  const rawCta =
    aboutPage?.sections?.find((s: any) => s.sectionIdentifier === 'about-cta' || s.componentType === 'CTA') ||
    homePage?.sections?.find((s: any) => s.sectionIdentifier === 'homepage-cta' || s.componentType === 'CTA');

  const ctaSectionToRender: PageSectionDto = rawCta || {
    id: 'about-cta-section',
    pageId: 'about',
    sectionIdentifier: 'about-cta',
    componentType: 'CTA',
    displayOrder: 99,
    isActive: true,
    contentPayload: {
      eyebrow: 'COLLABORATE',
      title: 'Ready to Build Your Flagship Storefront?',
      titleHighlight: 'Flagship',
      description:
        'Connect with our principal architects to explore your architectural roadmap, scope milestones, and project timeline.',
      primaryButton: {
        label: 'Schedule Architecture Call',
        url: '/book',
        variant: 'primary',
      },
    },
  };

  // Extract Clients Section (matching Home page's section exactly)
  const rawClientsSection =
    aboutPage?.sections?.find(
      (s: any) => s.sectionIdentifier === 'clients-trusted-by' || s.componentType === 'LOGO_CLOUD'
    ) ||
    homePage?.sections?.find(
      (s: any) => s.sectionIdentifier === 'clients-trusted-by' || s.componentType === 'LOGO_CLOUD'
    );

  const clientsSectionToRender: PageSectionDto = rawClientsSection || {
    id: 'about-clients-section',
    pageId: 'about',
    sectionIdentifier: 'clients-trusted-by',
    componentType: 'LOGO_CLOUD',
    displayOrder: 90,
    isActive: true,
    contentPayload: {
      eyebrow: 'TRUSTED BY',
      title: 'Trusted by 100+ brands worldwide',
      titleHighlight: '100+ brands',
      description:
        'We partner with ambitious enterprises and high-growth innovators to engineer scalable, high-performance digital platforms.',
      layout: {
        preset: '6/line',
        mobileCols: 3,
        showMetricsBar: true,
      },
      clients: Array.isArray(clients) && clients.length > 0 ? clients : [],
    },
  };

  if (
    clientsSectionToRender.contentPayload &&
    (!clientsSectionToRender.contentPayload.clients ||
      clientsSectionToRender.contentPayload.clients.length === 0)
  ) {
    clientsSectionToRender.contentPayload.clients = clients;
  }

  const heroBackgroundImage =
    heroPayload.backgroundImage ||
    heroPayload.heroBackgroundImage ||
    '/assets/editorial/agency-hero-editorial.png';

  const stats =
    Array.isArray(heroPayload.stats) && heroPayload.stats.length > 0
      ? heroPayload.stats
      : DEFAULT_STATS;

  const pillars =
    Array.isArray(storyPayload.pillars) && storyPayload.pillars.length > 0
      ? storyPayload.pillars
      : DEFAULT_PILLARS;

  const team =
    Array.isArray(teamList) && teamList.length > 0
      ? teamList
          .filter((m: any) => m.isActive !== false && m.status !== 'DRAFT')
          .map((m: any) => ({
            name: m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim() || 'Team Member',
            role: m.role || m.roleTitle || 'Senior Specialist',
            bio: m.bio || '',
            avatar: m.avatar || m.avatarUrl || null,
          }))
      : [];

  const breadcrumbSchema = buildBreadcrumbsSchema([
    { name: 'Home', item: '/' },
    { name: 'About Us', item: '/about' },
  ]);

  const aboutSchema = buildWebPageSchema({
    name: 'About Gypsym Technology',
    description: 'Learn about Gypsym Technology, our engineering-first philosophy, senior specialists, and client-proven track record building high-growth Shopify Plus storefronts.',
    url: `${getSiteUrl()}/about`,
    type: 'AboutPage',
  });

  return (
    <div className="w-full">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={aboutSchema} />
      {/* ── 1. Hero Section ── */}
      <SubpageHero
        ariaLabel="About Hero"
        backgroundImageUrl={heroBackgroundImage}
        imageAlt="Gypsym Technology Architectural Team"
        eyebrow={heroPayload.eyebrow || 'ABOUT GYPSYM TECHNOLOGY'}
        eyebrowBulletColor="bg-[#d9287c]"
        titlePrefix={heroPayload.headline || 'Architects of High-Growth Shopify'}
        titleHighlight={heroPayload.titleHighlight || 'Storefronts'}
        description={
          heroPayload.subheadline ||
          'Founded to solve the hardest problems in e-commerce engineering, headless performance, and custom Shopify architecture for ambitious global brands.'
        }
        credentials={stats}
        showHeroStrip={heroPayload.showHeroStrip !== undefined ? heroPayload.showHeroStrip : true}
        actions={
          <>
            <Link
              href="/book"
              className="inline-flex items-center px-6 sm:px-7 py-3 rounded-full bg-white text-neutral-950 font-semibold text-xs sm:text-sm hover:bg-neutral-100 hover:scale-105 transition-all shadow-xl shadow-black/20"
            >
              <span>Schedule Architecture Call</span>
              <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
            <Link
              href="/portfolio"
              className="inline-flex items-center px-5 sm:px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/25 text-white font-medium text-xs sm:text-sm transition-all"
            >
              <span>Explore Our Work</span>
            </Link>
          </>
        }
      />

      {/* ── 2. Mission & Core Pillars ── */}
      <section className="w-full py-8 sm:py-10 md:py-14 bg-transparent">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8">
          <ScrollReveal direction="up">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-10 sm:mb-14">
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#d9287c] uppercase">
                <span className="inline-block w-2 h-2 rounded-full bg-[#d9287c]" />
                <span>{storyPayload.eyebrow || 'OUR ETHOS & ARCHITECTURAL PHILOSOPHY'}</span>
              </div>

              <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-neutral-900 leading-[1.15] sm:leading-[1.12] whitespace-pre-line">
                {renderTitleWithHighlight(
                  storyPayload.title || 'Built Different: Code Quality Without Compromise',
                  storyPayload.titleHighlight || 'Code Quality',
                  'font-serif italic font-normal text-[1.12em] tracking-normal inline-block px-1'
                )}
              </h2>

              <p className="text-base sm:text-lg text-neutral-700 leading-relaxed max-w-2xl mx-auto">
                {storyPayload.description ||
                  'Most agencies hand off projects to junior devs while charging astronomical fees. We operate with a dedicated squad of senior developers, providing high-touch engineering that moves your conversion needle.'}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pillars.map((pil: any, idx: number) => (
              <ScrollReveal key={idx} direction="up" delay={idx * 0.08}>
                <div className="p-6 sm:p-8 rounded-[22px] sm:rounded-[30px] bg-white border border-neutral-200/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] space-y-3 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 text-[#d9287c]">
                    <span className="h-7 w-7 rounded-xl bg-[#d9287c]/10 text-[#d9287c] flex items-center justify-center font-mono text-xs font-bold">
                      0{idx + 1}
                    </span>
                    <h3 className="text-lg font-bold text-neutral-900">{pil.title}</h3>
                  </div>
                  <p className="text-sm text-neutral-600 leading-relaxed pl-9">{pil.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Leadership & Specialists ── */}
      {(rawTeam?.isActive !== false || team.length > 0) && (
      <section className="w-full py-8 sm:py-10 md:py-14 bg-transparent">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8">
          <ScrollReveal direction="up">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-10 sm:mb-14">
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#d9287c] uppercase">
                <span className="inline-block w-2 h-2 rounded-full bg-[#d9287c]" />
                <span>{teamPayload.eyebrow || 'DIRECT ACCESS'}</span>
              </div>

              <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-neutral-900 leading-[1.15] sm:leading-[1.12] whitespace-pre-line">
                {renderTitleWithHighlight(
                  teamPayload.title || 'Direct Access to Senior Technical Minds',
                  teamPayload.titleHighlight || 'Technical Minds',
                  'font-serif italic font-normal text-[1.12em] tracking-normal inline-block px-1'
                )}
              </h2>

              <p className="text-base sm:text-lg text-neutral-700 leading-relaxed max-w-2xl mx-auto">
                {teamPayload.description ||
                  'No account executives filtering your requirements. Direct collaboration with experienced specialists.'}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.map((mem: any, idx: number) => (
              <ScrollReveal key={idx} direction="up" delay={idx * 0.1}>
                <div className="p-6 sm:p-7 rounded-[22px] sm:rounded-[28px] bg-white border border-neutral-200/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] space-y-3 hover:shadow-md transition-shadow">
                  {mem.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mem.avatar}
                      alt={mem.name}
                      loading="lazy"
                      decoding="async"
                      className="h-12 w-12 rounded-xl object-cover border border-neutral-200/80 shadow-2xs"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-xl bg-[#d9287c]/10 text-[#d9287c] flex items-center justify-center font-bold text-sm">
                      {mem.name ? mem.name.charAt(0) : 'E'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-base text-neutral-900">{mem.name}</h3>
                    <p className="text-xs font-semibold text-[#d9287c]">{mem.role}</p>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">{mem.bio}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ── 4. Clients / Trusted By Section (Matching Home Page) ── */}
      {clientsSectionToRender && (
        <ClientsTrustedBySection section={clientsSectionToRender} />
      )}

      {/* ── 5. Bottom CTA ── */}
      <CtaSection section={ctaSectionToRender} />
    </div>
  );
}
