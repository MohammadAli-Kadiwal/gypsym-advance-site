'use client';

import * as React from 'react';
import {
  RevealDirection,
  MotionIntensity,
  MOTION_TOKENS,
} from './motion-tokens';

export interface ScrollRevealProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  direction?: RevealDirection;
  intensity?: MotionIntensity;
  duration?: number;
  delay?: number;
  once?: boolean;
  repeat?: boolean;
  distance?: number;
  easing?: string;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  as?: React.ElementType;
}

export function ScrollReveal({
  children,
  direction = 'up',
  intensity = 'subtle',
  duration = MOTION_TOKENS.duration.normal,
  delay = 0,
  once = true,
  repeat = false,
  distance: customDistance,
  easing = MOTION_TOKENS.easing.standard,
  threshold = 0.12,
  rootMargin = '0px 0px -40px 0px',
  className = '',
  as: Component = 'div',
  style,
  ...rest
}: ScrollRevealProps) {
  const Comp = Component as any;
  const ref = React.useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = React.useState<boolean>(false);
  const [hasRevealed, setHasRevealed] = React.useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState<boolean>(false);
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  // Check reduced-motion and viewport width
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleMotion = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleMotion);

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });

    return () => {
      mediaQuery.removeEventListener('change', handleMotion);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Intersection Observer for Bidirectional Scroll Reveal
  const shouldOnlyAnimateOnce = once && !repeat;

  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === 'undefined') return;

    if (prefersReducedMotion) {
      setIsVisible(true);
      setHasRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasRevealed(true);
          if (shouldOnlyAnimateOnce) {
            observer.unobserve(el);
          }
        } else if (!shouldOnlyAnimateOnce) {
          // Re-arm animation when scrolled out of view in either direction (scrolling up or down)
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [shouldOnlyAnimateOnce, threshold, rootMargin, prefersReducedMotion]);

  // Compute transform offsets
  const dist =
    customDistance !== undefined
      ? customDistance
      : isMobile
      ? MOTION_TOKENS.distance.mobile[intensity]
      : MOTION_TOKENS.distance.desktop[intensity];

  // For mobile, simplify horizontal translation to prevent page-level horizontal overflow
  const effectiveDirection: RevealDirection =
    isMobile && (direction === 'left' || direction === 'right') ? 'up' : direction;

  const getInitialTransform = (): string => {
    switch (effectiveDirection) {
      case 'up':
        return `translate3d(0, ${dist}px, 0)`;
      case 'down':
        return `translate3d(0, -${dist}px, 0)`;
      case 'left':
        return `translate3d(-${dist}px, 0, 0)`;
      case 'right':
        return `translate3d(${dist}px, 0, 0)`;
      case 'scale':
        return 'scale3d(0.95, 0.95, 1)';
      case 'fade':
      default:
        return 'translate3d(0, 0, 0)';
    }
  };

  const initialTransform = getInitialTransform();

  // If reduced-motion is requested, don't animate transforms
  if (prefersReducedMotion) {
    return (
      <Comp
        ref={ref}
        className={className}
        style={{ ...style }}
        {...rest}
      >
        {children}
      </Comp>
    );
  }

  const isShowing = isVisible || (shouldOnlyAnimateOnce && hasRevealed);

  return (
    <Comp
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: isShowing ? 1 : 0,
        transform: isShowing ? 'translate3d(0, 0, 0) scale3d(1, 1, 1)' : initialTransform,
        transitionProperty: 'opacity, transform',
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: easing,
        transitionDelay: `${delay}ms`,
        willChange: isShowing ? 'auto' : 'opacity, transform',
      }}
      {...rest}
    >
      {children}
    </Comp>
  );
}
