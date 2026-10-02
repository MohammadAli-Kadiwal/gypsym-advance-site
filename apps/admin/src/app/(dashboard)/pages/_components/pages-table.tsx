'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ChevronRight,
  FileText,
  Loader2,
  LayoutGrid,
  Briefcase,
  Layers,
  Mail,
  Calendar,
  Calculator,
  ExternalLink,
  Plus,
  Settings2,
  Search,
  CheckCircle2,
  Globe,
  FileCheck,
  FileClock,
  X,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
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
import { AdminPageHeader } from '@/components/layout/admin-page';
import { TablePagination } from '@/components/ui/table-pagination';
import { StatusToggleField } from '@/components/crud/status-toggle-field';
import { notify } from '@/lib/notifications';
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

const COUNTRY_SLUGS = new Set([
  'united-states', 'us',
  'uk', 'united-kingdom',
  'saudi-arabia', 'sa',
  'united-arab-emirates', 'uae',
  'australia', 'au',
  'oman', 'om',
]);

function isCountryPage(slug?: string): boolean {
  if (!slug) return false;
  return COUNTRY_SLUGS.has(slug.toLowerCase());
}

function getPageIcon(slug?: string) {
  if (isCountryPage(slug)) {
    return <Globe className="h-4 w-4" />;
  }
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
    case 'roi-calculator':
      return <Calculator className="h-4 w-4" />;
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
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

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

  // Bulk Selection State
  const [selectedSlugs, setSelectedSlugs] = React.useState<Set<string>>(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = React.useState(false);

  const handleBulkPageStatus = async (status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED') => {
    if (selectedSlugs.size === 0) return;
    setIsBulkProcessing(true);
    const slugs = Array.from(selectedSlugs);
    try {
      for (const slug of slugs) {
        await onSavePageSettings(slug, { status: status as any });
      }
      setSelectedSlugs(new Set());
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleToggleSingleStatus = async (page: PageData) => {
    if (!page.slug) return;
    const nextStatus = page.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await onSavePageSettings(page.slug, { status: nextStatus as any });
      notify.success(`Page "${page.title}" status updated to ${nextStatus === 'PUBLISHED' ? 'Public' : 'Draft'}.`);
    } catch {
      notify.error('Failed to update page status.');
    }
  };

  // ── Auto-open create dialog from URL param ────────────────────────────────
  const searchParams = useSearchParams();
  const routerInner = useRouter();
  React.useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setCreateOpen(true);
      // Remove the param from the URL without a page reload
      routerInner.replace('/pages');
    }
  }, [searchParams, routerInner]);

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

  const paginatedPages = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPages.slice(start, start + pageSize);
  }, [filteredPages, page, pageSize]);

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
      {/* Unified Admin Page Header */}
      <AdminPageHeader
        title={
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4" />
            </div>
            <span>Website Pages Directory</span>
          </div>
        }
        description="Manage all registered public website pages, SEO metadata, layouts, and live section configurations."
        actions={
          <div className="flex items-center gap-2.5">
            {loading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
            <Badge
              variant="outline"
              className="text-xs font-mono bg-primary/5 text-primary border-primary/20"
            >
              {pages.length} Registered Pages
            </Badge>

            <Button
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Page</span>
            </Button>
          </div>
        }
      />

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search pages by title, route slug, layout, or status..."
            className="pl-9 text-xs sm:text-sm rounded-xl bg-card border-border"
          />
        </div>
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setPage(1);
            }}
            className="text-xs text-muted-foreground"
          >
            Clear Filter
          </Button>
        )}
      </div>

      {/* Pages Table Card */}
      <Card className="rounded-2xl border-border bg-card shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between bg-muted/30">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Active Directory ({filteredPages.length} of {pages.length})
          </span>
          <span className="text-[11px] text-muted-foreground font-mono">
            {loading ? 'Synchronizing...' : 'PostgreSQL Database: Connected'}
          </span>
        </div>

        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="border-b border-border">
              <TableHead className="w-10 px-4 text-center">
                <Checkbox
                  checked={
                    filteredPages.length > 0 &&
                    filteredPages.every((p) => p.slug && selectedSlugs.has(p.slug))
                  }
                  onCheckedChange={(checked) => {
                    if (checked) {
                      const validSlugs = filteredPages
                        .map((p) => p.slug)
                        .filter((s): s is string => Boolean(s));
                      setSelectedSlugs(new Set(validSlugs));
                    } else {
                      setSelectedSlugs(new Set());
                    }
                  }}
                  aria-label="Select all pages"
                />
              </TableHead>
              <TableHead className="w-[320px] text-xs font-bold text-muted-foreground">
                Page Title &amp; Route
              </TableHead>
              <TableHead className="text-xs font-bold text-muted-foreground">Layout</TableHead>
              <TableHead className="text-xs font-bold text-muted-foreground">Sections</TableHead>
              <TableHead className="text-xs font-bold text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs font-bold text-muted-foreground">SEO Config</TableHead>
              <TableHead className="text-right text-xs font-bold text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPages.map((page) => {
              const pageSlug = page.slug || page.id || '';
              const route = getPageRoute(page.slug);
              const sectionCount = page.sectionsCount ?? page.sections?.length ?? 0;
              const isSelected = selectedSlugs.has(pageSlug);

              return (
                <TableRow
                  key={pageSlug}
                  className={`hover:bg-muted/50 transition-colors group ${
                    isSelected ? 'bg-primary/5' : ''
                  }`}
                >
                  <TableCell className="px-4 py-3.5 text-center">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        const next = new Set(selectedSlugs);
                        if (checked) next.add(pageSlug);
                        else next.delete(pageSlug);
                        setSelectedSlugs(next);
                      }}
                      aria-label={`Select page ${page.title}`}
                    />
                  </TableCell>

                  {/* Title & Route */}
                  <TableCell className="py-3.5">
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {getPageIcon(page.slug)}
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                          <span className="whitespace-nowrap">{page.title}</span>
                          {page.slug === 'home' && (
                            <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 whitespace-nowrap leading-tight">
                              Root /
                            </span>
                          )}
                          {isCountryPage(page.slug) && (
                            <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-accent text-accent-foreground border border-border whitespace-nowrap leading-tight flex items-center gap-1">
                              <Globe className="w-2.5 h-2.5" />
                              Country Landing
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground mt-0.5">
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
                    <button
                      type="button"
                      onClick={() => handleToggleSingleStatus(page)}
                      title={
                        page.status === 'PUBLISHED'
                          ? 'Public: Click to switch to Draft'
                          : 'Draft: Click to publish Public'
                      }
                      className="cursor-pointer transition-transform hover:scale-105 active:scale-95 inline-block"
                    >
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          page.status === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : page.status === 'DRAFT'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {page.status === 'PUBLISHED' ? 'PUBLIC' : page.status || 'PUBLIC'}
                      </span>
                    </button>
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
                      ) : page.slug === 'roi-calculator' ? (
                        <Link href="/pages/roi-calculator">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl"
                          >
                            <span>Studio</span>
                            <ChevronRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </Link>
                      ) : isCountryPage(page.slug) ? (
                        <Link href={`/pages/countries/${page.slug}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl"
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

        <TablePagination
          currentPage={page}
          totalItems={filteredPages.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemLabel="pages"
        />
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
                </div>

                <StatusToggleField
                  value={formStatus}
                  onChange={(st) => setFormStatus(st as any)}
                />
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
                </div>

                <StatusToggleField
                  value={createStatus}
                  onChange={(st) => setCreateStatus(st as any)}
                />
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

      {/* Floating Bulk Action Dock */}
      {selectedSlugs.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-2.5 rounded-2xl border border-slate-200 bg-white/95 px-5 py-2.5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="text-xs font-semibold text-slate-800 pr-2 border-r border-slate-200">
            {selectedSlugs.size} {selectedSlugs.size === 1 ? 'page' : 'pages'} selected
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={isBulkProcessing}
            className="h-8 text-xs rounded-xl border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
            onClick={() => handleBulkPageStatus('PUBLISHED')}
          >
            <FileCheck className="h-3.5 w-3.5 mr-1 text-emerald-600" />
            <span>Publish</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={isBulkProcessing}
            className="h-8 text-xs rounded-xl border-slate-200 hover:bg-slate-100"
            onClick={() => handleBulkPageStatus('DRAFT')}
          >
            <FileClock className="h-3.5 w-3.5 mr-1 text-amber-600" />
            <span>Draft</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={isBulkProcessing}
            className="h-8 text-xs rounded-xl border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
            onClick={() => handleBulkPageStatus('ARCHIVED')}
          >
            <span>Archive</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 rounded-xl"
            onClick={() => setSelectedSlugs(new Set())}
            title="Clear selection"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
