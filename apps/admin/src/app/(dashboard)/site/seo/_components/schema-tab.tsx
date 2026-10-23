'use client';

import * as React from 'react';
import {
  FileJson,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  Building,
  Globe,
  FileText,
  ExternalLink,
  Save,
  Sparkles,
  HelpCircle,
  RefreshCw,
  Sliders,
  ChevronDown,
  Wand2,
  AlertCircle,
  Code,
  Search,
  X,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { notify } from '@/lib/notifications';
import { normalizeErrorMessage } from '@/lib/api';
import { seoService, GlobalSeoData } from '@/services/seo.service';
import { PageSeoItem } from './types';

interface SchemaTabProps {
  onNavigateTab?: (tab: string) => void;
}

export function SchemaTab({ onNavigateTab }: SchemaTabProps) {
  const [globalSeo, setGlobalSeo] = React.useState<GlobalSeoData | null>(null);
  const [pages, setPages] = React.useState<PageSeoItem[]>([]);
  const [selectedPageId, setSelectedPageId] = React.useState<string>('');
  const [schemaCode, setSchemaCode] = React.useState<string>('');
  const [jsonError, setJsonError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [savingPageSchema, setSavingPageSchema] = React.useState(false);
  const [copiedType, setCopiedType] = React.useState<string | null>(null);

  // Searchable page selector state
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [pageSearch, setPageSearch] = React.useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = React.useState<string>('ALL');
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Load initial data
  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [g, p] = await Promise.all([seoService.getGlobal(), seoService.getPages()]);
      setGlobalSeo(g);
      const pageList = Array.isArray(p) ? p : [];
      setPages(pageList);

      if (pageList.length > 0) {
        if (!selectedPageId) {
          const homePage = pageList.find((item) => item.slug === 'home' || item.slug === '/') || pageList[0];
          setSelectedPageId(homePage.id);
          const currentData = homePage.seoMetadata?.structuredData;
          setSchemaCode(currentData ? JSON.stringify(currentData, null, 2) : '');
        } else {
          const current = pageList.find((item) => item.id === selectedPageId);
          if (current) {
            const currentData = current.seoMetadata?.structuredData;
            setSchemaCode(currentData ? JSON.stringify(currentData, null, 2) : '');
          }
        }
      }
    } catch (err) {
      console.error(err);
      notify.error({ title: 'Failed to load Schema data', description: normalizeErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [selectedPageId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // When selected page changes, sync schema code
  const handlePageSelect = (pageId: string) => {
    setSelectedPageId(pageId);
    const p = pages.find((item) => item.id === pageId);
    if (p) {
      const currentData = p.seoMetadata?.structuredData;
      setSchemaCode(currentData ? JSON.stringify(currentData, null, 2) : '');
      setJsonError(null);
    }
  };

  const selectedPage = React.useMemo(() => {
    return pages.find((p) => p.id === selectedPageId) || pages[0] || null;
  }, [pages, selectedPageId]);

  const filteredPages = React.useMemo(() => {
    return pages.filter((p) => {
      const matchesType =
        selectedTypeFilter === 'ALL' ||
        (p.type || 'PAGE').toUpperCase() === selectedTypeFilter.toUpperCase();

      if (!matchesType) return false;
      if (!pageSearch.trim()) return true;

      const q = pageSearch.toLowerCase();
      const title = (p.title || '').toLowerCase();
      const slug = (p.slug || '').toLowerCase();
      const type = (p.type || 'PAGE').toLowerCase();
      return title.includes(q) || slug.includes(q) || type.includes(q);
    });
  }, [pages, pageSearch, selectedTypeFilter]);

  const typeCounts = React.useMemo(() => {
    const counts: Record<string, number> = { ALL: pages.length };
    for (const p of pages) {
      const t = (p.type || 'PAGE').toUpperCase();
      counts[t] = (counts[t] || 0) + 1;
    }
    return counts;
  }, [pages]);

  const handleGenerateForCurrentPage = () => {
    const targetPage = pages.find((p) => p.id === selectedPageId);
    if (!targetPage) return;

    const siteUrl = (globalSeo?.siteUrl || 'https://gypsym.com').replace(/\/+$/, '');
    const orgName = globalSeo?.organizationName || globalSeo?.siteName || 'Gypsym Technology';
    const orgLogo = globalSeo?.organizationLogo || globalSeo?.defaultOgImage || `${siteUrl}/og-default.png`;
    const slug = (targetPage.slug || '').toLowerCase().trim();
    const pageUrl = slug === 'home' || slug === '/' ? siteUrl : `${siteUrl}/${slug.replace(/^\/+/, '')}`;
    const pType = (targetPage.type || 'PAGE').toUpperCase();

    let templateObj: any = null;

    if (pType === 'SERVICE') {
      templateObj = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        serviceType: 'E-Commerce Development & Engineering',
        name: targetPage.title,
        description: targetPage.seoMetadata?.metaDescription || `Enterprise ${targetPage.title} engineering services by ${orgName}.`,
        provider: {
          '@type': 'Organization',
          name: orgName,
          url: siteUrl,
          logo: orgLogo,
        },
        areaServed: 'Worldwide',
        url: pageUrl,
      };
    } else if (pType === 'BLOG') {
      templateObj = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: targetPage.title,
        description: targetPage.seoMetadata?.metaDescription || targetPage.title,
        image: targetPage.seoMetadata?.ogImageUrl || orgLogo,
        datePublished: new Date().toISOString(),
        dateModified: new Date().toISOString(),
        author: {
          '@type': 'Organization',
          name: globalSeo?.defaultAuthor || `${orgName} Team`,
          url: siteUrl,
        },
        publisher: {
          '@type': 'Organization',
          name: orgName,
          url: siteUrl,
          logo: orgLogo,
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': pageUrl,
        },
      };
    } else if (slug === 'home' || slug === '/' || slug === '') {
      templateObj = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: orgName,
        url: siteUrl,
        description: globalSeo?.siteDescription || 'Enterprise Shopify & Shopify Plus agency.',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      };
    } else if (slug === 'about') {
      templateObj = {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: `About ${orgName}`,
        description: targetPage.seoMetadata?.metaDescription || `About ${orgName}`,
        url: pageUrl,
        mainEntity: {
          '@type': 'Organization',
          name: orgName,
          url: siteUrl,
        },
      };
    } else if (slug === 'contact' || slug === 'book') {
      templateObj = {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: `Contact ${orgName}`,
        url: pageUrl,
        mainEntity: {
          '@type': 'Organization',
          name: orgName,
          url: siteUrl,
        },
      };
    } else {
      templateObj = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: targetPage.title,
        description: targetPage.seoMetadata?.metaDescription || targetPage.title,
        url: pageUrl,
        isPartOf: {
          '@type': 'WebSite',
          name: orgName,
          url: siteUrl,
        },
      };
    }

    setSchemaCode(JSON.stringify(templateObj, null, 2));
    setJsonError(null);
    notify.info({
      title: 'Schema generated',
      description: `Generated ${templateObj['@type']} schema for "${targetPage.title}". Click "Save Structured Data" to commit.`,
    });
  };

  // Real-time JSON validation
  const validateJson = (code: string): boolean => {
    if (!code.trim()) {
      setJsonError(null);
      return true;
    }
    try {
      JSON.parse(code);
      setJsonError(null);
      return true;
    } catch (err: any) {
      setJsonError(err.message || 'Invalid JSON syntax');
      return false;
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setSchemaCode(val);
    validateJson(val);
  };

  const handleFormatJson = () => {
    if (!schemaCode.trim()) return;
    try {
      const parsed = JSON.parse(schemaCode);
      const formatted = JSON.stringify(parsed, null, 2);
      setSchemaCode(formatted);
      setJsonError(null);
      notify.success({ title: 'JSON formatted', description: 'Schema code indented and formatted.' });
    } catch (err: any) {
      notify.error({ title: 'Format failed', description: 'Fix syntax errors before formatting.' });
    }
  };

  // Quick template inserters
  const applyTemplate = (templateName: string) => {
    const targetPage = pages.find((p) => p.id === selectedPageId);
    const siteUrl = globalSeo?.siteUrl || 'https://gypsym.com';
    const pageUrl = targetPage
      ? `${siteUrl.replace(/\/$/, '')}/${targetPage.slug.replace(/^\//, '')}`
      : siteUrl;
    const pageTitle = targetPage?.title || 'Gypsym Technology';

    let templateObj: any = null;

    switch (templateName) {
      case 'Service':
        templateObj = {
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: pageTitle,
          serviceType: 'Enterprise E-Commerce Engineering',
          provider: {
            '@type': 'Organization',
            name: globalSeo?.organizationName || globalSeo?.siteName || 'Gypsym Technology',
            url: siteUrl,
          },
          url: pageUrl,
          description: targetPage?.seoMetadata?.metaDescription || 'Enterprise software and Shopify Plus engineering solutions.',
          areaServed: {
            '@type': 'Country',
            name: 'Worldwide',
          },
        };
        break;

      case 'FAQPage':
        templateObj = {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: `What makes Gypsym's ${pageTitle} unique?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'We combine high-performance architecture, custom Shopify engineering, and conversion rate optimization to scale enterprise brands.',
              },
            },
            {
              '@type': 'Question',
              name: 'How long does project delivery take?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Typical engagements span 4 to 12 weeks depending on scope, custom headless integrations, and ERP syncing requirements.',
              },
            },
          ],
        };
        break;

      case 'Article':
        templateObj = {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: pageTitle,
          description: targetPage?.seoMetadata?.metaDescription || 'Key technical and architectural insights.',
          url: pageUrl,
          author: {
            '@type': 'Organization',
            name: globalSeo?.organizationName || globalSeo?.siteName || 'Gypsym Technology',
          },
          publisher: {
            '@type': 'Organization',
            name: globalSeo?.organizationName || globalSeo?.siteName || 'Gypsym Technology',
            logo: {
              '@type': 'ImageObject',
              url: globalSeo?.organizationLogo || globalSeo?.defaultOgImage || `${siteUrl}/og-default.png`,
            },
          },
          datePublished: new Date().toISOString().split('T')[0],
          dateModified: new Date().toISOString().split('T')[0],
        };
        break;

      case 'LocalBusiness':
        templateObj = {
          '@context': 'https://schema.org',
          '@type': 'ProfessionalService',
          name: globalSeo?.organizationName || globalSeo?.siteName || 'Gypsym Technology',
          image: globalSeo?.organizationLogo || globalSeo?.defaultOgImage || `${siteUrl}/og-default.png`,
          url: siteUrl,
          telephone: globalSeo?.phone || '+44 20 7946 0991',
          email: globalSeo?.email || 'briefing@gypsym.com',
          priceRange: '$$$$',
          address: {
            '@type': 'PostalAddress',
            streetAddress: globalSeo?.address || '100 Bishopsgate',
            addressCountry: globalSeo?.country || 'United Kingdom',
          },
        };
        break;

      case 'BreadcrumbList':
        templateObj = {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: siteUrl,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: pageTitle,
              item: pageUrl,
            },
          ],
        };
        break;
    }

    if (templateObj) {
      setSchemaCode(JSON.stringify(templateObj, null, 2));
      setJsonError(null);
      notify.info({
        title: `${templateName} template inserted`,
        description: 'Review and customize the schema properties before saving.',
      });
    }
  };

  // Save Page Schema
  const handleSavePageSchema = async () => {
    if (!selectedPageId) return;
    const targetPage = pages.find((p) => p.id === selectedPageId);
    if (!targetPage) return;

    let parsedJson: any = null;
    if (schemaCode.trim()) {
      try {
        parsedJson = JSON.parse(schemaCode);
      } catch (err: any) {
        setJsonError(err.message || 'Invalid JSON syntax');
        notify.error({ title: 'Invalid JSON', description: 'Please fix JSON syntax errors before saving.' });
        return;
      }
    }

    try {
      setSavingPageSchema(true);
      await seoService.updatePageSeo(selectedPageId, {
        ...(targetPage.seoMetadata || {}),
        structuredData: parsedJson,
      });

      // Update local state
      setPages((prev) =>
        prev.map((item) =>
          item.id === selectedPageId
            ? {
                ...item,
                seoMetadata: {
                  ...(item.seoMetadata || {}),
                  structuredData: parsedJson,
                },
              }
            : item
        )
      );

      notify.success({
        title: 'Structured data saved',
        description: `JSON-LD schema successfully updated for "${targetPage.title}".`,
      });
    } catch (err) {
      notify.error({ title: 'Save failed', description: normalizeErrorMessage(err) });
    } finally {
      setSavingPageSchema(false);
    }
  };

  // Global Core Schemas
  const organizationSchema = React.useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: globalSeo?.organizationName || globalSeo?.siteName || '',
      url: globalSeo?.siteUrl || '',
      logo: globalSeo?.organizationLogo || globalSeo?.defaultOgImage || '',
      description: globalSeo?.organizationDescription || globalSeo?.siteDescription || '',
      email: globalSeo?.email || undefined,
      telephone: globalSeo?.phone || undefined,
      address: globalSeo?.address
        ? {
            '@type': 'PostalAddress',
            streetAddress: globalSeo.address,
            addressCountry: globalSeo.country || undefined,
          }
        : undefined,
      sameAs: globalSeo?.socialProfiles?.map((s) => s.url).filter(Boolean) || [],
    };
  }, [globalSeo]);

  const websiteSchema = React.useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: globalSeo?.siteName || '',
      url: globalSeo?.siteUrl || '',
      description: globalSeo?.siteDescription || '',
      potentialAction: globalSeo?.siteUrl
        ? {
            '@type': 'SearchAction',
            target: `${globalSeo.siteUrl}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          }
        : undefined,
    };
  }, [globalSeo]);

  // Validation checks for Core Organization Schema
  const orgValidation = React.useMemo(() => {
    const issues: string[] = [];
    if (!globalSeo?.organizationName && !globalSeo?.siteName) issues.push('Organization Name is missing');
    if (!globalSeo?.siteUrl) issues.push('Site URL is missing');
    if (!globalSeo?.organizationLogo && !globalSeo?.defaultOgImage) issues.push('Organization Logo URL is missing');
    if (!globalSeo?.organizationDescription && !globalSeo?.siteDescription) issues.push('Organization Description is missing');
    return issues;
  }, [globalSeo]);

  const copyToClipboard = (type: string, data: any) => {
    const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    notify.success({ title: 'Schema copied', description: `${type} JSON-LD copied to clipboard.` });
    setTimeout(() => setCopiedType(null), 2500);
  };

  const selectedPageUrl = selectedPage
    ? `${(globalSeo?.siteUrl || 'https://gypsym.com').replace(/\/$/, '')}/${(selectedPage.slug || '').replace(/^\//, '')}`
    : globalSeo?.siteUrl || 'https://gypsym.com';

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground animate-pulse">
        <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
        Loading Structured Data &amp; JSON-LD Schemas…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Main Top Card ────────────────────────────────────────── */}
      <Card className="rounded-2xl border-border shadow-xs overflow-hidden bg-card">
        <CardHeader className="p-5 sm:p-6 border-b border-border bg-muted/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FileJson className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-foreground">
                    Structured Data &amp; JSON-LD Schemas
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Manage Schema.org microdata for Google Rich Results, Answer Engines (AEO), and knowledge graphs.
                  </CardDescription>
                </div>
              </div>
            </div>

            {/* Quick External Actions */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs rounded-xl cursor-pointer"
                onClick={() => window.open('https://validator.schema.org/', '_blank')}
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Schema.org Validator
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs rounded-xl cursor-pointer"
                onClick={() =>
                  window.open(
                    `https://search.google.com/test/rich-results?url=${encodeURIComponent(selectedPageUrl)}`,
                    '_blank'
                  )
                }
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                Google Rich Results Test
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-6">
          {/* Sub-tabs: Page Editor vs Core Schemas vs How it works */}
          <Tabs defaultValue="page-editor" className="space-y-5">
            <div className="overflow-x-auto pb-1 -mx-1 px-1">
              <TabsList className="h-9 bg-muted/60 p-1 rounded-xl inline-flex w-auto gap-1">
                <TabsTrigger value="page-editor" className="h-7 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap">
                  <Code className="h-3.5 w-3.5" />
                  Page Custom JSON-LD Editor
                </TabsTrigger>
                <TabsTrigger value="core-schemas" className="h-7 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap">
                  <Building className="h-3.5 w-3.5" />
                  Site-Wide Core Schemas
                </TabsTrigger>
                <TabsTrigger value="guide" className="h-7 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap">
                  <HelpCircle className="h-3.5 w-3.5" />
                  How Structured Data Works
                </TabsTrigger>
              </TabsList>
            </div>

            {/* ════════════════════════════════════════════════════════
                TAB 1: PAGE & ENTITY CUSTOM JSON-LD EDITOR
               ════════════════════════════════════════════════════════ */}
            <TabsContent value="page-editor" className="space-y-4">
              {/* Page selection toolbar */}
              <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Globe className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-foreground block">Select Page / URL:</span>
                    <span className="text-[11px] text-muted-foreground truncate block">
                      Edit custom structured data injected directly into this page&apos;s &lt;head&gt;.
                    </span>
                  </div>
                </div>

                {/* Searchable Page Selector with integrated Search Bar */}
                <div className="relative w-full md:w-96 shrink-0" ref={dropdownRef}>
                  {/* Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className="h-10 w-full px-3 rounded-xl border border-border bg-background hover:bg-muted/30 text-xs font-medium text-foreground flex items-center justify-between gap-2 shadow-2xs transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-muted border border-border/80 text-foreground shrink-0 uppercase">
                        {selectedPage?.type || 'PAGE'}
                      </span>
                      <span className="truncate font-semibold text-foreground">
                        {selectedPage?.title || 'Select page...'}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono truncate hidden sm:inline">
                        (/{selectedPage?.slug || ''})
                      </span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                        isDropdownOpen ? 'rotate-180 text-primary' : ''
                      }`}
                    />
                  </button>

                  {/* Popover Menu with Live Search Bar */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-full sm:w-[420px] bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 p-2 space-y-2">
                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                        <Input
                          value={pageSearch}
                          onChange={(e) => setPageSearch(e.target.value)}
                          placeholder="Search pages by title, slug, or type..."
                          className="h-8 pl-8 pr-7 text-xs rounded-xl bg-muted/40 border-border focus:bg-background"
                          autoFocus
                        />
                        {pageSearch && (
                          <button
                            type="button"
                            onClick={() => setPageSearch('')}
                            className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground text-xs"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Quick Type Filter Pills */}
                      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                        {(['ALL', 'PAGE', 'SERVICE', 'BLOG', 'PORTFOLIO'] as const).map((t) => {
                          const count = typeCounts[t] || 0;
                          if (t !== 'ALL' && count === 0) return null;
                          const active = selectedTypeFilter === t;
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setSelectedTypeFilter(t)}
                              className={`px-2 py-0.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                                active
                                  ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                              }`}
                            >
                              {t === 'ALL' ? `All (${count})` : `${t} (${count})`}
                            </button>
                          );
                        })}
                      </div>

                      {/* Filtered Pages List */}
                      <div className="max-h-72 overflow-y-auto space-y-1 divide-y divide-border/40 pr-0.5">
                        {filteredPages.length === 0 ? (
                          <div className="py-6 text-center text-xs text-muted-foreground">
                            No pages found matching &quot;{pageSearch}&quot;
                          </div>
                        ) : (
                          filteredPages.map((p) => {
                            const isSelected = p.id === selectedPageId;
                            const hasCustomSchema = Boolean(p.seoMetadata?.structuredData);
                            const pType = (p.type || 'PAGE').toUpperCase();

                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  handlePageSelect(p.id);
                                  setIsDropdownOpen(false);
                                }}
                                className={`w-full text-left p-2 rounded-xl flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-primary/10 text-primary font-semibold'
                                    : 'hover:bg-muted/50 text-foreground'
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold tracking-wide uppercase ${
                                        pType === 'SERVICE'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : pType === 'BLOG'
                                          ? 'bg-amber-100 text-amber-800'
                                          : pType === 'PORTFOLIO'
                                          ? 'bg-purple-100 text-purple-800'
                                          : 'bg-blue-100 text-blue-800'
                                      }`}
                                    >
                                      {pType}
                                    </span>
                                    <span className="font-semibold truncate text-foreground">{p.title}</span>
                                  </div>
                                  <div className="text-[11px] text-muted-foreground font-mono truncate mt-0.5">
                                    /{p.slug}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  {hasCustomSchema ? (
                                    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                                      <Check className="h-2.5 w-2.5" /> Schema
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">
                                      Default
                                    </span>
                                  )}
                                  {isSelected && <Check className="h-4 w-4 text-primary ml-1" />}
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Template shortcuts */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mr-1">
                    <Wand2 className="h-3 w-3 text-primary" />
                    Insert Template:
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2.5 text-[11px] rounded-lg border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 font-semibold cursor-pointer flex items-center gap-1"
                    onClick={handleGenerateForCurrentPage}
                  >
                    <Sparkles className="h-3 w-3 text-primary" />
                    Auto-Generate for This Page
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2.5 text-[11px] rounded-lg cursor-pointer"
                    onClick={() => applyTemplate('Service')}
                  >
                    Service
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2.5 text-[11px] rounded-lg cursor-pointer"
                    onClick={() => applyTemplate('FAQPage')}
                  >
                    FAQPage
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2.5 text-[11px] rounded-lg cursor-pointer"
                    onClick={() => applyTemplate('Article')}
                  >
                    Article
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2.5 text-[11px] rounded-lg cursor-pointer"
                    onClick={() => applyTemplate('LocalBusiness')}
                  >
                    LocalBusiness
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2.5 text-[11px] rounded-lg cursor-pointer"
                    onClick={() => applyTemplate('BreadcrumbList')}
                  >
                    Breadcrumbs
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2.5 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                    onClick={handleFormatJson}
                    disabled={!schemaCode.trim()}
                  >
                    Format JSON
                  </Button>
                  {schemaCode.trim() && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2.5 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                      onClick={() => copyToClipboard('Custom Page Schema', schemaCode)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  )}
                </div>
              </div>

              {/* Editor area */}
              <div className="space-y-2">
                <div className="relative">
                  <Textarea
                    value={schemaCode}
                    onChange={handleCodeChange}
                    rows={12}
                    placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "Service",\n  "name": "Custom Shopify Development",\n  "description": "..."\n}'}
                    className="w-full rounded-xl text-xs font-mono leading-relaxed bg-slate-950 text-emerald-400 p-4 border-slate-800 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 selection:bg-primary/20"
                  />
                </div>

                {/* Validation Status & Save Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {jsonError ? (
                      <div className="flex items-center gap-1.5 text-rose-500 text-xs">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span className="truncate">JSON Syntax Error: {jsonError}</span>
                      </div>
                    ) : schemaCode.trim() ? (
                      <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-medium">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>Valid JSON-LD Schema</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        No custom schema defined for this page yet (core Organization &amp; WebSite still apply).
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={handleSavePageSchema}
                      disabled={savingPageSchema || Boolean(jsonError)}
                      className="h-8 px-4 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs gap-1.5"
                    >
                      {savingPageSchema ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          Saving Schema…
                        </>
                      ) : (
                        <>
                          <Save className="h-3.5 w-3.5" />
                          Save Structured Data
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ════════════════════════════════════════════════════════
                TAB 2: SITE-WIDE CORE SCHEMAS (ORGANIZATION & WEBSITE)
               ════════════════════════════════════════════════════════ */}
            <TabsContent value="core-schemas" className="space-y-5">
              {/* Validation Warning / Success Banner */}
              {orgValidation.length > 0 ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-amber-700 dark:text-amber-300">
                        Missing Recommended Core Schema Fields ({orgValidation.length}):
                      </span>
                      {onNavigateTab && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onNavigateTab('global')}
                          className="h-6 text-[11px] px-2 rounded-lg cursor-pointer border-amber-500/30 text-amber-700 hover:bg-amber-500/20"
                        >
                          <Sliders className="h-3 w-3 mr-1" />
                          Edit in Global SEO
                        </Button>
                      )}
                    </div>
                    <ul className="list-disc pl-4 text-muted-foreground space-y-0.5">
                      {orgValidation.map((issue, idx) => (
                        <li key={idx}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      Site-wide Organization &amp; WebSite structured data schemas are fully configured and verified.
                    </span>
                  </div>
                  {onNavigateTab && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onNavigateTab('global')}
                      className="h-7 text-xs rounded-xl cursor-pointer"
                    >
                      <Sliders className="h-3 w-3 mr-1.5" />
                      Configure Global SEO
                    </Button>
                  )}
                </div>
              )}

              {/* Core Schemas Tabs */}
              <Tabs defaultValue="org" className="space-y-4">
                <TabsList className="h-8 bg-muted/60 p-0.5 rounded-xl inline-flex w-auto gap-0.5">
                  <TabsTrigger value="org" className="h-7 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                    <Building className="h-3 w-3" />
                    Organization Schema
                  </TabsTrigger>
                  <TabsTrigger value="website" className="h-7 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                    <Globe className="h-3 w-3" />
                    WebSite Schema
                  </TabsTrigger>
                </TabsList>

                {/* Organization Output */}
                <TabsContent value="org" className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Schema.org/Organization JSON-LD (injected automatically into &lt;head&gt; across the site):
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs rounded-lg cursor-pointer"
                      onClick={() => copyToClipboard('Organization', organizationSchema)}
                    >
                      {copiedType === 'Organization' ? (
                        <Check className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 mr-1" />
                      )}
                      Copy JSON-LD
                    </Button>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800 max-h-96">
                    {JSON.stringify(organizationSchema, null, 2)}
                  </pre>
                </TabsContent>

                {/* WebSite Output */}
                <TabsContent value="website" className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Schema.org/WebSite with Google Sitelinks SearchAction:
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs rounded-lg cursor-pointer"
                      onClick={() => copyToClipboard('WebSite', websiteSchema)}
                    >
                      {copiedType === 'WebSite' ? (
                        <Check className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 mr-1" />
                      )}
                      Copy JSON-LD
                    </Button>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800 max-h-96">
                    {JSON.stringify(websiteSchema, null, 2)}
                  </pre>
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* ════════════════════════════════════════════════════════
                TAB 3: HOW STRUCTURED DATA WORKS (GUIDE)
               ════════════════════════════════════════════════════════ */}
            <TabsContent value="guide" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Building className="h-4 w-4" />
                  </div>
                  <h4 className="text-xs font-bold text-foreground">1. Global Brand Schema</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Configured under the <strong>Global SEO</strong> tab. Populates your company name, logo, official social profiles (<code className="text-[10px]">sameAs</code>), address, and contact info across all pages for Google Knowledge Graph.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <FileText className="h-4 w-4" />
                  </div>
                  <h4 className="text-xs font-bold text-foreground">2. Page-Specific Schemas</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Custom schemas (e.g. <strong>Service</strong>, <strong>FAQPage</strong>, <strong>BlogPosting</strong>) injected on individual pages to unlock Google Rich Snippets, expandable FAQ accordions, and star ratings.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                  <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h4 className="text-xs font-bold text-foreground">3. Google &amp; AI Testing</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Validate schemas directly using Google Rich Results Test and Schema.org Validator. Search engines and AI answer engines (Perplexity, ChatGPT Search) index these JSON-LD blocks to cite Gypsym.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
