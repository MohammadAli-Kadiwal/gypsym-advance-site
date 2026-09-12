'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Search,
  ChevronDown,
  ArrowUpRight,
  Check,
} from 'lucide-react';
import {
  NavigationDto,
  BrandSettingsDto,
  HeaderConfigDto,
} from '@/lib/cms-types';
import { ThemeToggle } from './theme-toggle';
import { MegaMenu } from './cms/mega-menu';

interface HeaderViewProps {
  navigation: NavigationDto | null;
  brand: BrandSettingsDto | null;
  config: HeaderConfigDto | null;
}

export function HeaderView({ navigation, brand, config }: HeaderViewProps) {
  const pathname = usePathname();
  const [headerVisible, setHeaderVisible] = React.useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = React.useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = React.useState<Record<string, boolean>>({});
  const lastScrollY = React.useRef(0);
  const ticking = React.useRef(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY.current;

        if (currentY < 70) {
          // Always show near top
          setHeaderVisible(true);
        } else if (delta > 14 && currentY > 120) {
          // Scrolling DOWN firmly — smooth hide
          setHeaderVisible(false);
        } else if (delta < -10) {
          // Scrolling UP — smooth show
          setHeaderVisible(true);
        }

        lastScrollY.current = currentY;
        ticking.current = false;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mega menu on route change
  React.useEffect(() => {
    setActiveMegaMenu(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  const navItems = navigation?.items || [];
  const cta = config?.cta;

  const isValidLogoUrl = (url?: string | null): boolean => {
    if (!url) return false;
    return (
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('data:') ||
      url.startsWith('/')
    );
  };

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
    return brand?.companyName || '';
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

  const handleMouseEnter = (itemId: string, hasMegaMenu: boolean) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (hasMegaMenu) {
      setActiveMegaMenu(itemId);
    } else {
      setActiveMegaMenu(null);
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 200);
  };

  const toggleMobileAccordion = (itemId: string) => {
    setMobileExpanded((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  return (
    <div
      className="fixed left-0 right-0 z-50 pointer-events-none transition-all duration-400"
      style={{
        top: 'clamp(14px, 2vw, 24px)',
        transform: headerVisible ? 'translateY(0)' : 'translateY(calc(-100% - clamp(24px, 3vw, 36px)))',
        opacity: headerVisible ? 1 : 0,
        transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease',
        willChange: 'transform, opacity',
      }}
    >
      <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-5 md:px-6">
        {/* Floating Header Shell */}
        <header
          onMouseLeave={handleMouseLeave}
          className="pointer-events-auto relative w-full rounded-[14px] sm:rounded-[16px] bg-white/95 backdrop-blur-md text-neutral-900 border border-neutral-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.07)] transition-all duration-300 h-[56px] sm:h-[62px] lg:h-[70px] pl-4 sm:pl-5 lg:pl-6 pr-2 sm:pr-3 flex items-center justify-between"
        >
          <div className="w-full flex items-center justify-between">
            {/* Dynamic Brand Logo */}
            <Link
              href="/"
              className="flex items-center space-x-2.5 group shrink-0"
              aria-label="Home"
            >
              {liveLogo && !imgError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={liveLogo}
                  alt={liveBrandName || 'Logo'}
                  className="h-7 sm:h-8 w-auto max-w-[160px] sm:max-w-[200px] object-contain group-hover:scale-105 transition-transform"
                  onError={() => setImgError(true)}
                />
              ) : (
                <>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#9ae625] text-neutral-950 shadow-sm group-hover:scale-105 transition-transform shrink-0">
                    <Check className="h-3.5 w-3.5 stroke-[3.2]" />
                  </div>
                  {liveBrandName && (
                    <span className="font-bold tracking-tight text-neutral-900 text-[17px] sm:text-[18px] leading-none">
                      {liveBrandName}
                    </span>
                  )}
                </>
              )}
            </Link>

            {/* Desktop Center Navigation matching reference */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-7.5 relative" aria-label="Main">
              {navItems.map((item) => {
                const hasMega = Boolean(item.megaMenuConfig?.enabled);
                const isMenuOpen = activeMegaMenu === item.id;
                const isActive = pathname === item.url || (item.url !== '/' && pathname.startsWith(item.url));

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => handleMouseEnter(item.id, hasMega)}
                    className="relative group"
                  >
                    <Link
                      href={item.url}
                      id={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={(e) => {
                        if (hasMega) {
                          e.preventDefault();
                          setActiveMegaMenu((prev) => (prev === item.id ? null : item.id));
                        }
                      }}
                      className={`text-[14px] lg:text-[15px] font-normal transition-colors inline-flex items-center gap-1.5 py-2 px-3 rounded-lg ${isMenuOpen || isActive
                          ? 'text-neutral-950 font-medium'
                          : 'text-neutral-700 hover:text-neutral-950 hover:bg-black/[0.04]'
                        }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={`h-2.5 w-2.5 text-neutral-400 group-hover:text-neutral-800 transition-transform duration-200 ${isMenuOpen ? 'rotate-180 text-neutral-900' : ''
                          }`}
                      />
                    </Link>
                  </div>
                );
              })}
            </nav>

            {/* Right Action Controls */}
            <div className="flex items-center space-x-2">
              {/* Search Trigger (Admin configurable) */}
              {config?.showSearchBar && (
                <button
                  onClick={() => {
                    const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
                    window.dispatchEvent(event);
                  }}
                  className="hidden sm:inline-flex items-center space-x-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 transition-colors"
                  aria-label="Open search dialog"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Search</span>
                  <kbd className="ml-1 rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px]">
                    ⌘K
                  </kbd>
                </button>
              )}

              {/* Theme Toggle (Admin configurable) */}
              {config?.showThemeToggle && (
                <ThemeToggle />
              )}

              {/* Dynamic Header CTA Pill */}
              {cta && cta.enabled && cta.label && (
                <Link
                  href={cta.url || '/contact'}
                  target={cta.openInNewTab ? '_blank' : undefined}
                  rel={cta.openInNewTab ? 'noopener noreferrer' : undefined}
                  className="hidden md:inline-flex items-center gap-2 h-[38px] sm:h-[40px] px-5 sm:px-6 rounded-full bg-[#18181b] hover:bg-black text-white font-medium text-[13px] sm:text-[14px] tracking-normal transition-all hover:opacity-90 shadow-sm shrink-0"
                >
                  <span>{cta.label}</span>
                  <ArrowUpRight className="h-3 w-3 stroke-[2.2]" />
                </Link>
              )}

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex lg:hidden h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-neutral-800"
                aria-label="Toggle Mobile Menu"
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Full-width Mega Menu — rendered relative to <header> so it matches header width exactly */}
          {(() => {
            const activeItem = navItems.find((i) => i.id === activeMegaMenu && i.megaMenuConfig?.enabled);
            if (!activeItem?.megaMenuConfig) return null;
            return (
              <div
                onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }}
              >
                <MegaMenu
                  config={activeItem.megaMenuConfig}
                  isOpen={true}
                  onClose={() => setActiveMegaMenu(null)}
                />
              </div>
            );
          })()}

          {/* Mobile Drawer Navigation Panel */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-3 pt-3 border-t border-border/60 animate-in slide-in-from-top-3 duration-200">
              <nav className="flex flex-col space-y-1.5 pb-2 max-h-[75vh] overflow-y-auto">
                {navItems.map((item) => {
                  const hasMega = Boolean(item.megaMenuConfig?.enabled);
                  const isExpanded = mobileExpanded[item.id];

                  return (
                    <div key={item.id} className="rounded-xl border border-border/40 bg-card/40 p-2">
                      <div className="flex items-center justify-between">
                        <Link
                          href={item.url}
                          onClick={() => setMobileMenuOpen(false)}
                          className="font-semibold text-sm text-foreground hover:text-primary py-1 px-2"
                        >
                          {item.label}
                        </Link>
                        {hasMega && (
                          <button
                            onClick={() => toggleMobileAccordion(item.id)}
                            className="p-1 text-muted-foreground hover:text-foreground"
                            aria-label="Toggle subcategories"
                          >
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''
                                }`}
                            />
                          </button>
                        )}
                      </div>

                      {/* Mobile Mega-Menu Accordion Items */}
                      {hasMega && isExpanded && item.megaMenuConfig && (
                        <div className="mt-2 pt-2 border-t border-border/40 space-y-2 pl-2">
                          {item.megaMenuConfig.items.map((sub, sIdx) => (
                            <Link
                              key={sIdx}
                              href={sub.url}
                              onClick={() => setMobileMenuOpen(false)}
                              className="block p-1.5 rounded-lg hover:bg-accent/60"
                            >
                              <div className="font-medium text-xs text-foreground">
                                {sub.title}
                              </div>
                              <p className="text-[11px] text-muted-foreground line-clamp-1">
                                {sub.description}
                              </p>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {cta && cta.enabled && cta.label && (
                  <div className="pt-2">
                    <Link
                      href={cta.url || '/contact'}
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold text-xs shadow-md"
                    >
                      <span>{cta.label}</span>
                      <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          )}
        </header>
      </div>
    </div>
  );
}
