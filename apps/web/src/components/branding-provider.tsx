'use client';

import * as React from 'react';

export interface BrandTokens {
  companyName: string;
  defaultTheme?: 'dark' | 'light' | 'system';
  logoLightUrl?: string;
  logoDarkUrl?: string;
  faviconUrl?: string;
  primaryColorHsl: string; // e.g. "217 91% 60%" or hex "#3b82f6"
  secondaryColorHsl: string; // e.g. "217.2 32.6% 14%"
  accentColorHsl: string; // e.g. "217 91% 60%"
  lightBgHsl: string; // e.g. "210 40% 98%" or hex "#f8fafc"
  darkBgHsl: string; // e.g. "224 71% 4%" or hex "#030712"
  lightBgColor?: string; // Optional raw hex
  darkBgColor?: string; // Optional raw hex
  fontFamily: string; // e.g. "Plus Jakarta Sans, sans-serif"
  contactEmail: string;
  contactPhone: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

// 1. Design-System Sensible Defaults (Zero-Breakage Fallback)
export const DEFAULT_BRAND_TOKENS: BrandTokens = {
  companyName: 'Gypsym',
  defaultTheme: 'dark',
  logoLightUrl: '/logo-light.svg',
  logoDarkUrl: '/logo-dark.svg',
  faviconUrl: '/favicon.ico',
  primaryColorHsl: '217 91% 60%',
  secondaryColorHsl: '217.2 32.6% 14%',
  accentColorHsl: '217 91% 60%',
  lightBgHsl: '48 18% 95%',
  darkBgHsl: '224 71% 4%',
  lightBgColor: '#f4f3ef',
  darkBgColor: '#030712',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  contactEmail: 'advisory@gypsym.com',
  contactPhone: '+1-212-555-0199',
  socialLinks: {
    linkedin: 'https://linkedin.com/company/gypsym',
    twitter: 'https://twitter.com/gypsymtech',
    github: 'https://github.com/gypsym',
  },
};

/**
 * Validates HSL color strings to prevent CSS injection attacks.
 * Accepts formats: "217 91% 60%" or "217.2 32.6% 14%"
 */
export function isValidHslString(val: unknown): boolean {
  if (typeof val !== 'string') return false;
  const hslPattern = /^[0-9]+(\.[0-9]+)?\s+[0-9]+(\.[0-9]+)?%\s+[0-9]+(\.[0-9]+)?%$/;
  return hslPattern.test(val.trim());
}

/**
 * Converts Hex string (#ffffff, #030712) to HSL space-separated format ("224 71% 4%")
 */
export function hexToHsl(hex: string): string | null {
  let cleaned = hex.trim().replace(/^#/, '');
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map((c) => c + c).join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return null;

  const r = parseInt(cleaned.substring(0, 2), 16) / 255;
  const g = parseInt(cleaned.substring(2, 4), 16) / 255;
  const b = parseInt(cleaned.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  const hDeg = Math.round(h * 360 * 10) / 10;
  const sPct = Math.round(s * 100 * 10) / 10;
  const lPct = Math.round(l * 100 * 10) / 10;
  return `${hDeg} ${sPct}% ${lPct}%`;
}

/**
 * Normalizes Hex or HSL color string to safe HSL token.
 */
export function normalizeToHsl(val: unknown, fallback: string): string {
  if (typeof val !== 'string') return fallback;
  const trimmed = val.trim();
  if (isValidHslString(trimmed)) return trimmed;
  if (trimmed.startsWith('#') || /^[0-9a-fA-F]{3,6}$/.test(trimmed)) {
    const converted = hexToHsl(trimmed);
    if (converted) return converted;
  }
  return fallback;
}

/**
 * Sanitizes and validates admin brand configuration before emitting CSS properties.
 */
export function sanitizeBrandTokens(raw?: Partial<BrandTokens & { lightBgColor?: string; darkBgColor?: string }> | null): BrandTokens {
  if (!raw) return DEFAULT_BRAND_TOKENS;

  // Prefer lightBgColor if provided and convert
  const lightBg = raw.lightBgColor
    ? normalizeToHsl(raw.lightBgColor, DEFAULT_BRAND_TOKENS.lightBgHsl)
    : normalizeToHsl(raw.lightBgHsl, DEFAULT_BRAND_TOKENS.lightBgHsl);

  const darkBg = raw.darkBgColor
    ? normalizeToHsl(raw.darkBgColor, DEFAULT_BRAND_TOKENS.darkBgHsl)
    : normalizeToHsl(raw.darkBgHsl, DEFAULT_BRAND_TOKENS.darkBgHsl);

  const primary = normalizeToHsl(raw.primaryColorHsl, DEFAULT_BRAND_TOKENS.primaryColorHsl);
  const secondary = normalizeToHsl(raw.secondaryColorHsl, DEFAULT_BRAND_TOKENS.secondaryColorHsl);
  const accent = normalizeToHsl(raw.accentColorHsl, DEFAULT_BRAND_TOKENS.accentColorHsl);

  const defaultTheme: 'dark' | 'light' | 'system' =
    raw.defaultTheme === 'light' || raw.defaultTheme === 'dark' || raw.defaultTheme === 'system'
      ? raw.defaultTheme
      : 'dark';

  return {
    companyName:
      typeof raw.companyName === 'string' && raw.companyName.trim().length > 0
        ? raw.companyName.trim()
        : DEFAULT_BRAND_TOKENS.companyName,
    defaultTheme,
    logoLightUrl: raw.logoLightUrl || DEFAULT_BRAND_TOKENS.logoLightUrl,
    logoDarkUrl: raw.logoDarkUrl || DEFAULT_BRAND_TOKENS.logoDarkUrl,
    faviconUrl: raw.faviconUrl || DEFAULT_BRAND_TOKENS.faviconUrl,
    primaryColorHsl: primary,
    secondaryColorHsl: secondary,
    accentColorHsl: accent,
    lightBgHsl: lightBg,
    darkBgHsl: darkBg,
    lightBgColor: raw.lightBgColor || DEFAULT_BRAND_TOKENS.lightBgColor,
    darkBgColor: raw.darkBgColor || DEFAULT_BRAND_TOKENS.darkBgColor,
    fontFamily:
      typeof raw.fontFamily === 'string' && /^[a-zA-Z0-9\s,\-_'"]+$/.test(raw.fontFamily)
        ? raw.fontFamily
        : DEFAULT_BRAND_TOKENS.fontFamily,
    contactEmail: raw.contactEmail || DEFAULT_BRAND_TOKENS.contactEmail,
    contactPhone: raw.contactPhone || DEFAULT_BRAND_TOKENS.contactPhone,
    socialLinks: {
      linkedin: raw.socialLinks?.linkedin || DEFAULT_BRAND_TOKENS.socialLinks?.linkedin,
      twitter: raw.socialLinks?.twitter || DEFAULT_BRAND_TOKENS.socialLinks?.twitter,
      github: raw.socialLinks?.github || DEFAULT_BRAND_TOKENS.socialLinks?.github,
    },
  };
}

/**
 * Dynamic Branding Token Style Injector
 * Emits CSS custom properties directly into the document <head>.
 * Enables dynamic whole-website background colors for both light mode and dark mode.
 */
export function DynamicBrandStyleTag({ tokens }: { tokens?: Partial<BrandTokens> | null }) {
  const [liveTokens, setLiveTokens] = React.useState<BrandTokens>(() => sanitizeBrandTokens(tokens));

  React.useEffect(() => {
    const updateFromStorage = () => {
      try {
        const stored = localStorage.getItem('gypsym_branding_settings');
        if (stored) {
          const parsed = JSON.parse(stored);
          setLiveTokens(
            sanitizeBrandTokens({
              ...tokens,
              defaultTheme: parsed.defaultTheme,
              primaryColorHsl: parsed.primaryColor,
              secondaryColorHsl: parsed.secondaryColor,
              accentColorHsl: parsed.accentColor,
              lightBgColor: parsed.lightBgColor,
              darkBgColor: parsed.darkBgColor,
              lightBgHsl: parsed.lightBgColor ? hexToHsl(parsed.lightBgColor) || undefined : undefined,
              darkBgHsl: parsed.darkBgColor ? hexToHsl(parsed.darkBgColor) || undefined : undefined,
            })
          );
        }
      } catch {
        // Ignore storage access errors
      }
    };

    updateFromStorage();
    window.addEventListener('storage', updateFromStorage);
    return () => window.removeEventListener('storage', updateFromStorage);
  }, [tokens]);

  const css = `
    :root {
      --background: ${liveTokens.lightBgHsl};
      --primary: ${liveTokens.primaryColorHsl};
      --accent: ${liveTokens.accentColorHsl};
      --font-brand: ${liveTokens.fontFamily};
    }
    .dark {
      --background: ${liveTokens.darkBgHsl};
      --primary: ${liveTokens.primaryColorHsl};
      --secondary: ${liveTokens.secondaryColorHsl};
      --accent: ${liveTokens.accentColorHsl};
    }
  `;

  return (
    <style
      id="gypsym-brand-tokens"
      dangerouslySetInnerHTML={{ __html: css }}
    />
  );
}
