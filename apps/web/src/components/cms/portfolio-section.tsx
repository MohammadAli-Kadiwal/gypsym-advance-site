'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Briefcase, Loader2, ArrowUpRight } from 'lucide-react';
import { PageSectionDto } from '@/lib/cms-types';
import { renderTitleWithHighlight } from '@/lib/render-title-highlight';
import { ScrollReveal } from '@/components/motion';

export interface PortfolioCategoryFilterItem {
  id: string;
  name: string;
  slug: string;
  displayOrder?: number;
  projectCount?: number;
}

export interface PortfolioProject {
  id: string;
  orderNumber?: string;
  title: string;
  slug?: string;
  client?: string;
  category?: string;
  categorySlug?: string;
  categoryId?: string;
  description?: string;
  imageUrl: string;
  altText?: string;
  projectUrl?: string;
  tags?: string[];
  metrics?: string;
  displayOrder?: number;
}

export interface PortfolioPayload {
  eyebrow?: string;
  title?: string;
  titleHighlight?: string;
  description?: string;

  // Category filter
  showCategoryFilter?: boolean;
  defaultCategory?: string;
  categories?: PortfolioCategoryFilterItem[];

  // Display limit & Home page curation
  maxDisplayCount?: number;
  selectedProjectIds?: string[];

  // View All Button (Home Page)
  showViewAllButton?: boolean;
  viewAllButtonLabel?: string;
  viewAllButtonUrl?: string;

  // Hover settings
  hoverEffectsEnabled?: boolean;
  viewButtonEnabled?: boolean;
  viewButtonLabel?: string;
  imageZoomEnabled?: boolean;

  projects?: PortfolioProject[];
}

export interface PortfolioSectionProps {
  section: PageSectionDto;
  activeCategory?: string;
  onCategoryChange?: (slug: string) => void;
  categories?: PortfolioCategoryFilterItem[];
  overrideProjects?: PortfolioProject[];
  linkToInnerPage?: boolean;
}

