'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  FooterDataDto,
  FooterRegionDto,
  NavigationItemDto,
} from '@/lib/cms-types';
import {
  Linkedin,
  Twitter,
  Github,
  Instagram,
  Youtube,
  Facebook,
  Globe,
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
  ChevronDown,
  ShieldCheck,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface FooterViewProps {
  data: FooterDataDto;
}

function isValidLogoUrl(url?: string | null): boolean {
  if (!url) return false;
  if (url === '/logo-light.svg' || url === '/logo-dark.svg') return false;
  return (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('/')
  );
}

function getSocialIcon(platform: string) {
  const p = platform.toLowerCase();
  if (p.includes('linkedin')) return <Linkedin className="w-4 h-4" />;
  if (p.includes('twitter') || p.includes('x')) return <Twitter className="w-4 h-4" />;
  if (p.includes('github') || p.includes('git')) return <Github className="w-4 h-4" />;
  if (p.includes('instagram') || p.includes('insta')) return <Instagram className="w-4 h-4" />;
  if (p.includes('youtube')) return <Youtube className="w-4 h-4" />;
  if (p.includes('facebook') || p.includes('fb')) return <Facebook className="w-4 h-4" />;
  return <Globe className="w-4 h-4" />;
}

export function FooterView({ data }: FooterViewProps) {
  const [footerData, setFooterData] = React.useState<FooterDataDto>(data);

  // Sync state if server prop updates
  React.useEffect(() => {
    if (data) {
      setFooterData(data);
    }
  }, [data]);

  // Live dynamic fetch from API on mount & on footer update events
  React.useEffect(() => {
    let isMounted = true;
    const fetchLiveFooter = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
        const res = await fetch(`${apiUrl}/footer`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.data && isMounted) {
            setFooterData(json.data);
          }
        }
      } catch {
        // Silently preserve current SSR data
      }
    };

    fetchLiveFooter();

    const handleFooterSync = () => {
      fetchLiveFooter();
    };

    window.addEventListener('storage', handleFooterSync);
    window.addEventListener('gypsym_footer_updated', handleFooterSync);

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleFooterSync);
      window.removeEventListener('gypsym_footer_updated', handleFooterSync);
    };
  }, []);

  const { branding, navigation, config, contact, entity } = footerData || data;
  const currentYear = new Date().getFullYear();

  // If footer is explicitly disabled in CMS, gracefully omit
  if (config?.enabled === false) {
    return null;
  }

  // Dynamic live branding with backend + local storage synchronization
  const getResolvedLogo = (
    light?: string | null,
    dark?: string | null,
    favicon?: string | null,
    custom?: string | null
  ): string | null => {
    if (isValidLogoUrl(custom)) return custom!;
    if (isValidLogoUrl(light)) return light!;
    if (isValidLogoUrl(dark)) return dark!;
    if (isValidLogoUrl(favicon)) return favicon!;
    return null;
  };

  const [liveLogo, setLiveLogo] = React.useState<string | null>(() => {
    return getResolvedLogo(
      branding?.logoLight,
      branding?.logoDark,
      branding?.favicon,
      config?.brand?.customLogoUrl
    );
  });

  const [liveBrandName, setLiveBrandName] = React.useState<string>(() => {
    return branding?.companyName || entity?.companyName || 'Gypsym Technology';
  });

  const [imgError, setImgError] = React.useState(false);

  React.useEffect(() => {
    const valid = getResolvedLogo(
      branding?.logoLight,
      branding?.logoDark,
      branding?.favicon,
      config?.brand?.customLogoUrl
    );
    setLiveLogo(valid);
    setImgError(false);
    if (branding?.companyName) setLiveBrandName(branding.companyName);
  }, [branding, config?.brand?.customLogoUrl]);

  React.useEffect(() => {
    const updateFromStorage = () => {
      try {
        const stored = localStorage.getItem('gypsym_branding_settings');
        if (stored) {
          const parsed = JSON.parse(stored);
          const valid = getResolvedLogo(
            parsed.logoLightUrl,
            parsed.logoDarkUrl,
            parsed.faviconUrl,
            config?.brand?.customLogoUrl
          );
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
  }, [config?.brand?.customLogoUrl]);

  // Dynamic menu groups from Navigation items (where parentId is null)
  const navGroups: NavigationItemDto[] = React.useMemo(() => {
    const items = navigation?.items || [];
    return items
      .filter((item) => item.isActive !== false)
      .map((item) => ({
        ...item,
        children: (item.children || []).filter((c) => c.isActive !== false),
      }));
  }, [navigation]);

  // Mobile accordion state
  const [openAccordions, setOpenAccordions] = React.useState<Record<string, boolean>>({});

  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Dynamic contact info resolution
  const resolvedEmail =
    config?.contact?.emailOverride ||
    contact?.primaryEmail ||
    contact?.advisoryEmail ||
    '';
  const resolvedPhone =
    config?.contact?.phoneOverride || contact?.phone || '';
  const resolvedAddress =
    config?.contact?.addressOverride || contact?.address || '';

  // Dynamic social links from branding or config
  const socialLinks = React.useMemo(() => {
    return (branding?.socialLinks || []).filter((s) => s.isActive !== false);
  }, [branding?.socialLinks]);

  // Dynamic active regions
  const activeRegions: FooterRegionDto[] = React.useMemo(() => {
    return (config?.regions || [])
      .filter((r) => r.isActive !== false)
      .map((r) => ({
        ...r,
        links: (r.links || []).filter((l) => l.isActive !== false),
      }));
  }, [config?.regions]);

  // Dynamic active legal links
  const activeLegalLinks = React.useMemo(() => {
    return (config?.legalLinks || []).filter((l) => l.isActive !== false);
  }, [config?.legalLinks]);

  // Dynamic active badges
  const activeBadges = React.useMemo(() => {
    return (config?.badges || []).filter((b) => b.isActive !== false);
  }, [config?.badges]);

  // Dynamic active searchable keywords
  const activeKeywords = React.useMemo(() => {
    return (config?.keywords?.items || []).filter((k) => k.isActive !== false);
  }, [config?.keywords?.items]);

  // Dynamic copyright text replacement
  const copyrightText = React.useMemo(() => {
    const template =
      config?.copyright?.template || '© {year} {brand}. All rights reserved.';
    return template
      .replace('{year}', currentYear.toString())
      .replace('{brand}', liveBrandName);
  }, [config?.copyright?.template, currentYear, liveBrandName]);

  // Dynamic container width styling (matches hero section full-width container)
  const containerWidthClass = React.useMemo(() => {
    switch (config?.layout?.containerWidth) {
      case 'standard':
        return 'max-w-6xl';
      case 'wide':
      case 'full':
      default:
        return 'w-full';
    }
  }, [config?.layout?.containerWidth]);

  // Dynamic border radius styling
  const borderRadiusClass = React.useMemo(() => {
    switch (config?.layout?.borderRadius) {
      case 'medium':
        return 'rounded-2xl sm:rounded-3xl';
      case 'large':
        return 'rounded-[28px] sm:rounded-[36px]';
      case 'extra-large':
      default:
        return 'rounded-[28px] sm:rounded-[40px] md:rounded-[48px]';
    }
  }, [config?.layout?.borderRadius]);

  // Dynamic surface color
  const surfaceColor = config?.appearance?.surfaceColor || '#07090e';
  const borderColor = config?.appearance?.borderColor || 'rgba(255, 255, 255, 0.08)';

  // Large Brand Mark text resolution
  const largeMarkText =
    config?.largeBrandMark?.textOverride || liveBrandName.toUpperCase();
  const largeMarkOpacity = config?.largeBrandMark?.opacity ?? 0.12;
  const largeMarkAlignment = config?.largeBrandMark?.alignment || 'center';

  return (
    <footer className="w-full px-1.5 sm:px-2 md:px-3 pb-1.5 sm:pb-2 md:pb-3 pt-6 mt-auto select-text font-sans">
      {/* Outer Floating Rounded Container */}
      <div
        style={{
          backgroundColor: surfaceColor,
          borderColor: borderColor,
        }}
        className={`mx-auto ${containerWidthClass} ${borderRadiusClass} border text-neutral-100 overflow-hidden shadow-2xl relative transition-all duration-300`}
      >
        {/* Subtle Ambient Radial Mesh Glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen"
          style={{
            background:
              'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(255, 255, 255, 0.08), transparent 70%)',
          }}
        />

        <div className="relative z-10 p-6 sm:p-10 lg:p-14">
          {/* Optional Footer CTA Banner */}
          {config?.cta?.enabled && (
            <div className="mb-12 pb-12 border-b border-white/[0.08] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                {config.cta.eyebrow && (
                  <span className="text-[11px] font-mono tracking-widest uppercase text-primary font-semibold">
                    {config.cta.eyebrow}
                  </span>
                )}
                {config.cta.title && (
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    {config.cta.title}
                  </h3>
                )}
                {config.cta.description && (
                  <p className="text-sm text-neutral-400">
                    {config.cta.description}
                  </p>
                )}
              </div>
              {config.cta.buttonLabel && (
                <Link
                  href={config.cta.buttonUrl || '/book'}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-neutral-950 font-semibold text-sm hover:bg-neutral-200 transition-colors shadow-sm group shrink-0"
                >
                  <span>{config.cta.buttonLabel}</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              )}
            </div>
          )}

          {/* Top Section: Brand Column + Navigation Columns (Divider Removed) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 pb-8 sm:pb-10">
            {/* Left Brand Column (5 Cols on Desktop) */}
            <div className="lg:col-span-4 xl:col-span-5 space-y-6">
              {/* Brand Wordmark / Logo */}
              <Link
                href="/"
                className="inline-flex items-center space-x-3 group"
                aria-label="Home"
              >
                {liveLogo && !imgError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={liveLogo}
                    alt={liveBrandName}
                    className="h-9 w-auto max-w-[200px] object-contain transition-transform group-hover:scale-105"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-white text-neutral-950 flex items-center justify-center font-mono font-black text-lg transition-transform group-hover:scale-105">
                      {liveBrandName ? liveBrandName.charAt(0).toUpperCase() : 'G'}
                    </div>
                    <span className="font-bold text-xl tracking-tight text-white">
                      {liveBrandName}
                    </span>
                  </div>
                )}
              </Link>

              {/* Dynamic Company Description */}
              {config?.brand?.description ? (
                <p className="text-sm text-neutral-400 leading-relaxed max-w-sm">
                  {config.brand.description}
                </p>
              ) : (
                entity?.legalName && (
                  <p className="text-xs text-neutral-500 font-mono">
                    {entity.legalName} • {entity.headquarters}
                  </p>
                )
              )}

              {/* Dynamic Contact Block */}
              {config?.contact?.enabled !== false && (
                <div className="space-y-2.5 pt-2 text-xs text-neutral-300 font-mono">
                  {config?.contact?.badgeText && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/[0.08] text-[10px] text-neutral-300 uppercase tracking-wider mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {config.contact.badgeText}
                    </div>
                  )}

                  {config?.contact?.showEmail !== false && resolvedEmail && (
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                      <a
                        href={`mailto:${resolvedEmail}`}
                        className="hover:text-white transition-colors underline-offset-4 hover:underline"
                      >
                        {resolvedEmail}
                      </a>
                    </div>
                  )}

                  {config?.contact?.showPhone !== false && resolvedPhone && (
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                      <a
                        href={`tel:${resolvedPhone}`}
                        className="hover:text-white transition-colors"
                      >
                        {resolvedPhone}
                      </a>
                    </div>
                  )}

                  {config?.contact?.showAddress !== false && resolvedAddress && (
                    <div className="flex items-start gap-2.5 pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
                      <span className="text-neutral-400 leading-tight">
                        {resolvedAddress}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Dynamic Social Links */}
              {socialLinks.length > 0 && (
                <div className="pt-3">
                  <div className="flex flex-wrap gap-2">
                    {socialLinks.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Follow on ${s.platform}`}
                        className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/[0.12] hover:border-white/[0.2] transition-all transform hover:-translate-y-0.5"
                      >
                        {getSocialIcon(s.platform)}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional Partner & Compliance Badges */}
              {activeBadges.length > 0 && (
                <div className="pt-4 flex flex-wrap items-center gap-3 border-t border-white/[0.06]">
                  {activeBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.07] text-[11px] text-neutral-300"
                      title={badge.title}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                      {badge.url ? (
                        <a
                          href={badge.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-white transition-colors flex items-center gap-1"
                        >
                          <span>{badge.title}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                      ) : (
                        <span>{badge.title}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Navigation Area (7 Cols on Desktop) */}
            <div className="lg:col-span-8 xl:col-span-7">
              {navGroups.length > 0 && (
                <>
                  {/* Desktop Columns Grid */}
                  <div
                    className={`hidden md:grid gap-8 ${
                      navGroups.length <= 2
                        ? 'grid-cols-2'
                        : navGroups.length === 3
                        ? 'grid-cols-3'
                        : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                    }`}
                  >
                    {navGroups.map((group) => (
                      <nav
                        key={group.id}
                        aria-label={group.label}
                        className="space-y-4"
                      >
                        <h4 className="text-xs font-mono font-semibold tracking-wider text-neutral-400 uppercase">
                          {group.label}
                        </h4>
                        {group.children && group.children.length > 0 && (
                          <ul className="space-y-2.5">
                            {group.children.map((child) => (
                              <li key={child.id}>
                                <Link
                                  href={child.url}
                                  target={child.isExternal ? '_blank' : undefined}
                                  rel={
                                    child.isExternal
                                      ? 'noopener noreferrer'
                                      : undefined
                                  }
                                  className="text-sm text-neutral-300 hover:text-white transition-colors inline-flex items-center gap-1 group/link"
                                >
                                  <span>{child.label}</span>
                                  {child.isExternal ? (
                                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all text-neutral-400" />
                                  ) : null}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </nav>
                    ))}
                  </div>

                  {/* Mobile Accordions (< 768px) */}
                  <div className="md:hidden divide-y divide-white/[0.08] border-t border-b border-white/[0.08]">
                    {navGroups.map((group) => {
                      const isOpen = Boolean(openAccordions[group.id]);
                      const contentId = `mobile-nav-group-${group.id}`;
                      const headerId = `mobile-nav-header-${group.id}`;

                      return (
                        <div key={group.id} className="py-3">
                          <button
                            id={headerId}
                            type="button"
                            aria-expanded={isOpen}
                            aria-controls={contentId}
                            onClick={() => toggleAccordion(group.id)}
                            className="w-full flex items-center justify-between text-left py-1 text-sm font-semibold text-neutral-200 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            <span>{group.label}</span>
                            <ChevronDown
                              className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                                isOpen ? 'rotate-180 text-white' : ''
                              }`}
                            />
                          </button>

                          <div
                            id={contentId}
                            role="region"
                            aria-labelledby={headerId}
                            className={`grid transition-all duration-300 ease-in-out overflow-hidden ${
                              isOpen
                                ? 'grid-rows-[1fr] opacity-100 mt-2'
                                : 'grid-rows-[0fr] opacity-0'
                            }`}
                          >
                            <div className="min-h-0">
                              <ul className="space-y-2.5 pb-2 pl-1">
                                {group.children?.map((child) => (
                                  <li key={child.id}>
                                    <Link
                                      href={child.url}
                                      target={
                                        child.isExternal ? '_blank' : undefined
                                      }
                                      rel={
                                        child.isExternal
                                          ? 'noopener noreferrer'
                                          : undefined
                                      }
                                      className="text-xs text-neutral-400 hover:text-white transition-colors block py-0.5"
                                    >
                                      {child.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Centered Compact Keywords Directory */}
          {config?.keywords?.enabled !== false && activeKeywords.length > 0 && (
            <div className="pt-2 pb-3 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-2.5">
                <Sparkles className="w-3 h-3 text-blue-400 shrink-0" />
                <span className="text-[11px] font-mono font-semibold tracking-wider text-neutral-400 uppercase">
                  {config?.keywords?.title || 'Trending Capabilities & Directory'}
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono bg-white/[0.06] text-neutral-400 border border-white/[0.08]">
                  {activeKeywords.length}
                </span>
              </div>

              {/* Centered Compact Keyword Chips Cloud */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-5xl mx-auto">
                {activeKeywords.map((item) => (
                  <Link
                    key={item.id}
                    href={item.url || `/services?q=${encodeURIComponent(item.label)}`}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] font-mono bg-white/[0.03] hover:bg-white/[0.1] border border-white/[0.07] hover:border-white/[0.2] text-neutral-400 hover:text-white transition-all transform hover:-translate-y-0.5 active:translate-y-0 group/kw"
                  >
                    <span>{item.label}</span>
                    <ArrowUpRight className="w-2.5 h-2.5 opacity-30 group-hover/kw:opacity-100 group-hover/kw:translate-x-0.5 transition-all text-neutral-400 group-hover/kw:text-white" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Middle Section: Regional / Market Links Grid */}
          {activeRegions.length > 0 && (
            <div className="py-10 border-b border-white/[0.08]">
              <div className="mb-6 flex items-center justify-between">
                <span className="text-[11px] font-mono tracking-wider uppercase text-neutral-400 font-semibold">
                  Global Practice & Regional Markets
                </span>
                <span className="text-[11px] font-mono text-neutral-500">
                  {activeRegions.length} Active Hubs
                </span>
              </div>

              <div
                className={`grid gap-8 ${
                  activeRegions.length <= 2
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : activeRegions.length === 3
                    ? 'grid-cols-1 sm:grid-cols-3'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                }`}
              >
                {activeRegions.map((region) => (
                  <nav
                    key={region.id}
                    aria-label={`${region.name} Regional Links`}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-white/[0.06] border border-white/[0.1] text-[10px] font-mono font-bold text-neutral-200">
                        {region.code}
                      </span>
                      <span className="text-xs font-semibold text-neutral-200">
                        {region.name}
                      </span>
                      {region.label && (
                        <span className="text-[10px] text-neutral-500 font-mono">
                          ({region.label})
                        </span>
                      )}
                    </div>

                    {region.links && region.links.length > 0 && (
                      <ul className="space-y-1.5">
                        {region.links.map((link) => (
                          <li key={link.id}>
                            <Link
                              href={link.url}
                              target={link.isExternal ? '_blank' : undefined}
                              rel={
                                link.isExternal
                                  ? 'noopener noreferrer'
                                  : undefined
                              }
                              className="text-xs text-neutral-400 hover:text-white transition-colors group/rlink inline-flex items-center gap-1"
                            >
                              <span>{link.label}</span>
                              {link.isExternal && (
                                <ArrowUpRight className="w-2.5 h-2.5 opacity-0 group-hover/rlink:opacity-100 transition-opacity" />
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </nav>
                ))}
              </div>
            </div>
          )}

          {/* Large Brand Mark Section */}
          {config?.largeBrandMark?.enabled !== false && (
            <div className="pt-8 sm:pt-12 pb-4 overflow-hidden w-full select-none pointer-events-none">
              <div
                style={{
                  opacity: largeMarkOpacity,
                }}
                className={`w-full flex items-center ${
                  largeMarkAlignment === 'left'
                    ? 'justify-start text-left'
                    : largeMarkAlignment === 'right'
                    ? 'justify-end text-right'
                    : 'justify-center text-center'
                }`}
              >
                <span
                  className="font-black uppercase leading-none block whitespace-nowrap text-[18vw] sm:text-[16.5vw] md:text-[15vw] lg:text-[14vw] xl:text-[13vw] 2xl:text-[12.5vw] bg-gradient-to-b from-white via-white/85 to-white/25 bg-clip-text text-transparent"
                  style={{
                    letterSpacing: '-0.035em',
                  }}
                >
                  {largeMarkText}
                </span>
              </div>
            </div>
          )}

          {/* Bottom Bar: Dynamic Copyright & Legal Links */}
          <div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400 font-mono">
            {/* Copyright with dynamic variables substitution */}
            <div>
              <span>{copyrightText}</span>
            </div>

            {/* Dynamic Legal Links */}
            {activeLegalLinks.length > 0 && (
              <nav aria-label="Legal & Policies">
                <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  {activeLegalLinks.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.url}
                        target={item.isExternal ? '_blank' : undefined}
                        rel={
                          item.isExternal ? 'noopener noreferrer' : undefined
                        }
                        className="hover:text-white transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
