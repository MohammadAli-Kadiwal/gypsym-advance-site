'use client';

import * as React from 'react';
import Link from 'next/link';
import { NavigationDto, BrandSettingsDto } from '@/lib/cms-types';
import { Container } from './ui/container';

interface FooterViewProps {
  navigation: NavigationDto | null;
  brand: BrandSettingsDto | null;
}

function isValidLogoUrl(url?: string | null): boolean {
  if (!url) return false;
  return (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('/')
  );
}

export function FooterView({ navigation, brand }: FooterViewProps) {
  const navItems = navigation?.items || [];
  const currentYear = new Date().getFullYear();

  const getResolvedLogo = (light?: string | null, dark?: string | null): string | null => {
    if (isValidLogoUrl(light)) return light!;
    if (isValidLogoUrl(dark)) return dark!;
    return null;
  };

  // Dynamic live branding with backend + local storage synchronization
  const [liveLogo, setLiveLogo] = React.useState<string | null>(() => {
    return getResolvedLogo(brand?.logoLight, brand?.logoDark);
  });
  const [liveBrandName, setLiveBrandName] = React.useState<string>(() => {
    return brand?.companyName || 'Gypsym';
  });
  const [imgError, setImgError] = React.useState(false);

  React.useEffect(() => {
    const valid = getResolvedLogo(brand?.logoLight, brand?.logoDark);
    setLiveLogo(valid);
    setImgError(false);
    if (brand?.companyName) setLiveBrandName(brand.companyName);
  }, [brand]);

  React.useEffect(() => {
    const updateFromStorage = () => {
      try {
        const stored = localStorage.getItem('gypsym_branding_settings');
        if (stored) {
          const parsed = JSON.parse(stored);
          const valid = getResolvedLogo(parsed.logoLightUrl, parsed.logoDarkUrl);
          if (valid !== null) {
            setLiveLogo(valid);
            setImgError(false);
          }
          if (parsed.companyName) {
            setLiveBrandName(parsed.companyName);
          }
        }
      } catch {}
    };

    updateFromStorage();
    window.addEventListener('storage', updateFromStorage);
    return () => window.removeEventListener('storage', updateFromStorage);
  }, []);

  return (
    <footer className="border-t border-border bg-card/40 pt-16 pb-12 mt-auto">
      <Container size="2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-border/80">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-3 group inline-flex" aria-label="Home">
              {liveLogo && !imgError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={liveLogo}
                  alt={liveBrandName || 'Logo'}
                  className="h-9 w-auto max-w-[180px] object-contain group-hover:scale-105 transition-transform"
                  onError={() => setImgError(true)}
                />
              ) : (
                <>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-mono font-bold group-hover:scale-105 transition-transform shrink-0">
                    {liveBrandName ? liveBrandName.charAt(0).toUpperCase() : 'G'}
                  </div>
                  {liveBrandName && (
                    <div className="flex flex-col">
                      <span className="font-bold tracking-tight text-foreground text-lg leading-tight">
                        {liveBrandName}
                      </span>
                    </div>
                  )}
                </>
              )}
            </Link>

            {/* Dynamic Social Links */}
            {brand?.socialLinks && brand.socialLinks.length > 0 && (
              <div className="pt-2 flex flex-wrap gap-3">
                {brand.socialLinks
                  .filter((s) => s.isActive !== false)
                  .map((s, idx) => (
                    <a
                      key={idx}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-foreground capitalize transition-colors"
                    >
                      {s.platform}
                    </a>
                  ))}
              </div>
            )}
          </div>

          {/* Dynamic Navigation Columns */}
          {navItems.length > 0 && (
            <div className="lg:col-span-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {navItems.map((item) => (
                  <div key={item.id} className="space-y-3">
                    <Link
                      href={item.url}
                      target={item.isExternal ? '_blank' : undefined}
                      rel={item.isExternal ? 'noopener noreferrer' : undefined}
                      className="text-sm font-medium text-foreground hover:text-primary transition-colors block"
                    >
                      {item.label}
                    </Link>
                    {item.children && item.children.length > 0 && (
                      <ul className="space-y-2">
                        {item.children
                          .filter((c) => c.isActive !== false)
                          .map((child) => (
                            <li key={child.id}>
                              <Link
                                href={child.url}
                                target={child.isExternal ? '_blank' : undefined}
                                rel={child.isExternal ? 'noopener noreferrer' : undefined}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sub-footer */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div>
            {liveBrandName && (
              <span>
                © {currentYear} {liveBrandName}. All rights reserved.
              </span>
            )}
          </div>
        </div>
      </Container>
    </footer>
  );
}
