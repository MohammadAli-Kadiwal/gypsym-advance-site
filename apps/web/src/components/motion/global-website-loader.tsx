'use client';

import * as React from 'react';
import { BrandSettingsDto } from '@/lib/cms-types';

interface GlobalWebsiteLoaderProps {
  brand?: BrandSettingsDto | null;
}

export function GlobalWebsiteLoader({ brand }: GlobalWebsiteLoaderProps) {
  const [progress, setProgress] = React.useState<number>(0);
  const [isExiting, setIsExiting] = React.useState<boolean>(false);
  const [shouldRender, setShouldRender] = React.useState<boolean>(true);

  // Dynamic branding attributes with local storage synchronization
  const [companyName, setCompanyName] = React.useState<string>(brand?.companyName || 'Gypsym Technology');
  const [brandIcon, setBrandIcon] = React.useState<string | null>(brand?.favicon || null);

  React.useEffect(() => {
    if (brand?.companyName) setCompanyName(brand.companyName);
    if (brand?.favicon) setBrandIcon(brand.favicon);

    try {
      const stored = localStorage.getItem('gypsym_branding_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.companyName) setCompanyName(parsed.companyName);
        if (parsed.faviconUrl) setBrandIcon(parsed.faviconUrl);
      }
    } catch {}
  }, [brand]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const barEl = document.getElementById('gypsym-loader-bar');
    const pctEl = document.getElementById('gypsym-loader-pct');
    const phaseEl = document.getElementById('gypsym-loader-phase');

    const updateUI = (val: number) => {
      setProgress(val);
      if (barEl) barEl.style.width = `${val}%`;
      if (pctEl) pctEl.textContent = `${val}%`;
      if (phaseEl) {
        if (val < 25) phaseEl.textContent = 'INITIALIZING CORE SYSTEMS';
        else if (val < 55) phaseEl.textContent = 'CONNECTING NEURAL INFRASTRUCTURE';
        else if (val < 85) phaseEl.textContent = 'OPTIMIZING RENDERING PIPELINE';
        else if (val < 100) phaseEl.textContent = 'FINALIZING ENVIRONMENT';
        else phaseEl.textContent = 'SYSTEM READY';
      }
    };

    const startTime = performance.now();
    const duration = 1200; // Smooth 1.2s progression
    let animFrame: number;
    let isDone = false;

    const tick = (now: number) => {
      if (isDone) return;
      const elapsed = now - startTime;
      const rawPct = Math.min(1, elapsed / duration);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - rawPct, 3);
      const currentPct = Math.min(100, Math.max(0, Math.round(eased * 100)));

      updateUI(currentPct);

      if (rawPct < 1) {
        animFrame = requestAnimationFrame(tick);
      } else {
        isDone = true;
        updateUI(100);
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => {
            setShouldRender(false);
          }, 450);
        }, 180);
      }
    };

    animFrame = requestAnimationFrame(tick);

    // Guaranteed fallback cap
    const fallbackTimer = setTimeout(() => {
      if (!isDone) {
        isDone = true;
        updateUI(100);
        setIsExiting(true);
        setTimeout(() => setShouldRender(false), 300);
      }
    }, 2200);

    return () => {
      cancelAnimationFrame(animFrame);
      clearTimeout(fallbackTimer);
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      id="gypsym-loader-root"
      role="status"
      aria-label="Loading Gypsym Enterprise Platform"
      aria-live="polite"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#f4f3ef] dark:bg-[#050811] transition-all duration-500 ease-out ${
        isExiting
          ? 'opacity-0 scale-98 pointer-events-none'
          : 'opacity-100 scale-100 pointer-events-auto'
      }`}
    >
      {/* Subtle ambient lighting backdrop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <div className="w-[360px] h-[360px] rounded-full bg-gradient-to-tr from-[#98c22a]/15 via-[#9ae625]/10 to-[#d9127b]/10 blur-[100px] animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-sm">
        {/* Brand Icon Showcase with High-Tech Orbital Ring */}
        <div className="relative mb-6 flex items-center justify-center">
          {/* Animated subtle rotating aura ring */}
          <div className="absolute -inset-2.5 rounded-3xl opacity-70 bg-gradient-to-r from-[#98c22a]/30 via-transparent to-[#d9127b]/30 animate-[spin_8s_linear_infinite]" />

          {/* Premium Glassmorphic Emblem Card */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/90 dark:border-neutral-800/80 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.6)] flex items-center justify-center p-3.5 transition-transform">
            {brandIcon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={brandIcon}
                alt={companyName}
                className="w-full h-full object-contain filter drop-shadow-sm select-none"
              />
            ) : (
              /* Fallback Geometric High-Tech Brand Icon */
              <div className="w-full h-full rounded-xl bg-gradient-to-tr from-[#98c22a] to-[#b8f53c] flex items-center justify-center shadow-inner">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-8 h-8 text-neutral-950"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Company Name */}
        <div className="text-xs sm:text-sm font-semibold tracking-[0.28em] text-neutral-800 dark:text-neutral-200 uppercase font-mono mb-4">
          {companyName}
        </div>

        {/* High-Precision Progress Bar & Status Engine */}
        <div className="w-48 sm:w-56 flex flex-col items-center space-y-2.5">
          {/* Progress Bar Track */}
          <div className="w-full h-[4px] rounded-full bg-neutral-200/80 dark:bg-neutral-800/90 overflow-hidden relative shadow-inner">
            <div
              id="gypsym-loader-bar"
              className="h-full bg-gradient-to-r from-[#98c22a] via-[#b8f53c] to-[#9ae625] rounded-full transition-all duration-75 ease-out relative"
              style={{
                width: `${progress}%`,
                boxShadow: '0 0 14px rgba(154,230,37,0.75)',
              }}
            >
              {/* Glowing flare at leading edge */}
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/70 rounded-full blur-[1px]" />
            </div>
          </div>

          {/* Micro Data Row: Phase Status + Percentage */}
          <div className="w-full flex items-center justify-between text-[10px] font-mono tracking-wider">
            <span
              id="gypsym-loader-phase"
              className="text-neutral-500 dark:text-neutral-400 font-medium truncate max-w-[130px] text-left"
            >
              INITIALIZING CORE SYSTEMS
            </span>
            <span
              id="gypsym-loader-pct"
              className="text-[#98c22a] dark:text-[#b8f53c] font-bold tabular-nums"
            >
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}


