'use client';

import * as React from 'react';
import {
  Layers,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { notify } from '@/lib/notifications';
import { fetchApi } from '@/lib/api-client';
import { SectionsHeader } from './sections-header';
import type { PageData } from './types';

const Label = ({ className = '', ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={`block text-xs font-semibold text-slate-700 mb-1.5 ${className}`} {...props} />
);

export interface UniversalPageStudioProps {
  pageId?: string;
  slug?: string;
  onBack?: () => void;
}

interface UniversalSection {
  id: string;
  sectionIdentifier: string;
  componentType: string;
  displayOrder: number;
  isActive: boolean;
  contentPayload: any;
}

const AVAILABLE_SECTION_TYPES = [
  { value: 'HERO', label: 'Hero Banner', desc: 'Prominent top visual banner with headline, subtext, and CTAs' },
  { value: 'FEATURE_GRID', label: 'Features & Capabilities', desc: 'Multi-column grid showcasing features or pillars' },
  { value: 'CAPABILITIES', label: 'Technical Capabilities', desc: 'Tech stack, specs, and engineering capabilities' },
  { value: 'CTA', label: 'Call to Action (CTA)', desc: 'Full-width high-contrast banner with conversion buttons' },
  { value: 'CONTACT', label: 'Contact Inquiry Form', desc: 'Interactive form with input fields and direct contact channels' },
  { value: 'TESTIMONIAL_SLIDER', label: 'Client Testimonials', desc: 'Endorsements and reviews slider from client leaders' },
  { value: 'LOGO_CLOUD', label: 'Client & Partner Logos', desc: 'Monochrome or full-color client and partner logo grid' },
  { value: 'CLIENT_OUTCOMES', label: 'Service Guarantees & SLA', desc: 'Outcome cards and client satisfaction metrics' },
];

export function UniversalPageStudio({ pageId, slug, onBack }: UniversalPageStudioProps) {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [page, setPage] = React.useState<PageData | null>(null);
  const [sections, setSections] = React.useState<UniversalSection[]>([]);
  const [activeTab, setActiveTab] = React.useState('sections');

  // Page SEO state
  const [pageTitle, setPageTitle] = React.useState('');
  const [pageDescription, setPageDescription] = React.useState('');
  const [metaTitle, setMetaTitle] = React.useState('');
  const [metaDescription, setMetaDescription] = React.useState('');
  const [canonicalUrl, setCanonicalUrl] = React.useState('');
  const [ogImageUrl, setOgImageUrl] = React.useState('');
  const [noIndex, setNoIndex] = React.useState(false);

  // Add Section Modal
  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [newComponentType, setNewComponentType] = React.useState('FEATURE_GRID');
  const [newIdentifier, setNewIdentifier] = React.useState('');
  const [newTitle, setNewTitle] = React.useState('');

  // ── Load Page ──
  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      let loaded: PageData | null = null;
      if (slug) {
        loaded = await fetchApi<PageData>(`/pages/${slug}`);
      } else if (pageId) {
        // Find page by id from all pages
        const all = await fetchApi<PageData[]>('/pages');
        if (Array.isArray(all)) {
          loaded = all.find((p) => p.id === pageId) || null;
          if (loaded?.slug) {
            // Re-fetch single page for full sections
            loaded = await fetchApi<PageData>(`/pages/${loaded.slug}`);
          }
        }
      }

      if (loaded) {
        setPage(loaded);
        setPageTitle(loaded.title || 'Custom Page');
        setPageDescription(loaded.description || '');

        const seo = loaded.seoMetadata;
        setMetaTitle(seo?.metaTitle || loaded.title || '');
        setMetaDescription(seo?.metaDescription || loaded.description || '');
        setCanonicalUrl(seo?.canonicalUrl || '');
        setOgImageUrl(seo?.ogImageUrl || '');
        setNoIndex(Boolean(seo?.noIndex));

        const rawSecs = Array.isArray(loaded.sections) ? loaded.sections : [];
        setSections(
          rawSecs
            .map((s, idx) => ({
              id: s.id,
              sectionIdentifier: s.sectionIdentifier || `sec-${idx}`,
              componentType: s.componentType || 'FEATURE_GRID',
              displayOrder: s.displayOrder ?? idx,
              isActive: s.isActive ?? true,
              contentPayload: s.contentPayload || {},
            }))
            .sort((a, b) => a.displayOrder - b.displayOrder)
        );
      }
    } catch {
      notify.error('Could not load page from database.');
    } finally {
      setLoading(false);
    }
  }, [pageId, slug]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Add Section ──
  const handleAddSection = () => {
    const identifier =
      newIdentifier.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-') ||
      `${newComponentType.toLowerCase()}-${Date.now()}`;

    const newSec: UniversalSection = {
      id: `local-${Date.now()}`,
      sectionIdentifier: identifier,
      componentType: newComponentType,
      displayOrder: sections.length + 1,
      isActive: true,
      contentPayload: {
        eyebrow: 'SECTION SUBTITLE',
        title: newTitle.trim() || 'New Section Headline',
        description: 'Configure detailed section content and parameters here.',
      },
    };

    setSections([...sections, newSec]);
    setAddModalOpen(false);
    setNewIdentifier('');
    setNewTitle('');
    notify.info(`Added section <${newComponentType}>. Click "Save Changes" to commit.`);
  };

  // ── Move Section ──
  const moveSection = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const copy = [...sections];
    const itemA = copy[idx];
    const itemB = copy[targetIdx];
    if (!itemA || !itemB) return;
    copy[idx] = itemB;
    copy[targetIdx] = itemA;

    // re-assign displayOrder
    copy.forEach((s, i) => {
      s.displayOrder = i + 1;
    });

    setSections(copy);
  };

  const updateSectionPayload = (idx: number, field: string, val: any) => {
    setSections((prev) => {
      const copy = [...prev];
      const curr = copy[idx];
      if (curr) {
        copy[idx] = {
          ...curr,
          contentPayload: {
            ...(curr.contentPayload || {}),
            [field]: val,
          },
        };
      }
      return copy;
    });
  };

  const updateSectionActive = (idx: number, active: boolean) => {
    setSections((prev) => {
      const copy = [...prev];
      const curr = copy[idx];
      if (curr) {
        copy[idx] = {
          ...curr,
          isActive: active,
        };
      }
      return copy;
    });
  };

  // ── Delete Section ──
  const handleDeleteSection = async (sec: UniversalSection) => {
    if (!confirm(`Are you sure you want to remove section "${sec.sectionIdentifier}"?`)) return;

    if (!sec.id.startsWith('local-')) {
      try {
        await fetchApi(`/sections/${sec.id}`, { method: 'DELETE' });
        notify.success('Section deleted from database.');
      } catch (err: any) {
        notify.error(err?.message || 'Failed to delete section');
        return;
      }
    }

    setSections(sections.filter((s) => s.id !== sec.id));
  };

  // ── Save All ──
  const handleSave = async () => {
    if (!page?.slug) {
      notify.error('Cannot save: Page slug is missing.');
      return;
    }

    setSaving(true);
    try {
      // 1. Update Page Info & SEO
      await fetchApi(`/pages/${page.slug}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: pageTitle.trim(),
          description: pageDescription.trim(),
          seoMetadata: {
            metaTitle: metaTitle.trim() || pageTitle.trim(),
            metaDescription: metaDescription.trim() || pageDescription.trim(),
            canonicalUrl: canonicalUrl.trim() || null,
            ogTitle: metaTitle.trim() || pageTitle.trim(),
            ogDescription: metaDescription.trim() || pageDescription.trim(),
            ogImageUrl: ogImageUrl.trim() || null,
            noIndex,
          },
        }),
      });

      // 2. Save each section
      for (const sec of sections) {
        if (sec.id.startsWith('local-')) {
          await fetchApi(`/pages/${page.slug}/sections`, {
            method: 'POST',
            body: JSON.stringify({
              sectionIdentifier: sec.sectionIdentifier,
              componentType: sec.componentType,
              displayOrder: sec.displayOrder,
              contentPayload: sec.contentPayload,
              isActive: sec.isActive,
            }),
          });
        } else {
          await fetchApi(`/sections/${sec.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              displayOrder: sec.displayOrder,
              contentPayload: sec.contentPayload,
              isActive: sec.isActive,
            }),
          });
        }
      }

      notify.success(`Page "${pageTitle}" and all sections saved successfully.`);
      await loadData();
    } catch (err: any) {
      notify.error(err?.message || 'Failed to save page sections.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 w-full">
      <SectionsHeader
        pageTitle={pageTitle || 'Custom'}
        pageRoute={page?.slug ? `/${page.slug}` : '/'}
        layoutLabel="PAGE SECTIONS STUDIO"
        sectionCount={sections.length}
        status={page?.status || 'PUBLISHED'}
        saving={saving}
        loading={loading}
        onBack={onBack || (() => {})}
        onSave={handleSave}
        onRefresh={loadData}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="bg-slate-100 p-1.5 rounded-2xl h-auto flex flex-wrap gap-1.5 border border-slate-200/80">
          <TabsTrigger
            value="sections"
            className="rounded-xl text-xs font-semibold px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
          >
            1. Inner Page Sections ({sections.length})
          </TabsTrigger>
          <TabsTrigger
            value="seo"
            className="rounded-xl text-xs font-semibold px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
          >
            2. Page SEO & OpenGraph
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: SECTIONS ── */}
        <TabsContent value="sections" className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Configured Page Sections</h2>
              <p className="text-xs text-slate-500">Manage order, visibility, and copy for each section.</p>
            </div>
            <Button
              onClick={() => setAddModalOpen(true)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              <span>Add Section</span>
            </Button>
          </div>

          {sections.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-3">
              <Layers className="h-10 w-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No Sections Configured Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Add your first section (Hero, Feature Grid, CTA, Contact, etc.) to design this page.
              </p>
              <Button
                onClick={() => setAddModalOpen(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add First Section
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sections.map((sec, idx) => {
                const payload = sec.contentPayload || {};

                return (
                  <Card key={sec.id || idx} className="rounded-2xl border-slate-200/80 shadow-xs overflow-hidden">
                    <CardHeader className="bg-slate-50/70 border-b border-slate-200/60 py-3 px-4 sm:px-6 flex flex-row items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="h-6 w-6 rounded-lg bg-blue-100 text-blue-700 font-mono text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-sm font-bold text-slate-900">
                              {payload.title || sec.sectionIdentifier}
                            </CardTitle>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 font-semibold uppercase">
                              {sec.componentType}
                            </span>
                          </div>
                          <CardDescription className="text-[11px] font-mono text-slate-400">
                            Identifier: {sec.sectionIdentifier}
                          </CardDescription>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Move Up/Down */}
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={idx === 0}
                          onClick={() => moveSection(idx, 'up')}
                          className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                          title="Move Up"
                        >
                          <MoveUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={idx === sections.length - 1}
                          onClick={() => moveSection(idx, 'down')}
                          className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                          title="Move Down"
                        >
                          <MoveDown className="h-3.5 w-3.5" />
                        </Button>

                        {/* Active Switch */}
                        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                          <span className="text-xs text-slate-500">{sec.isActive ? 'Active' : 'Hidden'}</span>
                          <Switch
                            checked={sec.isActive}
                            onCheckedChange={(val) => updateSectionActive(idx, val)}
                          />
                        </div>

                        {/* Delete */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSection(sec)}
                          className="h-7 w-7 p-0 text-slate-400 hover:text-red-600 ml-1"
                          title="Remove Section"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 sm:p-6 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label>Section Title / Headline</Label>
                          <Input
                            value={payload.title || ''}
                            onChange={(e) => updateSectionPayload(idx, 'title', e.target.value)}
                            className="mt-1 text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <Label>Eyebrow / Category Tag</Label>
                          <Input
                            value={payload.eyebrow || ''}
                            onChange={(e) => updateSectionPayload(idx, 'eyebrow', e.target.value)}
                            className="mt-1 text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Description / Body Content</Label>
                        <Textarea
                          value={payload.description || payload.subheadline || ''}
                          onChange={(e) => updateSectionPayload(idx, 'description', e.target.value)}
                          rows={2}
                          className="mt-1 text-xs"
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── TAB 2: SEO ── */}
        <TabsContent value="seo" className="space-y-4">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Page SEO & General Information</CardTitle>
              <CardDescription className="text-xs">
                Title, meta description, canonical link, and social sharing OpenGraph card.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Page Title</Label>
                  <Input
                    value={pageTitle}
                    onChange={(e) => setPageTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Page Slug</Label>
                  <Input value={page?.slug || ''} disabled className="mt-1 bg-slate-50 font-mono text-xs" />
                </div>
              </div>

              <div>
                <Label>Meta Title</Label>
                <Input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Meta Description</Label>
                <Textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  className="mt-1 text-xs"
                />
              </div>

              <div className="space-y-5">
                <div>
                  <Label>Canonical URL</Label>
                  <Input
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder="https://gypsym.com/..."
                    className="h-10 text-xs font-mono rounded-xl border-slate-200/90"
                  />
                </div>
                <div>
                  <ImageUploadField
                    label="Social OpenGraph (OG) Image"
                    description="Upload directly or enter URL for social media link previews."
                    value={ogImageUrl}
                    onChange={setOgImageUrl}
                    placeholder="https://gypsym.com/assets/editorial/og-preview.png"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-800">Prevent Search Indexing (noindex)</span>
                  <p className="text-[11px] text-slate-500">Keep this off for normal search discovery.</p>
                </div>
                <Switch checked={noIndex} onCheckedChange={setNoIndex} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── ADD SECTION MODAL ── */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Page Section</DialogTitle>
            <DialogDescription>
              Select an architectural section type to append to this page.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label>Component Type</Label>
              <select
                value={newComponentType}
                onChange={(e) => setNewComponentType(e.target.value)}
                className="w-full mt-1.5 h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                {AVAILABLE_SECTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label} ({t.value})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Section Headline / Title</Label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Scaling With Confidence"
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <Label>Section Identifier (Slug)</Label>
              <Input
                value={newIdentifier}
                onChange={(e) => setNewIdentifier(e.target.value)}
                placeholder="e.g. enterprise-scaling-section"
                className="mt-1 text-xs font-mono"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddSection} className="bg-blue-600 hover:bg-blue-700 text-white">
              Add Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
