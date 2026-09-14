'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Handshake,
  ExternalLink,
  Sparkles,
  LayoutGrid,
  Palette,
} from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import type {
  PartnersSection,
  PartnersPayload,
  PartnersLayoutSettings,
  PartnersAnimationSettings,
} from './types';

const Label = ({ className = '', ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={`block text-xs font-semibold text-slate-700 ${className}`} {...props} />
);

interface PartnersSettingsProps {
  section: PartnersSection;
  onChange: (updated: PartnersSection) => void;
}

const PRESETS: Record<string, { label: string; rows: number[] }> = {
  '8/6/4': { label: '8 → 6 → 4 (Centered Cascade · Default)', rows: [8, 6, 4] },
  '6/4/2': { label: '6 → 4 → 2 (Pyramid)', rows: [6, 4, 2] },
  '8/8': { label: '8 → 8 (Dual Rows)', rows: [8, 8] },
  '6/6/6': { label: '6 → 6 → 6 (Uniform Grid)', rows: [6, 6, 6] },
  '5/5': { label: '5 → 5 (Ten Partners)', rows: [5, 5] },
  custom: { label: 'Custom Row Pattern', rows: [8, 6, 4] },
};

export function PartnersSettings({ section, onChange }: PartnersSettingsProps) {
  const p: PartnersPayload = section.contentPayload || {};
  const layout: PartnersLayoutSettings = p.layout || {};
  const animation: PartnersAnimationSettings = p.animation || {};
  const cta = p.cta || {};

  // Count active live partners from DB for informational readout
  const [partnerCount, setPartnerCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    fetchApi<any[]>('/partners?showOnHomepage=true&status=PUBLISHED')
      .then((data) => {
        if (Array.isArray(data)) setPartnerCount(data.length);
      })
      .catch(() => {});
  }, []);

  const update = (partial: Partial<PartnersPayload>) => {
    onChange({
      ...section,
      contentPayload: {
        ...p,
        ...partial,
      },
    });
  };

  const updateLayout = (partial: Partial<PartnersLayoutSettings>) => {
    update({
      layout: {
        ...layout,
        ...partial,
      },
    });
  };

  const updateAnimation = (partial: Partial<PartnersAnimationSettings>) => {
    update({
      animation: {
        ...animation,
        ...partial,
      },
    });
  };

  const updateCta = (partial: Partial<NonNullable<PartnersPayload['cta']>>) => {
    update({
      cta: {
        ...cta,
        ...partial,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Informational Banner: Zero Manual Partner Selection ──────────────── */}
      <div className="p-4 bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/50 border border-blue-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start space-x-3">
          <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 sm:mt-0">
            <Handshake className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-xs font-bold text-slate-900">
                Partners Automatically Sourced from Partners Module
              </h4>
              {partnerCount !== null && (
                <Badge variant="outline" className="bg-white/80 text-blue-700 border-blue-200 text-[10px] font-mono">
                  {partnerCount} live eligible
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
              All partners with <strong className="text-slate-800">Published</strong> status and{' '}
              <strong className="text-slate-800">Show on Homepage</strong> enabled in the Partners module are displayed here in order. No manual selector required.
            </p>
          </div>
        </div>

        <Link href="/content/partners" passHref legacyBehavior>
          <Button
            size="sm"
            className="rounded-xl h-8 px-3 text-xs font-semibold bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 shadow-2xs shrink-0"
          >
            Manage Partners
            <ExternalLink className="h-3 w-3 ml-1.5" />
          </Button>
        </Link>
      </div>

      {/* ── Section Activation ──────────────────────────────────────────────── */}
      <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
        <CardHeader className="pb-3 pt-5 px-6 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900">Section Status</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Toggle visibility of the Partners section on the public homepage.
            </CardDescription>
          </div>
          <Switch
            checked={section.isActive}
            onCheckedChange={(checked) => onChange({ ...section, isActive: checked })}
          />
        </CardHeader>
      </Card>

      {/* ── Typography & Header Copy ────────────────────────────────────────── */}
      <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
        <CardHeader className="pb-3 pt-5 px-6 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>Section Header & Copywriting</span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Define the eyebrow tag, main headline, accent highlights, and descriptive text.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Eyebrow Badge</Label>
              <Input
                value={p.eyebrow ?? ''}
                onChange={(e) => update({ eyebrow: e.target.value })}
                placeholder="GLOBAL ALLIANCES"
                className="text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Title Highlight Keyword</Label>
              <Input
                value={p.titleHighlight ?? ''}
                onChange={(e) => update({ titleHighlight: e.target.value })}
                placeholder="Enterprise Partners"
                className="text-xs rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Headline</Label>
            <Input
              value={p.title ?? ''}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Strategic Cloud & Enterprise Partners"
              className="text-xs font-semibold rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={p.description ?? ''}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="We collaborate closely with leading cloud, commerce, and infrastructure providers to engineer resilient digital systems at global scale."
              rows={3}
              className="text-xs rounded-xl resize-none font-sans"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Structured Centered Layout (8 → 6 → 4) ───────────────────────────── */}
      <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
        <CardHeader className="pb-3 pt-5 px-6 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <LayoutGrid className="h-4 w-4 text-blue-600" />
            <span>Structured Centered Layout (8 → 6 → 4)</span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Configure row counts, alignment, and responsiveness. Desktop defaults to centered cascade.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Layout Preset */}
            <div className="space-y-1.5">
              <Label>Row Architecture Preset</Label>
              <select
                value={layout.preset || '8/6/4'}
                onChange={(e) => {
                  const val = e.target.value;
                  const cfg = PRESETS[val];
                  updateLayout({
                    preset: val as any,
                    desktopRow1: cfg?.rows[0] ?? 8,
                    desktopRow2: cfg?.rows[1] ?? 6,
                    desktopRow3: cfg?.rows[2] ?? 4,
                  });
                }}
                className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(PRESETS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Row Alignment */}
            <div className="space-y-1.5">
              <Label>Row Alignment</Label>
              <select
                value={layout.rowAlignment || 'center'}
                onChange={(e) => updateLayout({ rowAlignment: e.target.value as any })}
                className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="center">Centered (Recommended · Elegant Balance)</option>
                <option value="left">Left Aligned</option>
              </select>
            </div>
          </div>

          {/* Row count fine-tuning if custom or preset */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50/70 rounded-xl border border-slate-200/60">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-600">Row 1 (Top)</span>
              <Input
                type="number"
                value={layout.desktopRow1 ?? 8}
                onChange={(e) => updateLayout({ desktopRow1: parseInt(e.target.value, 10) || 8 })}
                min={1}
                max={12}
                className="h-8 text-xs text-center font-mono rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-600">Row 2 (Middle)</span>
              <Input
                type="number"
                value={layout.desktopRow2 ?? 6}
                onChange={(e) => updateLayout({ desktopRow2: parseInt(e.target.value, 10) || 6 })}
                min={1}
                max={12}
                className="h-8 text-xs text-center font-mono rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-600">Row 3 (Bottom)</span>
              <Input
                type="number"
                value={layout.desktopRow3 ?? 4}
                onChange={(e) => updateLayout({ desktopRow3: parseInt(e.target.value, 10) || 4 })}
                min={1}
                max={12}
                className="h-8 text-xs text-center font-mono rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Mobile Columns */}
            <div className="space-y-1.5">
              <Label>Mobile Columns</Label>
              <select
                value={layout.mobileCols || 3}
                onChange={(e) => updateLayout({ mobileCols: parseInt(e.target.value, 10) as 2 | 3 })}
                className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={3}>3 Columns (Compact & Visible)</option>
                <option value={2}>2 Columns (Larger Badges)</option>
              </select>
            </div>

            {/* Logo Style */}
            <div className="space-y-1.5">
              <Label>Logo Treatment</Label>
              <select
                value={layout.logoStyle || 'original'}
                onChange={(e) => updateLayout({ logoStyle: e.target.value as any })}
                className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="original">Original Full Color</option>
                <option value="muted">Muted Contrast (Polished)</option>
                <option value="grayscale">Pure Grayscale</option>
                <option value="monochrome">Monochrome Clean</option>
              </select>
            </div>

            {/* Logo Size */}
            <div className="space-y-1.5">
              <Label>Logo Card Scale</Label>
              <select
                value={layout.logoSize || 'medium'}
                onChange={(e) => updateLayout({ logoSize: e.target.value as any })}
                className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="small">Small (Dense)</option>
                <option value="medium">Medium (Standard · Balanced)</option>
                <option value="large">Large (Prominent)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Visual Effects & Animation ───────────────────────────────────────── */}
      <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
        <CardHeader className="pb-3 pt-5 px-6 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Palette className="h-4 w-4 text-blue-600" />
            <span>Interactive Effects & Reveal</span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Hover transitions, card depth, and scroll reveal animations.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50/60 rounded-xl border border-slate-200/60">
            <div>
              <span className="text-xs font-bold text-slate-800">Card Hover Glow & Elevate</span>
              <p className="text-[11px] text-slate-500">
                Smooth lift with subtle glow and logo sharpening on mouse hover.
              </p>
            </div>
            <Switch
              checked={animation.hoverEffect ?? true}
              onCheckedChange={(checked) => updateAnimation({ hoverEffect: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50/60 rounded-xl border border-slate-200/60">
            <div>
              <span className="text-xs font-bold text-slate-800">Staggered Scroll Reveal</span>
              <p className="text-[11px] text-slate-500">
                Smooth cascading entrance animation as the user scrolls into view.
              </p>
            </div>
            <Switch
              checked={animation.enableReveal ?? true}
              onCheckedChange={(checked) => updateAnimation({ enableReveal: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Optional Call to Action Button ──────────────────────────────────── */}
      <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
        <CardHeader className="pb-3 pt-5 px-6 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900">Partner Program CTA Button</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Optional button below the partner grid (e.g. &ldquo;Become a Partner&rdquo;).
            </CardDescription>
          </div>
          <Switch
            checked={cta.enabled ?? false}
            onCheckedChange={(checked) => updateCta({ enabled: checked })}
          />
        </CardHeader>
        {cta.enabled && (
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Button Label</Label>
                <Input
                  value={cta.label ?? ''}
                  onChange={(e) => updateCta({ label: e.target.value })}
                  placeholder="Become a Partner"
                  className="text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Button URL / Anchor</Label>
                <Input
                  value={cta.url ?? ''}
                  onChange={(e) => updateCta({ url: e.target.value })}
                  placeholder="/contact or #partnership"
                  className="text-xs font-mono rounded-xl"
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
