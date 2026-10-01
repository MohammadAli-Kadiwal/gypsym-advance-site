'use client';

import * as React from 'react';
import { settingsService } from '@/services/settings.service';

interface BrandingData {
  companyName: string;
  logoLight: string | null;
  logoDark: string | null;
  favicon: string | null;
}

const BrandingContext = React.createContext<BrandingData>({
  companyName: 'Gypsym Technology',
  logoLight: null,
  logoDark: null,
  favicon: null,
});

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = React.useState<BrandingData>({
    companyName: 'Gypsym Technology',
    logoLight: null,
    logoDark: null,
    favicon: null,
  });

  React.useEffect(() => {
    settingsService
      .getBranding()
      .then((res: any) => {
        if (res) {
          setBranding({
            companyName: res.companyName || 'Gypsym Technology',
            logoLight: res.logoLight || null,
            logoDark: res.logoDark || null,
            favicon: res.favicon || null,
          });
        }
      })
      .catch(() => {/* keep defaults */});
  }, []);

  React.useEffect(() => {
    if (branding.favicon && typeof window !== 'undefined') {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = branding.favicon;
      if (branding.favicon.includes('svg')) {
        link.type = 'image/svg+xml';
      }
    }
  }, [branding.favicon]);

  return (
    <BrandingContext.Provider value={branding}>
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
