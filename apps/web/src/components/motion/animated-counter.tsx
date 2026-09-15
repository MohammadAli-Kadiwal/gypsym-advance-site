'use client';

import * as React from 'react';

export interface ParsedNumeric {
  prefix: string;
  value: number | null;
  suffix: string;
  decimals: number;
  hasCommas: boolean;
  isRange?: boolean;
  rangeSeparator?: string;
  rangeEndValue?: number | null;
  rangeEndDecimals?: number;
}

/**
 * Smartly parse any string with a number into prefix, numeric value, suffix,
 * decimal count, and whether commas were used.
 * Supports single numbers ($2,333,906, < 0.8s, 25+) as well as ranges (40-60%, 40–60%).
 */
export function parseNumericString(input: string | number): ParsedNumeric {
  if (typeof input === 'number') {
    const str = String(input);
    const decIndex = str.indexOf('.');
    const decimals = decIndex >= 0 ? str.length - decIndex - 1 : 0;
    return {
      prefix: '',
      value: input,
      suffix: '',
      decimals,
      hasCommas: input >= 1000,
    };
  }

  const clean = String(input).trim();

  // Check for range pattern (e.g. "40-60%", "40–60%", "10–20+")
  const rangeMatch = clean.match(/^([^\d.]*?)([0-9][0-9,]*(?:\.[0-9]+)?)\s*([–\-—~])\s*([0-9][0-9,]*(?:\.[0-9]+)?)(.*)$/s);
  if (rangeMatch) {
    const prefix = rangeMatch[1] || '';
    const num1Raw = rangeMatch[2] || '';
    const rangeSep = rangeMatch[3] || '–';
    const num2Raw = rangeMatch[4] || '';
    const suffix = rangeMatch[5] || '';
    const hasCommas = num1Raw.includes(',') || num2Raw.includes(',');
    const val1 = parseFloat(num1Raw.replace(/,/g, ''));
    const val2 = parseFloat(num2Raw.replace(/,/g, ''));
    const dec1 = num1Raw.includes('.') ? num1Raw.length - num1Raw.indexOf('.') - 1 : 0;
    const dec2 = num2Raw.includes('.') ? num2Raw.length - num2Raw.indexOf('.') - 1 : 0;

    return {
      prefix,
      value: isNaN(val1) ? null : val1,
      suffix,
      decimals: dec1,
      hasCommas,
      isRange: true,
      rangeSeparator: rangeSep,
      rangeEndValue: isNaN(val2) ? null : val2,
      rangeEndDecimals: dec2,
    };
  }

  // Match single number with prefix and suffix
  const match = clean.match(/^([^\d.]*?)([0-9][0-9,]*(?:\.[0-9]+)?)(.*)$/s);
  if (!match) {
    return {
      prefix: '',
      value: null,
      suffix: clean,
      decimals: 0,
      hasCommas: false,
    };
  }

  const prefix = match[1] || '';
  const numRaw = match[2] || '';
  const suffix = match[3] || '';
  const hasCommas = numRaw.includes(',');
  const cleanNum = numRaw.replace(/,/g, '');
  const value = parseFloat(cleanNum);
  const decIndex = numRaw.indexOf('.');
  const decimals = decIndex >= 0 ? numRaw.length - decIndex - 1 : 0;

  return {
    prefix,
    value: isNaN(value) ? null : value,
    suffix,
    decimals,
    hasCommas,
  };
}

/**
 * Formats a number with specified decimal precision and optional comma grouping.
 */
