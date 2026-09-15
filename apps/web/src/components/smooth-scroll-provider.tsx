'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

interface SmoothScrollContextType {
  lenis: Lenis | null;
  scrollTo: (target: string | number | HTMLElement, options?: Record<string, any>) => void;
}

const SmoothScrollContext = React.createContext<SmoothScrollContextType>({
  lenis: null,
  scrollTo: () => {},
});

export const useSmoothScroll = () => React.useContext(SmoothScrollContext);

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lenisRef = React.useRef<Lenis | null>(null);

  React.useEffect(() => {
    // Respect reduced-motion preferences
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    // Initialize Lenis smooth scroll instance
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      autoResize: true,
    });

    lenisRef.current = lenis;
    (window as any).lenis = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Keep Lenis updated on window resize
    const handleResize = () => {
      lenis.resize();
    };
    window.addEventListener('resize', handleResize);

    // Intercept in-page hash links (e.g. href="#portfolio-grid", href="#contact-inquiry") for butter-smooth scrolling
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        const id = href.slice(1);
        const element = document.getElementById(id) || document.querySelector(href);
        if (element) {
          e.preventDefault();
          lenis.scrollTo(element as HTMLElement, { offset: -20, duration: 1.2 });
        }
      }
    };
    document.addEventListener('click', handleAnchorClick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('click', handleAnchorClick);
      lenis.destroy();
      lenisRef.current = null;
      delete (window as any).lenis;
    };
  }, []);

  // On route change across any page, recalculate scroll dimensions and reset
  React.useEffect(() => {
    const timer = setTimeout(() => {
      lenisRef.current?.resize();
    }, 50);
    return () => clearTimeout(timer);
  }, [pathname]);

  const scrollTo = React.useCallback(
    (target: string | number | HTMLElement, options?: Record<string, any>) => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target as any, options);
      } else if (typeof window !== 'undefined') {
        if (typeof target === 'number') {
          window.scrollTo({ top: target, behavior: 'smooth' });
        } else if (typeof target === 'string') {
          const el = document.querySelector(target);
          el?.scrollIntoView({ behavior: 'smooth' });
        } else if (target instanceof HTMLElement) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
    []
  );

  return (
    <SmoothScrollContext.Provider value={{ lenis: lenisRef.current, scrollTo }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
