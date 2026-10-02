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
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  LayoutGrid,
  List,
  MapPin,
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
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { notify } from '@/lib/notifications';
import { fetchApi } from '@/lib/api-client';
import { AdminContentContainer, AdminPageHeader } from '@/components/layout/admin-page';
import { StatusToggleField } from '@/components/crud/status-toggle-field';
import { getSiteUrl } from '@/lib/site-url';
import type { PageData } from '../_components/types';

// ─── Types ────────────────────────────────────────────────────────────────────

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
  return { name: cleanTitle, flag: '🌐', currency: 'USD', region: 'International' };
}

const EIGHT_SECTIONS_SPEC = [
  { id: 'hero-banner',              label: '1. Hero Section',          desc: 'Localized headline, subtext, background image & CTA' },
  { id: 'verified-results-metrics', label: '2. Verified Results',       desc: '+318% volume surge, 42ms TTFB, $1.4B+ GMV' },
  { id: 'portfolio-showcase',       label: '3. Portfolio',              desc: 'High-conversion flagship case studies' },
  { id: 'delivery-process',         label: '4. Delivery Methodology',   desc: '4-phase architecture, build, CRO & SLA' },
  { id: 'client-testimonials',      label: '5. Client Love',            desc: 'Executive endorsements & client ratings' },
  { id: 'clients-partners',         label: '6. Clients & Partners',     desc: 'Global enterprise logo cloud & metrics ribbon' },
  { id: 'contact-inquiry',          label: '7. Direct Engagement',      desc: 'High-intent consultation form with NDA' },
  { id: 'homepage-cta',             label: '8. Enterprise Architecture', desc: 'Final conversion banner before footer' },
];

// ─── Edit/Create Dialog ───────────────────────────────────────────────────────

interface CountryEditDialogProps {
  open: boolean;
  page: PageData | null;
  saving: boolean;
  onClose: () => void;
  // form state lifted up
  formCountryName: string; setFormCountryName: (v: string) => void;
  formSlug: string; setFormSlug: (v: string) => void;
  formHeroTitle: string; setFormHeroTitle: (v: string) => void;
  formHeroTitleHighlight: string; setFormHeroTitleHighlight: (v: string) => void;
  formHeroDescription: string; setFormHeroDescription: (v: string) => void;
  formHeroImage: string; setFormHeroImage: (v: string) => void;
  formStatus: 'PUBLISHED' | 'DRAFT'; setFormStatus: (v: 'PUBLISHED' | 'DRAFT') => void;
  formMetaTitle: string; setFormMetaTitle: (v: string) => void;
  formMetaDesc: string; setFormMetaDesc: (v: string) => void;
  onSave: () => void;
}