export function formatCounterNumber(
  num: number,
  decimals: number = 0,
  hasCommas: boolean = false
): string {
  if (decimals > 0) {
    const fixed = num.toFixed(decimals);
    if (!hasCommas) return fixed;
    const parts = fixed.split('.');
    const integerPart = (parts[0] ?? '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.length > 1 ? `${integerPart}.${parts[1] ?? ''}` : integerPart;
  }
  const rounded = Math.round(num);
  if (hasCommas) {
    return rounded.toLocaleString('en-US');
  }
  return String(rounded);
}

export interface AnimatedCounterProps extends React.HTMLAttributes<HTMLElement> {
  value: number | string;
  from?: number;
  duration?: number; // duration in seconds (default 1.6)
  delay?: number; // delay in milliseconds (default 0)
  easing?: 'expo' | 'cubic' | 'quad' | 'linear';
  prefix?: string;
  suffix?: string;
  decimals?: number;
  useGrouping?: boolean;
  once?: boolean;
  threshold?: number;
  rootMargin?: string;
  as?: React.ElementType;
}

export function AnimatedCounter({
  value: rawValue,
  from = 0,
  duration = 1.6,
  delay = 0,
  easing = 'cubic',
  prefix: overridePrefix,
  suffix: overrideSuffix,
  decimals: overrideDecimals,
  useGrouping: overrideGrouping,
  once = true,
  threshold = 0.2,
  rootMargin = '0px 0px -20px 0px',
  as: Component = 'span',
  className = '',
  ...rest
}: AnimatedCounterProps) {
  const containerRef = React.useRef<HTMLElement>(null);
  const parsed = React.useMemo(() => parseNumericString(rawValue), [rawValue]);

  const targetValue = parsed.value;
  const isRange = Boolean(parsed.isRange && parsed.rangeEndValue !== null);
  const targetEndValue = parsed.rangeEndValue ?? 0;
  const rangeSeparator = parsed.rangeSeparator ?? '–';
  const rangeEndDecimals = parsed.rangeEndDecimals ?? 0;

  const prefix = overridePrefix !== undefined ? overridePrefix : parsed.prefix;
  const suffix = overrideSuffix !== undefined ? overrideSuffix : parsed.suffix;
  const decimals = overrideDecimals !== undefined ? overrideDecimals : parsed.decimals;
  const hasCommas = overrideGrouping !== undefined ? overrideGrouping : parsed.hasCommas;

  // If no numeric target could be extracted, render original string cleanly
  if (targetValue === null) {
    const Comp = Component as any;
    return (
      <Comp ref={containerRef} className={className} {...rest}>
        {String(rawValue)}
      </Comp>
    );
  }

  const [currentValue, setCurrentValue] = React.useState<number>(from);
  const [currentEndValue, setCurrentEndValue] = React.useState<number>(from);
  const [hasStarted, setHasStarted] = React.useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState<boolean>(false);

  // Check reduced motion preference
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // IntersectionObserver to trigger animation when scrolled into view
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof window === 'undefined') return;

    if (prefersReducedMotion) {
      setCurrentValue(targetValue);
      if (isRange) setCurrentEndValue(targetEndValue);
      setHasStarted(true);
      return;
    }

    const triggerIfVisible = () => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        setHasStarted(true);
        if (once) {
          observer.disconnect();
        }
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setHasStarted(true);
          if (once) {
            observer.unobserve(el);
          }
        } else if (!once) {
          // Re-arm when scrolled out of view
          setHasStarted(false);
          setCurrentValue(from);
          if (isRange) setCurrentEndValue(from);
        }
      },
      { threshold: threshold ?? 0.1, rootMargin: rootMargin ?? '50px 0px 50px 0px' }
    );

    observer.observe(el);

    // Also check immediately after mount (in case already in viewport)
    // Use rAF so layout is settled before measuring
    const rafId = requestAnimationFrame(triggerIfVisible);

    // Also check after full page load (images/fonts may shift layout)
    const onLoad = () => triggerIfVisible();
    window.addEventListener('load', onLoad, { once: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('load', onLoad);
      observer.disconnect();
    };
  }, [once, threshold, rootMargin, prefersReducedMotion, targetValue, targetEndValue, isRange, from]);

  // requestAnimationFrame counter runner
  React.useEffect(() => {
    if (!hasStarted) return;
    if (prefersReducedMotion) {
      setCurrentValue(targetValue);
      if (isRange) setCurrentEndValue(targetEndValue);
      return;
    }

    let rafId: number;
    let timeoutId: NodeJS.Timeout;

    const startAnimation = () => {
      const startTime = performance.now();
      const totalDuration = duration * 1000;
      const startVal = from;
      const diff1 = targetValue - startVal;
      const diff2 = isRange ? targetEndValue - startVal : 0;

      const easeFunc = (t: number): number => {
        switch (easing) {
          case 'expo':
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
          case 'quad':
            return 1 - (1 - t) * (1 - t);
          case 'linear':
            return t;
          case 'cubic':
          default:
            return 1 - Math.pow(1 - t, 3);
        }
      };

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / totalDuration);
        const eased = easeFunc(progress);

        const nextVal1 = startVal + diff1 * eased;
        setCurrentValue(nextVal1);

        if (isRange) {
          const nextVal2 = startVal + diff2 * eased;
          setCurrentEndValue(nextVal2);
        }

        if (progress < 1) {
          rafId = requestAnimationFrame(tick);
        } else {
          setCurrentValue(targetValue);
          if (isRange) setCurrentEndValue(targetEndValue);
        }
      };

      rafId = requestAnimationFrame(tick);
    };

    if (delay > 0) {
      timeoutId = setTimeout(startAnimation, delay);
    } else {
      startAnimation();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [hasStarted, targetValue, targetEndValue, isRange, from, duration, delay, easing, prefersReducedMotion]);

  const Comp = Component as any;

  return (
    <Comp ref={containerRef} className={className} {...rest}>
      {prefix}
      {formatCounterNumber(currentValue, decimals, hasCommas)}
      {isRange && (
        <>
          {rangeSeparator}
          {formatCounterNumber(currentEndValue, rangeEndDecimals, hasCommas)}
        </>
      )}
      {suffix}
    </Comp>
  );
}
