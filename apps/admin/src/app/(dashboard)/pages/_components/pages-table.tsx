'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  FileText,
  Loader2,
  LayoutGrid,
  Briefcase,
  Layers,
  Mail,
  Calendar,
  ExternalLink,
  Plus,
  Settings2,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import type { PageData } from './types';

export type PageSlug = string;

interface PagesTableProps {
  pages: PageData[];
  loading: boolean;
  onSavePageSettings: (slug: string, data: Partial<PageData>) => Promise<void>;
  onCreatePage: (data: Partial<PageData>) => Promise<void>;
}

const LAYOUT_OPTIONS = [
  { value: 'DEFAULT', label: 'Default Content Layout' },
  { value: 'LANDING', label: 'Landing Page' },
  { value: 'FULL_WIDTH', label: 'Full Width Canvas' },
  { value: 'MINIMAL', label: 'Minimal Clean' },
];

const STATUS_OPTIONS = ['PUBLISHED', 'DRAFT', 'ARCHIVED'] as const;

function getPageIcon(slug?: string) {
  switch (slug) {
    case 'home':
      return <LayoutGrid className="h-4 w-4" />;
    case 'services':
      return <Layers className="h-4 w-4" />;
    case 'portfolio':
      return <Briefcase className="h-4 w-4" />;
    case 'contact':
      return <Mail className="h-4 w-4" />;
    case 'book':
      return <Calendar className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
}

function getPageRoute(slug?: string) {
  if (!slug || slug === 'home') return '/';
  return `/${slug}`;
}

export function PagesTable({
  pages,
  loading,
  onSavePageSettings,
  onCreatePage,
}: PagesTableProps) {
  const [searchQuery, setSearchQuery] = React.useState('');

  // ── Page Settings Modal State ──────────────────────────────────────────────
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [editingPage, setEditingPage] = React.useState<PageData | null>(null);
  const [savingSettings, setSavingSettings] = React.useState(false);

  // Settings form state
  const [formTitle, setFormTitle] = React.useState('');
  const [formSlug, setFormSlug] = React.useState('');
  const [formDescription, setFormDescription] = React.useState('');
  const [formLayoutType, setFormLayoutType] = React.useState('DEFAULT');
  const [formStatus, setFormStatus] = React.useState('PUBLISHED');
  const [formMetaTitle, setFormMetaTitle] = React.useState('');
  const [formMetaDesc, setFormMetaDesc] = React.useState('');
  const [formCanonicalUrl, setFormCanonicalUrl] = React.useState('');
  const [formOgTitle, setFormOgTitle] = React.useState('');
  const [formOgDesc, setFormOgDesc] = React.useState('');
  const [formOgImageUrl, setFormOgImageUrl] = React.useState('');
  const [formNoIndex, setFormNoIndex] = React.useState(false);

  // ── Create Page Modal State ────────────────────────────────────────────────
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createTitle, setCreateTitle] = React.useState('');
  const [createSlug, setCreateSlug] = React.useState('');
  const [createDescription, setCreateDescription] = React.useState('');
  const [createLayoutType, setCreateLayoutType] = React.useState('DEFAULT');
  const [createStatus, setCreateStatus] = React.useState('PUBLISHED');
  const [creating, setCreating] = React.useState(false);

  // Filtered pages
  const filteredPages = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return pages;
    return pages.filter(
      (p) =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.slug || '').toLowerCase().includes(q) ||
        (p.layoutType || '').toLowerCase().includes(q) ||
        (p.status || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
    );
  }, [pages, searchQuery]);

  // ── Open Settings Modal ────────────────────────────────────────────────────
  function handleOpenSettings(page: PageData) {
    setEditingPage(page);
    setFormTitle(page.title || '');
    setFormSlug(page.slug || '');
    setFormDescription(page.description || '');
    setFormLayoutType(page.layoutType || 'DEFAULT');
    setFormStatus(page.status || 'PUBLISHED');

    const seo = page.seoMetadata;
    setFormMetaTitle(seo?.metaTitle || page.title || '');
    setFormMetaDesc(seo?.metaDescription || page.description || '');
    setFormCanonicalUrl(seo?.canonicalUrl || '');
    setFormOgTitle(seo?.ogTitle || seo?.metaTitle || page.title || '');
    setFormOgDesc(seo?.ogDescription || seo?.metaDescription || page.description || '');
    setFormOgImageUrl(seo?.ogImageUrl || '');
    setFormNoIndex(Boolean(seo?.noIndex));

    setSettingsOpen(true);
  }

  // ── Save Page Settings ─────────────────────────────────────────────────────
  async function handleSaveSettings() {
    if (!editingPage?.slug) return;
    setSavingSettings(true);
    try {
      await onSavePageSettings(editingPage.slug, {
        title: formTitle.trim(),
        slug: formSlug.trim(),
        description: formDescription.trim(),
        layoutType: formLayoutType,
        status: formStatus,
        seoMetadata: {
          metaTitle: formMetaTitle.trim() || formTitle.trim(),
          metaDescription: formMetaDesc.trim() || formDescription.trim(),
          canonicalUrl: formCanonicalUrl.trim() || null,
          ogTitle: formOgTitle.trim() || formMetaTitle.trim() || formTitle.trim(),
          ogDescription: formOgDesc.trim() || formMetaDesc.trim() || formDescription.trim(),
          ogImageUrl: formOgImageUrl.trim() || null,
          noIndex: formNoIndex,
        },
      });
      setSettingsOpen(false);
    } finally {
      setSavingSettings(false);
    }
  }

  // ── Create Page ────────────────────────────────────────────────────────────
  async function handleCreatePage() {
    if (!createTitle.trim()) return;
    setCreating(true);
    try {
      const slugToUse = (createSlug || createTitle)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      await onCreatePage({
        title: createTitle.trim(),
        slug: slugToUse,
        description: createDescription.trim(),
        layoutType: createLayoutType,
        status: createStatus,
        seoMetadata: {
          metaTitle: createTitle.trim(),
          metaDescription: createDescription.trim(),
          noIndex: false,
        },
      });
      setCreateOpen(false);
      setCreateTitle('');
      setCreateSlug('');
      setCreateDescription('');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eaedf3]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <span>Website Pages Directory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage all registered public website pages, SEO metadata, layouts, and live section configurations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
          <Badge
            variant="outline"
            className="text-xs font-mono bg-blue-50/60 text-blue-700 border-blue-200"
          >
            {pages.length} Registered Pages
          </Badge>

          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Add New Page</span>
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pages by title, route slug, layout, or status..."
            className="pl-9 text-xs sm:text-sm rounded-xl bg-white border-slate-200"
          />
        </div>
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery('')}
            className="text-xs text-slate-500"
          >
            Clear Filter
          </Button>
        )}
      </div>

      {/* Pages Table Card */}
      <Card className="rounded-2xl border-slate-200/90 bg-white shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Active Directory ({filteredPages.length} of {pages.length})
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {loading ? 'Synchronizing...' : 'PostgreSQL Database: Connected'}
          </span>
        </div>

        <Table>
          <TableHeader className="bg-slate-50/60">
            <TableRow className="border-b border-slate-100">
              <TableHead className="w-[320px] text-xs font-bold text-slate-600">
                Page Title &amp; Route
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-600">Layout</TableHead>
              <TableHead className="text-xs font-bold text-slate-600">Sections</TableHead>
              <TableHead className="text-xs font-bold text-slate-600">Status</TableHead>
              <TableHead className="text-xs font-bold text-slate-600">SEO Config</TableHead>
              <TableHead className="text-right text-xs font-bold text-slate-600">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPages.map((page) => {
              const route = getPageRoute(page.slug);
              const sectionCount = page.sectionsCount ?? page.sections?.length ?? 0;

              return (
                <TableRow
                  key={page.slug || page.id}
                  className="hover:bg-blue-50/30 transition-colors group"
                >
                  {/* Title & Route */}
                  <TableCell className="py-3.5">
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        {getPageIcon(page.slug)}
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                          <span className="whitespace-nowrap">{page.title}</span>
                          {page.slug === 'home' && (
                            <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/80 whitespace-nowrap leading-tight">
                              Root /
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 mt-0.5">
                          <span>{route}</span>
                          <a
                            href={route}
                            target="_blank"
                            rel="noreferrer"
                            title="Open live page in new tab"
                            className="text-slate-400 hover:text-blue-600 transition-colors inline-flex items-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-3 h-3 ml-0.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Layout */}
                  <TableCell className="py-3.5">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono font-medium bg-slate-100 text-slate-700 border-slate-200"
                    >
                      {page.layoutType || 'DEFAULT'}
                    </Badge>
                  </TableCell>

                  {/* Section Count */}
                  <TableCell className="py-3.5">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700">
                      <span className="font-semibold text-slate-900">{sectionCount}</span>
                      <span>Sections</span>
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-3.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        page.status === 'PUBLISHED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : page.status === 'DRAFT'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {page.status || 'PUBLISHED'}
                    </span>
                  </TableCell>

                  {/* SEO indicator */}
                  <TableCell className="py-3.5">
                    {page.seoMetadata ? (
                      <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate max-w-[120px]" title={page.seoMetadata.metaTitle || ''}>
                          {page.seoMetadata.metaTitle ? 'Customized' : 'Inherited'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400">Default</span>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Page Settings & SEO button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenSettings(page)}
                        title="Page Settings & SEO"
                        className="h-8 px-2.5 text-xs text-slate-700 hover:text-blue-600 hover:bg-blue-50 border-slate-200 rounded-xl"
                      >
                        <Settings2 className="h-3.5 w-3.5 mr-1 text-slate-500" />
                        <span>Settings</span>
                      </Button>

                      {/* Dedicated Section Studio navigation for all pages */}
                      {page.slug === 'home' ? (
                        <Link href="/pages/home">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl"
                          >
                            <span>Studio</span>
                            <ChevronRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </Link>
                      ) : page.slug === 'services' ? (
                        <Link href="/pages/services">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl"
                          >
                            <span>Studio</span>
                            <ChevronRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </Link>
                      ) : page.slug === 'portfolio' ? (
                        <Link href="/pages/portfolio">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl"
                          >
                            <span>Studio</span>
                            <ChevronRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </Link>
                      ) : page.slug === 'about' ? (
                        <Link href="/pages/about">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl"
                          >
                            <span>Studio</span>
                            <ChevronRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </Link>
                      ) : page.slug === 'contact' ? (
                        <Link href="/pages/contact">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl"
                          >
                            <span>Studio</span>
                            <ChevronRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </Link>
                      ) : page.slug === 'book' ? (
                        <Link href="/pages/book">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl"
                          >
                            <span>Studio</span>
                            <ChevronRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </Link>
                      ) : page.id ? (
                        <Link href={`/pages/${page.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl"
                          >
                            <span>Studio</span>
                            <ChevronRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenSettings(page)}
                          className="h-8 px-3 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl"
                        >
                          <span>Studio</span>
                          <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* ── Page Settings & SEO Dialog ──────────────────────────────────────── */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
                <Settings2 className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900">
                  Page Settings: {editingPage?.title || 'Edit Page'}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Route: <code className="font-mono text-blue-600 font-semibold">{getPageRoute(editingPage?.slug)}</code> · Configures metadata and SEO for this page.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue="general" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-3 border-b border-slate-100 bg-white">
              <TabsList className="bg-slate-100/80 p-1">
                <TabsTrigger value="general" className="text-xs font-semibold">
                  1. Page General &amp; Layout
                </TabsTrigger>
                <TabsTrigger value="seo" className="text-xs font-semibold">
                  2. SEO &amp; Social Meta
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* TAB 1: General */}
              <TabsContent value="general" className="m-0 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Page Title *</label>
                    <Input
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. Our Services"
                      className="text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">URL Route Slug *</label>
                    <Input
                      value={formSlug}
                      disabled={editingPage?.slug === 'home'}
                      onChange={(e) => setFormSlug(e.target.value)}
                      placeholder="e.g. services"
                      className="text-sm font-mono"
                    />
                    {editingPage?.slug === 'home' && (
                      <p className="text-[10px] text-slate-400">Root home slug is protected.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Page Description</label>
                  <Textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Short description of this page content and purpose..."
                    className="text-sm leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Layout Canvas</label>
                    <select
                      value={formLayoutType}
                      onChange={(e) => setFormLayoutType(e.target.value)}
                      className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-white p-2.5 text-slate-800"
                    >
                      {LAYOUT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label} ({opt.value})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Status</label>
                    <div className="flex items-center gap-1.5">
                      {STATUS_OPTIONS.map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setFormStatus(st)}
                          className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all ${
                            formStatus === st
                              ? st === 'PUBLISHED'
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : st === 'DRAFT'
                                ? 'bg-amber-600 text-white border-amber-600'
                                : 'bg-slate-700 text-white border-slate-700'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 2: SEO */}
              <TabsContent value="seo" className="m-0 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Meta Title Tag</label>
                  <Input
                    value={formMetaTitle}
                    onChange={(e) => setFormMetaTitle(e.target.value)}
                    placeholder="e.g. Services | Gypsym Technology"
                    className="text-sm"
                  />
                  <p className="text-[11px] text-slate-400">
                    Shown in browser tab and Google search results ({formMetaTitle.length}/60 chars).
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Meta Description</label>
                  <Textarea
                    rows={3}
                    value={formMetaDesc}
                    onChange={(e) => setFormMetaDesc(e.target.value)}
                    placeholder="Compelling summary shown in Google search result snippets..."
                    className="text-sm leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-400">
                    Optimal length 140–160 characters ({formMetaDesc.length}/160 chars).
                  </p>
                </div>

                <div>
                  <ImageUploadField
                    label="Social OpenGraph (OG) Image"
                    description="Upload directly or specify a URL (1200x630 recommended for LinkedIn, X, and WhatsApp previews)."
                    value={formOgImageUrl}
                    onChange={setFormOgImageUrl}
                    placeholder="https://example.com/assets/og-image.jpg"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Canonical URL (Optional)</label>
                  <Input
                    value={formCanonicalUrl}
                    onChange={(e) => setFormCanonicalUrl(e.target.value)}
                    placeholder="https://gypsym.com/services"
                    className="text-sm font-mono"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 pt-2">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">Robots No-Index</span>
                    <span className="text-[11px] text-slate-400 block">
                      Instruct search engines to NOT index this page
                    </span>
                  </div>
                  <Switch checked={formNoIndex} onCheckedChange={setFormNoIndex} />
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between sm:justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSettingsOpen(false)}
              disabled={savingSettings}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {savingSettings && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              Save Page Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Create New Page Dialog ──────────────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Create New Website Page
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Adds a new dynamic page to the PostgreSQL CMS database and generates its live public route.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Page Title *</label>
              <Input
                value={createTitle}
                onChange={(e) => {
                  setCreateTitle(e.target.value);
                  if (!createSlug) {
                    setCreateSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-|-$/g, '')
                    );
                  }
                }}
                placeholder="e.g. Enterprise Solutions"
                className="text-sm font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">URL Route Slug *</label>
              <div className="relative">
                <Input
                  value={createSlug}
                  onChange={(e) => setCreateSlug(e.target.value)}
                  placeholder="enterprise-solutions"
                  className="text-sm font-mono pl-7"
                />
                <span className="absolute left-2.5 top-2.5 text-xs font-mono text-slate-400 select-none">
                  /
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Description</label>
              <Textarea
                rows={2}
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                placeholder="Brief summary of page contents..."
                className="text-sm leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Layout</label>
                <select
                  value={createLayoutType}
                  onChange={(e) => setCreateLayoutType(e.target.value)}
                  className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-white p-2.5 text-slate-800"
                >
                  {LAYOUT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Status</label>
                <select
                  value={createStatus}
                  onChange={(e) => setCreateStatus(e.target.value)}
                  className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-white p-2.5 text-slate-800"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCreateOpen(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleCreatePage}
              disabled={creating || !createTitle.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {creating && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              Create Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
