'use client';

import * as React from 'react';
import Image from 'next/image';
import { BrandSettingsDto } from '@/lib/cms-types';

interface GlobalWebsiteLoaderProps {
  brand?: BrandSettingsDto | null;
}

export function GlobalWebsiteLoader({ brand }: GlobalWebsiteLoaderProps) {
  const [progress, setProgress] = React.useState<number>(0);
  const [isExiting, setIsExiting] = React.useState<boolean>(false);
  const [shouldRender, setShouldRender] = React.useState<boolean>(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState<boolean>(false);

  // Dynamic branding attributes
  const companyName = brand?.companyName || 'Gypsym Technology';
  const logoLight = brand?.logoLight || '';
  const logoDark = brand?.logoDark || logoLight;
  const hasLogo = Boolean(logoLight || logoDark);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Check if initial session boot already completed
    const hasLoadedThisSession = sessionStorage.getItem('gypsym_initial_boot_done');
    if (hasLoadedThisSession) {
      setShouldRender(false);
      return;
    }

    // Smooth simulated progress from 0 to 100%
    const startTime = performance.now();
    const duration = 650; // ms for smooth progression

    let animFrame: number;
    const updateProgress = (now: number) => {
      const elapsed = now - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct < 100) {
        animFrame = requestAnimationFrame(updateProgress);
      } else {
        // Complete! Wait a moment for visual satisfaction, then trigger smooth exit
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => {
            setShouldRender(false);
            sessionStorage.setItem('gypsym_initial_boot_done', 'true');
          }, 450);
        }, 120);
      }
    };

    animFrame = requestAnimationFrame(updateProgress);

    // Safety timeout cap (1.5s max)
    const safetyTimeout = setTimeout(() => {
      setProgress(100);
      setIsExiting(true);
      setTimeout(() => {
        setShouldRender(false);
        sessionStorage.setItem('gypsym_initial_boot_done', 'true');
      }, 300);
    }, 1500);

    return () => {
      cancelAnimationFrame(animFrame);
      clearTimeout(safetyTimeout);
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      role="status"
      aria-label="Loading application"
      aria-live="polite"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#f4f3ef] dark:bg-[#050811] transition-all ${
        prefersReducedMotion ? 'duration-200' : 'duration-500'
      } ease-out ${
        isExiting
          ? 'opacity-0 scale-95 pointer-events-none'
          : 'opacity-100 scale-100 pointer-events-auto'
      }`}
    >
      <div className="flex flex-col items-center justify-center max-w-xs text-center px-4 space-y-4">
        {/* Dynamic Logo or Fallback Text */}
        {hasLogo ? (
          /* When logo image exists: show ONLY the image, NO company name text */
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center animate-in fade-in zoom-in-95 duration-500">
            {logoDark && (
              <Image
                src={logoDark}
                alt="Brand Logo"
                width={80}
                height={80}
                className="hidden dark:block object-contain max-h-16 w-auto"
                priority
              />
            )}
            {logoLight && (
              <Image
                src={logoLight}
                alt="Brand Logo"
                width={80}
                height={80}
                className="block dark:hidden object-contain max-h-16 w-auto"
                priority
              />
            )}
          </div>
        ) : (
          /* When NO logo image exists: show company name text and emblem */
          <div className="flex flex-col items-center space-y-2 animate-in fade-in duration-400">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#d9127b] to-[#ff4b8b] flex items-center justify-center shadow-lg shadow-[#d9127b]/25">
              <span className="text-white text-lg font-bold font-mono">G</span>
            </div>
            <div className="text-sm font-bold tracking-wider text-neutral-900 dark:text-neutral-100 uppercase">
              {companyName}
            </div>
          </div>
        )}

        {/* Loading Progress Bar & Percentage */}
        <div className="flex flex-col items-center space-y-2 w-36 sm:w-44 pt-1">
          <div className="w-full h-[3px] rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden relative shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#d9127b] to-[#ff4b8b] rounded-full transition-all duration-100 ease-out"
              style={{
                width: `${progress}%`,
                boxShadow: '0 0 12px rgba(217,18,123,0.6)',
              }}
            />
          </div>

          <span className="text-[11px] font-mono font-semibold text-neutral-500 dark:text-neutral-400 tabular-nums tracking-wider">
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
}
