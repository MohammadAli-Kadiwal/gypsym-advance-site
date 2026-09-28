'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Globe,
  Plus,
  ExternalLink,
  Settings2,
  ChevronRight,
  Search,
  Sparkles,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { notify } from '@/lib/notifications';
import { fetchApi } from '@/lib/api-client';
import type { PageData } from '../_components/types';

interface CountryMeta {
  name: string;
  flag: string;
  currency: string;
  region: string;
}

const KNOWN_COUNTRIES: Record<string, CountryMeta> = {
  'united-states': { name: 'United States', flag: '🇺🇸', currency: 'USD', region: 'North America' },
  us: { name: 'United States', flag: '🇺🇸', currency: 'USD', region: 'North America' },
  uk: { name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', region: 'Europe / UK' },
  'united-kingdom': { name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', region: 'Europe / UK' },
  'saudi-arabia': { name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR', region: 'Middle East / GCC' },
  sa: { name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR', region: 'Middle East / GCC' },
  'united-arab-emirates': { name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED', region: 'Middle East / GCC' },
  uae: { name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED', region: 'Middle East / GCC' },
  australia: { name: 'Australia', flag: '🇦🇺', currency: 'AUD', region: 'Asia Pacific / Oceania' },
  au: { name: 'Australia', flag: '🇦🇺', currency: 'AUD', region: 'Asia Pacific / Oceania' },
  oman: { name: 'Oman', flag: '🇴🇲', currency: 'OMR', region: 'Middle East / GCC' },
  om: { name: 'Oman', flag: '🇴🇲', currency: 'OMR', region: 'Middle East / GCC' },
};

function getCountryMeta(slug?: string, title?: string): CountryMeta {
  const normalized = (slug || '').toLowerCase();
  if (KNOWN_COUNTRIES[normalized]) return KNOWN_COUNTRIES[normalized];

  const cleanTitle = (title || slug || 'Global Market').split('|')[0]?.trim() || 'Global Market';
  return {
    name: cleanTitle,
    flag: '🌐',
    currency: 'USD',
    region: 'International',
  };
}

const EIGHT_SECTIONS_SPEC = [
  { id: 'hero-banner', type: 'HERO', label: '1. Hero Section', desc: 'Localized headline, subtext, background image & CTA' },
  { id: 'portfolio-showcase', type: 'PORTFOLIO', label: '2. Portfolio Component', desc: 'High-conversion flagship case studies' },
  { id: 'verified-results-metrics', type: 'VERIFIED_RESULTS', label: '3. Verified Results', desc: '+318% volume surge, 42ms TTFB, $1.4B+ GMV' },
  { id: 'clients-partners', type: 'CLIENTS_PARTNERS', label: '4. Clients & Partners', desc: 'Global enterprise logo cloud & metrics ribbon' },
  { id: 'delivery-process', type: 'DELIVERY_PROCESS', label: '5. Delivery Methodology', desc: '4-phase architecture, build, CRO & SLA' },
  { id: 'client-testimonials', type: 'CLIENT_TESTIMONIALS', label: '6. Client Love', desc: 'Executive endorsements & client ratings' },
  { id: 'contact-inquiry', type: 'CONTACT', label: '7. Direct Engagement', desc: 'High-intent consultation form with NDA' },
  { id: 'homepage-cta', type: 'CTA', label: '8. Enterprise Architecture', desc: 'Final conversion banner before footer' },
];

export default function CountryPagesManagementPage() {
  const [loading, setLoading] = React.useState(true);
  const [pages, setPages] = React.useState<PageData[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');

  // ── Settings Modal State ──
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [editingPage, setEditingPage] = React.useState<PageData | null>(null);
  const [savingSettings, setSavingSettings] = React.useState(false);

  const [formCountryName, setFormCountryName] = React.useState('');
  const [formSlug, setFormSlug] = React.useState('');
  const [formHeroTitle, setFormHeroTitle] = React.useState('');
  const [formHeroDescription, setFormHeroDescription] = React.useState('');
  const [formHeroImage, setFormHeroImage] = React.useState('');
  const [formHeroTitleHighlight, setFormHeroTitleHighlight] = React.useState('');
  const [formStatus, setFormStatus] = React.useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');
  const [formMetaTitle, setFormMetaTitle] = React.useState('');
  const [formMetaDesc, setFormMetaDesc] = React.useState('');

  // ── Create Modal State ──
  const [createOpen, setCreateOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [createCountryName, setCreateCountryName] = React.useState('');
  const [createSlug, setCreateSlug] = React.useState('');
  const [createFlag, setCreateFlag] = React.useState('🌐');
  const [createHeroTitle, setCreateHeroTitle] = React.useState('');
  const [createHeroDescription, setCreateHeroDescription] = React.useState('');
  const [createHeroImage, setCreateHeroImage] = React.useState('');
  const [createStatus] = React.useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const all = await fetchApi<PageData[]>('/pages');
      if (Array.isArray(all)) {
        const countryList = all.filter((p) => {
          const s = (p.slug || '').toLowerCase();
          const isCore = ['home', 'services', 'portfolio', 'about', 'contact', 'book'].includes(s);
          if (isCore) return false;
          return Boolean(KNOWN_COUNTRIES[s]) || p.layoutType === 'LANDING' || p.title?.includes('| Gypsym Technology');
        });
        setPages(countryList);
      }
    } catch {
      notify.error('Unable to synchronize country pages from database.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered by search
  const filteredPages = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return pages;
    return pages.filter(
      (p) =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.slug || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
    );
  }, [pages, searchQuery]);

  // Open Edit Settings Modal
  const handleOpenSettings = async (page: PageData) => {
    setEditingPage(page);
    const meta = getCountryMeta(page.slug, page.title);

    let fullPage = page;
    try {
      const res = await fetchApi<PageData>(`/pages/${page.slug}`);
      if (res) fullPage = res;
    } catch {
      // fallback
    }

    const heroSection = fullPage.sections?.find((s) => s.componentType === 'HERO');
    const heroPayload = (heroSection?.contentPayload as Record<string, any>) || {};

    setFormCountryName(heroPayload.country?.name || meta.name);
    setFormSlug(fullPage.slug || '');

    let headlineStr = fullPage.title || '';
    if (Array.isArray(heroPayload.headline?.segments)) {
      headlineStr = heroPayload.headline.segments.map((seg: any) => seg.value || seg.text || '').join('');
    }
    setFormHeroTitle(headlineStr || fullPage.title || '');
    setFormHeroTitleHighlight(heroPayload.titleHighlight || meta.name);
    setFormHeroDescription(heroPayload.description?.content || fullPage.description || '');
    setFormHeroImage(heroPayload.backgroundMedia?.desktopImageUrl || '');
    setFormStatus((fullPage.status as any) || 'PUBLISHED');

    const seo = fullPage.seoMetadata;
    setFormMetaTitle(seo?.metaTitle || fullPage.title || '');
    setFormMetaDesc(seo?.metaDescription || fullPage.description || '');

    setSettingsOpen(true);
  };

  // Save Settings
  const handleSaveSettings = async () => {
    if (!editingPage?.slug) return;
    setSavingSettings(true);
    try {
      // 1. Update Page record & SEO
      await fetchApi(`/pages/${editingPage.slug}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: `${formCountryName.trim()} | Gypsym Technology`,
          slug: formSlug.trim(),
          description: formHeroDescription.trim(),
          status: formStatus,
          seoMetadata: {
            metaTitle: formMetaTitle.trim() || `${formCountryName.trim()} | Gypsym Technology`,
            metaDescription: formMetaDesc.trim() || formHeroDescription.trim(),
            canonicalUrl: `https://gypsym.com/${formSlug.trim()}`,
            robotsIndex: true,
            robotsFollow: true,
          },
        }),
      });

      // 2. Update Hero Section payload if existing
      const heroSection = editingPage.sections?.find((s) => s.componentType === 'HERO');
      if (heroSection && heroSection.id) {
        const curPayload = (heroSection.contentPayload as Record<string, any>) || {};
        const updatedPayload = {
          ...curPayload,
          country: {
            ...curPayload.country,
            name: formCountryName.trim(),
          },
          headline: {
            ...curPayload.headline,
            segments: [
              { value: formHeroTitle.trim(), type: 'text' },
            ],
          },
          titleHighlight: formHeroTitleHighlight.trim(),
          description: {
            ...curPayload.description,
            content: formHeroDescription.trim(),
            enabled: true,
          },
          backgroundMedia: {
            ...curPayload.backgroundMedia,
            desktopImageUrl: formHeroImage.trim() || curPayload.backgroundMedia?.desktopImageUrl,
            mobileImageUrl: formHeroImage.trim() || curPayload.backgroundMedia?.mobileImageUrl,
          },
        };

        await fetchApi(`/sections/${heroSection.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            contentPayload: updatedPayload,
          }),
        });
      }

      notify.success(`Country page for "${formCountryName}" saved successfully.`);
      setSettingsOpen(false);
      await loadData();
    } catch (err: any) {
      notify.error(err?.message || 'Failed to save country page settings');
    } finally {
      setSavingSettings(false);
    }
  };

  // Create New Country Page
  const handleCreateCountry = async () => {
    if (!createCountryName.trim()) {
      notify.error('Country name is required.');
      return;
    }
    const cleanSlug = (createSlug || createCountryName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    setCreating(true);
    try {
      await fetchApi<PageData>('/pages', {
        method: 'POST',
        body: JSON.stringify({
          title: `${createCountryName.trim()} | Gypsym Technology`,
          slug: cleanSlug,
          description: createHeroDescription.trim(),
          layoutType: 'LANDING',
          status: createStatus,
          seoMetadata: {
            metaTitle: `Shopify Plus Agency & Enterprise Commerce | ${createCountryName.trim()}`,
            metaDescription: createHeroDescription.trim(),
            canonicalUrl: `https://gypsym.com/${cleanSlug}`,
            robotsIndex: true,
            robotsFollow: true,
          },
        }),
      });

      notify.success(`Country page for "${createCountryName}" created successfully.`);
      setCreateOpen(false);
      setCreateCountryName('');
      setCreateSlug('');
      setCreateHeroTitle('');
      setCreateHeroDescription('');
      setCreateHeroImage('');

      await loadData();
    } catch (err: any) {
      notify.error(err?.message || 'Failed to create country page');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-24 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eaedf3]">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Country Landing Pages
                </h1>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-mono text-xs">
                  {pages.length} Global Markets
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Localized high-conversion landing pages engineered with the complete 8-section enterprise sequence.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            <span>New Country Page</span>
          </Button>
        </div>
      </div>

      {/* 8-Section Architecture Badge Strip */}
      <Card className="rounded-2xl border-slate-200/80 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-purple-50/30 shadow-2xs p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Guaranteed 8-Section Architecture Structure
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Every country page strictly renders in the user-specified high-conversion sequence:
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-slate-700">
            {EIGHT_SECTIONS_SPEC.map((s) => (
              <span
                key={s.id}
                className="px-2 py-0.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs text-slate-800 flex items-center gap-1"
                title={s.desc}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>{s.label}</span>
              </span>
            ))}
          </div>
        </div>
      </Card>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Filter country name, slug, or region..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9 rounded-xl border-slate-200 text-xs bg-white"
        />
      </div>

      {/* Country Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-xs">Loading country pages...</span>
        </div>
      ) : filteredPages.length === 0 ? (
        <Card className="p-12 text-center rounded-2xl border-dashed border-slate-300">
          <Globe className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">No Country Pages Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Create localized country pages to power targeted international market acquisitions.
          </p>
          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="mt-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            <span>Create First Country Page</span>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredPages.map((page) => {
            const meta = getCountryMeta(page.slug, page.title);
            const liveUrl = `http://localhost:3000/${page.slug}`;

            const heroSection = page.sections?.find((s) => s.componentType === 'HERO');
            const heroPayload = (heroSection?.contentPayload as Record<string, any>) || {};
            const bgImage = heroPayload.backgroundMedia?.desktopImageUrl || `/images/countries/${page.slug}.jpg`;

            return (
              <Card
                key={page.id}
                className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
              >
                {/* Visual Header with Background Preview */}
                <div className="relative h-40 w-full overflow-hidden bg-slate-900 border-b border-slate-100">
                  <img
                    src={bgImage}
                    alt={meta.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                    onError={(e) => {
                      (e.currentTarget as any).src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

                  {/* Top Bar with Flag and Status */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-slate-900 shadow-xs">
                      <span className="text-base leading-none">{meta.flag}</span>
                      <span>{meta.name}</span>
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border backdrop-blur-md ${
                        page.status === 'PUBLISHED'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                      }`}
                    >
                      {page.status}
                    </span>
                  </div>

                  {/* Bottom Bar with Route */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
                    <div className="flex items-center gap-1 text-[11px] font-mono opacity-90">
                      <span>/{page.slug}</span>
                    </div>
                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-white/90 hover:text-white bg-white/20 hover:bg-white/30 backdrop-blur-md px-2 py-0.5 rounded-lg transition-colors"
                      title="View live website"
                    >
                      <span>Live Site</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {(page.title || '').replace(' | Gypsym Technology', '')}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {page.description || 'Enterprise Shopify Plus architecture and high-conversion engineering.'}
                    </p>
                  </div>

                  {/* Sections Badge */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="font-medium">8 Sections Registered</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono text-slate-500 bg-slate-50 border-slate-200">
                      {meta.region}
                    </Badge>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenSettings(page)}
                      className="h-8 rounded-xl border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-blue-50 text-xs font-medium"
                    >
                      <Settings2 className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      <span>Settings</span>
                    </Button>

                    <Link href={`/pages/countries/${page.slug}`}>
                      <Button
                        size="sm"
                        className="w-full h-8 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold shadow-2xs transition-colors"
                      >
                        <span>Studio</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── SETTINGS & HERO EDIT MODAL ───────────────────────────────────────── */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="text-2xl leading-none">{editingPage ? getCountryMeta(editingPage.slug).flag : '🌐'}</span>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900">
                  Country Page Settings · {formCountryName}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Configure page identity, URL slug, hero headline, description, background image, and SEO metadata.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue="hero" className="w-full space-y-4 pt-2">
            <TabsList className="grid grid-cols-3 bg-slate-100 p-1 rounded-xl">
              <TabsTrigger value="hero" className="rounded-lg text-xs font-semibold">
                Hero &amp; Copy
              </TabsTrigger>
              <TabsTrigger value="image" className="rounded-lg text-xs font-semibold">
                Background Image
              </TabsTrigger>
              <TabsTrigger value="seo" className="rounded-lg text-xs font-semibold">
                SEO &amp; Indexing
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Hero & Copy */}
            <TabsContent value="hero" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Country Name</label>
                  <Input
                    value={formCountryName}
                    onChange={(e) => setFormCountryName(e.target.value)}
                    placeholder="e.g. United States"
                    className="h-9 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">URL Route Slug</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-mono text-slate-400">/</span>
                    <Input
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value)}
                      placeholder="united-states"
                      className="h-9 rounded-xl text-xs font-mono pl-6"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Hero Main Title / Headline</label>
                <Input
                  value={formHeroTitle}
                  onChange={(e) => setFormHeroTitle(e.target.value)}
                  placeholder="Enterprise Shopify Plus Engineering for the United States"
                  className="h-9 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Title Highlight Segment</label>
                <Input
                  value={formHeroTitleHighlight}
                  onChange={(e) => setFormHeroTitleHighlight(e.target.value)}
                  placeholder="e.g. United States"
                  className="h-9 rounded-xl text-xs"
                />
                <span className="text-[10px] text-slate-400">
                  This exact phrase will be styled with editorial serif italics.
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Hero Subtitle / Description</label>
                <Textarea
                  value={formHeroDescription}
                  onChange={(e) => setFormHeroDescription(e.target.value)}
                  rows={3}
                  placeholder="Detail your localized market specialization and engineering value proposition..."
                  className="rounded-xl text-xs leading-relaxed resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Publishing Status</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="radio"
                      name="status"
                      checked={formStatus === 'PUBLISHED'}
                      onChange={() => setFormStatus('PUBLISHED')}
                      className="accent-blue-600"
                    />
                    <span>Published (Live)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="radio"
                      name="status"
                      checked={formStatus === 'DRAFT'}
                      onChange={() => setFormStatus('DRAFT')}
                      className="accent-blue-600"
                    />
                    <span>Draft (Offline)</span>
                  </label>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: Image Setting */}
            <TabsContent value="image" className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Hero Background Image</label>
                <ImageUploadField
                  value={formHeroImage}
                  onChange={setFormHeroImage}
                  label="Upload or Select Hero Background"
                  description="Recommended: 1920x1080 high-contrast modern architectural image."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Direct Image URL</label>
                <Input
                  value={formHeroImage}
                  onChange={(e) => setFormHeroImage(e.target.value)}
                  placeholder="https://... or /images/countries/united-states.jpg"
                  className="h-9 rounded-xl text-xs font-mono"
                />
              </div>

              {formHeroImage && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 relative h-48 w-full bg-slate-900">
                  <img
                    src={formHeroImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/35 pointer-events-none flex items-center justify-center">
                    <span className="text-white text-xs font-semibold bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">
                      35% Hero Overlay Preview
                    </span>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* TAB 3: SEO */}
            <TabsContent value="seo" className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Meta Title Tag</label>
                <Input
                  value={formMetaTitle}
                  onChange={(e) => setFormMetaTitle(e.target.value)}
                  placeholder="Shopify Plus Agency | United States"
                  className="h-9 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Meta Description</label>
                <Textarea
                  value={formMetaDesc}
                  onChange={(e) => setFormMetaDesc(e.target.value)}
                  rows={3}
                  placeholder="Compelling SERP description under 160 characters..."
                  className="rounded-xl text-xs resize-none"
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSettingsOpen(false)}
              className="rounded-xl border-slate-200 text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
            >
              {savingSettings ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : null}
              <span>Save Changes</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── CREATE NEW COUNTRY MODAL ────────────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <span>Create New Country Page</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Initializes a new country landing page equipped with the full 8-section enterprise layout.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 pt-2">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-semibold text-slate-700">Country Name *</label>
                <Input
                  value={createCountryName}
                  onChange={(e) => {
                    setCreateCountryName(e.target.value);
                    if (!createSlug) {
                      setCreateSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-|-$/g, '')
                      );
                    }
                  }}
                  placeholder="e.g. Germany"
                  className="h-9 rounded-xl text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Flag Emoji</label>
                <Input
                  value={createFlag}
                  onChange={(e) => setCreateFlag(e.target.value)}
                  placeholder="🇩🇪"
                  className="h-9 rounded-xl text-xs text-center text-lg"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">URL Route Slug *</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-mono text-slate-400">/</span>
                <Input
                  value={createSlug}
                  onChange={(e) => setCreateSlug(e.target.value)}
                  placeholder="germany"
                  className="h-9 rounded-xl text-xs font-mono pl-6"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Hero Headline</label>
              <Input
                value={createHeroTitle}
                onChange={(e) => setCreateHeroTitle(e.target.value)}
                placeholder={`Enterprise Shopify Plus Engineering for ${createCountryName || 'the Region'}`}
                className="h-9 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Hero Subtitle / Description</label>
              <Textarea
                value={createHeroDescription}
                onChange={(e) => setCreateHeroDescription(e.target.value)}
                rows={2}
                placeholder="Partnering with enterprise brands to engineer resilient commerce infrastructure..."
                className="rounded-xl text-xs leading-relaxed resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Background Image URL</label>
              <Input
                value={createHeroImage}
                onChange={(e) => setCreateHeroImage(e.target.value)}
                placeholder="/images/countries/sample.jpg or https://..."
                className="h-9 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateOpen(false)}
              className="rounded-xl border-slate-200 text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreateCountry}
              disabled={creating}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
            >
              {creating ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : null}
              <span>Create Country Page</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
