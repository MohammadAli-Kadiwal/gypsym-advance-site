'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Search,
  Clock,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  X,
} from 'lucide-react';
import { BlogPostItemDto, BlogCategoryDto } from '@/lib/api';
import { renderTitleWithHighlight } from '@/lib/render-title-highlight';
import { ScrollReveal } from '@/components/motion';

interface BlogHubClientProps {
  initialPosts: BlogPostItemDto[];
  categories: BlogCategoryDto[];
}

export function BlogHubClient({ initialPosts, categories }: BlogHubClientProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [newsletterEmail, setNewsletterEmail] = React.useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = React.useState(false);
  const categoryScrollRef = React.useRef<HTMLDivElement>(null);

  // Filter posts based on category and search query
  const filteredPosts = React.useMemo(() => {
    return initialPosts.filter((post) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        post.category?.slug === selectedCategory ||
        post.category?.id === selectedCategory ||
        post.category?.name?.toLowerCase() === selectedCategory.toLowerCase();

      const matchesSearch =
        searchQuery.trim() === '' ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [initialPosts, selectedCategory, searchQuery]);

  // Spotlight article when viewing all without search
  const spotlightPost =
    selectedCategory === 'all' && searchQuery.trim() === '' && filteredPosts.length > 0
      ? filteredPosts[0]
      : null;

  const gridPosts = spotlightPost ? filteredPosts.slice(1) : filteredPosts;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubscribed(true);
    setNewsletterEmail('');
  };

  return (
    <div className="w-full bg-[#f4f3ef] dark:bg-background">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-14 md:py-16">
        {/* ── 1. Section Header: Matches WhatWeChange & Verified Results Exactly ── */}
        <ScrollReveal direction="up">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#d9287c] uppercase">
              <span className="inline-block w-2 h-2 rounded-full bg-[#d9287c]" />
              <span>EDITORIAL ARCHITECTURE</span>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.15] sm:leading-[1.12] whitespace-pre-line">
              {renderTitleWithHighlight(
                'Explore our latest architecture blueprints and benchmarks.',
                'blueprints',
                'font-serif italic font-normal text-[1.06em] tracking-normal inline-block text-neutral-900 dark:text-white leading-normal'
              )}
            </h2>

            <p className="text-base sm:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-2xl mx-auto">
              Peer-reviewed technical publications covering Shopify Plus storefronts, active-active multi-cloud topologies, and sovereign AI clusters.
            </p>
          </div>
        </ScrollReveal>

        {/* ── 2. Centered Search Bar Matching Site Inputs ── */}
        <ScrollReveal direction="up" delay={60}>
          <div className="max-w-xl mx-auto mb-8 sm:mb-10">
            <div className="relative flex items-center rounded-full bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] px-4 py-2.5 sm:py-3 focus-within:border-[#d9287c] focus-within:ring-2 focus-within:ring-[#d9287c]/20 transition-all">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 ml-1 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search architecture patterns, Shopify, Kafka, eBPF..."
                className="w-full px-3 bg-transparent text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-400 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* ── 3. Category Filter Bar (Matching Portfolio Section Exact Style) ── */}
        <ScrollReveal direction="up" delay={80}>
          <div className="w-full pb-8 sm:pb-12">
            <div
              ref={categoryScrollRef}
              className="flex items-center justify-start md:justify-center gap-2 sm:gap-2.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 py-1.5 flex-nowrap md:flex-wrap max-w-[1360px] mx-auto scroll-smooth touch-pan-x"
              role="tablist"
              aria-label="Filter blog posts by category"
            >
              {/* Virtual 'All' Filter Pill */}
              <button
                type="button"
                role="tab"
                aria-selected={selectedCategory === 'all'}
                onClick={() => setSelectedCategory('all')}
                className={`shrink-0 whitespace-nowrap px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 select-none hover:scale-105 active:scale-95 cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-[#d9287c] text-white shadow-xs'
                    : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:border-[#d9287c]/40 border border-neutral-200/80 dark:border-neutral-800 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.02)]'
                }`}
              >
                All Articles ({initialPosts.length})
              </button>

              {/* Dynamic Category Pills */}
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.slug || selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id || cat.slug}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`shrink-0 whitespace-nowrap px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 select-none hover:scale-105 active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'bg-[#d9287c] text-white shadow-xs'
                        : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:border-[#d9287c]/40 border border-neutral-200/80 dark:border-neutral-800 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.02)]'
                    }`}
                  >
                    {cat.name}
                    {cat.postCount ? ` (${cat.postCount})` : ''}
                  </button>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* ── 4. Spotlight / Featured Article ── */}
        {spotlightPost && (
          <ScrollReveal direction="up" delay={100}>
            <div className="mb-12 sm:mb-16">
              <div className="bg-white dark:bg-neutral-900 rounded-[22px] sm:rounded-[30px] p-6 sm:p-8 md:p-10 border border-neutral-200/70 dark:border-neutral-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all duration-300 group">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
                  {/* Left: Featured Image */}
                  <div className="lg:col-span-7 rounded-[16px] sm:rounded-[22px] overflow-hidden aspect-video relative bg-neutral-950">
                    <img
                      src={spotlightPost.coverImage}
                      alt={spotlightPost.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#d9287c] text-white shadow-xs">
                        FEATURED BRIEFING
                      </span>
                    </div>
                  </div>

                  {/* Right: Article Details */}
                  <div className="lg:col-span-5 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center gap-3 text-xs font-semibold text-neutral-500 mb-3">
                        <span className="text-[#d9287c] font-bold uppercase tracking-wider">
                          {spotlightPost.category?.name}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5" />
                          {spotlightPost.readTime}
                        </span>
                      </div>

                      <Link href={`/blog/${spotlightPost.slug}`}>
                        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white group-hover:text-[#d9287c] transition-colors leading-[1.2]">
                          {spotlightPost.title}
                        </h3>
                      </Link>

                      <p className="mt-3.5 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 line-clamp-3 leading-relaxed">
                        {spotlightPost.excerpt}
                      </p>

                      {spotlightPost.tags && spotlightPost.tags.length > 0 && (
                        <div className="mt-5 flex flex-wrap gap-1.5">
                          {spotlightPost.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {spotlightPost.author?.avatar && (
                          <img
                            src={spotlightPost.author.avatar}
                            alt={spotlightPost.author.name}
                            loading="lazy"
                            decoding="async"
                            className="w-9 h-9 rounded-full object-cover border border-neutral-200"
                          />
                        )}
                        <div>
                          <div className="text-xs font-bold text-neutral-900 dark:text-white">
                            {spotlightPost.author?.name}
                          </div>
                          <div className="text-[11px] text-neutral-400 font-mono">
                            {spotlightPost.publishedDate}
                          </div>
                        </div>
                      </div>

                      <Link
                        href={`/blog/${spotlightPost.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-neutral-900 dark:text-white group-hover:text-[#d9287c] transition-colors"
                      >
                        Read Article
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* ── 5. 3-Column Articles Grid ── */}
        {filteredPosts.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-[22px] sm:rounded-[30px] p-12 text-center border border-neutral-200/70 dark:border-neutral-800 max-w-lg mx-auto">
            <BookOpen className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">No publications match your criteria</h3>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Try searching for a different keyword or resetting your category filter.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-5 px-5 py-2.5 rounded-full bg-[#d9287c] text-white text-xs font-bold hover:scale-105 transition-transform"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {gridPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white dark:bg-neutral-900 rounded-[22px] sm:rounded-[26px] p-5 sm:p-6 border border-neutral-200/70 dark:border-neutral-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Cover image */}
                  <div className="rounded-[14px] sm:rounded-[18px] overflow-hidden aspect-[16/10] relative bg-neutral-950 mb-5">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-neutral-900/80 text-white backdrop-blur-md">
                        {post.category?.name}
                      </span>
                    </div>
                  </div>

                  {/* Metadata line */}
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-400 mb-2 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                    <span>•</span>
                    <span>{post.publishedDate}</span>
                  </div>

                  {/* Title */}
                  <Link href={`/blog/${post.slug}`}>
                    <h3 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-white group-hover:text-[#d9287c] transition-colors leading-snug line-clamp-2">
                      {post.title}
                    </h3>
                  </Link>

                  {/* Excerpt */}
                  <p className="mt-2.5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                {/* Card footer */}
                <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {post.author?.avatar && (
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        loading="lazy"
                        decoding="async"
                        className="w-7 h-7 rounded-full object-cover border border-neutral-200"
                      />
                    )}
                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 line-clamp-1">
                      {post.author?.name}
                    </span>
                  </div>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="p-1.5 rounded-full text-neutral-400 group-hover:text-[#d9287c] group-hover:translate-x-0.5 transition-all"
                    aria-label={`Read article: ${post.title}`}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* ── 6. Executive Briefing Newsletter Section (Matches CTA Section Design Exactly) ── */}
        <div className="mt-12 sm:mt-16 md:mt-20 w-full">
          <div className="w-full bg-white dark:bg-card rounded-[24px] sm:rounded-[36px] md:rounded-[42px] border border-neutral-200/80 dark:border-border shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] p-6 sm:p-8 md:p-10 lg:p-12 relative overflow-hidden">
            {/* Ambient background glow matching site theme */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-[#d9287c]/6 via-[#d9287c]/2 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />

            <div className="relative z-10 flex flex-col items-center text-center space-y-4 sm:space-y-5 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#d9287c] uppercase">
                <span className="inline-block w-2 h-2 rounded-full bg-[#d9287c]" />
                <span>EXECUTIVE DISPATCH</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white leading-tight whitespace-pre-line">
                {renderTitleWithHighlight(
                  'Subscribe to the Gypsym Engineering Briefing',
                  'Briefing',
                  'font-serif italic font-normal text-[1.06em] tracking-normal inline-block text-neutral-900 dark:text-white leading-normal'
                )}
              </h2>

              <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl mx-auto">
                Quarterly architectural blueprints, zero-downtime benchmarks, and sovereign AI telemetry delivered directly to CTOs and lead architects.
              </p>

              <div className="pt-2 sm:pt-4 w-full flex flex-col items-center">
                {newsletterSubscribed ? (
                  <div className="p-4 rounded-2xl bg-[#fce7ec] text-[#d9287c] font-bold text-sm max-w-md mx-auto flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Thank you. You are subscribed to the Executive Briefing.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="w-full max-w-md mx-auto flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter corporate email address..."
                      className="px-5 py-3.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#d9287c] flex-1"
                    />
                    <button
                      type="submit"
                      className="px-7 py-3.5 rounded-full bg-[#d9287c] hover:bg-[#c01c6a] text-white font-bold text-xs sm:text-sm transition-transform hover:scale-105 active:scale-95 shadow-sm shrink-0 cursor-pointer"
                    >
                      Join Briefing
                    </button>
                  </form>
                )}

                <p className="mt-3 text-[11px] text-neutral-400 font-mono">
                  Strict technical signal. Zero marketing spam. Unsubscribe at any time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
