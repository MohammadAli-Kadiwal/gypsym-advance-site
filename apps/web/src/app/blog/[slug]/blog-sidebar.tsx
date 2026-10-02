'use client';

import * as React from 'react';
import Link from 'next/link';
import { BlogPostItemDto } from '@/lib/api';
import { Search, X, Clock, ArrowRight, BookOpen, Sparkles } from 'lucide-react';

interface BlogSidebarProps {
  otherPosts: BlogPostItemDto[];
  currentSlug: string;
}

const SEARCH_PROMPTS = [
  'Search architecture deep dives...',
  'Search eBPF kernel observability...',
  'Search zero-trust session security...',
  'Search high-frequency Liquid OS 2.0...',
  'Search sovereign AI & distributed systems...',
  'Search cloud migrations & enterprise CRO...',
  'Search active-active multi-region databases...',
];

export function BlogSidebar({ otherPosts, currentSlug }: BlogSidebarProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(false);

  // Auto-typing placeholder state
  const [placeholder, setPlaceholder] = React.useState('');
  const [promptIdx, setPromptIdx] = React.useState(0);
  const [charIdx, setCharIdx] = React.useState(0);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Auto-type typewriter loop
  React.useEffect(() => {
    // If user has focused or typed something, don't run typewriter
    if (isFocused || searchTerm) {
      setPlaceholder('Search engineering publications...');
      return;
    }

    const currentPrompt = SEARCH_PROMPTS[promptIdx] || SEARCH_PROMPTS[0]!;

    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      // Typing forward
      if (charIdx < currentPrompt.length) {
        timer = setTimeout(() => {
          setPlaceholder(currentPrompt.substring(0, charIdx + 1));
          setCharIdx((prev) => prev + 1);
        }, 55);
      } else {
        // Finished typing word, pause before deleting
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      // Backspacing / clearing effect character-by-character
      if (charIdx > 0) {
        timer = setTimeout(() => {
          setPlaceholder(currentPrompt.substring(0, charIdx - 1));
          setCharIdx((prev) => prev - 1);
        }, 28);
      } else {
        // Finished clearing, advance to next sentence
        setIsDeleting(false);
        setPromptIdx((prev) => (prev + 1) % SEARCH_PROMPTS.length);
      }
    }

    return () => clearTimeout(timer);
  }, [charIdx, isDeleting, promptIdx, isFocused, searchTerm]);

  // Filter other posts based on user search
  const filteredPosts = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return otherPosts;

    return otherPosts.filter((post) => {
      const titleMatch = post.title.toLowerCase().includes(term);
      const excerptMatch = post.excerpt.toLowerCase().includes(term);
      const categoryMatch = post.category?.name?.toLowerCase().includes(term);
      return titleMatch || excerptMatch || categoryMatch;
    });
  }, [otherPosts, searchTerm]);

  return (
    <div className="space-y-6">
      {/* ── Search Box with Auto-type Animated Placeholder ── */}
      <div className="bg-white dark:bg-neutral-900 rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 border border-neutral-200/70 dark:border-neutral-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
            <Search className="w-3.5 h-3.5 text-[#d9287c]" />
            <span>Search Articles</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">
            {filteredPosts.length} available
          </span>
        </div>

        <div className="relative flex items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="w-full h-10 pl-3.5 pr-9 rounded-xl bg-neutral-100/80 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#d9287c]/30 focus:border-[#d9287c] transition-all font-sans"
          />

          {searchTerm ? (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="absolute right-3 w-1.5 h-3 bg-[#d9287c] animate-pulse pointer-events-none rounded-full" />
          )}
        </div>

        {searchTerm && (
          <div className="mt-2 text-[11px] text-neutral-500 flex items-center justify-between">
            <span>
              Found {filteredPosts.length} matching {filteredPosts.length === 1 ? 'article' : 'articles'}
            </span>
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="text-[#d9287c] hover:underline font-semibold"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* ── Other Blogs List Card ── */}
      <div className="bg-white dark:bg-neutral-900 rounded-[20px] sm:rounded-[24px] p-5 sm:p-6 border border-neutral-200/70 dark:border-neutral-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#d9287c]" />
            <h3 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white">
              Other Publications
            </h3>
          </div>
          <Link
            href="/blog"
            className="text-[11px] font-bold text-[#d9287c] hover:underline inline-flex items-center gap-0.5"
          >
            <span>All Articles</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <p className="text-xs text-neutral-500">
              No publications match &ldquo;<span className="font-semibold">{searchTerm}</span>&rdquo;
            </p>
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="text-xs font-bold text-[#d9287c] hover:underline"
            >
              Clear search query
            </button>
          </div>
        ) : (
          <div className="space-y-3.5 divide-y divide-neutral-100 dark:divide-neutral-800/60">
            {filteredPosts.map((post) => (
              <Link
                key={post.id || post.slug}
                href={`/blog/${post.slug}`}
                className={`group flex items-start gap-3.5 pt-3.5 first:pt-0 transition-all ${
                  post.slug === currentSlug ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                {/* Compact Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-950 shrink-0 border border-neutral-200/70 dark:border-neutral-800 relative">
                  {post.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-500">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-[#fce7ec] text-[#d9287c] truncate max-w-[140px]">
                      {post.category?.name || 'Architecture'}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1 shrink-0">
                      <Clock className="w-2.5 h-2.5" />
                      {post.readTime || '6 min'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-[#d9287c] transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
