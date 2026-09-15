'use client';

import * as React from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { PageSectionDto } from '@/lib/cms-types';
import { renderTitleWithHighlight } from '@/lib/render-title-highlight';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScrollReveal } from '@/components/motion';

interface ProcessStep {
  id?: string;
  stepNumber?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  altText?: string;
  ctaText?: string;
  ctaUrl?: string;
}

interface DeliveryProcessSectionProps {
  section: PageSectionDto;
}

export function DeliveryProcessSection({ section }: DeliveryProcessSectionProps) {
  const p = (section.contentPayload as Record<string, any>) || {};

  const eyebrow = p.eyebrow;
  const title = p.title || '';
  const titleHighlight = p.titleHighlight || 'Process';
  const description = p.description || '';
  const stickyScrollEnabled = p.stickyScrollEnabled !== false;

  const rawSteps: ProcessStep[] = Array.isArray(p.steps) ? p.steps : [];
  const steps = rawSteps.filter((s) => s && s.title);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const cardsContainerRef = React.useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = React.useState<number>(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState<boolean>(false);
  const [isDesktop, setIsDesktop] = React.useState<boolean>(true);

  // ── Mobile Slider Controls ────────────────────────────────────────────────
  const mobileSliderRef = React.useRef<HTMLDivElement>(null);
  const [activeMobileSlide, setActiveMobileSlide] = React.useState<number>(0);

  const handleMobileSliderScroll = () => {
    if (!mobileSliderRef.current) return;
    const el = mobileSliderRef.current;
    const slideWidth = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth + 16
      : el.clientWidth;
    const currentIdx = Math.round(el.scrollLeft / slideWidth);
    setActiveMobileSlide(Math.max(0, Math.min(steps.length - 1, currentIdx)));
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
        ? (el.firstElementChild as HTMLElement).offsetWidth + 16
        : el.clientWidth;
      el.scrollTo({ left: index * slideWidth, behavior: 'smooth' });
    }
    setActiveMobileSlide(index);
  };

  const scrollMobilePrev = () => {
    scrollToMobileSlide(Math.max(0, activeMobileSlide - 1));
  };

  const scrollMobileNext = () => {
    scrollToMobileSlide(Math.min(steps.length - 1, activeMobileSlide + 1));
  };

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

  // GSAP Smooth Width Accordion Animation for Active vs Inactive Cards
  React.useEffect(() => {
    if (!isDesktop || prefersReducedMotion || !cardsContainerRef.current) return;
    const cardElements = cardsContainerRef.current.children;
    if (!cardElements || cardElements.length === 0) return;

    Array.from(cardElements).forEach((el, idx) => {
      const isActive = idx === activeStep;
      gsap.to(el, {
        flexGrow: isActive ? 2.4 : 0.85,
        duration: 0.75,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    });
  }, [activeStep, isDesktop, prefersReducedMotion]);

  // Scroll Tracking & Step Progress
  React.useEffect(() => {
    if (!stickyScrollEnabled || prefersReducedMotion || !isDesktop || steps.length <= 1) {
      return;
    }

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!containerRef.current) {
            ticking = false;
            return;
          }

          const rect = containerRef.current.getBoundingClientRect();
          const totalScrollDistance = rect.height - window.innerHeight;

          if (totalScrollDistance <= 0) {
            ticking = false;
            return;
          }

          const currentScrolled = -rect.top;
          const progress = Math.min(Math.max(currentScrolled / totalScrollDistance, 0), 1);

          // Calculate active step
          const rawIndex = Math.floor(progress * steps.length);
          const stepIndex = Math.min(Math.max(rawIndex, 0), steps.length - 1);
          setActiveStep(stepIndex);

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
  }, [stickyScrollEnabled, prefersReducedMotion, isDesktop, steps.length]);

  if (!steps || steps.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="p-4 border border-dashed border-amber-500/50 bg-amber-500/10 rounded-lg text-xs font-mono text-amber-500">
            [DeliveryProcessSection] No process steps configured in CMS payload.
          </div>
        </div>
      );
    }
    return null;
  }

  // Handle clicking on a card to smoothly jump to that step
  const handleCardClick = (stepIndex: number) => {
    if (!isDesktop || !containerRef.current || steps.length <= 1) {
      setActiveStep(stepIndex);
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const totalScrollDistance = rect.height - window.innerHeight;
    const targetOffset = scrollTop + rect.top + (stepIndex / (steps.length - 1)) * totalScrollDistance + 2;
    window.scrollTo({ top: targetOffset, behavior: 'smooth' });
  };

  // Use sticky scroll track height on desktop via Tailwind responsive classes
  const trackHeightClass =
    stickyScrollEnabled && !prefersReducedMotion
      ? steps.length >= 4
        ? 'lg:h-[180vh] h-auto'
        : steps.length === 3
        ? 'lg:h-[150vh] h-auto'
        : 'lg:h-[120vh] h-auto'
      : 'h-auto';

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${trackHeightClass}`}
    >
      <div
        className={`${
          stickyScrollEnabled && !prefersReducedMotion
            ? 'lg:sticky lg:top-12 xl:top-16 relative py-8 sm:py-10 md:py-12'
            : 'relative py-8 sm:py-10 md:py-12'
        } flex flex-col justify-center`}
      >
        <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8">
          {/* Section Header */}
          <ScrollReveal direction="up">
            <div className="text-center max-w-3xl mx-auto space-y-3.5 mb-8 sm:mb-10">
              {eyebrow && (
                <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#d9287c] uppercase">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#d9287c]" />
                  <span>{eyebrow}</span>
                </div>
              )}

              <h2 className="text-3xl sm:text-4xl lg:text-[50px] xl:text-[54px] font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.12] whitespace-pre-line">
                <span className="block">{renderTitleWithHighlight(title, titleHighlight)}</span>
              </h2>

              {description && (
                <p className="text-sm sm:text-base lg:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-2xl mx-auto pt-0.5">
                  {description}
                </p>
              )}
            </div>
          </ScrollReveal>

          {/* Cards Flex Container */}
          <div className="w-full">
            {/* Desktop: GSAP Smooth Expanding Width Accordion (>= 1024px) */}
            <div
              ref={cardsContainerRef}
              className="hidden lg:flex flex-row gap-5 items-stretch h-[460px] lg:h-[480px] w-full"
            >
                {steps.map((step, idx) => {
                  const isActive = idx === activeStep;
                  const stepNumberFormatted =
                    step.stepNumber || `.${String(idx + 1).padStart(2, '0')}`;

                  return (
                    <div
                      key={step.id || idx}
                      onClick={() => handleCardClick(idx)}
                      role="button"
                      tabIndex={0}
                      aria-current={isActive ? 'step' : undefined}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleCardClick(idx);
                        }
                      }}
                      style={{
                        flexGrow: isActive ? 2.4 : 0.85,
                        flexShrink: 1,
                        flexBasis: '0%',
                        minWidth: 0,
                      }}
                      className={`group relative rounded-[30px] p-6 lg:p-7 cursor-pointer h-full flex flex-col justify-between overflow-hidden select-none transition-[background-color,border-color,box-shadow] duration-500 ${
                        isActive
                          ? 'bg-white dark:bg-card text-card-foreground shadow-[0_16px_45px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_16px_45px_-12px_rgba(0,0,0,0.45)] border border-neutral-300/80 dark:border-primary/40'
                          : 'bg-white dark:bg-card text-muted-foreground hover:border-neutral-300 dark:hover:border-border/90 border border-neutral-200/90 dark:border-border/80'
                      }`}
                    >
                      {/* Card Top Section: Title & Description */}
                      <div className="flex flex-col min-w-0">
                        <h3
                          className={`text-lg sm:text-xl lg:text-2xl font-bold tracking-tight transition-colors duration-300 ${
                            isActive ? 'text-neutral-900 dark:text-white' : 'text-neutral-900 dark:text-neutral-100'
                          }`}
                        >
                          {step.title}
                        </h3>

                        {/* Description smoothly fades without pushing card height */}
                        <div
                          className={`transition-all duration-500 ease-out ${
                            isActive
                              ? 'opacity-100 mt-3 mb-2 max-h-24 overflow-hidden pointer-events-auto'
                              : 'opacity-0 max-h-0 pointer-events-none overflow-hidden m-0'
                          }`}
                        >
                          <p className="text-[13px] lg:text-[14px] leading-relaxed text-neutral-600 dark:text-neutral-300 line-clamp-3">
                            {step.description}
                          </p>
                          {step.ctaText && (
                            <a
                              href={step.ctaUrl || '#'}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mt-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span>{step.ctaText}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Card Bottom: Dedicated Constant-Height Zone (h-52 sm:h-56 lg:h-60) */}
                      <div className="relative w-full h-52 sm:h-56 lg:h-60 mt-auto shrink-0">
                        {/* Active Image: absolutely positioned inside bottom zone */}
                        <div
                          className={`absolute inset-0 rounded-2xl overflow-hidden transition-all duration-500 ease-out ${
                            isActive
                              ? 'opacity-100 scale-100 pointer-events-auto shadow-md'
                              : 'opacity-0 scale-95 pointer-events-none'
                          }`}
                        >
                          {step.imageUrl ? (
                            <div className="relative w-full h-full">
                              <Image
                                src={step.imageUrl}
                                alt={step.altText || step.title}
                                fill
                                sizes="(max-width: 1280px) 40vw, 480px"
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                priority={idx === 0}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                              <span className="absolute bottom-2.5 right-3.5 text-5xl sm:text-6xl font-extrabold tracking-tighter text-white font-sans drop-shadow-lg select-none">
                                {stepNumberFormatted}
                              </span>
                            </div>
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-end p-4">
                              <span className="text-5xl sm:text-6xl font-extrabold tracking-tighter text-foreground font-sans">
                                {stepNumberFormatted}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Inactive Bottom: Display Large Number directly anchored at bottom left */}
                        <div
                          className={`absolute inset-0 flex items-end justify-start transition-opacity duration-500 ease-out ${
                            !isActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                          }`}
                        >
                          <span className="text-6xl sm:text-7xl font-extrabold tracking-tighter font-sans select-none text-neutral-900 dark:text-neutral-100 leading-none">
                            {stepNumberFormatted}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Mobile / Tablet Responsive Layout: Touch-Swipeable Slider with Dots & Arrows (< 1024px) */}
            <div className="block lg:hidden space-y-4">
                <div
                  ref={mobileSliderRef}
                  onScroll={handleMobileSliderScroll}
                  className="flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden gap-4 -mx-4 px-4 pb-2 pt-1 scroll-smooth"
                >
                  {steps.map((step, idx) => {
                    const stepNumberFormatted =
                      step.stepNumber || `.${String(idx + 1).padStart(2, '0')}`;

                    return (
                      <div
                        key={step.id || idx}
                        className="w-[85vw] max-w-[340px] shrink-0 snap-center bg-white dark:bg-card text-neutral-900 dark:text-white rounded-[24px] p-5 sm:p-6 border border-neutral-200/80 dark:border-border shadow-sm flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-4 mb-2.5">
                            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                              {step.title}
                            </h3>
                            <span className="text-2xl sm:text-3xl font-extrabold tracking-tighter text-[#d9127b] font-sans">
                              {stepNumberFormatted}
                            </span>
                          </div>
                          {step.description && (
                            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-3 line-clamp-3">
                              {step.description}
                            </p>
                          )}
                          {step.ctaText && (
                            <a
                              href={step.ctaUrl || '#'}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#d9127b] hover:underline mb-2"
                            >
                              <span>{step.ctaText}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>

                        {step.imageUrl && (
                          <div className="relative w-full h-44 rounded-2xl overflow-hidden mt-3 shadow-xs">
                            <Image
                              src={step.imageUrl}
                              alt={step.altText || step.title}
                              fill
                              sizes="85vw"
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <span className="absolute bottom-2.5 right-3.5 text-3xl font-extrabold tracking-tighter text-white/95 font-sans drop-shadow-md">
                              {stepNumberFormatted}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Mobile Slider Controls: Prev/Next Buttons + Dot Pagination */}
                <div className="flex items-center justify-between pt-1 px-1">
                  {/* Dots indicator */}
                  <div className="flex items-center gap-1.5">
                    {steps.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => scrollToMobileSlide(i)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          activeMobileSlide === i
                            ? 'w-6 bg-[#d9287c]'
                            : 'w-2 bg-neutral-300 dark:bg-neutral-700'
                        }`}
                        aria-label={`Go to methodology step ${i + 1}`}
                      />
                    ))}
                  </div>

                  {/* Arrow Navigation */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={scrollMobilePrev}
                      disabled={activeMobileSlide === 0}
                      className="w-9 h-9 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center justify-center shadow-xs disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      aria-label="Previous methodology step"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={scrollMobileNext}
                      disabled={activeMobileSlide >= steps.length - 1}
                      className="w-9 h-9 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center justify-center shadow-xs disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      aria-label="Next methodology step"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
