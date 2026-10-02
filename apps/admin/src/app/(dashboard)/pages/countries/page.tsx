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
  Coins,
  Clock,
  FileText,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
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
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { getSiteUrl } from '@/lib/site-url';
import type { PageData } from '../_components/types';
import {
  ALL_CURRENCIES,
  KNOWN_COUNTRIES,
  COUNTRY_PRESETS,
  findCountryLocale,
  getCountryMeta,
} from '../_components/country-locales';
import { TimezoneSearchSelect } from '../_components/timezone-search-select';

// ─── Edit/Create Dialog ───────────────────────────────────────────────────────

interface CountryEditDialogProps {
  open: boolean;
  page: PageData | null;
  saving: boolean;
  onClose: () => void;
  // form state lifted up
  formCountryName: string; setFormCountryName: (v: string) => void;
  formSlug: string; setFormSlug: (v: string) => void;
  formCurrency: string; setFormCurrency: (v: string) => void;
  formTimezone: string; setFormTimezone: (v: string) => void;
  formHeroTitle: string; setFormHeroTitle: (v: string) => void;
  formHeroTitleHighlight: string; setFormHeroTitleHighlight: (v: string) => void;
  formHeroDescription: string; setFormHeroDescription: (v: string) => void;
  formContent: string; setFormContent: (v: string) => void;
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
  formCurrency, setFormCurrency,
  formTimezone, setFormTimezone,
  formHeroTitle, setFormHeroTitle,
  formHeroTitleHighlight, setFormHeroTitleHighlight,
  formHeroDescription, setFormHeroDescription,
  formContent, setFormContent,
  formHeroImage, setFormHeroImage,
  formStatus, setFormStatus,
  formMetaTitle, setFormMetaTitle,
  formMetaDesc, setFormMetaDesc,
  onSave,
}: CountryEditDialogProps) {
  const flag = page ? getCountryMeta(page.slug, page.title).flag : '🌐';
  const [autoMatchedNotice, setAutoMatchedNotice] = React.useState<string | null>(null);

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
            <TabsList className="grid grid-cols-3 bg-slate-100 p-1 rounded-xl h-auto gap-1">
              <TabsTrigger value="hero" className="rounded-lg text-xs font-semibold py-1.5">Hero &amp; Copy</TabsTrigger>
              <TabsTrigger value="image" className="rounded-lg text-xs font-semibold py-1.5">Background Image</TabsTrigger>
              <TabsTrigger value="seo" className="rounded-lg text-xs font-semibold py-1.5">SEO &amp; Indexing</TabsTrigger>
            </TabsList>

            {/* TAB 1: Hero & Copy */}
            <TabsContent value="hero" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">Country Name</label>
                    {autoMatchedNotice && (
                      <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 animate-in fade-in">
                        <Sparkles className="h-2.5 w-2.5" />
                        {autoMatchedNotice}
                      </span>
                    )}
                  </div>
                  <Input
                    list="country-edit-presets"
                    value={formCountryName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormCountryName(val);
                      const matched = findCountryLocale(val);
                      if (matched) {
                        setFormCurrency(matched.currency);
                        setFormTimezone(matched.timezone);
                        setAutoMatchedNotice(`Auto-set: ${matched.timezone} (${matched.currency})`);
                      } else {
                        setAutoMatchedNotice(null);
                      }
                    }}
                    placeholder="e.g. United States, Germany, UAE, India..."
                    className="h-9 rounded-xl text-xs"
                  />
                  <datalist id="country-edit-presets">
                    {COUNTRY_PRESETS.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.flag} {c.name} ({c.currency} · {c.timezone})
                      </option>
                    ))}
                  </datalist>
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

              {/* Localization: All Currencies & Searchable Timezone */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Coins className="h-3.5 w-3.5 text-amber-500" />
                    <span>Market Currency ({ALL_CURRENCIES.length} available)</span>
                  </label>
                  <select
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value)}
                    className="w-full h-9 rounded-xl border border-input bg-white px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {ALL_CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-sky-500" />
                    <span>Business Timezone (Type &amp; Search)</span>
                  </label>
                  <TimezoneSearchSelect
                    value={formTimezone}
                    onChange={(tz) => {
                      setFormTimezone(tz);
                      setAutoMatchedNotice(null);
                    }}
                  />
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
                  rows={2}
                  placeholder="Detail your localized market specialization and engineering value proposition..."
                  className="rounded-xl text-xs leading-relaxed resize-none"
                />
              </div>

              {/* Page / Market Content */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-blue-600" />
                    <span>Page Content / Market Narrative (Rich Text)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Supports formatting, headings, lists, links &amp; preview
                  </span>
                </div>
                <RichTextEditor
                  value={formContent}
                  onChange={setFormContent}
                  placeholder="Localized market body content, engineering capabilities, regional commerce narrative, case studies, or strategic copy..."
                  minHeight="220px"
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
  const [formCurrency, setFormCurrency] = React.useState('USD');
  const [formTimezone, setFormTimezone] = React.useState('America/New_York');
  const [formHeroTitle, setFormHeroTitle] = React.useState('');
  const [formHeroDescription, setFormHeroDescription] = React.useState('');
  const [formContent, setFormContent] = React.useState('');
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
  const [createCurrency, setCreateCurrency] = React.useState('USD');
  const [createTimezone, setCreateTimezone] = React.useState('America/New_York');
  const [createHeroTitle, setCreateHeroTitle] = React.useState('');
  const [createHeroDescription, setCreateHeroDescription] = React.useState('');
  const [createContent, setCreateContent] = React.useState('');
  const [createHeroImage, setCreateHeroImage] = React.useState('');
  const [createAutoMatchedNotice, setCreateAutoMatchedNotice] = React.useState<string | null>(null);

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

  // Confirmation Dialog states
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = React.useState(false);
  const [singleDeleteTarget, setSingleDeleteTarget] = React.useState<PageData | null>(null);

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

  const handleExecuteBulkDelete = async () => {
    const ids = [...selected];
    if (!ids.length) return;
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
      setBulkDeleteConfirm(false);
    }
  };

  const handleExecuteSingleDelete = async () => {
    if (!singleDeleteTarget) return;
    try {
      await fetchApi(`/pages/${singleDeleteTarget.slug}`, { method: 'DELETE' });
      setPages((prev) => prev.filter((p) => p.slug !== singleDeleteTarget.slug));
      setSelected((prev) => {
        const next = new Set(prev);
        if (singleDeleteTarget.id) next.delete(singleDeleteTarget.id);
        return next;
      });
      notify.success(`Country page for "${singleDeleteTarget.title}" deleted.`);
    } catch {
      notify.error('Failed to delete country page.');
    } finally {
      setSingleDeleteTarget(null);
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
    setFormCurrency(heroPayload.country?.currency || meta.currency || 'USD');
    setFormTimezone(heroPayload.country?.timezone || meta.timezone || 'America/New_York');
    setFormSlug(fullPage.slug || '');
    let headlineStr = fullPage.title || '';
    if (Array.isArray(heroPayload.headline?.segments)) {
      headlineStr = heroPayload.headline.segments.map((seg: any) => seg.value || seg.text || '').join('');
    }
    setFormHeroTitle(headlineStr || fullPage.title || '');
    setFormHeroTitleHighlight(heroPayload.titleHighlight || meta.name);
    setFormHeroDescription(heroPayload.description?.content || fullPage.description || '');
    setFormContent(heroPayload.content || heroPayload.country?.content || fullPage.description || '');
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
          content: formContent.trim(),
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
        country: {
          name: formCountryName.trim(),
          currency: formCurrency.trim(),
          timezone: formTimezone.trim(),
          content: formContent.trim(),
        },
        content: formContent.trim(),
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
              country: {
                ...curPayload.country,
                name: formCountryName.trim(),
                currency: formCurrency.trim(),
                timezone: formTimezone.trim(),
                content: formContent.trim(),
              },
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
          content: createContent.trim(),
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

      // Initialize localized Hero section with country name, currency, timezone, content
      const heroPayloadBase = {
        country: {
          name: createCountryName.trim(),
          currency: createCurrency.trim(),
          timezone: createTimezone.trim(),
          content: createContent.trim(),
        },
        content: createContent.trim(),
        headline: {
          segments: [
            {
              value: createHeroTitle.trim() || `Enterprise Shopify Plus Engineering for ${createCountryName.trim()}`,
              type: 'text',
            },
          ],
        },
        titleHighlight: createCountryName.trim(),
        description: {
          content: createHeroDescription.trim() || `Partnering with enterprise brands in ${createCountryName.trim()} to engineer resilient commerce infrastructure.`,
          enabled: true,
        },
        backgroundMedia: {
          desktopImageUrl: createHeroImage.trim() || `/images/countries/${cleanSlug}.jpg`,
          mobileImageUrl: createHeroImage.trim() || `/images/countries/${cleanSlug}.jpg`,
          overlayOpacity: 0.38,
        },
      };

      await fetchApi(`/pages/${cleanSlug}/sections`, {
        method: 'POST',
        body: JSON.stringify({
          sectionIdentifier: 'hero-banner',
          componentType: 'HERO',
          displayOrder: 1,
          isActive: true,
          contentPayload: heroPayloadBase,
        }),
      });

      notify.success(`Country page for "${createCountryName}" created with ${createCurrency} and ${createTimezone}.`);
      setCreateOpen(false);
      setCreateCountryName(''); setCreateSlug(''); setCreateFlag('🌐');
      setCreateCurrency('USD'); setCreateTimezone('America/New_York');
      setCreateHeroTitle(''); setCreateHeroDescription(''); setCreateContent(''); setCreateHeroImage('');
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
                  const heroSection = page.sections?.find((s) => s.componentType === 'HERO');
                  const heroPayload = (heroSection?.contentPayload as Record<string, any>) || {};
                  const meta = getCountryMeta(page.slug, page.title, heroPayload);
                  const liveUrl = `${getSiteUrl()}/${page.slug}`;
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

                      {/* Region & Market Locale */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                            <span className="text-[11px] font-medium text-foreground">{meta.region}</span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/50" title={`Market Currency: ${meta.currency}`}>
                              <Coins className="h-2.5 w-2.5 text-amber-500" />
                              {meta.currency}
                            </span>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground bg-muted border border-border" title={`Business Timezone: ${meta.timezone}`}>
                              <Clock className="h-2.5 w-2.5 text-sky-500" />
                              {meta.timezone.split('/')[1]?.replace(/_/g, ' ') || meta.timezone}
                            </span>
                          </div>
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
                        <div className="flex items-center justify-end gap-1.5">
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSingleDeleteTarget(page)}
                            className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                            title="Delete Country Page"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
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
            const heroSection = page.sections?.find((s) => s.componentType === 'HERO');
            const heroPayload = (heroSection?.contentPayload as Record<string, any>) || {};
            const meta = getCountryMeta(page.slug, page.title, heroPayload);
            const liveUrl = `${getSiteUrl()}/${page.slug}`;
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

                  <div className="pt-2 border-t border-border flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="font-medium text-[11px]">8 Sections</span>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap justify-end">
                      <Badge variant="outline" className="text-[10px] font-mono text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-300/40" title={`Market Currency: ${meta.currency}`}>
                        <Coins className="h-2.5 w-2.5 mr-1 text-amber-500" />
                        {meta.currency}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground bg-muted border-border" title={`Business Timezone: ${meta.timezone}`}>
                        <Clock className="h-2.5 w-2.5 mr-1 text-sky-500" />
                        {meta.timezone.split('/')[1]?.replace(/_/g, ' ') || meta.timezone}
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-2 grid grid-cols-12 gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenEdit(page)} className="col-span-5 border-border hover:bg-muted text-xs font-medium cursor-pointer">
                      <Edit3 className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                      <span>Edit</span>
                    </Button>
                    <Link href={`/pages/countries/${page.slug}`} className="col-span-5">
                      <Button size="sm" className="w-full cursor-pointer shadow-2xs text-xs">
                        <span>Studio</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSingleDeleteTarget(page)}
                      className="col-span-2 p-0 border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 text-muted-foreground cursor-pointer flex items-center justify-center"
                      title="Delete Country Page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
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
        formCurrency={formCurrency} setFormCurrency={setFormCurrency}
        formTimezone={formTimezone} setFormTimezone={setFormTimezone}
        formHeroTitle={formHeroTitle} setFormHeroTitle={setFormHeroTitle}
        formHeroTitleHighlight={formHeroTitleHighlight} setFormHeroTitleHighlight={setFormHeroTitleHighlight}
        formHeroDescription={formHeroDescription} setFormHeroDescription={setFormHeroDescription}
        formContent={formContent} setFormContent={setFormContent}
        formHeroImage={formHeroImage} setFormHeroImage={setFormHeroImage}
        formStatus={formStatus} setFormStatus={setFormStatus}
        formMetaTitle={formMetaTitle} setFormMetaTitle={setFormMetaTitle}
        formMetaDesc={formMetaDesc} setFormMetaDesc={setFormMetaDesc}
        onSave={handleSaveEdit}
      />

      {/* ── CREATE DIALOG ─────────────────────────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="w-[95vw] max-w-lg rounded-2xl border-slate-200 bg-white shadow-2xl p-0 flex flex-col overflow-hidden max-h-[90vh]">
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xl leading-none">
                {createFlag}
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">Create New Country Page</DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Launch a localized market landing page with tailored currency, timezone, and complete 8-section sequence.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3.5">
            <div className="grid grid-cols-4 gap-2.5">
              <div className="col-span-3 space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Country Name *</label>
                  {createAutoMatchedNotice && (
                    <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 animate-in fade-in">
                      <Sparkles className="h-2.5 w-2.5" />
                      {createAutoMatchedNotice}
                    </span>
                  )}
                </div>
                <Input
                  list="country-create-presets"
                  value={createCountryName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCreateCountryName(val);
                    const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                    if (!createSlug || createSlug === createCountryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')) {
                      setCreateSlug(autoSlug);
                    }
                    const matched = findCountryLocale(val);
                    if (matched) {
                      setCreateFlag(matched.flag);
                      setCreateCurrency(matched.currency);
                      setCreateTimezone(matched.timezone);
                      setCreateAutoMatchedNotice(`Auto-set: ${matched.name} (${matched.timezone} · ${matched.currency})`);
                    } else {
                      setCreateAutoMatchedNotice(null);
                    }
                  }}
                  placeholder="e.g. Germany, UAE, India, United States..."
                  className="h-9 rounded-xl text-xs"
                />
                <datalist id="country-create-presets">
                  {COUNTRY_PRESETS.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.flag} {c.name} ({c.currency} · {c.timezone})
                    </option>
                  ))}
                </datalist>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Flag</label>
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

            {/* Currency & Searchable Timezone */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Coins className="h-3.5 w-3.5 text-amber-500" />
                  <span>Market Currency ({ALL_CURRENCIES.length}) *</span>
                </label>
                <select
                  value={createCurrency}
                  onChange={(e) => setCreateCurrency(e.target.value)}
                  className="w-full h-9 rounded-xl border border-input bg-white px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {ALL_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-sky-500" />
                  <span>Business Timezone (Type &amp; Search) *</span>
                </label>
                <TimezoneSearchSelect
                  value={createTimezone}
                  onChange={(tz) => {
                    setCreateTimezone(tz);
                    setCreateAutoMatchedNotice(null);
                  }}
                />
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

            {/* Page Content Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-blue-600" />
                  <span>Page Content / Market Narrative (Rich Text)</span>
                </label>
                <span className="text-[10px] text-slate-400">
                  Markdown, headings, lists &amp; links supported
                </span>
              </div>
              <RichTextEditor
                value={createContent}
                onChange={setCreateContent}
                placeholder="Localized market body content, engineering capabilities, regional commerce narrative, case studies, or strategic copy..."
                minHeight="200px"
              />
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

      {/* ─── Sticky Floating Bulk Action Dock ─────────────────────────── */}
      {someSelected && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center space-x-2.5 rounded-2xl border border-border bg-card/95 px-5 py-2.5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200 text-card-foreground">
          <span className="text-xs font-semibold text-foreground pr-2.5 border-r border-border">
            {selected.size} selected
          </span>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs rounded-xl border-border hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 cursor-pointer"
            onClick={() => handleBulkStatus('PUBLISHED')}
            disabled={bulkWorking}
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            <span>Publish</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs rounded-xl border-border hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 cursor-pointer"
            onClick={() => handleBulkStatus('DRAFT')}
            disabled={bulkWorking}
          >
            <EyeOff className="h-3.5 w-3.5 mr-1.5" />
            <span>Draft</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            className="h-8 text-xs rounded-xl shadow-xs cursor-pointer"
            onClick={() => setBulkDeleteConfirm(true)}
            disabled={bulkWorking}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            <span>Delete</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground hover:text-foreground rounded-xl ml-1 cursor-pointer"
            onClick={() => setSelected(new Set())}
          >
            Clear
          </Button>
        </div>
      )}

      {/* ─── Bulk Delete Confirmation Modal Popup ────────────────────── */}
      <ConfirmDialog
        open={bulkDeleteConfirm}
        onOpenChange={setBulkDeleteConfirm}
        title={`Delete ${selected.size} ${selected.size === 1 ? 'Country Page' : 'Country Pages'}?`}
        description={`This action cannot be undone. Are you sure you want to permanently delete these ${selected.size} selected country landing pages?`}
        confirmLabel={bulkWorking ? 'Deleting...' : `Delete ${selected.size} ${selected.size === 1 ? 'Page' : 'Pages'}`}
        variant="destructive"
        onConfirm={handleExecuteBulkDelete}
      />

      {/* ─── Single Item Delete Confirmation Modal Popup ───────────────── */}
      <ConfirmDialog
        open={!!singleDeleteTarget}
        onOpenChange={(open) => !open && setSingleDeleteTarget(null)}
        title="Delete Country Page?"
        description={`Are you sure you want to permanently delete the country page for "${singleDeleteTarget?.title || 'this country'}"? This action will remove it from the live website.`}
        confirmLabel="Delete Country Page"
        variant="destructive"
        onConfirm={handleExecuteSingleDelete}
      />
    </AdminContentContainer>
  );
}
