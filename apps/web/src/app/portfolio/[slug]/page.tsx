import * as React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  Sparkles,
  Briefcase,
  ChevronRight,
  TrendingUp,
  Globe,
  Tag,
} from 'lucide-react';
import { getPortfolioProjectBySlug, getPortfolioProjects, getPageBySlug } from '@/lib/api';
import { formatDateDDMMYYYY } from '@/lib/utils';
import { CtaSection } from '@/components/cms/cta-section';
import { PageSectionDto } from '@/lib/cms-types';
import { ScrollReveal } from '@/components/motion';
import { JsonLd, buildBreadcrumbsSchema } from '@/components/seo/json-ld';
import { getSiteUrl, resolveSiteUrl } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

interface PortfolioProjectPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PortfolioProjectPageProps): Promise<Metadata> {
  const [project, siteUrl] = await Promise.all([
    getPortfolioProjectBySlug(params.slug),
    resolveSiteUrl(),
  ]);
  if (!project) {
    return {
      title: 'Case Study Not Found | Gypsym Technology',
    };
  }

  const canonicalUrl = `${siteUrl}/portfolio/${project.slug}`;

  const seo = (project as any).seoMetadata;
  const customTitle = seo?.metaTitle;
  const resolvedTitle = customTitle || `${project.title} | Case Study | Gypsym Technology`;

