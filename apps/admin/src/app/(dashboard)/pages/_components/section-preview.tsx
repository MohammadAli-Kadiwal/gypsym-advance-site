'use client';

import * as React from 'react';
import { Monitor, Tablet, Smartphone, ExternalLink, Eye, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type {
  HeroPayload,
  MetricsPayload,
  RevenueExperimentPayload,
  WhatWeChangePayload,
  PortfolioPayload,
  DeliveryProcessPayload,
  ClientTestimonialsPayload,
  ClientsPayload,
  PartnersPayload,
  ContactPayload,
  CtaPayload,
} from './types';

type Viewport = 'desktop' | 'tablet' | 'mobile';
type PreviewScope = 'section' | 'full';
export type ActiveTab =
  | 'hero'
  | 'verifiedResults'
  | 'croExperiment'
  | 'whatWeChange'
  | 'portfolio'
  | 'deliveryProcess'
  | 'clients'
  | 'clientTestimonials'
  | 'partners'
  | 'contact'
  | 'cta';

interface SectionPreviewProps {
  activeTab: ActiveTab;
  heroPayload: HeroPayload;
  metricsPayload: MetricsPayload;
  croPayload?: RevenueExperimentPayload;
  whatWeChangePayload?: WhatWeChangePayload;
  portfolioPayload?: PortfolioPayload;
  deliveryProcessPayload?: DeliveryProcessPayload;
  clientTestimonialsPayload?: ClientTestimonialsPayload;
  clientsPayload?: ClientsPayload;
  partnersPayload?: PartnersPayload;
  contactPayload?: ContactPayload;
  ctaPayload?: CtaPayload;
  heroHeadlineText: string;
  metricsHeadlineText: string;
}

function renderPreviewTitleWithHighlight(
  title: string,
  highlightWord?: string
): React.ReactNode {
  if (!title) return null;
  if (!highlightWord || !highlightWord.trim() || !title.toLowerCase().includes(highlightWord.trim().toLowerCase())) {
    return title;
  }

  const trimmed = highlightWord.trim();
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = title.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <span key={i} className="text-[#d9287c] font-extrabold underline decoration-[#d9287c]/30">
        {part}
      </span>
    ) : (
      part
    )
  );
}

