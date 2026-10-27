'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Globe, Share2, Code } from 'lucide-react';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { PageSeoItem } from './types';

interface EditPageSeoDialogProps {
  page: PageSeoItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (pageId: string, data: any) => Promise<void>;
  canonicalBaseUrl?: string;
  defaultOgImage?: string;
}

export function EditPageSeoDialog({
  page,
  open,
  onOpenChange,
  onSave,
  canonicalBaseUrl,
  defaultOgImage,
}: EditPageSeoDialogProps) {
  const [metaTitle, setMetaTitle] = React.useState('');
  const [metaDescription, setMetaDescription] = React.useState('');
  const [canonicalUrl, setCanonicalUrl] = React.useState('');
  const [robotsIndex, setRobotsIndex] = React.useState(true);
  const [robotsFollow, setRobotsFollow] = React.useState(true);
  const [ogTitle, setOgTitle] = React.useState('');
  const [ogDescription, setOgDescription] = React.useState('');
  const [ogImageUrl, setOgImageUrl] = React.useState('');
  const [twitterCard, setTwitterCard] = React.useState('summary_large_image');
  const [structuredData, setStructuredData] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (page) {
      setMetaTitle(page.seoMetadata.metaTitle || '');
      setMetaDescription(page.seoMetadata.metaDescription || '');
      setCanonicalUrl(page.seoMetadata.canonicalUrl || '');
      setRobotsIndex(page.seoMetadata.robotsIndex !== false);
      setRobotsFollow(page.seoMetadata.robotsFollow !== false);
      setOgTitle(page.seoMetadata.ogTitle || '');
      setOgDescription(page.seoMetadata.ogDescription || '');
      setOgImageUrl(page.seoMetadata.ogImageUrl || (page.seoMetadata.structuredData as any)?.ogImageUrl || '');
      setTwitterCard(page.seoMetadata.twitterCard || 'summary_large_image');
      setStructuredData(
        page.seoMetadata.structuredData
          ? JSON.stringify(page.seoMetadata.structuredData, null, 2)
          : ''
      );
    }
  }, [page]);

  if (!page) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      let parsedSchema: any = null;
      if (structuredData.trim()) {
        try {
          parsedSchema = JSON.parse(structuredData);
        } catch {
          // invalid json
        }
      }

      await onSave(page.id, {
        metaTitle,
        metaDescription,
        canonicalUrl: canonicalUrl.trim() || null,
        robotsIndex,
        robotsFollow,
        ogTitle: ogTitle.trim() || null,
        ogDescription: ogDescription.trim() || null,
        ogImageUrl: ogImageUrl.trim() || null,
        twitterCard,
        structuredData: parsedSchema,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const titleLength = metaTitle.length;
  const descLength = metaDescription.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-600" />
            <span>Edit SEO & Discoverability — {page.title}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 font-mono">
            Path: {page.path || (page.slug === 'home' ? '/' : `/${page.slug}`)} • Type: {page.type || 'PAGE'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="metadata" className="space-y-4 pt-2">
          <TabsList className="bg-slate-100 p-1 rounded-xl h-auto w-full grid grid-cols-3 gap-1">
            <TabsTrigger value="metadata" className="text-[11px] sm:text-xs px-1 sm:px-2 py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-2xs font-semibold flex items-center justify-center">
              <Globe className="h-3.5 w-3.5 mr-1 shrink-0" /> <span className="truncate">SERP & Meta</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="text-[11px] sm:text-xs px-1 sm:px-2 py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-2xs font-semibold flex items-center justify-center">
              <Share2 className="h-3.5 w-3.5 mr-1 shrink-0" /> <span className="truncate">Social & OG</span>
            </TabsTrigger>
            <TabsTrigger value="schema" className="text-[11px] sm:text-xs px-1 sm:px-2 py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-2xs font-semibold flex items-center justify-center">
              <Code className="h-3.5 w-3.5 mr-1 shrink-0" /> <span className="truncate">Schema</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: SERP Metadata */}
          <TabsContent value="metadata" className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Page Meta Title</label>
                <span className={`text-[10px] font-mono ${titleLength >= 45 && titleLength <= 65 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                  {titleLength} / 60 recommended
                </span>
              </div>
              <Input
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Title for search engine snippets..."
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Meta Description</label>
                <span className={`text-[10px] font-mono ${descLength >= 120 && descLength <= 165 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                  {descLength} / 160 recommended
                </span>
              </div>
              <Textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={3}
                placeholder="Summary displayed below the title in search results..."
                className="rounded-xl text-xs leading-relaxed"
              />
            </div>

            {/* Canonical URL */}
            {(() => {
              const normalizedPath = page.path || (page.slug === 'home' || page.slug === '/' ? '' : (page.slug.startsWith('/') ? page.slug : `/${page.slug}`));
              const baseOrigin = (canonicalBaseUrl || 'https://gypsym.com').replace(/\/+$/, '');
              const autoCanonicalUrl = canonicalBaseUrl
                ? `${baseOrigin}${normalizedPath === '/' ? '' : normalizedPath}`
                : (page.autoCanonicalUrl || `${baseOrigin}${normalizedPath === '/' ? '' : normalizedPath}`);
              const isCustom = Boolean(canonicalUrl.trim());

              return (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">Canonical URL</label>
                    <span className="text-[10px] font-mono">
                      {isCustom ? (
                        <span className="text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          Custom Override
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Auto-Generated Active
                        </span>
                      )}
                    </span>
                  </div>
                  <Input
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder={autoCanonicalUrl}
                    className="rounded-xl text-xs font-mono"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span className="truncate">
                      Default Auto Canonical: <code className="text-slate-700 font-semibold">{autoCanonicalUrl}</code>
                    </span>
                    {isCustom && (
                      <button
                        type="button"
                        onClick={() => setCanonicalUrl('')}
                        className="text-xs text-rose-600 hover:underline shrink-0 ml-2 cursor-pointer font-medium"
                      >
                        Reset to Auto
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-slate-50/50">
                <div>
                  <span className="text-xs font-semibold text-slate-800">Robots Index</span>
                  <p className="text-[10px] text-slate-500">Allow in search results</p>
                </div>
                <Switch checked={robotsIndex} onCheckedChange={setRobotsIndex} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-slate-50/50">
                <div>
                  <span className="text-xs font-semibold text-slate-800">Robots Follow</span>
                  <p className="text-[10px] text-slate-500">Follow links on page</p>
                </div>
                <Switch checked={robotsFollow} onCheckedChange={setRobotsFollow} />
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Social Media & OG */}
          <TabsContent value="social" className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Open Graph Title</label>
              <Input
                value={ogTitle}
                onChange={(e) => setOgTitle(e.target.value)}
                placeholder="Custom title when shared on LinkedIn / Facebook..."
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Open Graph Description</label>
              <Textarea
                value={ogDescription}
                onChange={(e) => setOgDescription(e.target.value)}
                rows={2}
                placeholder="Custom description for social cards..."
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Twitter Card Type</label>
              <select
                value={twitterCard}
                onChange={(e) => setTwitterCard(e.target.value)}
                className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 cursor-pointer"
              >
                <option value="summary_large_image">summary_large_image (Large Banner)</option>
                <option value="summary">summary (Compact Square)</option>
              </select>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Open Graph Image (Social Card Banner)</label>
                  <p className="text-[11px] text-slate-500">
                    Banner displayed when this page is shared on LinkedIn, Facebook, X, and messaging cards.
                  </p>
                </div>
                <span className="text-[10px] font-mono shrink-0">
                  {ogImageUrl.trim() ? (
                    <span className="text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                      Custom Override
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Common Default Active
                    </span>
                  )}
                </span>
              </div>

              <ImageUploadField
                label=""
                value={ogImageUrl}
                onChange={setOgImageUrl}
                placeholder={defaultOgImage || '/og-default.png'}
              />

              {!ogImageUrl.trim() && (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200/80 bg-emerald-50/50">
                  <div className="w-20 h-11 rounded-lg overflow-hidden border border-emerald-200 shrink-0 bg-slate-900 relative">
                    <img
                      src={defaultOgImage || '/og-default.png'}
                      alt="Common Default OG Banner"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-emerald-900">Active: Common Default OG Banner</span>
                      <span className="text-[9px] bg-emerald-200/80 text-emerald-800 font-medium px-1.5 py-0.5 rounded">Auto Fallback</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 truncate">
                      Using site-wide default: <code className="text-emerald-950 font-semibold">{defaultOgImage || '/og-default.png'}</code>
                    </p>
                  </div>
                </div>
              )}

              {ogImageUrl.trim() && (
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                  <span>Custom page OG image active</span>
                  <button
                    type="button"
                    onClick={() => setOgImageUrl('')}
                    className="text-xs text-rose-600 hover:underline shrink-0 ml-2 cursor-pointer font-medium"
                  >
                    Reset to Common Default
                  </button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB 3: Structured Data */}
          <TabsContent value="schema" className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Custom JSON-LD Structured Data</label>
            <p className="text-[11px] text-slate-500">
              Valid JSON-LD schema (e.g. FAQPage, Article, Service) injected into the document head for this page.
            </p>
            <Textarea
              value={structuredData}
              onChange={(e) => setStructuredData(e.target.value)}
              rows={8}
              placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "WebPage",\n  "name": "..."\n}'}
              className="rounded-xl text-xs font-mono leading-relaxed bg-slate-900 text-slate-100 p-3"
            />
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-xs cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 cursor-pointer shadow-xs"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
              </>
            ) : (
              'Save Page SEO'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
