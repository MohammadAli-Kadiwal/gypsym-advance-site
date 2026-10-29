'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useCmsCollection } from '@/lib/store';
import { fetchApi } from '@/lib/api-client';
import {
  Sparkles,
  Layers,
  Eye,
  Briefcase,
  ExternalLink,
  Search,
  Filter,
} from 'lucide-react';
import type {
  PortfolioSection,
  PortfolioPayload,
} from './types';

const Label = ({ className = '', ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={`block text-xs font-semibold text-slate-700 ${className}`} {...props} />
);

interface PortfolioSettingsProps {
  section: PortfolioSection;
  onChange: (updated: PortfolioSection) => void;
}

export function PortfolioSettings({ section, onChange }: PortfolioSettingsProps) {
  const p: PortfolioPayload = section.contentPayload || {};
  const { data: cmsPortfolioItems } = useCmsCollection('portfolio');

  const [apiProjects, setApiProjects] = React.useState<any[]>([]);
  const [projectSearch, setProjectSearch] = React.useState('');

  // Fetch live portfolio catalog
  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res: any = await fetchApi('/portfolio/admin/projects').catch(() =>
          fetchApi('/portfolio').then((r: any) => r?.projects || r?.data?.projects || r || [])
        );
        const list = Array.isArray(res)
          ? res
          : (Array.isArray(res?.projects)
            ? res.projects
            : (Array.isArray(res?.data?.projects) ? res.data.projects : []));
        if (!cancelled && list.length > 0) {
          setApiProjects(list);
        }
      } catch {
        // Fallback silently
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const allProjects = apiProjects.length > 0 ? apiProjects : cmsPortfolioItems || [];

  const update = (partial: Partial<PortfolioPayload>) => {
    onChange({
      ...section,
      contentPayload: {
        ...p,
        ...partial,
      },
    });
  };

  const selectedIds: string[] = Array.isArray(p.selectedProjectIds) ? p.selectedProjectIds : [];

  const toggleProjectSelection = (id: string) => {
    const isSelected = selectedIds.includes(id);
    const nextSelected = isSelected
      ? selectedIds.filter((item) => item !== id)
      : [...selectedIds, id];
    update({ selectedProjectIds: nextSelected });
  };

  const handleSelectAll = () => {
    update({ selectedProjectIds: allProjects.map((proj) => proj.id) });
  };

  const handleClearSelection = () => {
    update({ selectedProjectIds: [] });
  };

  const filteredProjects = React.useMemo(() => {
    if (!projectSearch.trim()) return allProjects;
    const q = projectSearch.toLowerCase();
    return allProjects.filter(
      (proj) =>
        proj.title?.toLowerCase().includes(q) ||
        proj.client?.toLowerCase().includes(q) ||
        proj.category?.toLowerCase().includes(q)
    );
  }, [allProjects, projectSearch]);

  const catalogCount = allProjects.length;

  return (
    <div className="space-y-6">
      {/* ── SECTION VISIBILITY ─────────────────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm text-slate-800">
                  Portfolio / Our Work Section Visibility
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d9127b]/10 text-[#d9127b]">
                  Section 5 (After What We Change)
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Display the high-impact portfolio showcase grid on the public home page.
              </p>
            </div>
            <Switch
              checked={section.isActive}
              onCheckedChange={(checked) => onChange({ ...section, isActive: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── SECTION HEADINGS ───────────────────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#d9127b]" />
            <CardTitle className="text-base font-bold text-slate-900">
              Section Header & Typography
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Control the eyebrow, headline, dynamic highlight, and introductory text.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Section Eyebrow</Label>
              <Input
                value={p.eyebrow || ''}
                onChange={(e) => update({ eyebrow: e.target.value })}
                placeholder="PORTFOLIO"
                className="text-xs h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Highlighted Phrase (Dynamic Brand Color)</Label>
              <Input
                value={p.titleHighlight || ''}
                onChange={(e) => update({ titleHighlight: e.target.value })}
                placeholder="Our Work"
                className="text-xs h-9 font-medium text-[#d9127b]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Main Title (Multi-line supported)</Label>
            <Input
              value={p.title || ''}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Our Work In Production"
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Section Description</Label>
            <Textarea
              value={p.description || ''}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="High-performance architectures, mission-critical platforms, and conversion engines engineered for global enterprises."
              rows={2}
              className="text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── HOME PAGE CATEGORY FILTER & VIEW ALL BUTTON CONTROLS ──────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#d9127b]" />
            <CardTitle className="text-base font-bold text-slate-900">
              Home Page Category Bar & &quot;View All&quot; Action
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Control category tabs on the home page and provide a direct link to the full /portfolio showcase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Filter on Home Page Switch */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60">
              <div className="space-y-0.5 pr-2">
                <Label className="text-slate-800">Show Category Filter on Home Page</Label>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Keep off to remove category tabs from home page (clean agency look). All categories remain active on /portfolio.
                </p>
              </div>
              <Switch
                checked={Boolean(p.showCategoryFilter)}
                onCheckedChange={(checked) => update({ showCategoryFilter: checked })}
              />
            </div>

            {/* View All Portfolio Button Switch */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60">
              <div className="space-y-0.5 pr-2">
                <Label className="text-slate-800">Show &quot;View All Portfolio&quot; Button</Label>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Display a prominent callout button below the cards inviting visitors to explore the complete showcase.
                </p>
              </div>
              <Switch
                checked={p.showViewAllButton !== false}
                onCheckedChange={(checked) => update({ showViewAllButton: checked })}
              />
            </div>
          </div>

          {/* Button Config Fields */}
          {p.showViewAllButton !== false && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/40">
              <div className="space-y-1.5">
                <Label>&quot;View All&quot; Button Label</Label>
                <Input
                  value={p.viewAllButtonLabel || 'View All Portfolio'}
                  onChange={(e) => update({ viewAllButtonLabel: e.target.value })}
                  placeholder="View All Portfolio"
                  className="text-xs h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label>&quot;View All&quot; Destination URL</Label>
                <Input
                  value={p.viewAllButtonUrl || '/portfolio'}
                  onChange={(e) => update({ viewAllButtonUrl: e.target.value })}
                  placeholder="/portfolio"
                  className="text-xs h-9"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── WHICH PORTFOLIO PROJECTS TO SHOW ON HOME PAGE ────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#d9127b]" />
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Which Portfolio Projects Show on Home Page
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Select specific projects to showcase on the home page, or leave unselected to automatically display top published projects.
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`font-mono text-xs px-2.5 py-1 ${selectedIds.length > 0
                  ? 'border-[#d9127b]/40 bg-[#d9127b]/10 text-[#d9127b] font-bold'
                  : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
              >
                {selectedIds.length > 0
                  ? `${selectedIds.length} Custom Selected`
                  : `Top ${p.maxDisplayCount || 4} Automatic`}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls: Search, Quick Selection & Count */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search projects by name, client, category..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              {selectedIds.length > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearSelection}
                  className="text-xs h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                >
                  Clear Selection (Use Top Automatic)
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-xs h-8"
                >
                  Select All ({allProjects.length})
                </Button>
              )}
            </div>
          </div>

          {/* Project Cards Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1 border border-slate-100 rounded-xl p-2.5 bg-slate-50/40">
            {filteredProjects.map((proj) => {
              const isSelected = selectedIds.includes(proj.id);
              return (
                <div
                  key={proj.id}
                  onClick={() => toggleProjectSelection(proj.id)}
                  className={`group relative flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${isSelected
                    ? 'border-[#d9127b] bg-[#d9127b]/5 shadow-xs ring-1 ring-[#d9127b]/30'
                    : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-2xs'
                    }`}
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-12 rounded-lg bg-neutral-900 overflow-hidden shrink-0 border border-slate-200/80 flex items-center justify-center">
                    {proj.imageUrl ? (
                      <img
                        src={proj.imageUrl}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <Briefcase className="w-5 h-5 text-slate-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{proj.title}</p>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {proj.client || proj.category || 'Featured Brand'}
                    </p>
                    {proj.category && (
                      <span className="inline-block mt-0.5 text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                        {proj.category}
                      </span>
                    )}
                  </div>

                  {/* Check Indicator */}
                  <div className="shrink-0 pl-1">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleProjectSelection(proj.id)}
                      className="data-[state=checked]:bg-[#d9127b] data-[state=checked]:border-[#d9127b]"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Display Count fallback */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="space-y-0.5">
              <Label>Maximum Display Count on Home Page</Label>
              <p className="text-[11px] text-slate-400">
                Number of cards rendered in the home showcase grid (e.g. 4, 6).
              </p>
            </div>
            <Input
              type="number"
              min={1}
              max={catalogCount || 50}
              value={p.maxDisplayCount !== undefined && p.maxDisplayCount !== null ? p.maxDisplayCount : ''}
              onChange={(e) => {
                const val = e.target.value.trim() === '' ? undefined : parseInt(e.target.value, 10);
                update({ maxDisplayCount: isNaN(val as number) ? undefined : val });
              }}
              placeholder={`Default (4)`}
              className="text-xs h-9 w-32"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── PORTFOLIO CATALOG LINK CARD ────────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-gradient-to-br from-white via-slate-50/50 to-slate-100/30">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#d9127b]/10 border border-[#d9127b]/20 flex items-center justify-center shrink-0 text-[#d9127b] mt-0.5">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    Portfolio Projects Managed in Dedicated Menu
                  </h4>
                  <span className="font-mono text-[10px] font-bold text-[#d9127b] bg-[#d9127b]/10 px-2 py-0.5 rounded-full">
                    {catalogCount} Active Projects
                  </span>
                </div>
                <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                  Showcase projects, enterprise case studies, client names, impact metrics, project URLs, and cover images are managed centrally in the dedicated <strong className="font-semibold text-slate-800">Portfolio</strong> menu.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:self-center shrink-0">
              <Button
                asChild
                variant="default"
                size="sm"
                className="text-xs font-semibold bg-[#d9127b] hover:bg-[#b00e63] text-white shadow-xs gap-1.5 h-9 px-4"
              >
                <Link href="/content/portfolio">
                  <span>Manage Portfolio</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── HOVER & VIEW BUTTON SETTINGS ───────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#d9127b]" />
            <CardTitle className="text-base font-bold text-slate-900">
              Card Hover & Visual Physics
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Configure card hover elevation, ambient radial glow, and image zoom transitions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <div>
                <Label>Hover Effects</Label>
                <p className="text-[11px] text-slate-500">Enable card hover interactions and glow</p>
              </div>
              <Switch
                checked={p.hoverEffectsEnabled !== false}
                onCheckedChange={(checked) => update({ hoverEffectsEnabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <div>
                <Label>Image Zoom</Label>
                <p className="text-[11px] text-slate-500">Subtle 1.08x smooth zoom on hover</p>
              </div>
              <Switch
                checked={p.imageZoomEnabled !== false}
                onCheckedChange={(checked) => update({ imageZoomEnabled: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
