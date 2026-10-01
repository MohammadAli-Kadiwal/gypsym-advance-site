import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Clock,
  Calendar,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  ArrowRight,
  Quote,
} from 'lucide-react';
import { getBlogPostBySlug, getPageBySlug, getBlogPosts } from '@/lib/api';
import { ArticleShareBar } from './share-bar';
import { BlogSidebar } from './blog-sidebar';
import { CtaSection } from '@/components/cms/cta-section';
import { PageSectionDto } from '@/lib/cms-types';
import { ScrollReveal } from '@/components/motion';

export const dynamic = 'force-dynamic';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug);
  if (!post) {
    return {
      title: 'Publication Not Found | Gypsym Technology',
    };
  }

  return {
    title: `${post.title} | Gypsym Technology Architecture`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author?.name || 'Gypsym Technology'],
      images: post.coverImage ? [{ url: post.coverImage, alt: post.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const [post, homePage, allPosts] = await Promise.all([
    getBlogPostBySlug(params.slug),
    getPageBySlug('home'),
    getBlogPosts({ limit: 40 }),
  ]);

  if (!post) {
    notFound();
  }

  const otherPosts = (allPosts || []).filter((p) => p.slug !== params.slug);

  const sections = post.bodyContent?.sections || [
    {
      heading: 'Executive Overview',
      paragraphs: [post.excerpt],
    },
  ];

  // CTA Section
  const rawCtaSection = homePage?.sections?.find(
    (s: any) =>
      s.componentType === 'CTA' ||
      s.sectionIdentifier === 'homepage-cta' ||
      s.sectionIdentifier === 'cta-banner'
  );

  const ctaSectionToRender: PageSectionDto = rawCtaSection || {
    id: 'blog-article-cta',
    pageId: 'blog',
    sectionIdentifier: 'homepage-cta',
    componentType: 'CTA',
    displayOrder: 12,
    isActive: true,
    contentPayload: {
      eyebrow: 'ENTERPRISE ARCHITECTURE',
      title: 'Ready to Deploy Resilient Architecture at Scale?',
      titleHighlight: 'Resilient',
      description:
        'Schedule a technical architecture review with our Principal Engineers and Systems Architects.',
      primaryButton: {
        label: 'Schedule Technical Review',
        url: '/contact',
        variant: 'primary',
      },
    },
  };

  return (
    <div className="w-full bg-[#f4f3ef] dark:bg-background pt-28 sm:pt-32 lg:pt-36 pb-16 sm:pb-24">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Main Reading Area (Left Side) */}
          <article className="lg:col-span-8 w-full">
            {/* Main Article Container matching Site's Rounded Card Aesthetic */}
            <div className="bg-white dark:bg-neutral-900 rounded-[22px] sm:rounded-[32px] p-6 sm:p-10 md:p-14 border border-neutral-200/70 dark:border-neutral-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
              {/* Breadcrumbs */}
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-neutral-500 mb-8 overflow-x-auto whitespace-nowrap scrollbar-none">
              <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                Home
              </Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <Link href="/blog" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Blog
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span className="text-[#d9287c]">{post.category?.name}</span>
          </nav>

          {/* Category Pill & Reading Time */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#fce7ec] text-[#d9287c]">
              {post.category?.name}
            </span>
            <span className="text-xs font-mono text-neutral-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime}
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span className="text-xs font-mono text-neutral-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {post.publishedDate}
            </span>
          </div>

          {/* Grand Headline (Site's Primary Sans Typography) */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.15]">
            {post.title}
          </h1>

          {/* Abstract / Excerpt */}
          <p className="mt-6 text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed border-l-3 border-[#d9287c] pl-4 italic">
            {post.excerpt}
          </p>

          {/* Author Metadata Bar & Share Actions */}
          <div className="mt-8 pt-6 pb-6 border-y border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {post.author?.avatar && (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-neutral-200 shrink-0"
                />
              )}
              <div>
                <div className="text-sm font-bold text-neutral-900 dark:text-white">
                  {post.author?.name}
                </div>
                <div className="text-xs text-neutral-500">
                  {post.author?.role || 'Chief Technology Officer & Lead Architect'}
                </div>
              </div>
            </div>

            <ArticleShareBar title={post.title} slug={post.slug} />
          </div>

          {/* Cover Media Banner */}
          {post.coverImage && (
            <div className="mt-8 rounded-[18px] sm:rounded-[24px] overflow-hidden aspect-video relative bg-neutral-950">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Body Content */}
          <div className="mt-12 space-y-10">
            {sections.map((section: any, idx: number) => (
              <section key={idx} className="space-y-5">
                {section.heading && (
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white leading-snug pt-4 border-t border-neutral-100 dark:border-neutral-800 first:border-0 first:pt-0">
                    {section.heading}
                  </h2>
                )}

                {section.subheading && (
                  <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">
                    {section.subheading}
                  </h3>
                )}

                {section.paragraphs?.map((p: string, pIdx: number) => (
                  <p
                    key={pIdx}
                    className="text-base sm:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed"
                  >
                    {p}
                  </p>
                ))}

                {/* Quotation Callout */}
                {section.quote && (
                  <div className="my-6 p-6 sm:p-8 rounded-[20px] bg-[#fce7ec] dark:bg-neutral-800/80 border-l-4 border-[#d9287c] relative">
                    <Quote className="w-8 h-8 text-[#d9287c]/30 absolute top-4 right-4" />
                    <blockquote className="text-base sm:text-lg font-serif italic text-neutral-900 dark:text-white leading-relaxed">
                      &ldquo;{section.quote.text}&rdquo;
                    </blockquote>
                    {section.quote.citation && (
                      <div className="mt-3 text-xs font-mono font-bold text-[#d9287c] uppercase tracking-wider">
                        — {section.quote.citation}
                      </div>
                    )}
                  </div>
                )}

                {/* Code Snippet */}
                {section.codeSnippet && (
                  <div className="my-6 rounded-[18px] overflow-hidden border border-neutral-800 bg-[#0d1117] shadow-sm">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-neutral-800 text-xs font-mono text-neutral-400">
                      <span>{section.codeSnippet.language}</span>
                      <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Architecture Source</span>
                    </div>
                    <pre className="p-4 sm:p-5 overflow-x-auto text-xs sm:text-sm font-mono text-emerald-400 leading-relaxed">
                      <code>{section.codeSnippet.code}</code>
                    </pre>
                  </div>
                )}

                {/* Takeaways Callout */}
                {section.callout && (
                  <div className="my-6 p-5 sm:p-6 rounded-[18px] bg-[#f3f9e9] dark:bg-emerald-950/20 border border-[#98c22a]/40">
                    <div className="text-xs font-mono font-bold text-[#98c22a] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      {section.callout.title}
                    </div>
                    <p className="text-sm sm:text-base text-neutral-800 dark:text-neutral-200 leading-relaxed">
                      {section.callout.text}
                    </p>
                  </div>
                )}

                {/* Bullet Points */}
                {section.bulletPoints && section.bulletPoints.length > 0 && (
                  <ul className="space-y-2.5 my-4">
                    {section.bulletPoints.map((bp: string, bpIdx: number) => (
                      <li key={bpIdx} className="flex items-start gap-3 text-sm sm:text-base text-neutral-700 dark:text-neutral-300">
                        <span className="w-2 h-2 rounded-full bg-[#d9287c] mt-2.5 shrink-0" />
                        <span>{bp}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-6 border-t border-neutral-100 dark:border-neutral-800">
              <div className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-3">
                Architectural Domains
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Author Footer Card */}
          <div className="mt-12 p-6 sm:p-8 rounded-[22px] bg-[#f4f3ef] dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {post.author?.avatar && (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-neutral-300 shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-[#d9287c] uppercase tracking-wider">About the Author</div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mt-0.5">
                {post.author?.name}
              </h3>
              {post.author?.role && (
                <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  {post.author.role}
                </div>
              )}
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1.5 leading-relaxed">
                {post.author?.extendedBio || post.author?.bio || 'Leads systems architecture and global engineering practice at Gypsym Technology, advising enterprise retailers and financial institutions on active-active cloud topologies and sovereign AI.'}
              </p>
            </div>
          </div>

          {/* Back button */}
          <div className="mt-10">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-600 hover:text-[#d9287c] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to All Publications
            </Link>
          </div>
        </div>
      </article>

      {/* Right Side: Sticky Sidebar with Auto-type Search & Other Blogs */}
      <aside className="lg:col-span-4 w-full">
        <div className="sticky top-28 space-y-6">
          <BlogSidebar otherPosts={otherPosts} currentSlug={params.slug} />
        </div>
      </aside>
    </div>

        {/* ── Related Publications Grid ── */}
        {post.related && post.related.length > 0 && (
          <section className="mt-16 sm:mt-20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="text-xs font-bold text-[#d9287c] uppercase tracking-wider mb-1">
                  Further Reading
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  Related Architecture Publications
                </h3>
              </div>
              <Link
                href="/blog"
                className="text-xs font-bold text-[#d9287c] hover:underline hidden sm:inline-flex items-center gap-1"
              >
                View all articles <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {post.related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.slug}`}
                  className="bg-white dark:bg-neutral-900 rounded-[22px] sm:rounded-[26px] p-5 border border-neutral-200/70 dark:border-neutral-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="rounded-[14px] overflow-hidden aspect-[16/10] relative bg-neutral-950 mb-4">
                      <img
                        src={rel.coverImage}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-900/80 text-white backdrop-blur-md">
                          {rel.category?.name}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-neutral-900 dark:text-white group-hover:text-[#d9287c] transition-colors line-clamp-2 leading-snug">
                      {rel.title}
                    </h4>
                    <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                      {rel.excerpt}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] font-mono text-neutral-400">
                    <span>{rel.readTime}</span>
                    <span className="text-[#d9287c] group-hover:translate-x-0.5 transition-transform font-bold">
                      Read &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Bottom CTA Banner */}
      <section className="mt-16 sm:mt-20 w-full relative overflow-x-clip">
        <ScrollReveal direction="up" intensity="subtle" className="w-full">
          <CtaSection section={ctaSectionToRender} />
        </ScrollReveal>
      </section>
    </div>
  );
}
