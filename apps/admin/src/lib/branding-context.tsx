'use client';

import * as React from 'react';
import { fetchApi } from './api-client';

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
    fetchApi<any>('/branding')
      .then((res) => {
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
