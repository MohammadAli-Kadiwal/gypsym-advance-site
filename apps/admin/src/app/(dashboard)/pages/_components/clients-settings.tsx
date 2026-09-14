'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Building2,
  Plus,
  Trash2,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import type {
  ClientsSection,
  ClientsPayload,
  ClientsLayoutSettings,
  ClientsAnimationSettings,
} from './types';

const Label = ({ className = '', ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={`block text-xs font-semibold text-slate-700 ${className}`} {...props} />
);

interface RawClientRecord {
  id: string;
  name: string;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  tier?: string;
  isFeatured?: boolean;
  isActive?: boolean;
}

interface ClientsSettingsProps {
  section: ClientsSection;
  onChange: (updated: ClientsSection) => void;
}

const PRESETS: Record<string, { label: string; rows: number[] }> = {
  '8/6/4': { label: '8 / 6 / 4 (Default Structured)', rows: [8, 6, 4] },
  '6/4/2': { label: '6 / 4 / 2 (Pyramid)', rows: [6, 4, 2] },
  '8/8': { label: '8 / 8 (Balanced)', rows: [8, 8] },
  '6/6/6': { label: '6 / 6 / 6 (Uniform Grid)', rows: [6, 6, 6] },
};

export function ClientsSettings({ section, onChange }: ClientsSettingsProps) {
  const p: ClientsPayload = section.contentPayload || {};
  const layout: ClientsLayoutSettings = p.layout || {};
  const animation: ClientsAnimationSettings = p.animation || {};

  // Live clients from database
  const [availableClients, setAvailableClients] = React.useState<RawClientRecord[]>([]);
  const [loadingClients, setLoadingClients] = React.useState<boolean>(false);

  // Load existing clients from API
  const loadClients = React.useCallback(async () => {
    setLoadingClients(true);
    try {
      const res = await fetchApi<any>('/clients');
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setAvailableClients(list);
    } catch {
      // Graceful error handling
    } finally {
      setLoadingClients(false);
    }
  }, []);

  React.useEffect(() => {
    loadClients();
  }, [loadClients]);

  const update = (partial: Partial<ClientsPayload>) => {
    onChange({
      ...section,
      contentPayload: {
        ...p,
        ...partial,
      },
    });
  };

  const updateLayout = (partial: Partial<ClientsLayoutSettings>) => {
    update({
      layout: {
        ...layout,
        ...partial,
      },
    });
  };

  const updateAnimation = (partial: Partial<ClientsAnimationSettings>) => {
    update({
      animation: {
        ...animation,
        ...partial,
      },
    });
  };

  const rowPattern: number[] = Array.isArray(layout.rowPattern) && layout.rowPattern.length > 0
    ? layout.rowPattern
    : [8, 6, 4];

  // Total capacity of configured rows
  const plannedCapacity = rowPattern.reduce((acc, curr) => acc + (Number(curr) || 0), 0);

  // ── Row Pattern Editor Handlers ─────────────────────────────────────────────
  const applyPreset = (presetKey: string) => {
    if (PRESETS[presetKey]) {
      updateLayout({
        preset: presetKey as any,
        rowPattern: [...PRESETS[presetKey].rows],
      });
    } else {
      updateLayout({ preset: 'custom' });
    }
  };

  const setRowCount = (rowIndex: number, count: number) => {
    const validCount = Math.max(1, Math.min(16, count));
    const newPattern = [...rowPattern];
    newPattern[rowIndex] = validCount;
    updateLayout({ preset: 'custom', rowPattern: newPattern });
  };

  const addRow = () => {
    const lastCount = rowPattern[rowPattern.length - 1] || 4;
    updateLayout({
      preset: 'custom',
      rowPattern: [...rowPattern, Math.max(2, lastCount - 2)],
    });
  };

  const removeRow = (index: number) => {
    if (rowPattern.length <= 1) return;
    const newPattern = rowPattern.filter((_, idx) => idx !== index);
    updateLayout({ preset: 'custom', rowPattern: newPattern });
  };

  return (
    <div className="space-y-6">
      {/* ── 1. SECTION VISIBILITY ─────────────────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm text-slate-800">
                  Clients / Trusted By Section Visibility
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d9127b]/10 text-[#d9127b]">
                  Section 7 (Home Page - After Our Methodology)
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Display the client logo showcase section on the public home page right after Delivery Process.
              </p>
            </div>
            <Switch
              checked={section.isActive}
              onCheckedChange={(checked) => onChange({ ...section, isActive: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── 2. SECTION HEADERS & CONTENT ───────────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#d9127b]" />
            <CardTitle className="text-base font-bold text-slate-900">
              Section Header & Typography
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Control the section-level eyebrow, headline, dynamic highlight, and optional introductory text.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Section Eyebrow</Label>
              <Input
                value={p.eyebrow || ''}
                onChange={(e) => update({ eyebrow: e.target.value })}
                placeholder="TRUSTED BY"
                className="text-xs h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Highlighted Phrase (Dynamic Brand Color)</Label>
              <Input
                value={p.titleHighlight || ''}
                onChange={(e) => update({ titleHighlight: e.target.value })}
                placeholder="100+ brands worldwide"
                className="text-xs h-9 font-medium text-[#d9127b]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Main Section Title</Label>
            <Input
              value={p.title || ''}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Trusted by 100+ brands worldwide"
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Section Description</Label>
            <Textarea
              value={p.description || ''}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="We partner with ambitious businesses to build meaningful, high-performance digital products."
              rows={2}
              className="text-xs"
            />
          </div>

          {/* Optional CTA Controls */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Section Call-to-Action (Optional)</Label>
                <p className="text-[11px] text-slate-500">Enable an optional link/button under the heading</p>
              </div>
              <Switch
                checked={p.cta?.enabled || false}
                onCheckedChange={(checked) =>
                  update({
                    cta: {
                      ...p.cta,
                      enabled: checked,
                      label: p.cta?.label || 'Work With Us',
                      url: p.cta?.url || '/contact',
                    },
                  })
                }
              />
            </div>

            {p.cta?.enabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <Label>CTA Label</Label>
                  <Input
                    value={p.cta?.label || ''}
                    onChange={(e) => update({ cta: { ...p.cta, label: e.target.value } })}
                    placeholder="Work With Us"
                    className="text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label>CTA Target URL</Label>
                  <Input
                    value={p.cta?.url || ''}
                    onChange={(e) => update({ cta: { ...p.cta, url: e.target.value } })}
                    placeholder="/contact"
                    className="text-xs h-8"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── 3. ALL CLIENTS DEFAULT INFO ───────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-slate-50/50">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#d9127b]/10 text-[#d9127b] flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-slate-900">
                  Showing All Clients by Default
                </h4>
                <p className="text-xs text-slate-500">
                  All active client records from your central Clients module ({loadingClients ? '...' : availableClients.filter(c => c.logoUrl && !c.logoUrl.includes('apex-bank-logo')).length} active clients) are showcased on the homepage automatically.
                </p>
              </div>
            </div>
            <Link
              href="/content/clients"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-300 shadow-2xs transition-colors shrink-0"
            >
              <span>Manage Clients Module</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* ── 4. LAYOUT & ROW PATTERN CONFIGURATION ─────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#d9127b]" />
            <CardTitle className="text-base font-bold text-slate-900">
              Row Distribution & Visual Composition
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Configure the multi-row client counts and desktop centering. Initial requested default: 8 → 6 → 4.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Preset Buttons */}
          <div className="space-y-2">
            <Label>Row Layout Preset</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PRESETS).map(([key, config]) => {
                const isActive = layout.preset === key || (layout.preset === undefined && key === '8/6/4');
                return (
                  <Button
                    key={key}
                    type="button"
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => applyPreset(key)}
                    className={`text-xs h-8 ${
                      isActive
                        ? 'bg-slate-900 text-white hover:bg-slate-800'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {config.label}
                  </Button>
                );
              })}
              <Button
                type="button"
                variant={layout.preset === 'custom' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateLayout({ preset: 'custom' })}
                className={`text-xs h-8 ${
                  layout.preset === 'custom'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Custom Pattern
              </Button>
            </div>
          </div>

          {/* Interactive Row Pattern Editor */}
          <div className="space-y-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <Label>Configured Rows ({rowPattern.length} Rows, Total {plannedCapacity} Slots)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRow}
                className="text-[11px] h-7 gap-1"
              >
                <Plus className="w-3 h-3 text-[#d9127b]" />
                <span>Add Row</span>
              </Button>
            </div>

            <div className="space-y-2">
              {rowPattern.map((count, rIdx) => (
                <div key={rIdx} className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200/70 shadow-2xs">
                  <span className="text-xs font-semibold text-slate-700 w-16 shrink-0">
                    Row {rIdx + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={16}
                      value={count}
                      onChange={(e) => setRowCount(rIdx, parseInt(e.target.value, 10) || 1)}
                      className="text-xs h-8 w-20 text-center font-mono font-bold"
                    />
                    <span className="text-xs text-slate-500">logos</span>
                  </div>

                  <div className="ml-auto flex items-center gap-2">
                    {rowPattern.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRow(rIdx)}
                        className="h-7 w-7 text-slate-400 hover:text-rose-600"
                        title="Remove row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Styling & Alignment Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="space-y-1.5">
              <Label>Display Presentation</Label>
              <select
                value={layout.displayMode || 'cards'}
                onChange={(e) => updateLayout({ displayMode: e.target.value as any })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="cards">Glass Cards Grid (Centered)</option>
                <option value="minimal">Minimalist Floating Logos</option>
                <option value="marquee">Continuous Smooth Marquee</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Overflow Behavior</Label>
              <select
                value={layout.overflowBehavior || 'continue'}
                onChange={(e) => updateLayout({ overflowBehavior: e.target.value as any })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="continue">Continue additional rows</option>
                <option value="limit">Limit to configured rows</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Logo Style Treatment</Label>
              <select
                value={layout.logoStyle || 'muted'}
                onChange={(e) => updateLayout({ logoStyle: e.target.value as any })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="muted">Muted / Grayscale (Default)</option>
                <option value="monochrome">Monochrome / High Contrast</option>
                <option value="original">Original Full Color</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Logo Size</Label>
              <select
                value={layout.logoSize || 'medium'}
                onChange={(e) => updateLayout({ logoSize: e.target.value as any })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="small">Small (Compact &amp; Dense)</option>
                <option value="medium">Medium (Balanced)</option>
                <option value="large">Large (High Prominence)</option>
              </select>
            </div>
          </div>

          {/* Trust Metrics Ribbon Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 mt-2">
            <div>
              <Label>Trust Metrics Ribbon</Label>
              <p className="text-[11px] text-slate-500">
                Display enterprise social proof stats below logos (100+ Enterprise Brands, 99.98% SLA, 15+ Markets, $2B+ Scale)
              </p>
            </div>
            <Switch
              checked={layout.showMetricsBar !== false}
              onCheckedChange={(checked) => updateLayout({ showMetricsBar: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── 5. ANIMATION & HOVER CONTROLS ─────────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#d9127b]" />
            <CardTitle className="text-base font-bold text-slate-900">
              Interaction &amp; Reveal Animation
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Control subtle viewport entry reveal and desktop hover reactions. Respects prefers-reduced-motion.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
              <div>
                <Label>Scroll Viewport Reveal</Label>
                <p className="text-[11px] text-slate-500">Subtle row stagger entrance animation</p>
              </div>
              <Switch
                checked={animation.enableReveal !== false}
                onCheckedChange={(checked) => updateAnimation({ enableReveal: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
              <div>
                <Label>Desktop Hover Scale &amp; Un-mute</Label>
                <p className="text-[11px] text-slate-500">Subtle 1.03 scale and full contrast on hover</p>
              </div>
              <Switch
                checked={animation.hoverEffect !== false}
                onCheckedChange={(checked) => updateAnimation({ hoverEffect: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
