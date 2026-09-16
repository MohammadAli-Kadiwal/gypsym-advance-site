'use client';

import * as React from 'react';
import Image from 'next/image';
import { ScrollReveal, AnimatedCounter } from '@/components/motion';

export interface CredentialItem {
  label: string;
  value: string;
  sub: string;
}

export interface SubpageHeroProps {
  ariaLabel?: string;
  backgroundImageUrl?: string;
  imageAlt?: string;
  eyebrow?: string;
  eyebrowBulletColor?: string;
  titlePrefix?: string;
  titleHighlight?: string;
  titleSuffix?: string;
  titleNode?: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
  credentials?: CredentialItem[];
  showHeroStrip?: boolean;
  className?: string;
}

const DEFAULT_BACKGROUND_IMAGE =
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2200&auto=format&fit=crop';

export function SubpageHero({
  ariaLabel = 'Page Hero',
  backgroundImageUrl = DEFAULT_BACKGROUND_IMAGE,
  imageAlt = 'Gypsym Technology Hero Background',
  eyebrow,
  eyebrowBulletColor = 'bg-emerald-400',
  titlePrefix,
  titleHighlight,
  titleSuffix,
  titleNode,
  description,
  actions,
  credentials,
  showHeroStrip = true,
  className = '',
}: SubpageHeroProps) {
  return (
    <div className={`w-full bg-[#f4f3ef] px-1.5 sm:px-2 md:px-3 pt-[clamp(6px,1vw,10px)] ${className}`}>
      <section
        aria-label={ariaLabel}
        className="relative isolate w-full rounded-[18px] sm:rounded-[22px] md:rounded-[28px] overflow-hidden flex flex-col shadow-sm border border-neutral-200/50"
        style={{
          minHeight: 'calc(100dvh - clamp(10px, 2vw, 16px) - 16px)',
          height: 'calc(100dvh - clamp(10px, 2vw, 16px) - 16px)',
        }}
      >
        {/* Background Image with Ambient Depth */}
        <div className="absolute inset-0 z-0 overflow-hidden select-none">
          <Image
            src={backgroundImageUrl}
            alt={imageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center scale-105 animate-in fade-in duration-1000"
          />
          {/* Multi-tier Gradient & Contrast Overlay for Daylight / Legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-950/50 pointer-events-none" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/60 pointer-events-none" />
        </div>

        {/* Centered Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-8 md:px-12 pt-[clamp(80px,14vw,130px)] pb-6 max-w-5xl mx-auto space-y-5 sm:space-y-6">
          {/* Eyebrow Badge */}
          {eyebrow && (
            <ScrollReveal direction="down" delay={60}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] sm:text-[12px] font-mono uppercase tracking-[0.2em] text-neutral-200 shadow-sm">
                <span
                  className={`w-2 h-2 rounded-full ${eyebrowBulletColor} animate-pulse ${
                    eyebrowBulletColor.includes('#d9287c') || eyebrowBulletColor.includes('pink')
                      ? 'shadow-[0_0_8px_rgba(217,40,124,0.8)]'
                      : eyebrowBulletColor.includes('blue')
                      ? 'shadow-[0_0_8px_rgba(96,165,250,0.8)]'
                      : 'shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  }`}
                />
                <span>{eyebrow}</span>
              </div>
            </ScrollReveal>
          )}

          {/* Editorial Headline with Serif Accent */}
          <ScrollReveal direction="up" delay={120}>
            {React.isValidElement(titleNode) && (titleNode as React.ReactElement).type === 'h1' ? (
              titleNode
            ) : titleNode ? (
              <h1 className="text-[clamp(32px,6.5vw,66px)] font-semibold tracking-[-0.025em] text-white leading-[1.12] drop-shadow-md">
                {titleNode}
              </h1>
            ) : (
              <h1 className="text-[clamp(32px,6.5vw,66px)] font-semibold tracking-[-0.025em] text-white leading-[1.12] drop-shadow-md">
                {titlePrefix && <span>{titlePrefix} </span>}
                {titleHighlight && (
                  <span className="font-serif italic font-normal text-white drop-shadow-md text-[clamp(36px,7.5vw,74px)] inline-block leading-none mx-1.5 sm:mx-2.5">
                    {titleHighlight}
                  </span>
                )}
                {titleSuffix && <span> {titleSuffix}</span>}
              </h1>
            )}
          </ScrollReveal>

          {/* Subtitle Description */}
          {description && (
            <ScrollReveal direction="up" delay={180}>
              <p className="text-[14px] sm:text-[16px] md:text-[17px] text-neutral-200 max-w-[90%] sm:max-w-2xl mx-auto leading-[1.65] font-normal drop-shadow">
                {description}
              </p>
            </ScrollReveal>
          )}

          {/* Action CTAs */}
          {actions && (
            <ScrollReveal direction="up" delay={240}>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
                {actions}
              </div>
            </ScrollReveal>
          )}
        </div>

        {/* Low-Profile Agency Credentials Strip */}
        {showHeroStrip && credentials && credentials.length > 0 && (
          <div className="w-full relative z-10 mt-auto border-t border-white/15 bg-white/95 backdrop-blur-md">
            <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8 py-3.5 sm:py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 divide-y md:divide-y-0 md:divide-x divide-neutral-200/80">
                {credentials.map((item, i) => (
                  <div
                    key={i}
                    className={`flex flex-col justify-center ${i > 0 ? 'pt-2 md:pt-0 md:pl-6' : ''}`}
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="text-[17px] sm:text-[20px] md:text-[22px] font-bold text-neutral-900 tracking-tight">
                        <AnimatedCounter
                          value={item.value}
                          duration={1.8}
                          delay={i * 120}
                          threshold={0}
                          rootMargin="100px 0px 100px 0px"
                        />
                      </span>
                    </div>
                    <span className="text-[11px] sm:text-[12px] font-semibold text-neutral-800 tracking-tight">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {item.sub}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
