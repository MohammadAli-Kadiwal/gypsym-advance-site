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

  // Close mega menu & mobile drawer on route change
  React.useEffect(() => {
    setActiveMegaMenu(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setActiveMegaMenu(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    <>
      {/* Mobile Dimmed Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden pointer-events-auto transition-opacity animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

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
            className={`pointer-events-auto relative w-full rounded-[16px] sm:rounded-[18px] bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md text-neutral-900 dark:text-neutral-100 border border-neutral-200/80 dark:border-neutral-800 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col ${
              mobileMenuOpen ? 'h-auto pb-4 overflow-hidden shadow-2xl ring-1 ring-black/5' : 'h-[56px] sm:h-[62px] lg:h-[70px]'
            }`}
          >
            {/* Top Bar Row */}
            <div className="w-full h-[56px] sm:h-[62px] lg:h-[70px] pl-4 sm:pl-5 lg:pl-6 pr-2 sm:pr-3 flex items-center justify-between shrink-0">
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
                      <span className="font-bold tracking-tight text-neutral-900 dark:text-white text-[17px] sm:text-[18px] leading-none">
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
                        className={`text-[14px] lg:text-[15px] font-normal transition-colors inline-flex items-center gap-1.5 py-2 px-3 rounded-lg ${
                          isMenuOpen || isActive
                            ? 'text-neutral-950 dark:text-white font-medium'
                            : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                        }`}
                      >
                        <span>{item.label}</span>
                        {hasMega && (
                          <ChevronDown
                            className={`h-2.5 w-2.5 text-neutral-400 group-hover:text-neutral-800 transition-transform duration-200 ${
                              isMenuOpen ? 'rotate-180 text-neutral-900' : ''
                            }`}
                          />
                        )}
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
                    href={cta.url || '/book'}
                    target={cta.openInNewTab ? '_blank' : undefined}
                    rel={cta.openInNewTab ? 'noopener noreferrer' : undefined}
                    className="hidden md:inline-flex items-center gap-2 h-[38px] sm:h-[40px] px-5 sm:px-6 rounded-full bg-[#18181b] hover:bg-black text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 font-medium text-[13px] sm:text-[14px] tracking-normal transition-all hover:opacity-90 shadow-sm shrink-0"
                  >
                    <span>{cta.label}</span>
                    <ArrowUpRight className="h-3 w-3 stroke-[2.2]" />
                  </Link>
                )}

                {/* Mobile Hamburger Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex lg:hidden h-9 w-9 items-center justify-center rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-100/80 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 transition-colors active:scale-95"
                  aria-label="Toggle Mobile Menu"
                  aria-expanded={mobileMenuOpen}
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
              <div className="lg:hidden w-full px-4 pt-3 pb-2 border-t border-neutral-200/70 dark:border-neutral-800 animate-in fade-in slide-in-from-top-2 duration-200">
                <nav className="flex flex-col space-y-2 max-h-[72vh] overflow-y-auto pr-1">
                  {navItems.map((item) => {
                    const hasMega = Boolean(item.megaMenuConfig?.enabled);
                    const isExpanded = mobileExpanded[item.id];
                    const isActive = pathname === item.url || (item.url !== '/' && pathname.startsWith(item.url));

                    return (
                      <div
                        key={item.id}
                        className={`rounded-xl border transition-all ${
                          isActive
                            ? 'border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/20'
                            : 'border-neutral-200/70 bg-neutral-50/60 dark:border-neutral-800/60 dark:bg-neutral-900/40'
                        }`}
                      >
                        <div className="flex items-center justify-between p-1.5 sm:p-2">
                          <Link
                            href={item.url}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`font-semibold text-sm py-2 px-3 rounded-lg flex-1 flex items-center justify-between ${
                              isActive
                                ? 'text-blue-600 dark:text-blue-400 font-bold'
                                : 'text-neutral-800 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white'
                            }`}
                          >
                            <span>{item.label}</span>
                            {isActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                            )}
                          </Link>
                          {hasMega && (
                            <button
                              type="button"
                              onClick={() => toggleMobileAccordion(item.id)}
                              className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors"
                              aria-label="Toggle subcategories"
                            >
                              <ChevronDown
                                className={`h-4 w-4 transition-transform duration-200 ${
                                  isExpanded ? 'rotate-180 text-neutral-900 dark:text-neutral-100' : ''
                                }`}
                              />
                            </button>
                          )}
                        </div>

                        {/* Mobile Mega-Menu Accordion Items */}
                        {hasMega && isExpanded && item.megaMenuConfig && (
                          <div className="pt-2 pb-2.5 px-3 border-t border-neutral-200/60 dark:border-neutral-800 space-y-1 bg-white/70 dark:bg-neutral-950/70 rounded-b-xl">
                            {item.megaMenuConfig.items.map((sub, sIdx) => (
                              <Link
                                key={sIdx}
                                href={sub.url}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block p-2 rounded-lg hover:bg-blue-50/70 dark:hover:bg-blue-950/40 transition-colors group"
                              >
                                <div className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center justify-between">
                                  <span>{sub.title}</span>
                                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 text-blue-600 transition-opacity" />
                                </div>
                                {sub.description && (
                                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                                    {sub.description}
                                  </p>
                                )}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Primary CTA in Mobile Menu */}
                  <div className="pt-2 space-y-2">
                    {cta && cta.enabled && cta.label && (
                      <Link
                        href={cta.url || '/book'}
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-neutral-950 hover:bg-black text-white dark:bg-white dark:text-neutral-950 font-bold text-sm tracking-normal transition-all shadow-md active:scale-98"
                      >
                        <span>{cta.label}</span>
                        <ArrowUpRight className="h-4 w-4 stroke-[2.4]" />
                      </Link>
                    )}

                    {/* Secondary Direct Inquiry Link */}
                    <Link
                      href="/contact"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full inline-flex items-center justify-center h-9 px-4 rounded-xl border border-neutral-200/90 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100 font-medium text-xs hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                    >
                      <span>Need architectural consultation? Reach out directly →</span>
                    </Link>
                  </div>
                </nav>
              </div>
            )}
          </header>
        </div>
      </div>
    </>
  );
}