export function SectionPreview({
  activeTab,
  heroPayload,
  metricsPayload,
  croPayload,
  whatWeChangePayload,
  portfolioPayload,
  deliveryProcessPayload,
  clientTestimonialsPayload,
  clientsPayload,
  partnersPayload,
  contactPayload,
  ctaPayload,
  heroHeadlineText,
  metricsHeadlineText,
}: SectionPreviewProps) {
  const [viewport, setViewport] = React.useState<Viewport>('desktop');
  const [previewScope, setPreviewScope] = React.useState<PreviewScope>('section');

  const showHero = activeTab === 'hero' || previewScope === 'full';
  const showMetrics = activeTab === 'verifiedResults' || previewScope === 'full';
  const showCro = activeTab === 'croExperiment' || previewScope === 'full';
  const showWhatWeChange = activeTab === 'whatWeChange' || previewScope === 'full';
  const showPortfolio = activeTab === 'portfolio' || previewScope === 'full';
  const showDeliveryProcess = activeTab === 'deliveryProcess' || previewScope === 'full';
  const showClients = activeTab === 'clients' || previewScope === 'full';
  const showClientTestimonials = activeTab === 'clientTestimonials' || previewScope === 'full';
  const showPartners = activeTab === 'partners' || previewScope === 'full';
  const showContact = activeTab === 'contact' || previewScope === 'full';
  const showCta = activeTab === 'cta' || previewScope === 'full';

  return (
    <Card className="rounded-2xl border-slate-200/90 bg-white shadow-sm overflow-hidden">
      {/* Preview Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/80">
        <div className="flex items-center space-x-1.5">
          <Eye className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-800">Live Preview</span>
        </div>

        {/* Scope switcher */}
        <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 text-[11px]">
          <button
            type="button"
            onClick={() => setPreviewScope('section')}
            className={`px-2 py-0.5 rounded-lg transition-colors ${
              previewScope === 'section'
                ? 'bg-blue-50 text-blue-600 font-bold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => setPreviewScope('full')}
            className={`px-2 py-0.5 rounded-lg transition-colors ${
              previewScope === 'full'
                ? 'bg-blue-50 text-blue-600 font-bold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Full Page
          </button>
        </div>

        {/* Responsive viewport controls */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setViewport('desktop')}
            title="Desktop"
            className={`p-1.5 rounded-lg transition-colors ${
              viewport === 'desktop'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Monitor className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewport('tablet')}
            title="Tablet"
            className={`p-1.5 rounded-lg transition-colors ${
              viewport === 'tablet'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Tablet className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewport('mobile')}
            title="Mobile"
            className={`p-1.5 rounded-lg transition-colors ${
              viewport === 'mobile'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
          </button>
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            title="Open Live Website"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors ml-1"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Preview Viewport Frame */}
      <div className="p-4 bg-slate-100/70 min-h-[460px] flex items-start justify-center overflow-auto">
        <div
          className={`bg-[#f4f3ef] rounded-xl border border-slate-300/80 shadow-md transition-all duration-300 overflow-hidden ${
            viewport === 'mobile'
              ? 'w-[320px]'
              : viewport === 'tablet'
              ? 'w-[520px]'
              : 'w-full'
          }`}
        >
          {/* Mock Browser Header */}
          <div className="bg-white/90 backdrop-blur-xs px-3 py-2 border-b border-slate-200/80 flex items-center justify-between text-[10px]">
            <div className="flex space-x-1">
              <div className="h-2 w-2 rounded-full bg-red-400" />
              <div className="h-2 w-2 rounded-full bg-amber-400" />
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
            <div className="bg-slate-100 rounded-md px-3 py-0.5 text-slate-500 font-mono text-[9px] truncate max-w-[180px]">
              developios.com
            </div>
            <div className="h-2 w-2" />
          </div>

          {/* Section Render Stream */}
          <div className="divide-y divide-slate-200/60 text-slate-900">
            {/* 1. HERO PREVIEW */}
            {showHero && (
              <div className="p-4 space-y-3 bg-white">
                {heroPayload.eyebrow?.enabled !== false && heroPayload.eyebrow?.text && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-[9px] font-bold">
                    <Sparkles className="h-2.5 w-2.5" />
                    <span>{heroPayload.eyebrow.text}</span>
                  </span>
                )}

                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                  {renderPreviewTitleWithHighlight(heroHeadlineText, heroPayload.titleHighlight)}
                </h2>

                {heroPayload.description?.enabled !== false && heroPayload.description?.content && (
                  <p className="text-[10px] text-slate-600 line-clamp-2 leading-relaxed">
                    {heroPayload.description.content}
                  </p>
                )}

                <div className="flex items-center space-x-2 pt-1">
                  {heroPayload.primaryCta?.label && (
                    <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-semibold">
                      {heroPayload.primaryCta.label}
                    </span>
                  )}
                </div>

                {heroPayload.clientStrip?.enabled !== false && (
                  <div className="pt-2 border-t border-slate-100 text-[9px] text-slate-400">
                    <span className="font-semibold">{heroPayload.clientStrip?.title || 'The agency behind ..'}</span>
                  </div>
                )}
              </div>
            )}

            {/* 2. METRICS PREVIEW */}
            {showMetrics && (
              <div
                className="p-4 space-y-3 transition-colors"
                style={{ backgroundColor: metricsPayload.backgroundColor || '#f4f3ef' }}
              >
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold text-blue-600 uppercase tracking-wider block">
                    {metricsPayload.eyebrow?.text}
                  </span>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                    {renderPreviewTitleWithHighlight(metricsHeadlineText, metricsPayload.titleHighlight)}
                  </h3>
                </div>

                {(metricsPayload.cards ?? []).length > 0 && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {metricsPayload.cards!.map((c, i) => (
                      <div
                        key={c.id || i}
                        className="p-2.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1 transition-all"
                        style={{ backgroundColor: c.appearance?.cardBg || '#ffffff' }}
                      >
                        <div className="flex items-center justify-between text-[8px] text-slate-600">
                          <span className="font-semibold truncate">{c.category}</span>
                          <span className="text-[7px] text-pink-600 font-bold">VERIFIED ✓</span>
                        </div>
                        <div className="text-xs font-black text-slate-900 tracking-tight">
                          {c.metric?.displayValue}
                        </div>
                        <div className="text-[9px] text-slate-600 font-medium truncate">
                          {c.title}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. CRO EXPERIMENT PREVIEW */}
            {showCro && (
              <div className="p-4 bg-[#f4f3ef]">
                <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                    {/* Left Column: Eyebrow, Title, Description */}
                    <div className="space-y-1.5 text-left">
                      <span className="inline-flex items-center gap-1 text-[7px] font-bold text-[#d9287c] uppercase tracking-wider">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#d9287c]" />
                        <span>{croPayload?.eyebrow || 'CRO REVENUE EXPERIMENT'}</span>
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {renderPreviewTitleWithHighlight(croPayload?.headline || 'Test what makes money, not what looks nice', croPayload?.titleHighlight)}
                      </h4>
                      {croPayload?.description && (
                        <p className="text-[7.5px] text-slate-500 leading-tight line-clamp-3">
                          {croPayload.description}
                        </p>
                      )}
                      <div className="pt-1">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[7.5px] font-semibold">
                          {croPayload?.ctaText || 'Start a CRO audit'}
                        </span>
                      </div>
                    </div>

                    {/* Right Column: Mini comparison card */}
                    <div className="rounded-xl bg-[#fcf5f7] border border-pink-200/80 p-2.5 space-y-2">
                      <div className="flex items-center justify-between text-[8px]">
                        <span className="text-slate-600 font-medium">{croPayload?.experimentTag || 'Experiment 14 · PDP bundle block'}</span>
                        <span className="text-[7px] font-bold text-fuchsia-700 bg-pink-100 px-1.5 py-0.5 rounded-full uppercase">
                          {croPayload?.winnerBadge || 'WINNER'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="bg-white rounded-lg p-1.5 border border-slate-100">
                          <span className="text-[7px] text-slate-400 block">{croPayload?.controlLabel || 'Control'}</span>
                          <span className="text-xs font-bold text-slate-900 block">{croPayload?.controlValue || '$1.94'}</span>
                        </div>
                        <div className="bg-pink-100/60 rounded-lg p-1.5 border border-pink-200">
                          <span className="text-[7px] text-fuchsia-700 font-bold block">{croPayload?.variantLabel || 'Variant B'}</span>
                          <span className="text-xs font-bold text-slate-900 block">{croPayload?.variantValue || '$2.61'}</span>
                        </div>
                      </div>

                      {/* Bars */}
                      <div className="flex items-end gap-1 h-7 pt-1">
                        {(croPayload?.bars || [25, 38, 55, 70, 85, 100]).map((b, bIdx) => (
                          <div
                            key={bIdx}
                            style={{ height: `${Math.max(15, Math.min(100, b))}%` }}
                            className={`flex-1 rounded-t-xs ${
                              bIdx === 5 ? 'bg-fuchsia-600' : 'bg-pink-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. WHAT WE CHANGE PREVIEW */}
            {showWhatWeChange && (
              <div className="p-4 space-y-3 bg-[#f4f3ef] text-center">
                <div className="space-y-1 max-w-[90%] mx-auto">
                  <span className="inline-flex items-center gap-1 text-[7px] font-bold text-[#d9287c] uppercase tracking-wider">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#d9287c]" />
                    <span>{whatWeChangePayload?.eyebrow || 'WHAT WE ACTUALLY CHANGE'}</span>
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {renderPreviewTitleWithHighlight(whatWeChangePayload?.title || 'Give shoppers fewer reasons to leave', whatWeChangePayload?.titleHighlight)}
                  </h4>
                  {whatWeChangePayload?.description && (
                    <p className="text-[7.5px] text-slate-500 leading-tight line-clamp-2">
                      {whatWeChangePayload.description}
                    </p>
                  )}
                </div>

                {/* 3 mini cards */}
                <div className="grid grid-cols-3 gap-2">
                  {(whatWeChangePayload?.cards || [
                    { title: 'Fewer steps to buy' },
                    { title: 'Fast on real phones' },
                    { title: 'Yours to run after' },
                  ]).map((card, cIdx) => (
                    <div key={cIdx} className="bg-white rounded-xl p-2 border border-slate-200 shadow-2xs space-y-1">
                      <div className="h-10 rounded-lg bg-[#fce7ec] flex items-center justify-center p-1">
                        {cIdx === 0 && (
                          <div className="w-full bg-slate-900 text-white rounded-md text-[6px] text-center py-1 font-mono">
                            Checkout
                          </div>
                        )}
                        {cIdx === 1 && (
                          <div className="w-full space-y-1 px-1">
                            <div className="h-1 w-3/4 bg-fuchsia-600 rounded-full" />
                            <div className="h-1 w-full bg-fuchsia-600 rounded-full" />
                          </div>
                        )}
                        {cIdx === 2 && (
                          <div className="w-full space-y-0.5">
                            <div className="h-1.5 w-full bg-white rounded-xs" />
                            <div className="h-1.5 w-full bg-white rounded-xs" />
                          </div>
                        )}
                      </div>
                      <span className="text-[8px] font-bold text-slate-800 line-clamp-1 block">
                        {card.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4b. PORTFOLIO / OUR WORK PREVIEW (2 -> 1 -> 2 Layout) */}
            {showPortfolio && (
              <div className="p-4 space-y-3 bg-[#0a0a0a] text-white text-center border-t border-slate-800">
                <div className="space-y-1 max-w-[90%] mx-auto">
                  <span className="inline-flex items-center gap-1 text-[7px] font-bold text-[#d9287c] uppercase tracking-wider">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#d9287c]" />
                    <span>{portfolioPayload?.eyebrow || 'PORTFOLIO'}</span>
                  </span>
                  <h4 className="text-xs font-bold text-white leading-snug">
                    {renderPreviewTitleWithHighlight(
                      portfolioPayload?.title || 'Our Work In Production',
                      portfolioPayload?.titleHighlight || 'Our Work'
                    )}
                  </h4>
                  {portfolioPayload?.description && (
                    <p className="text-[7.5px] text-neutral-400 leading-tight line-clamp-2">
                      {portfolioPayload.description}
                    </p>
                  )}
                </div>

                {/* 2 -> 1 -> 2 interactive mini cards */}
                <div className="grid grid-cols-2 gap-2 text-left">
                  {(portfolioPayload?.projects || [])
                    .slice(
                      0,
                      typeof portfolioPayload?.maxDisplayCount === 'number' && portfolioPayload.maxDisplayCount > 0
                        ? portfolioPayload.maxDisplayCount
                        : (portfolioPayload?.projects || []).length || 5
                    )
                    .map((proj, pIdx) => {
                    const isFull = pIdx === 2;
                    return (
                      <div
                        key={pIdx}
                        className={`relative rounded-xl overflow-hidden border border-white/10 bg-neutral-900 group/card p-2.5 flex flex-col justify-between ${
                          isFull ? 'col-span-2 h-24' : 'h-24'
                        }`}
                      >
                        {/* Background image preview */}
                        {proj.imageUrl && (
                          <div
                            className="absolute inset-0 bg-cover bg-center opacity-40 group-hover/card:scale-105 transition-transform duration-500"
                            style={{ backgroundImage: `url(${proj.imageUrl})` }}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                        {/* Hover View Button simulation (⚪ View) */}
                        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 bg-black/30 backdrop-blur-xs">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900/80 text-white text-[8px] font-medium shadow-md border border-white/20 backdrop-blur-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                            <span>{portfolioPayload?.viewButtonLabel || 'View'}</span>
                          </span>
                        </div>

                        {/* Bottom: Only Project Name */}
                        <div className="relative z-10 mt-auto">
                          <span className="text-[8.5px] font-bold text-white line-clamp-1 block drop-shadow-xs">
                            {proj.title}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. DELIVERY PROCESS PREVIEW */}
            {showDeliveryProcess && (
              <div className="p-4 space-y-3 bg-white border-t border-slate-100 text-center">
                <div className="space-y-1 max-w-[90%] mx-auto">
                  {deliveryProcessPayload?.eyebrow && (
                    <span className="inline-flex items-center gap-1 text-[7px] font-bold text-[#d9287c] uppercase tracking-wider">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#d9287c]" />
                      <span>{deliveryProcessPayload.eyebrow}</span>
                    </span>
                  )}
                  <h4 className="text-xs font-extrabold text-slate-900 leading-snug">
                    {renderPreviewTitleWithHighlight(deliveryProcessPayload?.title || 'Our Four Step Delivery Process', deliveryProcessPayload?.titleHighlight)}
                  </h4>
                  {deliveryProcessPayload?.description && (
                    <p className="text-[7.5px] text-slate-500 leading-tight line-clamp-2">
                      {deliveryProcessPayload.description}
                    </p>
                  )}
                </div>

                {/* 4 Steps Mini Cards: Active card wider (flex accordion) */}
                <div className="flex gap-1.5 pt-1 items-stretch">
                  {(deliveryProcessPayload?.steps || [
                    { title: 'Discovery & Strategy', stepNumber: '.01' },
                    { title: 'Architecture & UX', stepNumber: '.02' },
                    { title: 'Design & Prototype', stepNumber: '.03' },
                    { title: 'Build & Ship', stepNumber: '.04' },
                  ]).map((st, sIdx) => {
                    const isActiveCard = sIdx === 0;
                    return (
                      <div
                        key={sIdx}
                        style={{
                          flexGrow: isActiveCard ? 2.3 : 0.85,
                          flexShrink: 1,
                          flexBasis: '0%',
                          minWidth: 0,
                        }}
                        className={`rounded-lg p-1.5 border flex flex-col justify-between transition-all duration-300 ${
                          isActiveCard
                            ? 'bg-white border-indigo-400 shadow-2xs'
                            : 'bg-white/90 border-slate-200 opacity-80'
                        }`}
                      >
                        <div>
                          <span className="text-[7.5px] font-bold text-slate-800 line-clamp-2 block leading-tight">
                            {st.title}
                          </span>
                          {isActiveCard && st.description && (
                            <p className="text-[6px] text-slate-500 line-clamp-2 mt-0.5 leading-tight">
                              {st.description}
                            </p>
                          )}
                        </div>
                        <div className="pt-2 flex justify-start">
                          <span
                            className={`text-[10px] font-extrabold font-mono ${
                              isActiveCard ? 'text-indigo-600' : 'text-slate-700'
                            }`}
                          >
                            {st.stepNumber || `.${String(sIdx + 1).padStart(2, '0')}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 7. CLIENTS / TRUSTED BY PREVIEW (Right after Delivery Process) */}
            {showClients && (
              <div className="p-4 space-y-3 bg-white border-t border-slate-100 text-center">
                <div className="space-y-1 max-w-[85%] mx-auto">
                  <span className="inline-flex items-center gap-1 text-[7px] font-bold text-[#d9287c] uppercase tracking-wider">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#d9287c]" />
                    <span>{clientsPayload?.eyebrow || 'TRUSTED BY'}</span>
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {renderPreviewTitleWithHighlight(
                      clientsPayload?.title || 'Trusted by 100+ brands worldwide',
                      clientsPayload?.titleHighlight || '100+ brands worldwide'
                    )}
                  </h4>
                  {(clientsPayload?.description || 'We partner with ambitious enterprises and high-growth innovators to engineer scalable, high-performance digital platforms.') && (
                    <p className="text-[7.5px] text-slate-500 leading-tight line-clamp-2">
                      {clientsPayload?.description || 'We partner with ambitious enterprises and high-growth innovators to engineer scalable, high-performance digital platforms.'}
                    </p>
                  )}
                </div>

                {/* 6 per line (desktop) / 3 per line (mobile) - Compact Floating Logos */}
                <div className="pt-1">
                  {(() => {
                    const allItems = clientsPayload?.clients || clientsPayload?.selectedClients || [];
                    const seenNames = new Set<string>();
                    const uniqueItems = allItems.filter((item: any) => {
                      const n = (item.name || '').trim().toLowerCase();
                      if (n && seenNames.has(n)) return false;
                      if (n) seenNames.add(n);
                      return true;
                    });

                    if (uniqueItems.length === 0) {
                      return (
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 justify-items-center">
                          {Array.from({ length: 6 }).map((_, cIdx) => (
                            <div
                              key={cIdx}
                              className="w-8 h-4 rounded bg-slate-200/50"
                            />
                          ))}
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-1 gap-y-1.5 items-center justify-items-center">
                        {uniqueItems.map((item: any, iIdx: number) => (
                          <div
                            key={iIdx}
                            className="h-6 px-0.5 flex items-center justify-center text-[7px] font-medium text-slate-600 truncate w-full max-w-[75px] bg-transparent border-0 shadow-none"
                          >
                            {item.logoUrl ? (
                              <img
                                src={item.logoUrl}
                                alt={item.name || 'Client'}
                                className="w-full max-h-5 max-w-[65px] object-contain opacity-85 [mix-blend-mode:multiply]"
                              />
                            ) : (
                              <span>{item.name || `Client ${iIdx + 1}`}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* 8. CLIENT TESTIMONIALS PREVIEW */}
            {showClientTestimonials && (
              <div className="p-4 space-y-3 bg-[#faf9f6] border-t border-slate-100 text-left">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 max-w-[70%]">
                    <span className="inline-flex items-center gap-1 text-[7px] font-bold text-[#d9287c] uppercase tracking-wider">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#d9287c]" />
                      <span>{clientTestimonialsPayload?.eyebrow || 'CLIENT LOVE'}</span>
                    </span>
                    <h4 className="text-xs font-extrabold text-slate-900 leading-snug">
                      {renderPreviewTitleWithHighlight(
                        clientTestimonialsPayload?.title || 'Hear it from the founders.',
                        clientTestimonialsPayload?.titleHighlight
                      )}
                    </h4>
                  </div>

                  {/* Rating mini badge */}
                  <div className="bg-white rounded-lg p-1.5 border border-slate-200 shadow-2xs flex items-center gap-1 shrink-0">
                    <span className="text-[10px] font-bold text-slate-900">
                      {clientTestimonialsPayload?.ratingSummary?.ratingValue ?? 4.9}
                    </span>
                    <span className="text-[9px] text-amber-500">★</span>
                  </div>
                </div>

                {/* 3 Video portrait cards mini preview */}
                <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                  {(clientTestimonialsPayload?.videoTestimonials || [
                    { clientName: 'Rayan A.', company: 'Ajirah' },
                    { clientName: 'Marco B.', company: 'Kinetik' },
                    { clientName: 'Bhaskar D.', company: 'Nepal Hills' },
                  ]).slice(0, 3).map((vid, vIdx) => (
                    <div
                      key={vIdx}
                      className="aspect-[3/4] rounded-lg bg-slate-900 border border-slate-800 p-1.5 flex flex-col justify-between relative overflow-hidden text-white"
                    >
                      <div className="w-full flex justify-end">
                        <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[7px]">
                          ▶
                        </span>
                      </div>
                      <div className="text-[6.5px] font-bold truncate">
                        {vid.clientName}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Testimonial mini cards preview */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <div className="rounded-lg bg-slate-950 p-2 text-white space-y-1">
                    <div className="text-[6px] text-amber-400 font-bold uppercase">Repeat Client</div>
                    <p className="text-[6.5px] text-slate-300 line-clamp-3 leading-tight">
                      &ldquo;The quality of execution has been exceptional — far exceeding many agencies.&rdquo;
                    </p>
                    <span className="text-[6px] font-bold text-white block">Dom · Enterprise</span>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-slate-200 space-y-1">
                    <div className="text-[6.5px] text-amber-500">★★★★★</div>
                    <p className="text-[6.5px] text-slate-600 line-clamp-3 leading-tight">
                      &ldquo;Delivered an exceptional store with outstanding speed and attention to detail.&rdquo;
                    </p>
                    <span className="text-[6px] font-bold text-slate-800 block">Candace M. · US</span>
                  </div>
                </div>

                {/* Bottom Trust mini bar */}
                <div className="rounded-lg bg-pink-50 p-1.5 border border-pink-100 flex items-center justify-between text-[6.5px] text-slate-700">
                  <span className="font-semibold truncate">85% retention · 24h response</span>
                  <span className="text-pink-600 font-bold shrink-0">Book Call →</span>
                </div>
              </div>
            )}

            {showPartners && (
              <div className="p-4 space-y-3 bg-white border-t border-slate-100 text-center">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 text-[7px] font-bold text-[#d9287c] uppercase tracking-wider">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#d9287c]" />
                    <span>{partnersPayload?.eyebrow || 'GLOBAL ALLIANCES'}</span>
                  </span>
                  <h4 className="text-xs font-extrabold text-slate-900">
                    {renderPreviewTitleWithHighlight(
                      partnersPayload?.title || 'Strategic Cloud & Enterprise Partners',
                      partnersPayload?.titleHighlight || 'Enterprise Partners'
                    )}
                  </h4>
                  {(partnersPayload?.description ||
                    'We collaborate closely with leading cloud, commerce, and infrastructure providers to engineer resilient digital systems at global scale.') && (
                    <p className="text-[7px] text-slate-500 max-w-[280px] mx-auto leading-tight line-clamp-2">
                      {partnersPayload?.description ||
                        'We collaborate closely with leading cloud, commerce, and infrastructure providers to engineer resilient digital systems at global scale.'}
                    </p>
                  )}
                </div>

                {/* Structured Centered Rows Preview */}
                {(() => {
                  const allItems = partnersPayload?.partners || [
                    { name: 'Amazon Web Services', logoUrl: '/aws-partner-badge.svg' },
                    { name: 'Google Cloud', logoUrl: '/aws-partner-badge.svg' },
                  ];

                  const r1 = partnersPayload?.layout?.desktopRow1 ?? 8;
                  const r2 = partnersPayload?.layout?.desktopRow2 ?? 6;
                  const r3 = partnersPayload?.layout?.desktopRow3 ?? 4;

                  const row1Items = allItems.slice(0, r1);
                  const row2Items = allItems.slice(r1, r1 + r2);
                  const row3Items = allItems.slice(r1 + r2, r1 + r2 + r3);

                  const renderRow = (rowItems: typeof allItems, key: string) => {
                    if (rowItems.length === 0) return null;
                    return (
                      <div key={key} className="flex flex-wrap items-center justify-center gap-1">
                        {rowItems.map((item, i) => (
                          <div
                            key={i}
                            className="h-6 px-2 rounded-md bg-slate-50 border border-slate-200/80 flex items-center justify-center text-[7px] font-semibold text-slate-700 shadow-2xs"
                          >
                            {item.logoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.logoUrl}
                                alt={item.name}
                                className="h-3.5 max-w-[45px] object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <span className="truncate max-w-[40px]">{item.name}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  };

                  return (
                    <div className="space-y-1 py-1">
                      {renderRow(row1Items, 'r1')}
                      {renderRow(row2Items, 'r2')}
                      {renderRow(row3Items, 'r3')}
                    </div>
                  );
                })()}

                {partnersPayload?.cta?.enabled && (
                  <div className="pt-1">
                    <span className="inline-block px-2.5 py-1 rounded-full bg-blue-600 text-white text-[7px] font-bold shadow-2xs">
                      {partnersPayload?.cta?.label || 'Become a Partner'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 10. Contact / Inquiry Section Preview */}
            {showContact && (
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  activeTab === 'contact'
                    ? 'ring-2 ring-[#d9287c]/30 border-[#d9287c]'
                    : 'border-slate-200/80 bg-white'
                } shadow-xs`}
              >
                <div className="grid grid-cols-2 gap-3 text-left">
                  {/* Left Column Preview */}
                  <div className="space-y-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#d9287c]/8 border border-[#d9287c]/20 text-[#d9287c] font-mono text-[7px] uppercase font-bold">
                      <span className="w-1 h-1 rounded-full bg-[#d9287c]" />
                      {contactPayload?.eyebrow || 'DIRECT ENGAGEMENT'}
                    </span>
                    <h4 className="text-[10px] font-bold text-neutral-900 leading-tight">
                      {renderPreviewTitleWithHighlight(
                        contactPayload?.title || 'Initiate an Architectural Consultation',
                        contactPayload?.titleHighlight || 'Consultation'
                      )}
                    </h4>
                    <p className="text-[7px] text-neutral-500 leading-tight line-clamp-2">
                      {contactPayload?.description ||
                        'Engage directly with our technical leadership. Strict non-disclosure terms.'}
                    </p>
                    <div className="pt-1 space-y-1 text-[7px] text-neutral-600">
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="truncate font-medium">Desk: briefings@gypsym.com</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#d9287c]" />
                        <span className="truncate font-medium">NYC HQ · 24h SLA</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column Form Card Preview */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-[8px] font-bold text-neutral-900">
                        {contactPayload?.form?.formTitle || 'Direct Inquiry'}
                      </span>
                      <span className="text-[6px] text-[#d9287c] font-bold bg-[#d9287c]/10 px-1.5 py-0.2 rounded-full">
                        24H SLA
                      </span>
                    </div>
                    <div className="space-y-1 py-0.5">
                      <div className="h-3.5 rounded-lg bg-white border border-slate-200 px-1.5 flex items-center text-[6px] text-slate-400">
                        Full Name *
                      </div>
                      <div className="h-3.5 rounded-lg bg-white border border-slate-200 px-1.5 flex items-center text-[6px] text-slate-400">
                        Work Email *
                      </div>
                      <div className="h-4 rounded-lg bg-white border border-slate-200 px-1.5 flex items-center text-[6px] text-slate-400">
                        Project Scope *
                      </div>
                    </div>
                    <div className="pt-0.5">
                      <div className="h-4 rounded-full bg-neutral-900 text-white font-bold text-[7px] flex items-center justify-center shadow-xs">
                        {contactPayload?.form?.submitButtonText || 'Submit Inquiry'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 11. CTA Banner Section Preview (Last Section) */}
            {showCta && (
              <div
                className={`p-5 rounded-2xl border text-center transition-all ${
                  activeTab === 'cta'
                    ? 'ring-2 ring-[#d9287c]/30 border-[#d9287c]'
                    : 'border-slate-200/80 bg-white'
                } shadow-xs relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-[#d9287c]/5 via-transparent to-transparent pointer-events-none" />
                <div className="relative z-10 space-y-2">
                  {ctaPayload?.eyebrow && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#d9287c]/8 border border-[#d9287c]/20 text-[#d9287c] font-mono text-[7px] tracking-wider uppercase font-bold">
                      <span className="w-1 h-1 rounded-full bg-[#d9287c]" />
                      {ctaPayload.eyebrow}
                    </span>
                  )}
                  <h4 className="text-xs font-bold text-neutral-900 leading-tight">
                    {renderPreviewTitleWithHighlight(
                      ctaPayload?.title || 'Ready to Accelerate Your Digital Transformation?',
                      ctaPayload?.titleHighlight || 'Transformation'
                    )}
                  </h4>
                  <p className="text-[7.5px] text-neutral-600 max-w-[280px] mx-auto leading-tight line-clamp-2">
                    {ctaPayload?.description ||
                      'Partner with our systems engineers and cloud architects to build resilient, distributed digital infrastructure.'}
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <span className="inline-block px-3 py-1.5 rounded-full bg-neutral-900 text-white text-[7.5px] font-bold shadow-xs">
                      {ctaPayload?.primaryButton?.label || 'Schedule an Architectural Briefing'}
                    </span>
                    {ctaPayload?.secondaryButton?.enabled && (
                      <span className="inline-block px-3 py-1.5 rounded-full bg-white border border-slate-200 text-neutral-800 text-[7.5px] font-medium">
                        {ctaPayload?.secondaryButton?.label || 'Explore Radar'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
