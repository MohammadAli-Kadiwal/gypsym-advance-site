'use client';

import * as React from 'react';
import Image from 'next/image';
import { PageSectionDto } from '@/lib/cms-types';
import { renderTitleWithHighlight } from '@/lib/render-title-highlight';
import { Cpu } from 'lucide-react';

export interface TechItem {
  id?: string;
  name: string;
  category?: string;
  icon?: string;
}

export interface CapabilitiesPayload {
  eyebrow?: string;
  title?: string;
  titleHighlight?: string;
  description?: string;
  backgroundColor?: string;
  image?: {
    url?: string;
    alt?: string;
    badgeText?: string;
  };
  technologies?: TechItem[];
  highlights?: Array<{
    title: string;
    description?: string;
  }>;
  ctaText?: string;
  ctaUrl?: string;
}

interface CapabilitiesSectionProps {
  section: PageSectionDto;
}

// ── High-Fidelity Inline Tech SVGs ───────────────────────────────────────────
function TechLogo({ name }: { name: string }) {
  const norm = name.toLowerCase().replace(/[\s\-_.]/g, '');

  if (norm.includes('figma')) {
    return (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" viewBox="0 0 38 57" fill="none">
        <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE"/>
        <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83"/>
        <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262"/>
        <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E"/>
        <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF"/>
      </svg>
    );
  }

  if (norm.includes('webflow')) {
    return (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" viewBox="0 0 24 24" fill="none">
        <path d="M17.8 7.4s-.3 1.2-.8 2.5c-.3.8-.7 1.6-1.1 2.4-.4.8-.8 1.6-1.1 2.3-.4-.7-.8-1.5-1.1-2.3-.4-.8-.8-1.6-1.1-2.4-.5-1.3-.8-2.5-.8-2.5h-3.4s.3 1.2.8 2.5c.3.8.7 1.6 1.1 2.4.4.8.8 1.6 1.1 2.3-.4.7-.8 1.5-1.1 2.3-.4.8-.8 1.6-1.1 2.4-.5 1.3-.8 2.5-.8 2.5h3.4s.3-1.2.8-2.5c.3-.8.7-1.6 1.1-2.4.4-.8.8-1.6 1.1-2.3.4.7.8 1.5 1.1 2.3.4.8.8 1.6 1.1 2.4.5 1.3.8 2.5.8 2.5h3.4s-.3-1.2-.8-2.5c-.3-.8-.7-1.6-1.1-2.4-.4-.8-.8-1.6-1.1-2.3.4-.7.8-1.5 1.1-2.3.4-.8.8-1.6 1.1-2.4.5-1.3.8-2.5.8-2.5H17.8z" fill="#4353FF"/>
      </svg>
    );
  }

  if (norm.includes('relume')) {
    return (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#10B981" />
        <path d="M2 17L12 22L22 17" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 12L12 17L22 12" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (norm.includes('midjourney')) {
    return (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#334155" strokeWidth="2" strokeDasharray="3 3"/>
        <path d="M12 6V18M6 12H18" stroke="#0284C7" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="3" fill="#0284C7"/>
      </svg>
    );
  }

  if (norm.includes('framer')) {
    return (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" viewBox="0 0 24 24" fill="none">
        <path d="M4 0H20V8H12L4 0Z" fill="#0055FF"/>
        <path d="M4 8H12L20 16H4V8Z" fill="#0055FF"/>
        <path d="M4 16H12V24L4 16Z" fill="#0055FF"/>
      </svg>
    );
  }

  if (norm.includes('react')) {
    return (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" viewBox="0 0 24 24" fill="none">
        <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#00B4D8" strokeWidth="1.6" transform="rotate(30 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#00B4D8" strokeWidth="1.6" transform="rotate(90 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#00B4D8" strokeWidth="1.6" transform="rotate(150 12 12)" />
        <circle cx="12" cy="12" r="2" fill="#00B4D8" />
      </svg>
    );
  }

  if (norm.includes('next')) {
    return (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#000000" stroke="#000000" strokeWidth="1.2"/>
        <path d="M8 8V16M16 16L10.5 8.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M16 8V12" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    );
  }

  if (norm.includes('node')) {
    return (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L20.5 7V17L12 22L3.5 17V7L12 2Z" fill="#5FA04E" fillOpacity="0.25" stroke="#417E38" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M12 7V17M7.5 9.5L16.5 14.5" stroke="#417E38" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    );
  }

  if (norm.includes('tailwind')) {
    return (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" viewBox="0 0 24 24" fill="none">
        <path d="M6 9C7.5 6 9.5 5 12 6C14.5 7 15.5 8.5 16.5 9C17.5 9.5 18.5 9.5 20 8.5C18.5 11.5 16.5 12.5 14 11.5C11.5 10.5 10.5 9 9.5 8.5C8.5 8 7.5 8 6 9ZM2 15C3.5 12 5.5 11 8 12C10.5 13 11.5 14.5 12.5 15C13.5 15.5 14.5 15.5 16 14.5C14.5 17.5 12.5 18.5 10 17.5C7.5 16.5 6.5 15 5.5 14.5C4.5 14 3.5 14 2 15Z" fill="#0EA5E9"/>
      </svg>
    );
  }

  // Fallback icon
  return <Cpu className="w-7 h-7 sm:w-8 sm:h-8 text-neutral-800 shrink-0" />;
}

const DEFAULT_TECH_STACK: TechItem[] = [
  { name: 'Figma', category: 'Design Systems' },
  { name: 'Webflow', category: 'Visual Development' },
  { name: 'Relume', category: 'Component Library' },
  { name: 'Midjourney', category: 'Generative Visuals' },
  { name: 'Framer', category: 'Interactivity & Motion' },
  { name: 'React.js', category: 'UI Engineering' },
  { name: 'NEXT.js', category: 'Full-Stack Architecture' },
  { name: 'node.js', category: 'High-Throughput Runtime' },
  { name: 'Tailwind css', category: 'Utility Design System' },
];

export function CapabilitiesSection({ section }: CapabilitiesSectionProps) {
  const p = (section.contentPayload as CapabilitiesPayload) || {};

  const eyebrow = p.eyebrow || 'OUR CAPABILITIES';
  const title = p.title || 'Engineered with modern tools for scalable digital products';
  const titleHighlight = p.titleHighlight || 'Engineered';
  const description =
    p.description ||
    'We combine world-class design systems with robust, high-performance engineering. Our multidisciplinary team leverages the modern web ecosystem to build digital experiences that load instantly, convert visitors, and scale seamlessly.';

  const imageUrl = p.image?.url || '/images/capabilities-engineer.jpg';
  const imageAlt = p.image?.alt || 'Senior Software & Solutions Engineer';

  const technologies = (p.technologies && p.technologies.length > 0) ? p.technologies : DEFAULT_TECH_STACK;
  const customBg = p.backgroundColor?.trim();

  return (
    <div
      id="our-capabilities"
      data-section-id={section.id}
      className="w-full py-8 sm:py-10 md:py-12 bg-transparent transition-colors duration-300 relative overflow-hidden"
    >
      <div className="w-full px-1.5 sm:px-2 md:px-3 relative z-10">
        <div
          className={`relative isolate w-full rounded-[24px] sm:rounded-[36px] md:rounded-[42px] overflow-hidden ${
            customBg ? '' : 'bg-gradient-to-br from-[#064e42] via-[#053d34] to-[#032a24]'
          } border border-emerald-500/25 shadow-2xl shadow-emerald-950/40 py-8 sm:py-10 md:py-12 lg:py-14`}
          style={customBg ? { background: customBg } : undefined}
        >
          {/* Subtle Ambient Backlight Effects */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

          {/* Standardized Inner Content Container matching all other sections */}
          <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* ── LEFT COLUMN: Engineer Photo (No floating badges) ─────────── */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-[16px] sm:rounded-[20px] overflow-hidden border border-emerald-400/20 shadow-xl group aspect-[4/3] sm:aspect-[4/4] lg:aspect-[4/5]">
                  <Image
                    src={imageUrl}
                    alt={imageAlt}
                    fill
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    priority={false}
                  />
                </div>
              </div>

              {/* ── RIGHT COLUMN: Content, Headline, 3x3 Logo-Only Grid ──────── */}
              <div className="lg:col-span-7 space-y-5 sm:space-y-6">
                
                {/* Eyebrow - identical to other sections, without border */}
                {eyebrow && (
                  <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#d9287c] uppercase">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#d9287c]" />
                    <span>{eyebrow}</span>
                  </div>
                )}

                {/* Headline matching other sections with Instrument Serif italic accent in pure white */}
                <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-white leading-[1.15] sm:leading-[1.12] whitespace-pre-line">
                  {renderTitleWithHighlight(
                    title,
                    titleHighlight,
                    'font-serif italic font-normal !text-white text-[1.12em] tracking-normal inline-block px-1'
                  )}
                </h2>

                {/* Description matching other sections */}
                {description && (
                  <p className="text-base sm:text-lg text-emerald-100/80 leading-relaxed max-w-2xl pt-1">
                    {description}
                  </p>
                )}

                {/* 3x3 Technology Logos Grid - Only logo, background same as page bg */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-3 sm:pt-4">
                  {technologies.map((tech, idx) => (
                    <div
                      key={tech.id || idx}
                      title={tech.name}
                      className="h-16 sm:h-20 flex items-center justify-center rounded-xl sm:rounded-2xl bg-[#f4f3ef] border border-white/20 shadow-sm hover:scale-105 hover:shadow-md transition-all duration-200 group cursor-default"
                    >
                      <TechLogo name={tech.name} />
                    </div>
                  ))}
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