  return {
    title: { absolute: resolvedTitle },
    description: seo?.metaDescription || (project.description ? stripHtml(project.description) : undefined),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: seo?.ogTitle || resolvedTitle,
      description: seo?.ogDescription || seo?.metaDescription || (project.description ? stripHtml(project.description) : undefined),
      images: project.imageUrl ? [{ url: project.imageUrl, alt: project.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description ? stripHtml(project.description) : undefined,
      images: project.imageUrl ? [project.imageUrl] : undefined,
    },
  };
}

function stripHtml(html: string = ''): string {
  return html
    .replace(/<[^>]*>?/gm, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .trim();
}

function escapeAndFormatInline(text: string): string {
  // Bold: **text**
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-neutral-900 dark:text-white">$1</strong>');
  // Italic: *text* or _text_
  formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
  // Links: [label](url)
  formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#d9287c] underline hover:opacity-80 transition-opacity font-medium">$1</a>');
  // Inline code: `code`
  formatted = formatted.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[#d9287c] font-mono text-sm">$1</code>');
  return formatted;
}

function parseRichContent(content: string = ''): string {
  if (!content) return '';
  const trimmed = content.trim();

  // If content already contains HTML tags (e.g. from TipTap rich text editor)
  if (/<[a-z][\s\S]*>/i.test(trimmed)) {
    // Also convert any markdown headers that were saved inside <p> tags, e.g. <p>## Title</p>
    return trimmed
      .replace(/<p>\s*####\s*([^<]+)<\/p>/gi, '<h4 class="text-lg font-bold text-neutral-900 dark:text-white mt-5 mb-2">$1</h4>')
      .replace(/<p>\s*###\s*([^<]+)<\/p>/gi, '<h3 class="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mt-6 mb-2.5">$1</h3>')
      .replace(/<p>\s*##\s*([^<]+)<\/p>/gi, '<h2 class="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mt-8 mb-3.5 pt-3 first:pt-0">$1</h2>')
      .replace(/<p>\s*#\s*([^<]+)<\/p>/gi, '<h2 class="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mt-8 mb-3.5 pt-3 first:pt-0">$1</h2>');
  }

  // Parse pure Markdown text into rich semantic HTML
  const lines = trimmed.split(/\r?\n/);
  const htmlParts: string[] = [];
  let inUl = false;
  let inOl = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i] ?? '';
    const line = rawLine.trim();

    if (!line) {
      if (inUl) { htmlParts.push('</ul>'); inUl = false; }
      if (inOl) { htmlParts.push('</ol>'); inOl = false; }
      continue;
    }

    // Markdown Headers: ####, ###, ##, #
    if (line.startsWith('#### ')) {
      if (inUl) { htmlParts.push('</ul>'); inUl = false; }
      if (inOl) { htmlParts.push('</ol>'); inOl = false; }
      htmlParts.push(`<h4 class="text-lg font-bold text-neutral-900 dark:text-white mt-5 mb-2">${escapeAndFormatInline(line.slice(5))}</h4>`);
      continue;
    }
    if (line.startsWith('### ')) {
      if (inUl) { htmlParts.push('</ul>'); inUl = false; }
      if (inOl) { htmlParts.push('</ol>'); inOl = false; }
      htmlParts.push(`<h3 class="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mt-6 mb-2.5">${escapeAndFormatInline(line.slice(4))}</h3>`);
      continue;
    }
    if (/^##\s+/.test(line)) {
      if (inUl) { htmlParts.push('</ul>'); inUl = false; }
      if (inOl) { htmlParts.push('</ol>'); inOl = false; }
      const headerText = line.replace(/^##\s+/, '');
      htmlParts.push(`<h2 class="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mt-8 mb-3.5 pt-3 first:pt-0">${escapeAndFormatInline(headerText)}</h2>`);
      continue;
    }
    if (/^#\s+/.test(line)) {
      if (inUl) { htmlParts.push('</ul>'); inUl = false; }
      if (inOl) { htmlParts.push('</ol>'); inOl = false; }
      const headerText = line.replace(/^#\s+/, '');
      htmlParts.push(`<h2 class="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mt-8 mb-3.5 pt-3 first:pt-0">${escapeAndFormatInline(headerText)}</h2>`);
      continue;
    }

    // Blockquote: >
    if (line.startsWith('>')) {
      if (inUl) { htmlParts.push('</ul>'); inUl = false; }
      if (inOl) { htmlParts.push('</ol>'); inOl = false; }
      const quoteText = line.replace(/^>\s*/, '');
      htmlParts.push(`<blockquote class="border-l-4 border-[#d9287c] pl-4 py-1.5 italic my-5 bg-[#fce7ec]/30 dark:bg-neutral-800/40 rounded-r-lg text-neutral-800 dark:text-neutral-200">${escapeAndFormatInline(quoteText)}</blockquote>`);
      continue;
    }

    // Unordered list item: - or *
    if (/^[-*]\s+/.test(line)) {
      if (inOl) { htmlParts.push('</ol>'); inOl = false; }
      if (!inUl) {
        htmlParts.push('<ul class="list-disc pl-5 mb-5 space-y-2 text-base sm:text-lg text-neutral-700 dark:text-neutral-300">');
        inUl = true;
      }
      const itemText = line.replace(/^[-*]\s+/, '');
      htmlParts.push(`<li>${escapeAndFormatInline(itemText)}</li>`);
      continue;
    }

    // Ordered list item: 1.
    if (/^\d+\.\s+/.test(line)) {
      if (inUl) { htmlParts.push('</ul>'); inUl = false; }
      if (!inOl) {
        htmlParts.push('<ol class="list-decimal pl-5 mb-5 space-y-2 text-base sm:text-lg text-neutral-700 dark:text-neutral-300">');
        inOl = true;
      }
      const itemText = line.replace(/^\d+\.\s+/, '');
      htmlParts.push(`<li>${escapeAndFormatInline(itemText)}</li>`);
      continue;
    }

    if (inUl) { htmlParts.push('</ul>'); inUl = false; }
    if (inOl) { htmlParts.push('</ol>'); inOl = false; }

    // Standalone headings without hashes if recognizable common case study headings
    const isStandaloneHeading =
      /^(Project Overview|Design & Development Approach|Project Goals|Project Outcome|Key Features|The Challenge|The Solution|Results & Impact)$/i.test(line);

    if (isStandaloneHeading) {
      htmlParts.push(`<h2 class="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mt-8 mb-3.5 pt-3 first:pt-0">${escapeAndFormatInline(line)}</h2>`);
      continue;
    }

    let formattedLine = escapeAndFormatInline(line);
    // Format "Feature Label: Description" with bold label
    const labelMatch = formattedLine.match(/^([A-Za-z0-9\s&/-]{3,40}:)\s+(.*)$/);
    if (labelMatch && !formattedLine.startsWith('<strong')) {
      formattedLine = `<strong class="font-bold text-neutral-900 dark:text-white">${labelMatch[1]}</strong> ${labelMatch[2]}`;
    }

    htmlParts.push(`<p class="text-base sm:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">${formattedLine}</p>`);
  }

  if (inUl) htmlParts.push('</ul>');
  if (inOl) htmlParts.push('</ol>');

  return htmlParts.join('\n');
}

export default async function PortfolioProjectPage({ params }: PortfolioProjectPageProps) {
  const [project, allProjects, homePage] = await Promise.all([
    getPortfolioProjectBySlug(params.slug),
    getPortfolioProjects(),
    getPageBySlug('home'),
  ]);

  if (!project) {
    notFound();
  }

  const siteUrl = getSiteUrl();
  const formattedDate = formatDateDDMMYYYY(project.projectDate || project.createdAt);

  // Filter other projects for "More Selected Works"
  const otherProjects = (allProjects || [])
    .filter((p) => p.slug !== params.slug)
    .slice(0, 3);

  // Check if project has an external live URL
  const hasExternalLiveUrl =
    project.projectUrl &&
    (project.projectUrl.startsWith('http://') || project.projectUrl.startsWith('https://'));

  // Parse tags safely if array or comma/space-separated string
  let tagsList: string[] = [];
  if (Array.isArray(project.tags)) {
    tagsList = project.tags;
  } else if (typeof project.tags === 'string') {
    const raw = project.tags as string;
    tagsList = raw.split(/[\s,]+/).filter(Boolean);
  }

  // Parse rich content (HTML or Markdown) into semantic styled HTML
  const parsedDescriptionHtml = parseRichContent(project.description || '');

  // Extract CTA from home page or use fallback
  const rawCtaSection = homePage?.sections?.find(
    (s: any) =>
      s.componentType === 'CTA' ||
      s.sectionIdentifier === 'homepage-cta' ||
      s.sectionIdentifier === 'cta-banner'
  );

  const ctaSectionToRender: PageSectionDto = rawCtaSection || {
    id: 'portfolio-inner-cta',
    pageId: 'portfolio',
    sectionIdentifier: 'homepage-cta',
    componentType: 'CTA',
    displayOrder: 12,
    isActive: true,
    contentPayload: {
      eyebrow: 'SHOPIFY PLUS SPECIALISTS',
      title: 'Ready to Build a High-Growth Shopify Plus Store?',
      titleHighlight: 'High-Growth',
      description:
        'Partner with our systems engineers and conversion architects to create bespoke Liquid themes, headless commerce, and frictionless D2C checkouts.',
      primaryButton: {
        label: 'Schedule Strategy Call',
        url: '/contact',
        variant: 'primary',
      },
    },
  };

  const breadcrumbItems = [
    { name: 'Home', item: '/' },
    { name: 'Portfolio', item: '/portfolio' },
  ];

  if (project.category) {
    breadcrumbItems.push({
      name: project.category,
      item: project.categorySlug ? `/portfolio?category=${project.categorySlug}` : '/portfolio',
    });
  }

  breadcrumbItems.push({
    name: project.title,
    item: `/portfolio/${project.slug}`,
  });

  const breadcrumbSchema = buildBreadcrumbsSchema(breadcrumbItems);

  const projectJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    headline: project.title,
    description: stripHtml(project.description) || project.title,
    image: project.imageUrl,
    url: `${siteUrl}/portfolio/${project.slug}`,
    datePublished: project.createdAt || project.projectDate,
    creator: {
      '@type': 'Organization',
      name: 'Gypsym Technology',
      url: siteUrl,
    },
    provider: {
      '@type': 'Organization',
      name: 'Gypsym Technology',
    },
  };

  return (
    <div className="w-full bg-[#f4f3ef] dark:bg-background pt-28 sm:pt-32 lg:pt-36">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={projectJsonLd} />

      {/* ── 1. Main Project Case Study Section ── */}
      <section className="w-full pb-8 sm:pb-10 md:pb-12 relative overflow-x-clip">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8">
          {/* Top Navigation Bar: Back Button & Breadcrumbs */}
          <ScrollReveal direction="down" delay={40}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-600 dark:text-neutral-300 hover:text-[#d9287c] dark:hover:text-[#d9287c] transition-colors group select-none"
              >
                <div className="w-8 h-8 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-center shadow-xs group-hover:border-[#d9287c]/40 group-hover:scale-105 transition-all">
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                </div>
                <span>Back to Portfolio Showcase</span>
              </Link>

              <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-2 text-xs font-semibold text-neutral-500 overflow-x-auto whitespace-nowrap scrollbar-none"
              >
                <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Home
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <Link href="/portfolio" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Portfolio
                </Link>
                {project.category && (
                  <>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <Link
                      href={project.categorySlug ? `/portfolio?category=${project.categorySlug}` : '/portfolio'}
                      className="hover:text-neutral-900 dark:hover:text-white transition-colors"
                    >
                      {project.category}
                    </Link>
                  </>
                )}
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span className="text-[#d9287c] font-medium truncate max-w-[200px]">{project.title}</span>
              </nav>
            </div>
          </ScrollReveal>

          {/* Main Case Study Card Container */}
          <ScrollReveal direction="up" intensity="subtle">
            <div className="bg-white dark:bg-neutral-900 rounded-[24px] sm:rounded-[36px] p-6 sm:p-10 md:p-14 border border-neutral-200/70 dark:border-neutral-800 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-8 sm:space-y-10">
            {/* Header Metadata & Headline */}
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                {project.category && (
                  <Link
                    href={project.categorySlug ? `/portfolio?category=${project.categorySlug}` : '/portfolio'}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#fce7ec] text-[#d9287c] hover:bg-[#fad3de] transition-colors uppercase tracking-wider inline-flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d9287c]" />
                    <span>{project.category}</span>
                  </Link>
                )}

                {formattedDate !== '—' && (
                  <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Launched: {formattedDate}</span>
                  </span>
                )}
              </div>

              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-2.5 max-w-4xl">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[50px] font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.12]">
                    {project.title}
                  </h1>
                  {project.client && (
                    <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 font-medium">
                      Engineered for <span className="text-neutral-900 dark:text-white font-bold">{project.client}</span>
                    </p>
                  )}
                </div>

                {/* Action Buttons: Live URL & Contact */}
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  {hasExternalLiveUrl && (
                    <a
                      href={project.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#d9287c] hover:bg-[#c2206c] text-white text-xs sm:text-sm font-semibold shadow-lg shadow-[#d9287c]/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      <span>Visit Live Store</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  )}
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white text-xs sm:text-sm font-medium transition-colors"
                  >
                    <span>Build Similar Store</span>
                  </Link>
                </div>
              </div>

              {/* Standout Metric Banner */}
              {project.metrics && (
                <div className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold text-xs sm:text-sm shadow-xs">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Impact Metric: {project.metrics}</span>
                </div>
              )}
            </div>

            {/* Visual Showcase Hero Image */}
            <div className="relative w-full h-[320px] sm:h-[460px] md:h-[540px] rounded-[20px] sm:rounded-[28px] overflow-hidden bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 shadow-xl group">
              <Image
                src={project.imageUrl}
                alt={project.altText || project.title}
                fill
                sizes="(max-width: 1360px) 100vw, 1360px"
                priority
                className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {hasExternalLiveUrl && (
                <a
                  href={project.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/75 hover:bg-black text-white text-xs font-semibold backdrop-blur-md border border-white/20 shadow-lg transition-all"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{project.projectUrl?.replace(/^https?:\/\//, '')}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Two-Column Details & Specifications */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start pt-2">
              {/* Left Column: Rich Description as entered (Col 8) */}
              <div className="lg:col-span-8 space-y-8">
                {/* Rich Text Description rendered cleanly without synthetic headings or raw tags */}
                {parsedDescriptionHtml ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: parsedDescriptionHtml }}
                    className="prose prose-neutral dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300 [&_h1]:text-3xl sm:[&_h1]:text-4xl [&_h1]:font-bold [&_h1]:text-neutral-900 dark:[&_h1]:text-white [&_h1]:mt-8 [&_h1]:mb-4 [&_h2]:text-2xl sm:[&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-neutral-900 dark:[&_h2]:text-white [&_h2]:mt-8 [&_h2]:mb-3.5 [&_h3]:text-xl sm:[&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-neutral-900 dark:[&_h3]:text-white [&_h3]:mt-6 [&_h3]:mb-2.5 [&_h4]:text-lg [&_h4]:font-bold [&_h4]:text-neutral-900 dark:[&_h4]:text-white [&_h4]:mt-4 [&_h4]:mb-2 [&_p]:text-base sm:[&_p]:text-lg [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-5 [&_li]:mt-1.5 [&_li]:text-base sm:[&_li]:text-lg [&_a]:text-[#d9287c] [&_a]:underline hover:[&_a]:opacity-80 [&_blockquote]:border-l-4 [&_blockquote]:border-[#d9287c] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-6 [&_blockquote]:bg-[#fce7ec]/30 dark:[&_blockquote]:bg-neutral-800/40 [&_blockquote]:p-4 [&_blockquote]:rounded-r-lg [&_strong]:text-neutral-900 dark:[&_strong]:text-white [&_img]:rounded-2xl [&_img]:my-6 [&_img]:border [&_img]:border-neutral-200 dark:[&_img]:border-neutral-800"
                  />
                ) : (
                  <p className="text-neutral-500 italic">No description provided for this project.</p>
                )}

                {/* Architectural Tags & Capabilities */}
                {tagsList.length > 0 && (
                  <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
                    <div className="text-xs font-mono uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Specialized Architectures & Technologies</span>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {tagsList.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-700 flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#d9287c]" />
                          <span>{tag}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Meta Specifications Sidebar (Col 4) */}
              <aside className="lg:col-span-4 w-full sticky top-28 space-y-6">
                <div className="rounded-[22px] sm:rounded-[26px] p-6 sm:p-7 bg-[#fbfbfa] dark:bg-neutral-950/60 border border-neutral-200/80 dark:border-neutral-800 space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-neutral-200/70 dark:border-neutral-800">
                    <Briefcase className="w-4 h-4 text-[#d9287c]" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                      Project Specifications
                    </span>
                  </div>

                  <dl className="space-y-4 text-xs sm:text-sm">
                    {project.client && (
                      <div className="flex justify-between items-start gap-4">
                        <dt className="text-neutral-500 font-medium">Client / Brand</dt>
                        <dd className="text-neutral-900 dark:text-white font-bold text-right">{project.client}</dd>
                      </div>
                    )}

                    {project.category && (
                      <div className="flex justify-between items-start gap-4">
                        <dt className="text-neutral-500 font-medium">Industry</dt>
                        <dd className="text-[#d9287c] font-bold text-right">
                          <Link
                            href={project.categorySlug ? `/portfolio?category=${project.categorySlug}` : '/portfolio'}
                            className="hover:underline"
                          >
                            {project.category}
                          </Link>
                        </dd>
                      </div>
                    )}

                    {formattedDate !== '—' && (
                      <div className="flex justify-between items-start gap-4">
                        <dt className="text-neutral-500 font-medium">Release Date</dt>
                        <dd className="text-neutral-900 dark:text-white font-mono font-semibold text-right">
                          {formattedDate}
                        </dd>
                      </div>
                    )}

                    {project.metrics && (
                      <div className="flex justify-between items-start gap-4 pt-2 border-t border-neutral-200/50 dark:border-neutral-800">
                        <dt className="text-neutral-500 font-medium">Impact Result</dt>
                        <dd className="text-emerald-700 dark:text-emerald-400 font-bold text-right">{project.metrics}</dd>
                      </div>
                    )}

                    {hasExternalLiveUrl && (
                      <div className="flex justify-between items-start gap-4 pt-2 border-t border-neutral-200/50 dark:border-neutral-800">
                        <dt className="text-neutral-500 font-medium">Live Website</dt>
                        <dd className="text-right">
                          <a
                            href={project.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#d9287c] hover:underline font-semibold inline-flex items-center gap-1"
                          >
                            <span>Open Store</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </a>
                        </dd>
                      </div>
                    )}
                  </dl>

                  {/* Direct Action Buttons inside Sidebar */}
                  <div className="pt-3 space-y-2.5">
                    {hasExternalLiveUrl && (
                      <a
                        href={project.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#d9287c] hover:bg-[#c2206c] text-white text-xs font-semibold shadow-md shadow-[#d9287c]/20 transition-all select-none"
                      >
                        <span>Explore Live Storefront</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <Link
                      href="/contact"
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-xs font-semibold hover:border-[#d9287c]/40 transition-all select-none"
                    >
                      <span>Request Similar Build</span>
                    </Link>
                  </div>
                </div>

                {/* Trust & Guarantee Callout */}
                <div className="rounded-[20px] p-5 bg-[#fce7ec]/40 dark:bg-neutral-900 border border-[#d9287c]/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#d9287c]">
                    <Sparkles className="w-4 h-4" />
                    <span>The Gypsym Guarantee</span>
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    Every Shopify Plus store is engineered with Core Web Vitals optimization (&lt;0.8s mobile LCP) and conversion-tested Liquid architectures.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>

      {/* ── 2. More Selected Works Section (Matching Section Size of Other Pages) ── */}
      {otherProjects.length > 0 && (
        <section className="w-full py-8 sm:py-10 md:py-12 relative overflow-x-clip">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8">
            <ScrollReveal direction="up" intensity="subtle">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#d9287c] uppercase">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#d9287c]" />
                    <span>Next Case Studies</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                    Explore More Showcase Stores
                  </h3>
                </div>
                <Link
                  href="/portfolio"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#d9287c] hover:underline"
                >
                  <span>View Full Showcase</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {otherProjects.map((other, idx) => (
                <ScrollReveal key={other.id} direction="up" delay={idx * 80} intensity="subtle">
                  <Link
                    href={`/portfolio/${other.slug}`}
                    className="h-full group block rounded-[22px] overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 shadow-xs hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative w-full h-[220px] sm:h-[240px] overflow-hidden bg-neutral-950">
                      <Image
                        src={other.imageUrl}
                        alt={other.altText || other.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      {other.category && (
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-md border border-white/20 uppercase tracking-wider">
                          {other.category}
                        </div>
                      )}
                    </div>
                    <div className="p-5 space-y-2">
                      <h4 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white group-hover:text-[#d9287c] transition-colors line-clamp-1">
                        {other.title}
                      </h4>
                      {other.client && (
                        <p className="text-xs text-neutral-500 line-clamp-1">{other.client}</p>
                      )}
                      {other.metrics && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                          {other.metrics}
                        </p>
                      )}
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 3. Global Conversion CTA Section (Clean Spacing, No Excess Top/Bottom Margins) ── */}
      <section id="portfolio-project-cta" className="w-full relative overflow-x-clip">
        <ScrollReveal direction="up" intensity="subtle" className="w-full">
          <CtaSection section={ctaSectionToRender} />
        </ScrollReveal>
      </section>
    </div>
  );
}