function CountryEditDialog({
  open, page, saving, onClose,
  formCountryName, setFormCountryName,
  formSlug, setFormSlug,
  formHeroTitle, setFormHeroTitle,
  formHeroTitleHighlight, setFormHeroTitleHighlight,
  formHeroDescription, setFormHeroDescription,
  formHeroImage, setFormHeroImage,
  formStatus, setFormStatus,
  formMetaTitle, setFormMetaTitle,
  formMetaDesc, setFormMetaDesc,
  onSave,
}: CountryEditDialogProps) {
  const flag = page ? getCountryMeta(page.slug, page.title).flag : '🌐';

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] rounded-2xl border-slate-200 bg-white shadow-2xl p-0 flex flex-col overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xl leading-none">
              {flag}
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                {page ? `Edit Country Page · ${formCountryName || page.title?.replace(' | Gypsym Technology', '')}` : 'Country Page Settings'}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Configure page identity, hero content, background image, and SEO metadata.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tabbed Form Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <Tabs defaultValue="hero" className="w-full space-y-4">
            <TabsList className="grid grid-cols-3 bg-slate-100 p-1 rounded-xl">
              <TabsTrigger value="hero" className="rounded-lg text-xs font-semibold">Hero &amp; Copy</TabsTrigger>
              <TabsTrigger value="image" className="rounded-lg text-xs font-semibold">Background Image</TabsTrigger>
              <TabsTrigger value="seo" className="rounded-lg text-xs font-semibold">SEO &amp; Indexing</TabsTrigger>
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
                <span className="text-[10px] text-slate-400">This exact phrase will be styled with editorial serif italics.</span>
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

              <StatusToggleField value={formStatus} onChange={(st) => setFormStatus(st as any)} />
            </TabsContent>

            {/* TAB 2: Background Image */}
            <TabsContent value="image" className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Hero Background Image</label>
                <ImageUploadField
                  value={formHeroImage}
                  onChange={setFormHeroImage}
                  label="Upload or Select Hero Background"
                  description="Recommended: 1920×1080 high-contrast modern architectural image."
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
                  <img src={formHeroImage} alt="Preview" className="w-full h-full object-cover" />
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
                <span className={`text-[10px] font-mono ${formMetaDesc.length > 160 ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
                  {formMetaDesc.length}/160 chars
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800">
                <p className="font-semibold mb-1">Canonical URL (auto-generated)</p>
                <code className="font-mono text-[11px] text-blue-700">https://gypsym.com/{formSlug || 'slug'}</code>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 shrink-0 flex items-center justify-between bg-slate-50/60">
          <Button variant="outline" size="sm" onClick={onClose} className="cursor-pointer">
            Cancel
          </Button>
          <Button size="sm" onClick={onSave} disabled={saving} className="shadow-xs cursor-pointer">
            {saving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : null}
            <span>Save Changes</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CountryPagesManagementPage() {
  const [loading, setLoading] = React.useState(true);
  const [pages, setPages] = React.useState<PageData[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [viewMode, setViewMode] = React.useState<'table' | 'grid'>('table');

  // Selection & bulk actions
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [bulkWorking, setBulkWorking] = React.useState(false);

  // Edit modal state
  const [editOpen, setEditOpen] = React.useState(false);
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

  // Create modal state
  const [createOpen, setCreateOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [createCountryName, setCreateCountryName] = React.useState('');
  const [createSlug, setCreateSlug] = React.useState('');
  const [createFlag, setCreateFlag] = React.useState('🌐');
  const [createHeroTitle, setCreateHeroTitle] = React.useState('');
  const [createHeroDescription, setCreateHeroDescription] = React.useState('');
  const [createHeroImage, setCreateHeroImage] = React.useState('');

  // ── Data Loading ────────────────────────────────────────────────────────────
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

  React.useEffect(() => { loadData(); }, [loadData]);

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

  // ── Selection ───────────────────────────────────────────────────────────────
  const allSelected = filteredPages.length > 0 && filteredPages.every((p) => selected.has(p.id || ''));
  const someSelected = selected.size > 0;

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredPages.map((p) => p.id || '')));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ── Bulk Actions ────────────────────────────────────────────────────────────
  const handleBulkStatus = async (status: 'PUBLISHED' | 'DRAFT') => {
    const ids = [...selected];
    if (!ids.length) return;
    setBulkWorking(true);
    try {
      await Promise.all(
        ids.map((id) => {
          const p = pages.find((pg) => pg.id === id);
          if (!p) return Promise.resolve();
          return fetchApi(`/pages/${p.slug}`, { method: 'PUT', body: JSON.stringify({ status }) });
        })
      );
      setPages((prev) => prev.map((p) => (selected.has(p.id || '') ? { ...p, status: status as any } : p)));
      setSelected(new Set<string>());
      notify.success(`${ids.length} pages updated to ${status === 'PUBLISHED' ? 'Published' : 'Draft'}.`);
    } catch {
      notify.error('Bulk status update failed.');
    } finally {
      setBulkWorking(false);
    }
  };

  const handleBulkDelete = async () => {
    const ids = [...selected];
    if (!ids.length) return;
    if (!confirm(`Delete ${ids.length} country page(s)? This cannot be undone.`)) return;
    setBulkWorking(true);
    try {
      await Promise.all(
        ids.map((id) => {
          const p = pages.find((pg) => pg.id === id);
          if (!p) return Promise.resolve();
          return fetchApi(`/pages/${p.slug}`, { method: 'DELETE' });
        })
      );
      setPages((prev) => prev.filter((p) => !selected.has(p.id || '')));
      setSelected(new Set<string>());
      notify.success(`${ids.length} country page(s) deleted.`);
    } catch {
      notify.error('Bulk delete failed.');
    } finally {
      setBulkWorking(false);
    }
  };

  // ── Single Row Actions ──────────────────────────────────────────────────────
  const handleToggleStatus = async (page: PageData) => {
    const nextStatus = page.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await fetchApi(`/pages/${page.slug}`, { method: 'PUT', body: JSON.stringify({ status: nextStatus }) });
      setPages((prev) => prev.map((p) => (p.slug === page.slug ? { ...p, status: nextStatus as any } : p)));
      notify.success(`Status updated to ${nextStatus === 'PUBLISHED' ? 'Published' : 'Draft'}.`);
    } catch {
      notify.error('Failed to update status.');
    }
  };

  const handleOpenEdit = async (page: PageData) => {
    setEditingPage(page);
    const meta = getCountryMeta(page.slug, page.title);

    let fullPage = page;
    try {
      const res = await fetchApi<PageData>(`/pages/${page.slug}`);
      if (res) fullPage = res;
    } catch { /* fallback */ }

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
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingPage?.slug) return;
    setSavingSettings(true);
    try {
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

      const ownHeroSection = editingPage.sections?.find((s) => s.componentType === 'HERO');
      const heroPayloadBase = {
        country: { name: formCountryName.trim() },
        headline: { segments: [{ value: formHeroTitle.trim(), type: 'text' }] },
        titleHighlight: formHeroTitleHighlight.trim(),
        description: { content: formHeroDescription.trim(), enabled: true },
        backgroundMedia: { desktopImageUrl: formHeroImage.trim() || '', mobileImageUrl: formHeroImage.trim() || '' },
      };

      if (ownHeroSection && ownHeroSection.id) {
        const curPayload = (ownHeroSection.contentPayload as Record<string, any>) || {};
        await fetchApi(`/sections/${ownHeroSection.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            contentPayload: {
              ...curPayload,
              ...heroPayloadBase,
              backgroundMedia: {
                ...curPayload.backgroundMedia,
                desktopImageUrl: formHeroImage.trim() || curPayload.backgroundMedia?.desktopImageUrl,
                mobileImageUrl: formHeroImage.trim() || curPayload.backgroundMedia?.mobileImageUrl,
              },
            },
          }),
        });
      } else {
        await fetchApi(`/pages/${formSlug.trim() || editingPage.slug}/sections`, {
          method: 'POST',
          body: JSON.stringify({
            sectionIdentifier: 'hero-banner', componentType: 'HERO',
            displayOrder: 1, isActive: true, contentPayload: heroPayloadBase,
          }),
        });
      }

      notify.success(`Country page for "${formCountryName}" saved.`);
      setEditOpen(false);
      await loadData();
    } catch (err: any) {
      notify.error(err?.message || 'Failed to save country page settings');
    } finally {
      setSavingSettings(false);
    }
  };

  // ── Create ──────────────────────────────────────────────────────────────────
  const handleCreateCountry = async () => {
    if (!createCountryName.trim()) { notify.error('Country name is required.'); return; }
    const cleanSlug = (createSlug || createCountryName)
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setCreating(true);
    try {
      await fetchApi<PageData>('/pages', {
        method: 'POST',
        body: JSON.stringify({
          title: `${createCountryName.trim()} | Gypsym Technology`,
          slug: cleanSlug,
          description: createHeroDescription.trim(),
          layoutType: 'LANDING',
          status: 'PUBLISHED',
          seoMetadata: {
            metaTitle: `Shopify Plus Agency & Enterprise Commerce | ${createCountryName.trim()}`,
            metaDescription: createHeroDescription.trim(),
            canonicalUrl: `https://gypsym.com/${cleanSlug}`,
            robotsIndex: true, robotsFollow: true,
          },
        }),
      });
      notify.success(`Country page for "${createCountryName}" created.`);
      setCreateOpen(false);
      setCreateCountryName(''); setCreateSlug(''); setCreateFlag('🌐');
      setCreateHeroTitle(''); setCreateHeroDescription(''); setCreateHeroImage('');
      await loadData();
    } catch (err: any) {
      notify.error(err?.message || 'Failed to create country page');
    } finally {
      setCreating(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <AdminContentContainer variant="wide">
      {/* Header */}
      <AdminPageHeader
        title={
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Globe className="h-4 w-4" />
            </div>
            <span>Country Landing Pages</span>
          </div>
        }
        description="Localized high-conversion landing pages engineered with the complete 8-section enterprise sequence."
        status={
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-mono text-xs">
            {pages.length} Global Markets
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="cursor-pointer">
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5 cursor-pointer shadow-xs">
              <Plus className="h-4 w-4" />
              <span>New Country Page</span>
            </Button>
          </div>
        }
      />

      {/* Architecture strip */}
      <Card className="rounded-2xl border-border bg-muted/40 shadow-2xs p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Guaranteed 8-Section Architecture Structure
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Every country page strictly renders in the high-conversion sequence:</p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-foreground">
            {EIGHT_SECTIONS_SPEC.map((s) => (
              <span key={s.id} className="px-2 py-0.5 rounded-lg bg-card border border-border shadow-2xs flex items-center gap-1" title={s.desc}>
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>{s.label}</span>
              </span>
            ))}
          </div>
        </div>
      </Card>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative max-w-xs w-full sm:w-auto">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by name, slug, or region…"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSelected(new Set()); }}
            className="pl-9 h-9 rounded-xl border-border text-xs bg-card w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Bulk actions — visible when selection exists */}
          {someSelected && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <span className="text-xs font-semibold text-slate-600">{selected.size} selected</span>
              <div className="w-px h-4 bg-slate-200" />
              <Button
                variant="ghost" size="sm"
                onClick={() => handleBulkStatus('PUBLISHED')}
                disabled={bulkWorking}
                className="h-7 px-2 text-[11px] font-semibold text-emerald-600 hover:bg-emerald-50 cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5 mr-1" />
                Publish
              </Button>
              <Button
                variant="ghost" size="sm"
                onClick={() => handleBulkStatus('DRAFT')}
                disabled={bulkWorking}
                className="h-7 px-2 text-[11px] font-semibold text-amber-600 hover:bg-amber-50 cursor-pointer"
              >
                <EyeOff className="h-3.5 w-3.5 mr-1" />
                Draft
              </Button>
              <Button
                variant="ghost" size="sm"
                onClick={handleBulkDelete}
                disabled={bulkWorking}
                className="h-7 px-2 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Delete
              </Button>
            </div>
          )}

          {/* View toggle */}
          <div className="flex items-center border border-border rounded-xl overflow-hidden bg-card">
            <button
              onClick={() => setViewMode('table')}
              className={`h-8 px-2.5 flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`h-8 px-2.5 flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Loading country pages…</span>
        </div>
      ) : filteredPages.length === 0 ? (
        <Card className="p-12 text-center rounded-2xl border-dashed border-border">
          <Globe className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-foreground">No Country Pages Found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Create localized country pages to power targeted international market acquisitions.
          </p>
          <Button size="sm" onClick={() => setCreateOpen(true)} className="mt-4 cursor-pointer">
            <Plus className="h-3.5 w-3.5 mr-1" />
            <span>Create First Country Page</span>
          </Button>
        </Card>
      ) : viewMode === 'table' ? (
        /* ── TABLE VIEW ─────────────────────────────────────────────── */
        <Card className="rounded-2xl border-border overflow-hidden bg-card shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="rounded accent-primary h-4 w-4 cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-4">Country</th>
                  <th className="py-3.5 px-4">URL Slug</th>
                  <th className="py-3.5 px-4">Region</th>
                  <th className="py-3.5 px-4">Sections</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPages.map((page) => {
                  const meta = getCountryMeta(page.slug, page.title);
                  const liveUrl = `${getSiteUrl()}/${page.slug}`;
                  const heroSection = page.sections?.find((s) => s.componentType === 'HERO');
                  const heroPayload = (heroSection?.contentPayload as Record<string, any>) || {};
                  const bgImage = heroPayload.backgroundMedia?.desktopImageUrl || `/images/countries/${page.slug}.jpg`;
                  const isChecked = selected.has(page.id || '');

                  return (
                    <tr key={page.id} className={`hover:bg-muted/40 transition-colors ${isChecked ? 'bg-primary/3' : ''}`}>
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleOne(page.id || '')}
                          className="rounded accent-primary h-4 w-4 cursor-pointer"
                        />
                      </td>

                      {/* Country */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-14 rounded-lg overflow-hidden border border-border shrink-0 bg-muted">
                            <img
                              src={bgImage}
                              alt={meta.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.currentTarget as any).src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=200'; }}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-foreground">
                              <span className="text-sm leading-none">{meta.flag}</span>
                              <span>{(page.title || '').replace(' | Gypsym Technology', '')}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1 max-w-[200px]">
                              {page.description || 'No description set'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <code className="text-[11px] font-mono text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded-md">
                            /{page.slug}
                          </code>
                          <a href={liveUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary cursor-pointer">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </td>

                      {/* Region */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="text-[11px]">{meta.region}</span>
                        </div>
                      </td>

                      {/* Sections */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span className="text-[11px] font-medium text-emerald-600">8 Sections</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(page)}
                          className="cursor-pointer transition-transform hover:scale-105"
                          title={page.status === 'PUBLISHED' ? 'Click to Draft' : 'Click to Publish'}
                        >
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-bold uppercase tracking-wider ${
                              page.status === 'PUBLISHED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {page.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                          </Badge>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(page)}
                            className="h-8 rounded-xl border-border text-xs font-semibold hover:bg-muted cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                          <Link href={`/pages/countries/${page.slug}`}>
                            <Button size="sm" className="h-8 rounded-xl text-xs font-semibold cursor-pointer shadow-2xs">
                              <Settings2 className="h-3.5 w-3.5 mr-1" />
                              Studio
                              <ChevronRight className="h-3 w-3 ml-0.5" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="border-t border-border px-4 py-3 flex items-center justify-between bg-muted/30">
            <span className="text-[11px] text-muted-foreground font-mono">
              {filteredPages.length} country page{filteredPages.length !== 1 ? 's' : ''} {searchQuery ? `matching "${searchQuery}"` : 'total'}
            </span>
            {someSelected && (
              <span className="text-[11px] text-primary font-semibold">{selected.size} selected</span>
            )}
          </div>
        </Card>
      ) : (
        /* ── GRID VIEW ──────────────────────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredPages.map((page) => {
            const meta = getCountryMeta(page.slug, page.title);
            const liveUrl = `${getSiteUrl()}/${page.slug}`;
            const heroSection = page.sections?.find((s) => s.componentType === 'HERO');
            const heroPayload = (heroSection?.contentPayload as Record<string, any>) || {};
            const bgImage = heroPayload.backgroundMedia?.desktopImageUrl || `/images/countries/${page.slug}.jpg`;
            const isChecked = selected.has(page.id || '');

            return (
              <Card
                key={page.id}
                className={`rounded-2xl border bg-card shadow-2xs hover:shadow-md transition-all flex flex-col overflow-hidden group ${isChecked ? 'border-primary/50 ring-1 ring-primary/20' : 'border-border'}`}
              >
                {/* Visual Header */}
                <div className="relative h-40 w-full overflow-hidden bg-muted border-b border-border">
                  {/* Checkbox */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleOne(page.id || '')}
                      className="rounded accent-primary h-4 w-4 cursor-pointer bg-white/90 shadow-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  <img
                    src={bgImage}
                    alt={meta.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                    onError={(e) => { (e.currentTarget as any).src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  <div className="absolute top-3 right-3">
                    <button type="button" onClick={(e) => { e.stopPropagation(); handleToggleStatus(page); }} className="cursor-pointer">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border backdrop-blur-md ${
                        page.status === 'PUBLISHED' ? 'bg-emerald-500/80 text-white border-emerald-400' : 'bg-amber-500/80 text-white border-amber-400'
                      }`}>
                        {page.status === 'PUBLISHED' ? 'PUBLIC' : 'DRAFT'}
                      </span>
                    </button>
                  </div>

                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/90 backdrop-blur-md text-xs font-bold text-foreground shadow-xs">
                      <span className="text-base leading-none">{meta.flag}</span>
                      <span>{meta.name}</span>
                    </span>
                    <a href={liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] font-semibold text-white/90 hover:text-white bg-white/20 hover:bg-white/30 backdrop-blur-md px-2 py-0.5 rounded-lg transition-colors">
                      <span>Live</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {(page.title || '').replace(' | Gypsym Technology', '')}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {page.description || 'Enterprise Shopify Plus architecture and high-conversion engineering.'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="font-medium">8 Sections Registered</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground bg-muted border-border">
                      {meta.region}
                    </Badge>
                  </div>

                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenEdit(page)} className="border-border hover:bg-muted text-xs font-medium cursor-pointer">
                      <Edit3 className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                      <span>Edit</span>
                    </Button>
                    <Link href={`/pages/countries/${page.slug}`}>
                      <Button size="sm" className="w-full cursor-pointer shadow-2xs">
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

      {/* ── EDIT DIALOG ──────────────────────────────────────────────────────── */}
      <CountryEditDialog
        open={editOpen}
        page={editingPage}
        saving={savingSettings}
        onClose={() => setEditOpen(false)}
        formCountryName={formCountryName} setFormCountryName={setFormCountryName}
        formSlug={formSlug} setFormSlug={setFormSlug}
        formHeroTitle={formHeroTitle} setFormHeroTitle={setFormHeroTitle}
        formHeroTitleHighlight={formHeroTitleHighlight} setFormHeroTitleHighlight={setFormHeroTitleHighlight}
        formHeroDescription={formHeroDescription} setFormHeroDescription={setFormHeroDescription}
        formHeroImage={formHeroImage} setFormHeroImage={setFormHeroImage}
        formStatus={formStatus} setFormStatus={setFormStatus}
        formMetaTitle={formMetaTitle} setFormMetaTitle={setFormMetaTitle}
        formMetaDesc={formMetaDesc} setFormMetaDesc={setFormMetaDesc}
        onSave={handleSaveEdit}
      />

      {/* ── CREATE DIALOG ─────────────────────────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg rounded-2xl border-slate-200 bg-white shadow-2xl p-0 flex flex-col overflow-hidden">
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">Create New Country Page</DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Initializes a new country landing page equipped with the full 8-section enterprise layout.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3.5">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-semibold text-slate-700">Country Name *</label>
                <Input
                  value={createCountryName}
                  onChange={(e) => {
                    setCreateCountryName(e.target.value);
                    if (!createSlug) {
                      setCreateSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
                    }
                  }}
                  placeholder="e.g. Germany"
                  className="h-9 rounded-xl text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Flag Emoji</label>
                <Input value={createFlag} onChange={(e) => setCreateFlag(e.target.value)} placeholder="🇩🇪" className="h-9 rounded-xl text-xs text-center text-lg" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">URL Route Slug *</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-mono text-slate-400">/</span>
                <Input value={createSlug} onChange={(e) => setCreateSlug(e.target.value)} placeholder="germany" className="h-9 rounded-xl text-xs font-mono pl-6" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Hero Headline</label>
              <Input value={createHeroTitle} onChange={(e) => setCreateHeroTitle(e.target.value)} placeholder={`Enterprise Shopify Plus Engineering for ${createCountryName || 'the Region'}`} className="h-9 rounded-xl text-xs" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Hero Description</label>
              <Textarea value={createHeroDescription} onChange={(e) => setCreateHeroDescription(e.target.value)} rows={2} placeholder="Partnering with enterprise brands to engineer resilient commerce infrastructure…" className="rounded-xl text-xs leading-relaxed resize-none" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Background Image URL</label>
              <Input value={createHeroImage} onChange={(e) => setCreateHeroImage(e.target.value)} placeholder="/images/countries/sample.jpg or https://…" className="h-9 rounded-xl text-xs font-mono" />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 shrink-0 flex items-center justify-between bg-slate-50/60">
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)} className="cursor-pointer">Cancel</Button>
            <Button size="sm" onClick={handleCreateCountry} disabled={creating} className="shadow-xs cursor-pointer">
              {creating ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : null}
              <span>Create Country Page</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminContentContainer>
  );
}