export function PortfolioSection({
  section,
  activeCategory: activeCategoryProp,
  onCategoryChange,
  categories: categoriesProp,
  overrideProjects,
  linkToInnerPage,
}: PortfolioSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const p = (section.contentPayload as PortfolioPayload) || {};

  const eyebrow = p.eyebrow;
  const title = p.title || '';
  const titleHighlight = p.titleHighlight || 'Our Work';
  const description = p.description || '';

  const isDedicatedPortfolioPage = pathname ? pathname.startsWith('/portfolio') : false;

  // Category filter: On dedicated /portfolio page, show by default (unless explicitly false).
  // On Home page, DO NOT show categories unless explicitly enabled (p.showCategoryFilter === true).
  const showCategoryFilter = isDedicatedPortfolioPage
    ? p.showCategoryFilter !== false
    : Boolean(p.showCategoryFilter);
  const initialCategories = categoriesProp || p.categories || [];
  const [filterCategories, setFilterCategories] = React.useState<PortfolioCategoryFilterItem[]>(initialCategories);

  // Client-side live API projects state
  const initialProjects: PortfolioProject[] =
    overrideProjects && overrideProjects.length > 0
      ? overrideProjects
      : (Array.isArray(p.projects) && p.projects.length > 0 ? p.projects : []);
  const [apiProjects, setApiProjects] = React.useState<PortfolioProject[]>(initialProjects);
  const [loadingProjects, setLoadingProjects] = React.useState<boolean>(false);

  // Determine active category with URL sync
  const urlCategory = searchParams.get('category');
  const [activeCategoryState, setActiveCategoryState] = React.useState<string>(
    activeCategoryProp || urlCategory || p.defaultCategory || 'all',
  );

  React.useEffect(() => {
    if (activeCategoryProp !== undefined) {
      setActiveCategoryState(activeCategoryProp);
    } else if (urlCategory) {
      setActiveCategoryState(urlCategory);
    } else {
      setActiveCategoryState(p.defaultCategory || 'all');
    }
  }, [activeCategoryProp, urlCategory, p.defaultCategory]);

  const activeCategory = activeCategoryProp || activeCategoryState;
  const isInitialFetchMount = React.useRef(true);

  // ── Call Live Portfolio API from Client ───────────────────────────────────
  React.useEffect(() => {
    // If SSR already provided projects and activeCategory is default, skip initial mount fetch
    if (isInitialFetchMount.current) {
      isInitialFetchMount.current = false;
      if (initialProjects.length > 0 && (!activeCategory || activeCategory === 'all')) {
        return;
      }
    }

    let isCancelled = false;

    async function loadPortfolioData() {
      try {
        setLoadingProjects(true);
        const apiBase =
          typeof window !== 'undefined'
            ? (process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//${window.location.hostname}:4000/api/v1`)
            : 'http://127.0.0.1:4000/api/v1';

        const categoryQuery =
          activeCategory && activeCategory !== 'all'
            ? `?category=${encodeURIComponent(activeCategory)}`
            : '';

        const res = await fetch(`${apiBase}/portfolio${categoryQuery}`);

        if (res.ok) {
          const json = await res.json();
          const list = json?.data?.projects || json?.projects || (Array.isArray(json?.data) ? json.data : []);
          if (Array.isArray(list) && !isCancelled) {
            setApiProjects(list);
          }
        }
      } catch (err) {
        console.error('[PortfolioSection] Error calling portfolio API:', err);
      } finally {
        if (!isCancelled) {
          setLoadingProjects(false);
        }
      }
    }

    loadPortfolioData();

    return () => {
      isCancelled = true;
    };
  }, [activeCategory]);

  // ── Call Live Categories API from Client ─────────────────────────────────
  React.useEffect(() => {
    // If categories are already supplied by SSR or not showing filter, don't fetch
    if (!showCategoryFilter || (categoriesProp && categoriesProp.length > 0)) {
      return;
    }

    let isCancelled = false;

    async function loadCategoriesData() {
      try {
        const apiBase =
          typeof window !== 'undefined'
            ? (process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//${window.location.hostname}:4000/api/v1`)
            : 'http://127.0.0.1:4000/api/v1';

        const res = await fetch(`${apiBase}/portfolio/categories`);

        if (res.ok) {
          const json = await res.json();
          const list = json?.data || json;
          if (Array.isArray(list) && list.length > 0 && !isCancelled) {
            setFilterCategories(
              list.map((c: any) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                displayOrder: c.displayOrder,
                projectCount: c.projectCount ?? c._count?.projects ?? 0,
              }))
            );
          }
        }
      } catch (err) {
        console.error('[PortfolioSection] Error calling categories API:', err);
      }
    }

    loadCategoriesData();

    return () => {
      isCancelled = true;
    };
  }, [showCategoryFilter, categoriesProp]);

  const hoverEffectsEnabled = p.hoverEffectsEnabled !== false;
  const imageZoomEnabled = p.imageZoomEnabled !== false;

  // Determine if project cards should open the inner detail page (/portfolio/[slug])
  const shouldLinkInner =
    linkToInnerPage ?? (pathname ? pathname.startsWith('/portfolio') : false);

  // Source projects: prefer live API projects, fallback to server override or CMS payload
  const sourceProjects: PortfolioProject[] =
    apiProjects && apiProjects.length > 0
      ? apiProjects
      : (overrideProjects && overrideProjects.length > 0
          ? overrideProjects
          : (Array.isArray(p.projects) && p.projects.length > 0 ? p.projects : []));

  const validProjects = sourceProjects.filter((pr: any) => pr && pr.title && pr.status !== 'DRAFT');

  // Curate projects for Home Page showcase based on admin selection if configured
  const curatedProjects = React.useMemo(() => {
    if (
      !isDedicatedPortfolioPage &&
      Array.isArray(p.selectedProjectIds) &&
      p.selectedProjectIds.length > 0
    ) {
      const selected = p.selectedProjectIds
        .map((id) => validProjects.find((pr) => pr.id === id))
        .filter(Boolean) as PortfolioProject[];
      if (selected.length > 0) {
        return selected;
      }
    }
    return validProjects;
  }, [validProjects, isDedicatedPortfolioPage, p.selectedProjectIds]);

  // Filter projects by category
  const filteredProjects = React.useMemo(() => {
    if (!activeCategory || activeCategory === 'all') {
      return curatedProjects;
    }
    return curatedProjects.filter((pr) => {
      const prSlug = pr.categorySlug || pr.category?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return prSlug === activeCategory || pr.category?.toLowerCase() === activeCategory.toLowerCase();
    });
  }, [curatedProjects, activeCategory]);

  const maxDisplayCount =
    !isDedicatedPortfolioPage && typeof p.maxDisplayCount === 'number' && p.maxDisplayCount > 0
      ? (Array.isArray(p.selectedProjectIds) && p.selectedProjectIds.length > 0
          ? Math.max(p.maxDisplayCount, p.selectedProjectIds.length)
          : p.maxDisplayCount)
      : filteredProjects.length;
  const projects = filteredProjects.slice(0, maxDisplayCount);

  // Handle Category Filter Click
  const handleCategorySelect = (slug: string) => {
    setActiveCategoryState(slug);
    if (onCategoryChange) {
      onCategoryChange(slug);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      if (slug === 'all') {
        params.delete('category');
      } else {
        params.set('category', slug);
      }
      const qs = params.toString();
      const targetUrl = qs ? `${pathname}?${qs}` : pathname;
      router.push(targetUrl, { scroll: false });
    }
  };

  // ── Category Filter Horizontal Auto-Scroll ────────────────────────────────
  const categoryContainerRef = React.useRef<HTMLDivElement>(null);
  const isInitialMount = React.useRef(true);

  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const container = categoryContainerRef.current;
    if (!container) return;
    const activeEl = container.querySelector('[aria-selected="true"]') as HTMLElement;
    if (activeEl) {
      const containerWidth = container.offsetWidth;
      const elLeft = activeEl.offsetLeft;
      const elWidth = activeEl.offsetWidth;
      const targetScrollLeft = elLeft - containerWidth / 2 + elWidth / 2;
      container.scrollTo({
        left: Math.max(0, targetScrollLeft),
        behavior: 'smooth',
      });
    }
  }, [activeCategory]);

  return (
    <section className="relative w-full py-12 sm:py-16 md:py-20 lg:py-24 bg-background overflow-hidden">
      <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        {(title || eyebrow || description) && (
          <ScrollReveal direction="up">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-14">
              {eyebrow && (
                <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#d9287c] uppercase">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#d9287c]" />
                  <span>{eyebrow}</span>
                </div>
              )}

              {title && (
                <h2 className="text-3xl sm:text-5xl lg:text-[52px] font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.15] sm:leading-[1.12] whitespace-pre-line">
                  {renderTitleWithHighlight(
                    title,
                    titleHighlight,
                    'font-serif italic font-normal text-[1.12em] tracking-normal inline-block px-1'
                  )}
                </h2>
              )}

              {description && (
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl mx-auto pt-1">
                  {description}
                </p>
              )}
            </div>
          </ScrollReveal>
        )}

        {/* ── Dynamic Category Filter Bar: Perfectly Centered Pill Bar ── */}
        {showCategoryFilter && (
          <div className="w-full pb-10 sm:pb-14">
            <div
              ref={categoryContainerRef}
              className="flex items-center justify-start sm:justify-center gap-2 sm:gap-2.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-2 px-1 scroll-smooth touch-pan-x"
              role="tablist"
              aria-label="Filter portfolio by category"
            >
              {/* Virtual 'All' Filter Pill */}
              <button
                type="button"
                role="tab"
                aria-selected={activeCategory === 'all'}
                onClick={() => handleCategorySelect('all')}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 select-none whitespace-nowrap cursor-pointer ${
                  activeCategory === 'all'
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 shadow-md shadow-black/10'
                    : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-800'
                }`}
              >
                <span>All</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                    activeCategory === 'all'
                      ? 'bg-white/20 dark:bg-black/20 text-white dark:text-neutral-950'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                  }`}
                >
                  {validProjects.length}
                </span>
              </button>

              {/* Dynamic Category Pills */}
              {filterCategories.map((cat) => {
                const isSelected = activeCategory === cat.slug;
                const catCount =
                  typeof cat.projectCount === 'number' && cat.projectCount > 0
                    ? cat.projectCount
                    : validProjects.filter(
                        (pr) =>
                          pr.categorySlug === cat.slug ||
                          pr.category?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === cat.slug ||
                          pr.category?.toLowerCase() === cat.name.toLowerCase()
                      ).length;

                return (
                  <button
                    key={cat.id || cat.slug}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => handleCategorySelect(cat.slug)}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 select-none whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 shadow-md shadow-black/10'
                        : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-800'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {catCount > 0 && (
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                          isSelected
                            ? 'bg-white/20 dark:bg-black/20 text-white dark:text-neutral-950'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                        }`}
                      >
                        {catCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Projects Grid Container ── */}
        <div className="w-full">
          {/* Loading Spinner */}
          {loadingProjects && projects.length === 0 && (
            <div className="w-full py-24 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#d9287c]" />
              <p className="text-sm font-medium text-neutral-500">Loading portfolio showcase...</p>
            </div>
          )}

          {/* Empty Category State */}
          {!loadingProjects && projects.length === 0 && (
            <div className="w-full py-20 text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
                No projects available in this category yet.
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                New showcase projects are published regularly. Please select another category or view all work.
              </p>
            </div>
          )}

          {/* ── Perfectly Balanced Responsive 2-Column Grid with Staggered Scroll Animations ── */}
          {projects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-8 w-full">
              {projects.map((project, index) => (
                <ScrollReveal
                  key={project.id || `${activeCategory}-${index}`}
                  direction="up"
                  intensity="subtle"
                  distance={28}
                  delay={(index % 2) * 110}
                  threshold={0.06}
                  duration={550}
                  className="w-full"
                >
                  <PortfolioCard
                    project={project}
                    index={index}
                    hoverEffectsEnabled={hoverEffectsEnabled}
                    imageZoomEnabled={imageZoomEnabled}
                    shouldLinkInner={shouldLinkInner}
                  />
                </ScrollReveal>
              ))}
            </div>
          )}

          {/* ── View All Portfolio Button (Home Page Showcase Callout) ── */}
          {(!isDedicatedPortfolioPage || p.showViewAllButton) && p.showViewAllButton !== false && (
            <div className="w-full flex justify-center pt-10 sm:pt-14">
              <ScrollReveal direction="up" intensity="subtle" delay={150}>
                <Link
                  href={p.viewAllButtonUrl || '/portfolio'}
                  className="group inline-flex items-center gap-3 px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold text-xs sm:text-sm shadow-xl hover:bg-[#d9287c] dark:hover:bg-[#d9287c] dark:hover:text-white hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  <span>{p.viewAllButtonLabel || 'View All Portfolio'}</span>
                  <div className="w-6 h-6 rounded-full bg-white/20 dark:bg-neutral-900/20 group-hover:bg-white/30 flex items-center justify-center transition-all duration-300">
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </Link>
              </ScrollReveal>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Individual Portfolio Card Component: Pixel-Perfect, Balanced Height & Alignment
// Elevated Hover & Animation Dynamics
// ─────────────────────────────────────────────────────────────────────────────
interface PortfolioCardProps {
  project: PortfolioProject;
  index: number;
  hoverEffectsEnabled?: boolean;
  imageZoomEnabled?: boolean;
  shouldLinkInner?: boolean;
}

function PortfolioCard({
  project,
  index,
  hoverEffectsEnabled = true,
  imageZoomEnabled = true,
  shouldLinkInner = true,
}: PortfolioCardProps) {
  const href = shouldLinkInner && project.slug
    ? `/portfolio/${project.slug}`
    : (project.projectUrl || (project.slug ? `/portfolio/${project.slug}` : '#'));
  const isExternal = !shouldLinkInner && (href.startsWith('http://') || href.startsWith('https://'));

  return (
    <Link
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="group relative block w-full h-[360px] sm:h-[420px] lg:h-[460px] rounded-[24px] overflow-hidden bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:shadow-[0_24px_50px_-10px_rgba(0,0,0,0.35)] hover:border-white/30"
      aria-label={`View project: ${project.title}`}
    >
      {/* ── Background Image Layer with Zoom on Hover ── */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <Image
          src={project.imageUrl}
          alt={project.altText || project.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 680px"
          quality={75}
          className={`object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            imageZoomEnabled && hoverEffectsEnabled ? 'group-hover:scale-108' : ''
          }`}
          priority={index < 2}
          loading={index < 2 ? undefined : 'lazy'}
        />
        {/* Multi-step Gradient Protection for Maximum Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/15 transition-opacity duration-500 group-hover:from-black/95 group-hover:via-black/55" />

        {/* Ambient Brand Interactive Radial Glow on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#d9287c]/25 via-transparent to-transparent pointer-events-none" />

        {/* Shimmer Light Reflection Sweep Across Card */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
      </div>

      {/* ── Top Bar: Category Badge & Arrow Button ── */}
      <div className="absolute top-4 sm:top-5 inset-x-4 sm:inset-x-5 z-20 flex items-center justify-between pointer-events-none">
        {project.category ? (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-semibold tracking-wider uppercase text-white shadow-xs transition-all duration-300 group-hover:bg-black/80 group-hover:border-white/40 group-hover:scale-105">
            {project.category}
          </span>
        ) : (
          <span />
        )}

        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-neutral-950 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-[#d9287c] group-hover:text-white group-hover:scale-110 group-hover:rotate-12 shadow-lg">
          <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>

      {/* ── Bottom Content: Metrics, Title, Tags, & Hover Callout ── */}
      <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 sm:pb-7 z-20 flex flex-col justify-end space-y-2.5 pointer-events-none transform transition-transform duration-300 ease-out group-hover:-translate-y-1">
        {/* Optional Performance Metric Badge */}
        {project.metrics && (
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 transition-transform duration-300 group-hover:scale-105">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span>{project.metrics}</span>
          </div>
        )}

        {/* Project Title (clamped to 2 lines for uniform visual alignment) */}
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white line-clamp-2 leading-snug drop-shadow-sm transition-colors duration-200">
          {project.title}
        </h3>

        {/* Tags & Explore Case Study pill */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {project.tags.slice(0, 3).map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/10 text-[11px] font-medium text-neutral-200 transition-colors duration-300 group-hover:bg-white/25 group-hover:border-white/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Sleek Floating Hover CTA */}
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out shrink-0">
            <span>Explore Case Study</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#d9287c]" />
          </span>
        </div>
      </div>
    </Link>
  );
}
