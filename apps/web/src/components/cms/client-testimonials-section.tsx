'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PageSectionDto, ClientTestimonialsPayload, VideoTestimonialDto, TextTestimonialDto } from '@/lib/cms-types';
import { renderTitleWithHighlight } from '@/lib/render-title-highlight';
import { Play, Star, X, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

interface ClientTestimonialsSectionProps {
  section: PageSectionDto;
}

export function ClientTestimonialsSection({ section }: ClientTestimonialsSectionProps) {
  const p = (section.contentPayload as ClientTestimonialsPayload) || {};

  const eyebrow = p.eyebrow;
  const title = p.title || '';
  const titleHighlight = p.titleHighlight;
  const description = p.description || '';
  const ratingSummary = p.ratingSummary;
  const bottomTrustBar = p.bottomTrustBar;
  const autoplayVideos = p.autoplayVideos !== false;

  const rawVideos: VideoTestimonialDto[] = Array.isArray(p.videoTestimonials) ? p.videoTestimonials : [];
  const videos = rawVideos
    .filter((v) => v && v.isActive !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const rawTestimonials: TextTestimonialDto[] = Array.isArray(p.textTestimonials) ? p.textTestimonials : [];
  const testimonials = rawTestimonials
    .filter((t) => t && t.isActive !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Separate featured testimonial from regular grid testimonials
  const featuredTestimonial = testimonials.find((t) => t.isFeatured) || testimonials[0];
  const gridTestimonials = featuredTestimonial
    ? testimonials.filter((t) => t.id !== featuredTestimonial.id)
    : testimonials;

  // State to expand more reviews (reference layout shows 1 featured + 12 grid cards = 13 total)
  const [showAllReviews, setShowAllReviews] = React.useState(false);
  const baseGridCount = 12;
  const displayedGridTestimonials = showAllReviews
    ? gridTestimonials
    : gridTestimonials.slice(0, baseGridCount);
  const remainingReviewsCount = Math.max(0, gridTestimonials.length - baseGridCount);
  const reviewPlural = remainingReviewsCount === 1 ? 'review' : 'reviews';

  // Mobile combined list (featured first, then grid reviews)
  const allMobileTestimonials = featuredTestimonial
    ? [featuredTestimonial, ...gridTestimonials]
    : testimonials;
  const displayedMobileTestimonials = showAllReviews
    ? allMobileTestimonials
    : allMobileTestimonials.slice(0, baseGridCount + 1);

  // Video modal state
  const [activeVideo, setActiveVideo] = React.useState<VideoTestimonialDto | null>(null);

  // Expanded text testimonials state ("Read more")
  const [expandedIds, setExpandedIds] = React.useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ── Mobile Video Slider Controls ──────────────────────────────────────────
  const videoSliderRef = React.useRef<HTMLDivElement>(null);
  const [activeVideoSlide, setActiveVideoSlide] = React.useState(0);

  const handleVideoScroll = () => {
    if (!videoSliderRef.current) return;
    const el = videoSliderRef.current;
    const slideWidth = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth + 16
      : el.clientWidth;
    const currentIdx = Math.round(el.scrollLeft / slideWidth);
    setActiveVideoSlide(Math.max(0, Math.min(videos.length - 1, currentIdx)));
  };

  const scrollVideoTo = (index: number) => {
    if (!videoSliderRef.current) return;
    const el = videoSliderRef.current;
    const slideWidth = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth + 16
      : el.clientWidth;
    el.scrollTo({ left: index * slideWidth, behavior: 'smooth' });
    setActiveVideoSlide(index);
  };

  const scrollVideoPrev = () => {
    scrollVideoTo(Math.max(0, activeVideoSlide - 1));
  };

  const scrollVideoNext = () => {
    scrollVideoTo(Math.min(videos.length - 1, activeVideoSlide + 1));
  };

  // ── Mobile Text Reviews Slider Controls ────────────────────────────────────
  const textSliderRef = React.useRef<HTMLDivElement>(null);
  const [activeTextSlide, setActiveTextSlide] = React.useState(0);

  const handleTextScroll = () => {
    if (!textSliderRef.current) return;
    const el = textSliderRef.current;
    const slideWidth = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth + 16
      : el.clientWidth;
    const currentIdx = Math.round(el.scrollLeft / slideWidth);
    setActiveTextSlide(Math.max(0, Math.min(displayedMobileTestimonials.length - 1, currentIdx)));
  };

  const scrollTextTo = (index: number) => {
    if (!textSliderRef.current) return;
    const el = textSliderRef.current;
    const slideWidth = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth + 16
      : el.clientWidth;
    el.scrollTo({ left: index * slideWidth, behavior: 'smooth' });
    setActiveTextSlide(index);
  };

  const scrollTextPrev = () => {
    scrollTextTo(Math.max(0, activeTextSlide - 1));
  };

  const scrollTextNext = () => {
    scrollTextTo(Math.min(displayedMobileTestimonials.length - 1, activeTextSlide + 1));
  };

  // Keyboard close for modal (ESC)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveVideo(null);
      }
    };
    if (activeVideo) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeVideo]);

  return (
    <section
      id={section.sectionIdentifier || 'client-testimonials'}
      aria-labelledby={`heading-${section.id}`}
      className="w-full py-8 sm:py-10 md:py-12 transition-colors"
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8 space-y-8 sm:space-y-10">
        {/* ── SECTION HEADER & RATING SUMMARY ─────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          {/* Left Column: Eyebrow, Main Headline & Description */}
          <div className="max-w-3xl space-y-3.5 text-left">
            {eyebrow && (
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#d9287c] uppercase">
                <span className="inline-block w-2 h-2 rounded-full bg-[#d9287c]" />
                <span>{eyebrow}</span>
              </div>
            )}

            <h2
              id={`heading-${section.id}`}
              className="text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.12] whitespace-pre-line"
            >
              {renderTitleWithHighlight(title, titleHighlight)}
            </h2>

            {description && (
              <p className="text-base sm:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-2xl pt-0.5">
                {description}
              </p>
            )}
          </div>

          {/* Right Column: Dynamic Rating Summary Badge */}
          {ratingSummary && ratingSummary.enabled !== false && (
            <div className="shrink-0 self-start md:self-auto">
              <div className="bg-white dark:bg-card border border-neutral-200/80 dark:border-border rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                  <span>{ratingSummary.ratingValue.toFixed(1)}</span>
                  <Star className="w-6 h-6 fill-amber-400 text-amber-400 shrink-0" aria-hidden="true" />
                </div>
                <div className="border-l border-neutral-200 dark:border-neutral-800 pl-3.5 text-left space-y-0.5">
                  <span className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 block leading-tight">
                    {ratingSummary.reviewCountText}
                  </span>
                  {ratingSummary.badgeText && (
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">
                      {ratingSummary.badgeText}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── VIDEO TESTIMONIALS ──────────────────────────────────────────────── */}
        {videos.length > 0 && (
          <div>
            {/* DESKTOP VIEW: 3-Card Grid */}
            <div className="hidden md:grid md:grid-cols-3 gap-5 sm:gap-6">
              {videos.map((vid) => (
                <div
                  key={vid.id}
                  className="group relative aspect-[3/4] rounded-[28px] overflow-hidden bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 shadow-sm cursor-pointer"
                  onClick={() => setActiveVideo(vid)}
                >
                  {/* Video Media: Autoplay loop without voice or fallback poster */}
                  {vid.videoUrl && autoplayVideos ? (
                    <video
                      src={vid.videoUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                      poster={vid.thumbnailUrl}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                    />
                  ) : vid.thumbnailUrl ? (
                    <Image
                      src={vid.thumbnailUrl}
                      alt={`${vid.clientName} - ${vid.company}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : null}

                  {/* Subtle Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                  {/* Centered Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/95 text-neutral-900 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-white transition-all duration-200"
                      aria-label={`Play video testimonial from ${vid.clientName}`}
                    >
                      <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-neutral-900 ml-1 text-neutral-900" aria-hidden="true" />
                    </div>
                  </div>

                  {/* Bottom Card Content: Client Name & Company */}
                  <div className="absolute bottom-5 left-5 right-5 text-left text-white pointer-events-none">
                    <h3 className="text-base sm:text-lg font-bold drop-shadow-md leading-tight">
                      {vid.clientName}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/85 font-medium drop-shadow-sm mt-0.5">
                      {vid.company}
                      {vid.location ? ` · ${vid.location}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* MOBILE VIEW: Touch Swipeable Horizontal Slider */}
            <div className="block md:hidden space-y-3">
              <div
                ref={videoSliderRef}
                onScroll={handleVideoScroll}
                className="flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden gap-4 -mx-4 px-4 pb-2 pt-1 scroll-smooth"
              >
                {videos.map((vid) => (
                  <div
                    key={vid.id}
                    className="w-[82vw] max-w-[310px] shrink-0 snap-center group relative aspect-[3/4] rounded-[28px] overflow-hidden bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 shadow-md cursor-pointer"
                    onClick={() => setActiveVideo(vid)}
                  >
                    {/* Video Media: Autoplay loop without voice or fallback poster */}
                    {vid.videoUrl && autoplayVideos ? (
                      <video
                        src={vid.videoUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        poster={vid.thumbnailUrl}
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    ) : vid.thumbnailUrl ? (
                      <Image
                        src={vid.thumbnailUrl}
                        alt={`${vid.clientName} - ${vid.company}`}
                        fill
                        sizes="82vw"
                        className="object-cover"
                      />
                    ) : null}

                    {/* Subtle Gradient Scrim */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                    {/* Centered Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div
                        className="w-14 h-14 rounded-full bg-white/95 text-neutral-900 flex items-center justify-center shadow-xl active:scale-95 transition-transform"
                        aria-label={`Play video testimonial from ${vid.clientName}`}
                      >
                        <Play className="w-6 h-6 fill-neutral-900 ml-1 text-neutral-900" aria-hidden="true" />
                      </div>
                    </div>

                    {/* Bottom Card Content */}
                    <div className="absolute bottom-5 left-5 right-5 text-left text-white pointer-events-none">
                      <h3 className="text-base font-bold drop-shadow-md leading-tight">
                        {vid.clientName}
                      </h3>
                      <p className="text-xs text-white/85 font-medium drop-shadow-sm mt-0.5">
                        {vid.company}
                        {vid.location ? ` · ${vid.location}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Video Slider Controls: Prev/Next Buttons + Dot Pagination */}
              <div className="flex items-center justify-between pt-1 px-1">
                {/* Dots indicator */}
                <div className="flex items-center gap-1.5">
                  {videos.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => scrollVideoTo(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        activeVideoSlide === i
                          ? 'w-6 bg-[#d9287c]'
                          : 'w-2 bg-neutral-300 dark:bg-neutral-700'
                      }`}
                      aria-label={`Go to video slide ${i + 1}`}
                    />
                  ))}
                </div>

                {/* Arrow Navigation */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={scrollVideoPrev}
                    disabled={activeVideoSlide === 0}
                    className="w-9 h-9 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center justify-center shadow-xs disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    aria-label="Previous video testimonial"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={scrollVideoNext}
                    disabled={activeVideoSlide >= videos.length - 1}
                    className="w-9 h-9 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center justify-center shadow-xs disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    aria-label="Next video testimonial"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TEXT TESTIMONIALS: FEATURED + GRID ─────────────────────────────── */}
        {testimonials.length > 0 && (
          <div>
            {/* DESKTOP VIEW: Unified 4-Column Bento Grid matching reference */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-stretch">
              {/* Featured Testimonial Card (Spans 2 columns and 2 rows on lg screen) */}
              {featuredTestimonial && (
                <div className="md:col-span-2 md:row-span-2 lg:col-span-2 lg:row-span-2 bg-[#121212] dark:bg-neutral-900 text-white rounded-[24px] sm:rounded-[28px] p-6 sm:p-8 md:p-9 border border-neutral-800 shadow-md flex flex-col justify-between space-y-6">
                  {/* Top: Repeat Client Badge on top right */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: featuredTestimonial.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" aria-hidden="true" />
                      ))}
                    </div>

                    {featuredTestimonial.isRepeatClient && (
                      <span className="text-[11px] font-semibold text-[#facc15] bg-[#ca8a04]/15 border border-[#ca8a04]/30 px-3 py-1 rounded-full uppercase tracking-wider">
                        Repeat Client
                      </span>
                    )}
                  </div>

                  {/* Main Quote Content */}
                  <blockquote className="text-base sm:text-lg lg:text-xl font-medium sm:font-semibold text-neutral-100 leading-relaxed text-left">
                    &ldquo;{featuredTestimonial.content || featuredTestimonial.quote}&rdquo;
                  </blockquote>

                  {/* Author Info */}
                  <div className="flex items-center gap-3.5 pt-2 border-t border-neutral-800/80">
                    {featuredTestimonial.avatarUrl ? (
                      <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden shrink-0 border border-neutral-700">
                        <Image
                          src={featuredTestimonial.avatarUrl}
                          alt={featuredTestimonial.clientName || (featuredTestimonial as any).name || 'Client'}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-sm text-neutral-300 border border-neutral-700">
                        {(featuredTestimonial.clientName || (featuredTestimonial as any).name || 'C').charAt(0)}
                      </div>
                    )}
                    <div className="text-left truncate">
                      <span className="font-bold text-white text-sm sm:text-base block truncate">
                        {featuredTestimonial.clientName || (featuredTestimonial as any).name || 'Verified Client'}
                      </span>
                      <span className="text-xs text-neutral-400 block truncate mt-0.5">
                        {featuredTestimonial.role ? `${featuredTestimonial.role}, ` : ''}
                        {featuredTestimonial.company}
                        {featuredTestimonial.location ? ` · ${featuredTestimonial.location}` : ''}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid of Other Testimonials */}
              {displayedGridTestimonials.map((item) => {
                const isExpanded = !!expandedIds[item.id];
                const reviewText = item.content || item.quote || '';
                const shouldTruncate = reviewText.length > 180;
                const displayContent =
                  shouldTruncate && !isExpanded
                    ? `${reviewText.slice(0, 180)}…`
                    : reviewText;
                const authorName = item.clientName || (item as any).name || 'Verified Client';

                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-card border border-neutral-200/80 dark:border-border rounded-[22px] p-5 sm:p-5.5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-3.5 min-h-[200px]"
                  >
                    {/* Top Row: Stars + Repeat Client Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-amber-400" aria-label={`Rated ${item.rating || 5} out of 5`}>
                        {Array.from({ length: item.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                        ))}
                      </div>

                      {item.isRepeatClient && (
                        <span className="text-[10px] font-semibold text-[#d9127b] bg-[#fdf2f8] dark:bg-pink-950/50 dark:text-pink-300 border border-[#fbcfe8] dark:border-pink-800/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Repeat Client
                        </span>
                      )}
                    </div>

                    {/* Content with Read More toggle */}
                    <div className="text-left flex-1">
                      <p className="text-xs sm:text-[13px] text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        &ldquo;{displayContent}&rdquo;
                      </p>
                      {shouldTruncate && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(item.id)}
                          className="text-xs font-semibold text-[#d9127b] hover:underline mt-1.5 inline-block cursor-pointer"
                        >
                          {isExpanded ? 'Read less' : 'Read more'}
                        </button>
                      )}
                    </div>

                    {/* Author row */}
                    <div className="flex items-center gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                      {item.avatarUrl ? (
                        <div className="relative w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full overflow-hidden shrink-0 border border-neutral-200 dark:border-neutral-700">
                          <Image
                            src={item.avatarUrl}
                            alt={authorName}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {authorName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="text-left truncate">
                        <span className="text-xs sm:text-[13px] font-bold text-neutral-900 dark:text-white block truncate">
                          {authorName}
                        </span>
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block truncate">
                          {item.company}
                          {item.location ? ` · ${item.location}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* See More button: Spans full width if remainingReviewsCount > 0 */}
              {remainingReviewsCount > 0 && (
                <div className="col-span-full flex justify-center pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white dark:bg-card border border-neutral-200/90 dark:border-neutral-800 text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200 shadow-2xs hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-xs transition-all cursor-pointer group"
                  >
                    <span>{showAllReviews ? 'Show fewer reviews' : `See ${remainingReviewsCount} more text ${reviewPlural}`}</span>
                    {showAllReviews ? (
                      <ChevronUp className="w-4 h-4 text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-transform" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-transform" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* MOBILE VIEW: Touch Swipeable Horizontal Slider */}
            <div className="block lg:hidden space-y-3">
              <div
                ref={textSliderRef}
                onScroll={handleTextScroll}
                className="flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden gap-4 -mx-4 px-4 pb-2 pt-1 scroll-smooth"
              >
                {displayedMobileTestimonials.map((item, idx) => {
                  const isFeaturedCard = idx === 0 && item.id === featuredTestimonial?.id;
                  const isExpanded = !!expandedIds[item.id];
                  const reviewText = item.content || item.quote || '';
                  const shouldTruncate = reviewText.length > 180;
                  const displayContent =
                    shouldTruncate && !isExpanded
                      ? `${reviewText.slice(0, 180)}…`
                      : reviewText;
                  const authorName = item.clientName || (item as any).name || 'Verified Client';

                  if (isFeaturedCard) {
                    return (
                      <div
                        key={item.id}
                        className="w-[88vw] max-w-[340px] shrink-0 snap-center bg-neutral-950 dark:bg-neutral-900 text-white rounded-[28px] p-6 border border-neutral-800 shadow-md flex flex-col justify-between space-y-4 min-h-[350px]"
                      >
                        {/* Top: Stars + Repeat Client Badge */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-amber-400">
                            {Array.from({ length: item.rating || 5 }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-amber-400" aria-hidden="true" />
                            ))}
                          </div>

                          {item.isRepeatClient && (
                            <span className="text-[10px] font-bold text-amber-300 bg-amber-400/15 border border-amber-400/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              Repeat Client
                            </span>
                          )}
                        </div>

                        {/* Quote Content */}
                        <blockquote className="text-sm font-normal text-neutral-100 leading-relaxed text-left">
                          &ldquo;{reviewText}&rdquo;
                        </blockquote>

                        {/* Author */}
                        <div className="flex items-center gap-3 pt-2 border-t border-neutral-800/80">
                          {item.avatarUrl ? (
                            <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-neutral-700">
                              <Image
                                src={item.avatarUrl}
                                alt={authorName}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-xs text-neutral-300 border border-neutral-700">
                              {authorName.charAt(0)}
                            </div>
                          )}
                          <div className="text-left truncate">
                            <span className="font-bold text-white text-sm block truncate">
                              {authorName}
                            </span>
                            <span className="text-[11px] text-neutral-400 block truncate">
                              {item.role ? `${item.role}, ` : ''}
                              {item.company}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={item.id}
                      className="w-[88vw] max-w-[340px] shrink-0 snap-center bg-white dark:bg-card border border-neutral-200/80 dark:border-border rounded-[24px] p-6 shadow-2xs flex flex-col justify-between space-y-4 min-h-[350px]"
                    >
                      {/* Top: Stars + Repeat Client Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 text-amber-400">
                          {Array.from({ length: item.rating || 5 }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                          ))}
                        </div>

                        {item.isRepeatClient && (
                          <span className="text-[10px] font-bold text-fuchsia-700 bg-fuchsia-50 dark:bg-fuchsia-950/50 dark:text-fuchsia-300 border border-fuchsia-100 dark:border-fuchsia-800/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Repeat Client
                          </span>
                        )}
                      </div>

                      {/* Content with Read More toggle */}
                      <div className="text-left flex-1">
                        <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                          &ldquo;{displayContent}&rdquo;
                        </p>
                        {shouldTruncate && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(item.id)}
                            className="text-xs font-semibold text-primary hover:underline mt-1.5 inline-block cursor-pointer"
                          >
                            {isExpanded ? 'Read less' : 'Read more'}
                          </button>
                        )}
                      </div>

                      {/* Author */}
                      <div className="flex items-center gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                        {item.avatarUrl ? (
                          <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-neutral-200 dark:border-neutral-700">
                            <Image
                              src={item.avatarUrl}
                              alt={authorName}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center font-bold text-xs">
                            {authorName.charAt(0)}
                          </div>
                        )}
                        <div className="text-left truncate">
                          <span className="text-xs font-bold text-neutral-900 dark:text-white block truncate">
                            {authorName}
                          </span>
                          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block truncate">
                            {item.company}
                            {item.location ? ` · ${item.location}` : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile Text Reviews Controls: Prev/Next Buttons + Dot Pagination */}
              <div className="flex items-center justify-between pt-1 px-1">
                {/* Dots indicator */}
                <div className="flex items-center gap-1.5 overflow-hidden max-w-[200px]">
                  {displayedMobileTestimonials.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => scrollTextTo(i)}
                      className={`h-2 rounded-full transition-all duration-300 shrink-0 ${
                        activeTextSlide === i
                          ? 'w-6 bg-[#d9287c]'
                          : 'w-2 bg-neutral-300 dark:bg-neutral-700'
                      }`}
                      aria-label={`Go to review slide ${i + 1}`}
                    />
                  ))}
                </div>

                {/* Arrow Navigation */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={scrollTextPrev}
                    disabled={activeTextSlide === 0}
                    className="w-9 h-9 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center justify-center shadow-xs disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    aria-label="Previous client review"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={scrollTextNext}
                    disabled={activeTextSlide >= displayedMobileTestimonials.length - 1}
                    className="w-9 h-9 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center justify-center shadow-xs disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    aria-label="Next client review"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mobile "See 9 more text reviews" toggle */}
              {remainingReviewsCount > 0 && (
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-card border border-neutral-200/90 dark:border-neutral-800 text-xs font-bold text-neutral-800 dark:text-neutral-200 shadow-2xs hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-300 transition-all cursor-pointer group"
                  >
                    <span>{showAllReviews ? 'Show fewer reviews' : `See ${remainingReviewsCount} more text ${reviewPlural}`}</span>
                    {showAllReviews ? (
                      <ChevronUp className="w-3.5 h-3.5 text-neutral-500" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── BOTTOM TRUST & CTA BAR ─────────────────────────────────────────── */}
        {bottomTrustBar && bottomTrustBar.enabled !== false && (() => {
          const rawStatements = bottomTrustBar.trustStatements || '';
          const statementList = rawStatements.includes('·')
            ? rawStatements.split('·').map((s) => s.trim()).filter(Boolean)
            : [rawStatements];

          return (
            <div className="rounded-[20px] sm:rounded-[28px] bg-[#fcf2f6] dark:bg-pink-950/30 border border-[#fae2ec] dark:border-pink-900/40 px-4 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-3.5 sm:gap-4">
              {/* Responsive Statements List */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 sm:gap-x-4 gap-y-2 text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 text-center sm:text-left">
                {statementList.map((stmt, idx) => (
                  <div key={idx} className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#d9127b] shrink-0" aria-hidden="true" />
                    <span>{stmt}</span>
                    {idx < statementList.length - 1 && (
                      <span className="hidden sm:inline-block text-neutral-300 dark:text-neutral-700 ml-2" aria-hidden="true">
                        ·
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {bottomTrustBar.ctaLabel && (
                <Link
                  href={bottomTrustBar.ctaUrl || '#contact'}
                  className="shrink-0 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#d9127b] hover:text-[#b00e63] dark:text-pink-400 hover:underline transition-colors mt-0.5 sm:mt-0"
                >
                  <span>{bottomTrustBar.ctaLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              )}
            </div>
          );
        })()}
      </div>

      {/* ── ACCESSIBLE VIDEO PLAYBACK MODAL ─────────────────────────────────── */}
      {activeVideo && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Video testimonial from ${activeVideo.clientName}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in-0"
        >
          <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-black border border-neutral-800 shadow-2xl">
            <button
              type="button"
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-neutral-900/80 text-white hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Close video player"
            >
              <X className="w-5 h-5" />
            </button>

            {activeVideo.videoUrl.endsWith('.mp4') || activeVideo.videoUrl.endsWith('.webm') ? (
              <video
                src={activeVideo.videoUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            ) : (
              <iframe
                src={activeVideo.videoUrl}
                title={`Video testimonial - ${activeVideo.clientName}`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
