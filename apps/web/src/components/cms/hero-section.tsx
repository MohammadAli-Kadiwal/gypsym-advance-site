'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import {
  Play,
  ArrowUpRight,
  X,
  MessageCircle,
} from 'lucide-react';
import { PageSectionDto, HeroPayload } from '@/lib/cms-types';
import { renderTitleWithHighlight } from '@/lib/render-title-highlight';
import { ScrollReveal } from '@/components/motion';

interface HeroSectionProps {
  section: PageSectionDto;
}

export function HeroSection({ section }: HeroSectionProps) {
  const payload = (section.contentPayload as HeroPayload) || {};
  const [videoOpen, setVideoOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const titleHighlight = payload.titleHighlight;
  const headline = payload.headline;
  const description = payload.description;
  const primaryCta = payload.primaryCta;
  const videoCta = payload.videoCta;
  const bg = payload.backgroundMedia;
  const clientStrip = payload.clientStrip;
  const floatingAction = payload.floatingAction;

  return (
    <div className="w-full bg-[#f4f3ef] px-1.5 sm:px-2 md:px-3 pt-[clamp(6px,1vw,10px)]">
      <div
        className="relative isolate w-full rounded-[18px] sm:rounded-[22px] md:rounded-[28px] overflow-hidden flex flex-col shadow-sm border border-neutral-200/50"
        style={{ minHeight: 'calc(100dvh - clamp(10px, 2vw, 16px) - 16px)', height: 'calc(100dvh - clamp(10px, 2vw, 16px) - 16px)' }}
      >
        {/* 1. Daylight Background Video / Image & Light Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {bg?.videoUrl ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster={bg.desktopImageUrl}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none scale-105 animate-in fade-in duration-700"
            >
              <source src={bg.videoUrl} type="video/mp4" />
            </video>
          ) : bg?.desktopImageUrl ? (
            <Image
              src={bg.desktopImageUrl}
              alt="Hero Background"
              fill
              priority
              className="object-cover object-center scale-105 animate-in fade-in duration-1000"
              sizes="100vw"
            />
          ) : null}

          {/* Daylight 35% Overlay */}
          <div
            className="absolute inset-0 bg-black pointer-events-none"
            style={{
              opacity: bg?.overlayOpacity !== undefined ? bg.overlayOpacity : 0.35,
            }}
          />
        </div>

        {/* 2. Main Centered Hero Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-5 sm:px-8 md:px-12 pt-[clamp(80px,14vw,130px)] pb-6 text-center space-y-5 sm:space-y-6 relative z-10">

          {/* Editorial Headline with Segments & Inline Video Trigger */}
          {headline?.segments && headline.segments.length > 0 && (
            <ScrollReveal direction="up" delay={80}>
              <h1 className="text-[clamp(28px,7vw,64px)] font-semibold tracking-[-0.02em] text-white leading-[1.15] max-w-[18ch] sm:max-w-[20ch] md:max-w-5xl mx-auto drop-shadow-md">
                {headline.segments.map((seg, idx) => {
                  const isVideoSpot =
                    headline.hasInlineVideo && headline.inlineVideoPosition === idx;

                  const lines = seg.value.split('\n');
                  const renderText = lines.map((line, lIdx) => (
                    <React.Fragment key={lIdx}>
                      {lIdx > 0 && <br />}
                      {line}
                    </React.Fragment>
                  ));

                  let segElem = null;
                  if (seg.type === 'italic') {
                    segElem = (
                      <span
                        key={idx}
                        className="font-serif italic font-normal text-white drop-shadow-md text-[clamp(32px,8vw,72px)] inline-block leading-none mx-2 sm:mx-3"
                      >
                        {renderText}
                      </span>
                    );
                  } else if (titleHighlight && (seg.value || (seg as any).text || '').toLowerCase().includes(titleHighlight.trim().toLowerCase())) {
                    const segStr = seg.value || (seg as any).text || '';
                    segElem = (
                      <span key={idx} className="text-white">
                        {renderTitleWithHighlight(
                          segStr,
                          titleHighlight,
                          'font-serif italic font-normal text-white drop-shadow-md text-[clamp(32px,8vw,72px)] inline-block leading-none mx-1.5 sm:mx-2.5'
                        )}
                      </span>
                    );
                  } else if (seg.type === 'highlight') {
                    segElem = (
                      <span key={idx} className="text-white">
                        {renderText}
                      </span>
                    );
                  } else {
                    segElem = (
                      <span key={idx} className="text-white">
                        {renderText}
                      </span>
                    );
                  }

                  return (
                    <React.Fragment key={idx}>
                      {isVideoSpot && videoCta?.enabled && (
                        <button
                          onClick={() => setVideoOpen(true)}
                          className="inline-flex items-center justify-center w-[72px] h-[40px] sm:w-[84px] sm:h-[48px] rounded-2xl bg-[#c2e678]/15 border border-[#c2e678]/25 text-lime-400 hover:scale-105 hover:bg-[#c2e678]/25 transition-all mx-2 sm:mx-3 align-middle shadow-lg cursor-pointer backdrop-blur-[3px] group"
                          aria-label="Play video"
                        >
                          <Play className="h-4 w-4 fill-lime-400 ml-0.5 group-hover:scale-110 transition-transform" />
                        </button>
                      )}
                      {segElem}
                    </React.Fragment>
                  );
                })}
              </h1>
            </ScrollReveal>
          )}

          {/* Description Paragraph */}
          {description?.enabled && description.content && (
            <ScrollReveal direction="up" delay={160}>
              <p className="text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] text-neutral-100 max-w-[90%] sm:max-w-xl md:max-w-2xl mx-auto leading-[1.65] font-normal drop-shadow">
                {description.content}
              </p>
            </ScrollReveal>
          )}

          {/* Primary CTA Action */}
          {primaryCta?.enabled && primaryCta.label && (
            <ScrollReveal direction="up" delay={240}>
              <div className="pt-2 flex flex-col xs:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
                <Link
                  href={primaryCta.url || '/contact'}
                  className="inline-flex items-center px-7 py-3 rounded-full bg-white text-neutral-950 font-semibold text-xs sm:text-sm hover:bg-neutral-100 hover:scale-105 transition-all shadow-xl shadow-black/10"
                >
                  <span>{primaryCta.label}</span>
                  <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </div>
            </ScrollReveal>
          )}
        </div>

        {/* 3. Client Marquee Strip — white background */}
        {clientStrip?.enabled && clientStrip.clients && (
          <div className="w-full relative z-10" style={{ marginTop: 'auto' }}>
            <div className="w-full h-[80px] sm:h-[90px] lg:h-[100px] flex items-center overflow-hidden bg-white">
              {/* Label — no separator, same style as gypsym */}
              {clientStrip.title && (
                <div
                  className="shrink-0 pl-4 sm:pl-6 lg:pl-8 pr-5 sm:pr-7 text-[11px] sm:text-[12px] font-normal text-neutral-400 whitespace-nowrap"
                  aria-label="Client strip heading"
                >
                  {clientStrip.title}
                </div>
              )}

              {/* Marquee track */}
              <div className="relative flex-1 overflow-hidden h-full flex items-center">
                {/* Fade edges */}
                <div className="pointer-events-none absolute left-0 top-0 h-full w-12 sm:w-16 bg-gradient-to-r from-white to-transparent z-10" />
                <div className="pointer-events-none absolute right-0 top-0 h-full w-12 sm:w-16 bg-gradient-to-l from-white to-transparent z-10" />

                {/* Truly infinite seamless marquee using two identical synchronized tracks */}
                {(() => {
                  const clientList = clientStrip.clients || [];
                  const trackItems = clientList.length < 15 ? [...clientList, ...clientList] : clientList;

                  return (
                    <div className="flex w-full overflow-hidden select-none marquee-wrapper group">
                      {/* Track 1 */}
                      <div
                        className="marquee-track flex shrink-0 items-center gap-10 sm:gap-14 lg:gap-16 pr-10 sm:pr-14 lg:pr-16 animate-marquee-infinite whitespace-nowrap"
                        style={{ animation: 'marqueeInfinite 30s linear infinite' }}
                      >
                        {trackItems.map((client, idx) => (
                          client.logoUrl ? (
                            <img
                              key={`t1-${idx}`}
                              src={client.logoUrl}
                              alt={client.name}
                              className="h-9 sm:h-11 lg:h-12 max-w-[130px] sm:max-w-[155px] lg:max-w-[175px] w-auto object-contain select-none transition-all duration-300"
                              loading="lazy"
                              draggable={false}
                            />
                          ) : (
                            <span
                              key={`t1-${idx}`}
                              className="inline-flex items-center px-4 h-9 sm:h-11 lg:h-12 rounded-lg border border-neutral-200 bg-white text-xs sm:text-sm font-semibold text-neutral-600 select-none whitespace-nowrap"
                            >
                              {client.name}
                            </span>
                          )
                        ))}
                      </div>

                      {/* Track 2 (Pixel-identical duplicate for seamless infinite loop) */}
                      <div
                        aria-hidden="true"
                        className="marquee-track flex shrink-0 items-center gap-10 sm:gap-14 lg:gap-16 pr-10 sm:pr-14 lg:pr-16 animate-marquee-infinite whitespace-nowrap"
                        style={{ animation: 'marqueeInfinite 30s linear infinite' }}
                      >
                        {trackItems.map((client, idx) => (
                          client.logoUrl ? (
                            <img
                              key={`t2-${idx}`}
                              src={client.logoUrl}
                              alt={client.name}
                              className="h-9 sm:h-11 lg:h-12 max-w-[130px] sm:max-w-[155px] lg:max-w-[175px] w-auto object-contain select-none transition-all duration-300"
                              loading="lazy"
                              draggable={false}
                            />
                          ) : (
                            <span
                              key={`t2-${idx}`}
                              className="inline-flex items-center px-4 h-9 sm:h-11 lg:h-12 rounded-lg border border-neutral-200 bg-white text-xs sm:text-sm font-semibold text-neutral-600 select-none whitespace-nowrap"
                            >
                              {client.name}
                            </span>
                          )
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 4. Floating WhatsApp Button — portalled to document.body so it is truly sticky across page scrolling */}
      {mounted && floatingAction?.enabled && typeof document !== 'undefined' && createPortal(
        <aside
          aria-label="Direct contact action"
          className="fixed bottom-6 right-6 z-50 pointer-events-auto"
        >
          <a
            href={floatingAction.url}
            target="_blank"
            rel="noopener noreferrer"
            className="relative flex items-center justify-center h-12 w-12 sm:h-13 sm:w-13 rounded-full bg-[#128C7E] hover:bg-[#075E54] text-white shadow-[0_4px_20px_rgba(18,140,126,0.45)] hover:shadow-[0_6px_28px_rgba(18,140,126,0.65)] hover:scale-110 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 cursor-pointer group"
            aria-label={floatingAction.label || 'Contact us via WhatsApp'}
          >
            {/* Tooltip on hover (desktop) */}
            <span className="pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-neutral-900/90 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 group-hover:-translate-x-1 hidden sm:block">
              {floatingAction.label || 'Chat on WhatsApp'}
            </span>

            {/* Online Status Pulse Indicator */}
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
            </span>

            <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
          </a>
        </aside>,
        document.body
      )}

      {/* 5. Video Modal — portalled to document.body for clean viewport overlay */}
      {mounted && videoOpen && videoCta?.videoUrl && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in-0">
          <div className="relative w-full max-w-4xl aspect-video rounded-xl overflow-hidden bg-black border border-neutral-800 shadow-2xl">
            <button
              onClick={() => setVideoOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-neutral-900/80 text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Close video player"
            >
              <X className="h-5 w-5" />
            </button>
            {videoCta.videoUrl.endsWith('.mp4') || videoCta.videoUrl.endsWith('.mov') ? (
              <video
                src={videoCta.videoUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            ) : (
              <iframe
                src={videoCta.videoUrl}
                title={videoCta.label || 'Video Player'}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
