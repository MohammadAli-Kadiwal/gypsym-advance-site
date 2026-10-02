'use client';

import * as React from 'react';
import { settingsService } from '@/services/settings.service';

export interface BrandTokens {
  companyName: string;
  defaultTheme?: 'dark' | 'light' | 'system';
  logoLight: string | null;
  logoDark: string | null;
  favicon: string | null;
  primaryColorHsl: string;
  secondaryColorHsl: string;
  accentColorHsl: string;
  lightBgHsl: string;
  darkBgHsl: string;
  lightBgColor: string;
  darkBgColor: string;
  fontFamily: string;
}

export const DEFAULT_BRAND_TOKENS: BrandTokens = {
  companyName: 'Gypsym Technology',
  defaultTheme: 'light',
  logoLight: null,
  logoDark: null,
  favicon: '/favicon.ico',
  primaryColorHsl: '217 91% 54%',
  secondaryColorHsl: '48 14% 91%',
  accentColorHsl: '217 91% 54%',
  lightBgHsl: '48 18% 95%',
  darkBgHsl: '224 71% 4%',
  lightBgColor: '#f4f3ef',
  darkBgColor: '#030712',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
};

/**
 * Validates HSL color strings to prevent CSS injection.
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

export function sanitizeBrandTokens(raw?: any): BrandTokens {
  if (!raw) return DEFAULT_BRAND_TOKENS;

  const primary = normalizeToHsl(raw.primaryColor || raw.primaryColorHsl || raw.colors?.primary, DEFAULT_BRAND_TOKENS.primaryColorHsl);
  const secondary = normalizeToHsl(raw.secondaryColor || raw.secondaryColorHsl || raw.colors?.secondary, DEFAULT_BRAND_TOKENS.secondaryColorHsl);
  const accent = normalizeToHsl(raw.accentColor || raw.accentColorHsl || raw.colors?.accent, DEFAULT_BRAND_TOKENS.accentColorHsl);

  const lightBgColor = raw.lightBgColor || raw.colors?.lightBgColor || DEFAULT_BRAND_TOKENS.lightBgColor;
  const darkBgColor = raw.darkBgColor || raw.colors?.darkBgColor || DEFAULT_BRAND_TOKENS.darkBgColor;

  const lightBg = lightBgColor ? normalizeToHsl(lightBgColor, DEFAULT_BRAND_TOKENS.lightBgHsl) : DEFAULT_BRAND_TOKENS.lightBgHsl;
  const darkBg = darkBgColor ? normalizeToHsl(darkBgColor, DEFAULT_BRAND_TOKENS.darkBgHsl) : DEFAULT_BRAND_TOKENS.darkBgHsl;

  return {
    companyName: typeof raw.companyName === 'string' && raw.companyName.trim().length > 0
      ? raw.companyName.trim()
      : DEFAULT_BRAND_TOKENS.companyName,
    defaultTheme: raw.defaultTheme === 'dark' || raw.defaultTheme === 'light' || raw.defaultTheme === 'system' ? raw.defaultTheme : 'light',
    logoLight: raw.logoLight || raw.logoLightUrl || null,
    logoDark: raw.logoDark || raw.logoDarkUrl || null,
    favicon: raw.favicon || raw.faviconUrl || DEFAULT_BRAND_TOKENS.favicon,
    primaryColorHsl: primary,
    secondaryColorHsl: secondary,
    accentColorHsl: accent,
    lightBgHsl: lightBg,
    darkBgHsl: darkBg,
    lightBgColor,
    darkBgColor,
    fontFamily: typeof raw.fontFamily === 'string' && /^[a-zA-Z0-9\s,\-_'"]+$/.test(raw.fontFamily)
      ? raw.fontFamily
      : DEFAULT_BRAND_TOKENS.fontFamily,
  };
}

interface BrandingContextValue extends BrandTokens {
  getLogoForTheme: (currentTheme?: string) => string | null;
  refreshBranding: () => Promise<void>;
}

const BrandingContext = React.createContext<BrandingContextValue>({
  ...DEFAULT_BRAND_TOKENS,
  getLogoForTheme: () => null,
  refreshBranding: async () => {},
});

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokens] = React.useState<BrandTokens>(DEFAULT_BRAND_TOKENS);

  const loadFromApiOrStorage = React.useCallback(async () => {
    try {
      const res = await settingsService.getBranding();
      if (res) {
        setTokens((prev) =>
          sanitizeBrandTokens({
            ...prev,
            companyName: res.companyName,
            logoLight: res.logoLight,
            logoDark: res.logoDark,
            favicon: res.favicon,
            primaryColor: res.colors?.primaryColorHsl || res.colors?.primary,
            secondaryColor: res.colors?.secondaryColorHsl || res.colors?.secondary,
            accentColor: res.colors?.accentColorHsl || res.colors?.accent,
            lightBgColor: res.colors?.lightBgColor || res.colors?.lightBg,
            darkBgColor: res.colors?.darkBgColor || res.colors?.darkBg,
            fontFamily: res.typography?.fontFamily,
          })
        );
      }
    } catch {
      // Check localStorage for offline / unsaved studio previews
      try {
        const stored = localStorage.getItem('gypsym_branding_settings');
        if (stored) {
          const parsed = JSON.parse(stored);
          setTokens((prev) => sanitizeBrandTokens({ ...prev, ...parsed }));
        }
      } catch {
        // Ignore storage errors
      }
    }
  }, []);

  React.useEffect(() => {
    loadFromApiOrStorage();

    const handleStorage = () => {
      try {
        const stored = localStorage.getItem('gypsym_branding_settings');
        if (stored) {
          const parsed = JSON.parse(stored);
          setTokens((prev) =>
            sanitizeBrandTokens({
              ...prev,
              companyName: parsed.companyName,
              logoLight: parsed.logoLightUrl || parsed.logoLight,
              logoDark: parsed.logoDarkUrl || parsed.logoDark,
              favicon: parsed.faviconUrl || parsed.favicon,
              primaryColor: parsed.primaryColor,
              secondaryColor: parsed.secondaryColor,
              accentColor: parsed.accentColor,
              lightBgColor: parsed.lightBgColor,
              darkBgColor: parsed.darkBgColor,
              fontFamily: parsed.fontFamily,
            })
          );
        }
      } catch {
        // Ignore
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [loadFromApiOrStorage]);

  // Favicon dynamic injection
  React.useEffect(() => {
    if (tokens.favicon && typeof window !== 'undefined') {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = tokens.favicon;
      if (tokens.favicon.includes('svg') || tokens.favicon.startsWith('data:image/svg')) {
        link.type = 'image/svg+xml';
      }
    }
  }, [tokens.favicon]);

  const getLogoForTheme = React.useCallback(
    (currentTheme?: string) => {
      const isDark = currentTheme === 'dark';
      if (isDark && isValidImageUrl(tokens.logoDark)) return tokens.logoDark;
      if (!isDark && isValidImageUrl(tokens.logoLight)) return tokens.logoLight;
      if (isValidImageUrl(tokens.logoLight)) return tokens.logoLight;
      if (isValidImageUrl(tokens.logoDark)) return tokens.logoDark;
      if (isValidImageUrl(tokens.favicon)) return tokens.favicon;
      return null;
    },
    [tokens.logoDark, tokens.logoLight, tokens.favicon]
  );

  // Dynamic CSS variables synced with the website branding design system
  const dynamicCss = `
    :root {
      --primary: ${tokens.primaryColorHsl};
      --ring: ${tokens.primaryColorHsl};
      --sidebar-primary: ${tokens.primaryColorHsl};
      --accent: ${tokens.accentColorHsl};
      --background: ${tokens.lightBgHsl};
    }
    .dark {
      --primary: ${tokens.primaryColorHsl};
      --ring: ${tokens.primaryColorHsl};
      --sidebar-primary: ${tokens.primaryColorHsl};
      --accent: ${tokens.accentColorHsl};
      --background: ${tokens.darkBgHsl};
    }
  `;

  return (
    <BrandingContext.Provider
      value={{
        ...tokens,
        getLogoForTheme,
        refreshBranding: loadFromApiOrStorage,
      }}
    >
      <style id="gypsym-admin-dynamic-branding" dangerouslySetInnerHTML={{ __html: dynamicCss }} />
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  return React.useContext(BrandingContext);
}

/** Returns true if the URL is a usable image source */
export function isValidImageUrl(url?: string | null): boolean {
  if (!url) return false;
  if (url === '/logo-light.svg' || url === '/logo-dark.svg') return false;
  return (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('/')
  );
}
