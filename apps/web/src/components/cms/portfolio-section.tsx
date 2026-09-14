'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';
import { PageSectionDto } from '@/lib/cms-types';
import { renderTitleWithHighlight } from '@/lib/render-title-highlight';

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

  // Display limit
  maxDisplayCount?: number;

  // Hover settings
  hoverEffectsEnabled?: boolean;
  viewButtonEnabled?: boolean;
  viewButtonLabel?: string;
  viewButtonPosition?: 'center' | 'bottom-center' | 'bottom-right';
  overlayEnabled?: boolean;
  backdropBlurEnabled?: boolean;
  imageZoomEnabled?: boolean;

  // 3D Animation settings
  threeDScrollEnabled?: boolean;
  threeDIntensity?: 'subtle' | 'premium';
  mouseParallaxEnabled?: boolean;

  projects?: PortfolioProject[];
}

export interface PortfolioSectionProps {
  section: PageSectionDto;
  activeCategory?: string;
  onCategoryChange?: (slug: string) => void;
  categories?: PortfolioCategoryFilterItem[];
  overrideProjects?: PortfolioProject[];
}

export function PortfolioSection({
  section,
  activeCategory: activeCategoryProp,
  onCategoryChange,
  categories: categoriesProp,
  overrideProjects,
}: PortfolioSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const p = (section.contentPayload as PortfolioPayload) || {};

  const eyebrow = p.eyebrow;
  const title = p.title || '';
  const titleHighlight = p.titleHighlight || 'Our Work';
  const description = p.description || '';

  const showCategoryFilter = p.showCategoryFilter ?? false;
  const filterCategories = categoriesProp || p.categories || [];

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

  const hoverEffectsEnabled = p.hoverEffectsEnabled !== false;
  const viewButtonEnabled = p.viewButtonEnabled !== false;
  const viewButtonLabel = p.viewButtonLabel || 'View';
  const overlayEnabled = p.overlayEnabled !== false;
  const backdropBlurEnabled = p.backdropBlurEnabled !== false;
  const imageZoomEnabled = p.imageZoomEnabled !== false;

  const threeDScrollEnabled = p.threeDScrollEnabled !== false;
  const threeDIntensity = p.threeDIntensity || 'premium';
  const mouseParallaxEnabled = p.mouseParallaxEnabled !== false;

  // Source projects
  const sourceProjects: PortfolioProject[] = overrideProjects || (Array.isArray(p.projects) ? p.projects : []);
  const validProjects = sourceProjects.filter((pr) => pr && pr.title);

  // Filter projects by category
  const filteredProjects = React.useMemo(() => {
    if (!activeCategory || activeCategory === 'all') {
      return validProjects;
    }
    return validProjects.filter((pr) => {
      const prSlug = pr.categorySlug || pr.category?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return prSlug === activeCategory;
    });
  }, [validProjects, activeCategory]);

  const maxDisplayCount =
    typeof p.maxDisplayCount === 'number' && p.maxDisplayCount > 0
      ? p.maxDisplayCount
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

  // ── Mobile Slider Controls ────────────────────────────────────────────────
  const mobileSliderRef = React.useRef<HTMLDivElement>(null);
  const [activeMobileSlide, setActiveMobileSlide] = React.useState<number>(0);

  // Reset mobile slide index on category switch
  React.useEffect(() => {
    setActiveMobileSlide(0);
    if (mobileSliderRef.current) {
      mobileSliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [activeCategory]);

  const handleMobileSliderScroll = () => {
    if (!mobileSliderRef.current) return;
    const el = mobileSliderRef.current;
    const slideWidth = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth + 12
      : el.clientWidth;
    const currentIdx = Math.round(el.scrollLeft / slideWidth);
    setActiveMobileSlide(Math.max(0, Math.min(projects.length - 1, currentIdx)));
  };

  const scrollToMobileSlide = (index: number) => {
    if (!mobileSliderRef.current) return;
    const el = mobileSliderRef.current;
    const target = el.children[index] as HTMLElement | undefined;
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    } else {
      const slideWidth = el.firstElementChild
        ? (el.firstElementChild as HTMLElement).offsetWidth + 12
        : el.clientWidth;
      el.scrollTo({ left: index * slideWidth, behavior: 'smooth' });
    }
    setActiveMobileSlide(index);
  };

  const scrollMobilePrev = () => {
    scrollToMobileSlide(Math.max(0, activeMobileSlide - 1));
  };

  const scrollMobileNext = () => {
    scrollToMobileSlide(Math.min(projects.length - 1, activeMobileSlide + 1));
  };

  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState<boolean>(false);
  const [isDesktop, setIsDesktop] = React.useState<boolean>(true);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleMotionChange);

    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop, { passive: true });

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      window.removeEventListener('resize', checkDesktop);
    };
  }, []);

  return (
    <section className="relative w-full py-12 sm:py-16 lg:py-20 bg-background overflow-hidden">
      <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-8 sm:mb-12">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#d9287c] uppercase">
              <span className="inline-block w-2 h-2 rounded-full bg-[#d9287c]" />
              <span>{eyebrow}</span>
            </div>
          )}

          <h2 className="text-3xl sm:text-4xl lg:text-[46px] xl:text-[50px] font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.12]">
            <span>{renderTitleWithHighlight(title, titleHighlight)}</span>
          </h2>

          {description && (
            <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-2xl mx-auto pt-0.5">
              {description}
            </p>
          )}

          {/* ── Dynamic Category Filter Bar (Rules 5, 12, 17, 21, 55) ── */}
          {showCategoryFilter && (
            <div className="pt-4 sm:pt-6 w-full">
              {/* Mobile: Horizontal scroll only container (page overflow prevented) */}
              {/* Tablet & Desktop: Centered wrapped pill list */}
              <div
                className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 md:mx-0 md:px-0 py-1 flex-nowrap md:flex-wrap"
                role="tablist"
                aria-label="Filter portfolio by category"
              >
                {/* Virtual 'All' Filter Pill (Rule 21: not in DB) */}
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === 'all'}
                  onClick={() => handleCategorySelect('all')}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 select-none ${
                    activeCategory === 'all'
                      ? 'bg-[#d9287c] text-white shadow-md shadow-[#d9287c]/25 ring-2 ring-[#d9287c]/20'
                      : 'bg-neutral-100 dark:bg-neutral-800/90 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700/90 border border-neutral-200/60 dark:border-neutral-700/60'
                  }`}
                >
                  All
                </button>

                {/* Dynamic Category Pills */}
                {filterCategories.map((cat) => {
                  const isSelected = activeCategory === cat.slug;
                  return (
                    <button
                      key={cat.id || cat.slug}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => handleCategorySelect(cat.slug)}
                      className={`shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 select-none ${
                        isSelected
                          ? 'bg-[#d9287c] text-white shadow-md shadow-[#d9287c]/25 ring-2 ring-[#d9287c]/20'
                          : 'bg-neutral-100 dark:bg-neutral-800/90 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700/90 border border-neutral-200/60 dark:border-neutral-700/60'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Empty Category State (Rule 30) ── */}
        {projects.length === 0 && (
          <div className="w-full py-16 text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
              No projects available in this category yet.
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              New enterprise showcase projects are published regularly. Please select another category or view all work.
            </p>
          </div>
        )}

        {/* ── Mobile Layout: Touch-Swipeable Project Slider (< 1024px) ── */}
        {projects.length > 0 && (
          <div className="block lg:hidden space-y-4 transition-opacity duration-300">
            <div
              ref={mobileSliderRef}
              onScroll={handleMobileSliderScroll}
              className="flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden gap-3 -mx-4 px-4 pb-2 pt-1 scroll-smooth"
            >
              {projects.map((project, idx) => (
                <div
                  key={project.id || idx}
                  className="w-[86vw] sm:w-[75vw] max-w-[420px] shrink-0 snap-center"
                >
                  <Link
                    href={project.projectUrl || '#'}
                    className="group relative block w-full h-[360px] sm:h-[400px] rounded-[22px] overflow-hidden bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/80 shadow-md active:scale-[0.99] transition-transform"
                    aria-label={`View project: ${project.title}`}
                  >
                    {/* Project Image */}
                    <div className="absolute inset-0 w-full h-full overflow-hidden">
                      <Image
                        src={project.imageUrl}
                        alt={project.altText || project.title}
                        fill
                        sizes="(max-width: 640px) 86vw, 420px"
                        className="object-cover"
                        priority={idx === 0}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    </div>

                    {/* View Button (⚪ View) */}
                    {viewButtonEnabled && (
                      <div className="absolute top-4 right-4 z-20 pointer-events-none">
                        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/55 text-white text-xs font-medium backdrop-blur-md border border-white/20 shadow-lg">
                          <span className="w-1.5 h-1.5 rounded-full bg-white inline-block shadow-xs" />
                          <span>{viewButtonLabel}</span>
                        </div>
                      </div>
                    )}

                    {/* Project Name & Category Tag at Bottom */}
                    <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 z-10 pointer-events-none flex flex-col justify-end space-y-1">
                      {project.category && (
                        <div className="text-[11px] font-medium tracking-wide uppercase text-neutral-300/90">
                          {project.category}
                        </div>
                      )}
                      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-md">
                        {project.title}
                      </h3>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Mobile Slider Controls: Prev/Next Buttons + Dot Pagination */}
            <div className="flex items-center justify-between pt-1 px-1">
              {/* Dots indicator */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-[65%] [scrollbar-width:none]">
                {projects.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => scrollToMobileSlide(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeMobileSlide === i
                        ? 'w-6 bg-[#d9287c]'
                        : 'w-2 bg-neutral-300 dark:bg-neutral-700'
                    }`}
                    aria-label={`Go to project ${i + 1}`}
                  />
                ))}
              </div>

              {/* Arrow Navigation */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={scrollMobilePrev}
                  disabled={activeMobileSlide === 0}
                  className="w-9 h-9 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center justify-center shadow-xs disabled:opacity-30 disabled:pointer-events-none transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  aria-label="Previous project"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={scrollMobileNext}
                  disabled={activeMobileSlide === projects.length - 1}
                  className="w-9 h-9 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center justify-center shadow-xs disabled:opacity-30 disabled:pointer-events-none transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  aria-label="Next project"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Desktop Layout: Compact 2 -> 1 -> 2 Portfolio Grid Container (>= 1024px) ── */}
        {projects.length > 0 && (
          <div
            className="hidden lg:grid lg:grid-cols-12 gap-3 sm:gap-4 md:gap-5 w-full transition-opacity duration-300"
            style={{
              perspective: threeDScrollEnabled && isDesktop && !prefersReducedMotion ? '1200px' : 'none',
            }}
          >
            {projects.map((project, index) => {
              const isFullWidth = index % 5 === 2;
              const isLeftCard = index % 5 === 0 || index % 5 === 3;
              const isRightCard = index % 5 === 1 || index % 5 === 4;

              const colSpanClass = isFullWidth
                ? 'lg:col-span-12'
                : 'lg:col-span-6';

              return (
                <PortfolioCard
                  key={project.id || index}
                  project={project}
                  index={index}
                  isFullWidth={isFullWidth}
                  isLeftCard={isLeftCard}
                  isRightCard={isRightCard}
                  colSpanClass={colSpanClass}
                  hoverEffectsEnabled={hoverEffectsEnabled}
                  viewButtonEnabled={viewButtonEnabled}
                  viewButtonLabel={viewButtonLabel}
                  overlayEnabled={overlayEnabled}
                  backdropBlurEnabled={backdropBlurEnabled}
                  imageZoomEnabled={imageZoomEnabled}
                  threeDScrollEnabled={threeDScrollEnabled}
                  threeDIntensity={threeDIntensity}
                  mouseParallaxEnabled={mouseParallaxEnabled}
                  prefersReducedMotion={prefersReducedMotion}
                  isDesktop={isDesktop}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Individual Portfolio Card Component with Cursor-Following "View" Button
// ─────────────────────────────────────────────────────────────────────────────
interface PortfolioCardProps {
  project: PortfolioProject;
  index: number;
  isFullWidth: boolean;
  isLeftCard: boolean;
  isRightCard: boolean;
  colSpanClass: string;
  hoverEffectsEnabled: boolean;
  viewButtonEnabled: boolean;
  viewButtonLabel: string;
  overlayEnabled: boolean;
  backdropBlurEnabled: boolean;
  imageZoomEnabled: boolean;
  threeDScrollEnabled: boolean;
  threeDIntensity: 'subtle' | 'premium';
  mouseParallaxEnabled: boolean;
  prefersReducedMotion: boolean;
  isDesktop: boolean;
}

function PortfolioCard({
  project,
  index,
  isFullWidth,
  isLeftCard,
  isRightCard,
  colSpanClass,
  hoverEffectsEnabled,
  viewButtonEnabled,
  viewButtonLabel,
  overlayEnabled,
  backdropBlurEnabled,
  imageZoomEnabled,
  threeDScrollEnabled,
  threeDIntensity,
  mouseParallaxEnabled,
  prefersReducedMotion,
  isDesktop,
}: PortfolioCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);

  // Custom Cursor Following State
  const [isHovered, setIsHovered] = React.useState(false);
  const [cursorPos, setCursorPos] = React.useState({ x: 0, y: 0 });

  // Scroll 3D Transform State
  const [scrollTransform, setScrollTransform] = React.useState({
    rotateX: 0,
    rotateY: 0,
    translateY: 0,
    scale: 1,
    opacity: 1,
  });

  // Mouse Parallax State (Desktop only)
  const [mouseOffset, setMouseOffset] = React.useState({ x: 0, y: 0, tiltX: 0, tiltY: 0 });

  // 3D Scroll Depth Physics calculation
  React.useEffect(() => {
    if (!threeDScrollEnabled || !isDesktop || prefersReducedMotion || !cardRef.current) {
      setScrollTransform({ rotateX: 0, rotateY: 0, translateY: 0, scale: 1, opacity: 1 });
      return;
    }

    const cardEl = cardRef.current;
    let ticking = false;

    // Multipliers according to intensity preset
    const maxRotX = threeDIntensity === 'premium' ? 6 : 3.5;
    const maxRotY = threeDIntensity === 'premium' ? 3 : 1.5;

    // Lateral directional bias based on card column placement
    const lateralBias = isLeftCard ? -1 : isRightCard ? 1 : 0;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!cardEl) {
            ticking = false;
            return;
          }

          const rect = cardEl.getBoundingClientRect();
          const windowHeight = window.innerHeight;

          // Card center relative to viewport center (-1 to +1)
          const cardCenter = rect.top + rect.height / 2;
          const viewportCenter = windowHeight / 2;
          const delta = (cardCenter - viewportCenter) / (windowHeight / 2);
          const clampedDelta = Math.max(-1.5, Math.min(1.5, delta));

          const rotX = clampedDelta * maxRotX;
          const rotY = lateralBias * maxRotY * (1 - Math.abs(clampedDelta) * 0.3);
          const translateY = clampedDelta > 0 ? clampedDelta * 14 : 0;
          const scale = 1 - Math.min(0.03, Math.abs(clampedDelta) * 0.02);
          const opacity = Math.min(1, Math.max(0.88, 1 - Math.abs(clampedDelta) * 0.12));

          setScrollTransform({
            rotateX: rotX,
            rotateY: rotY,
            translateY,
            scale,
            opacity,
          });

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threeDScrollEnabled, threeDIntensity, isDesktop, prefersReducedMotion, isLeftCard, isRightCard]);

  // Desktop Mouse Move & Cursor Tracker
  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setIsHovered(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;

    // Update cursor button position
    setCursorPos({ x: relX, y: relY });

    // Update micro parallax
    if (mouseParallaxEnabled && isDesktop && !prefersReducedMotion) {
      const normX = relX / rect.width - 0.5; // -0.5 to 0.5
      const normY = relY / rect.height - 0.5;
      setMouseOffset({
        x: normX * 6,
        y: normY * 6,
        tiltX: -normY * 2.5,
        tiltY: normX * 2.5,
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMouseOffset({ x: 0, y: 0, tiltX: 0, tiltY: 0 });
  };

  const cardHeightClass = isFullWidth
    ? 'h-[340px] sm:h-[420px] lg:h-[460px]'
    : 'h-[320px] sm:h-[380px] lg:h-[430px]';

  return (
    <div
      ref={cardRef}
      className={`${colSpanClass} relative`}
      style={{
        transformStyle: 'preserve-3d',
        transform:
          threeDScrollEnabled && isDesktop && !prefersReducedMotion
            ? `rotateX(${scrollTransform.rotateX + mouseOffset.tiltX}deg) rotateY(${
                scrollTransform.rotateY + mouseOffset.tiltY
              }deg) translateY(${scrollTransform.translateY}px) scale(${scrollTransform.scale})`
            : undefined,
        opacity: prefersReducedMotion ? 1 : scrollTransform.opacity,
        transition: mouseOffset.tiltX === 0 ? 'transform 0.4s ease-out, opacity 0.4s ease-out' : 'none',
      }}
    >
      <Link
        href={project.projectUrl || '#'}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`group block relative w-full ${cardHeightClass} rounded-[20px] sm:rounded-[24px] overflow-hidden bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/80 shadow-xs hover:shadow-xl transition-[shadow,border-color] duration-300 ${
          isDesktop ? 'cursor-none' : 'cursor-pointer'
        }`}
        aria-label={`View project: ${project.title}`}
      >
        {/* ── Layer 1: Image Layer ────────────────────────────────────── */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <Image
            src={project.imageUrl}
            alt={project.altText || project.title}
            fill
            sizes={isFullWidth ? '100vw' : '(max-width: 1024px) 100vw, 50vw'}
            className={`object-cover transition-transform duration-700 ease-out ${
              imageZoomEnabled && hoverEffectsEnabled && !prefersReducedMotion
                ? 'group-hover:scale-105'
                : ''
            }`}
            style={{
              transform:
                mouseParallaxEnabled && isDesktop && !prefersReducedMotion
                  ? `translate(${mouseOffset.x}px, ${mouseOffset.y}px)`
                  : undefined,
            }}
            priority={index === 0}
          />
          {/* Base gradient at bottom for clean typography readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent transition-opacity duration-300" />
        </div>

        {/* ── Layer 2: Hover Backdrop Glass Overlay ──────────────────── */}
        {overlayEnabled && hoverEffectsEnabled && (
          <div
            className={`absolute inset-0 bg-black/25 dark:bg-black/40 transition-opacity duration-300 pointer-events-none opacity-0 group-hover:opacity-100 ${
              backdropBlurEnabled ? 'backdrop-blur-[4px]' : ''
            }`}
          />
        )}

        {/* ── Layer 3: Custom Floating Cursor "⚪ View" Button ────────── */}
        {viewButtonEnabled && isDesktop && (
          <div
            className="pointer-events-none absolute z-30 top-0 left-0"
            style={{
              transform: `translate3d(${cursorPos.x}px, ${cursorPos.y}px, 0) translate(-50%, -50%) scale(${
                isHovered ? 1 : 0.4
              })`,
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.05s linear',
            }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 sm:px-4.5 sm:py-2 rounded-full bg-neutral-900/65 dark:bg-black/70 text-white text-xs sm:text-sm font-medium tracking-wide shadow-2xl border border-white/20 backdrop-blur-md whitespace-nowrap select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-white inline-block shadow-xs" />
              <span>{viewButtonLabel}</span>
            </div>
          </div>
        )}

        {/* Mobile static pill fallback when on touch devices */}
        {viewButtonEnabled && !isDesktop && (
          <div className="absolute top-4 right-4 z-20 pointer-events-none">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 text-white text-[11px] font-medium backdrop-blur-md border border-white/15">
              <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
              <span>{viewButtonLabel}</span>
            </div>
          </div>
        )}

        {/* ── Layer 4: Project Category & Title at Bottom ──────────────── */}
        <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 z-10 pointer-events-none flex flex-col justify-end space-y-1">
          {project.category && (
            <div className="text-[11px] sm:text-xs font-semibold tracking-wide uppercase text-neutral-300 drop-shadow-sm">
              {project.category}
            </div>
          )}
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-white drop-shadow-md transition-transform duration-300 group-hover:translate-x-1">
            {project.title}
          </h3>
        </div>
      </Link>
    </div>
  );
}
