'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { TrendingUp, BarChart3, ArrowRight, Award } from 'lucide-react';
import type { RevenueExperimentSection, RevenueExperimentPayload } from './types';

const Label = ({ className = '', ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={`block text-xs font-semibold text-slate-700 ${className}`} {...props} />
);

interface RevenueExperimentSettingsProps {
  section: RevenueExperimentSection;
  onChange: (updated: RevenueExperimentSection) => void;
}

export function RevenueExperimentSettings({ section, onChange }: RevenueExperimentSettingsProps) {
  const p: RevenueExperimentPayload = section.contentPayload || {};

  const update = (partial: Partial<RevenueExperimentPayload>) => {
    onChange({
      ...section,
      contentPayload: {
        ...p,
        ...partial,
      },
    });
  };

  const handleBarChange = (index: number, val: number) => {
    const current = Array.isArray(p.bars) ? [...p.bars] : [25, 38, 55, 70, 85, 100];
    current[index] = Math.max(10, Math.min(100, val || 10));
    update({ bars: current });
  };

  const bars = Array.isArray(p.bars) && p.bars.length === 6 ? p.bars : [25, 38, 55, 70, 85, 100];

  return (
    <div className="space-y-6">
      {/* ── SECTION STATUS CARD ────────────────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm text-slate-800">
                  CRO Experiment Section Visibility
                </span>
                <span
                  className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase ${
                    section.isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {section.isActive ? 'Active on Web' : 'Hidden'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Display the 2-column CRO revenue experiment block directly after Verified Results.
              </p>
            </div>
            <Switch
              checked={section.isActive}
              onCheckedChange={(checked) => onChange({ ...section, isActive: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── LEFT COLUMN: HEADLINE & CTA ──────────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2 text-slate-700">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-sm font-semibold">Headlines & Call to Action</CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Configure the left-hand value proposition and primary audit button.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">Eyebrow Tag</Label>
            <Input
              value={p.eyebrow ?? 'CRO REVENUE EXPERIMENT'}
              onChange={(e) => update({ eyebrow: e.target.value })}
              placeholder="CRO REVENUE EXPERIMENT"
              className="rounded-xl text-xs font-mono uppercase tracking-wider"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">Main Headline</Label>
            <Textarea
              rows={2}
              value={p.headline || ''}
              onChange={(e) => update({ headline: e.target.value })}
              placeholder="Test what makes money, not what looks nice"
              className="rounded-xl text-sm font-medium"
            />
            <p className="text-[11px] text-slate-400">
              Tip: Supports multi-line breaks for balanced title typography.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">Stylized Accent Word (Serif Italic)</Label>
            <Input
              value={p.titleHighlight || ''}
              onChange={(e) => update({ titleHighlight: e.target.value })}
              placeholder="e.g. money"
              className="rounded-xl text-xs font-serif italic"
            />
            <p className="text-[11px] text-slate-400">
              Word in the headline rendered in Instrument Serif italic font.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">Supporting Paragraph</Label>
            <Textarea
              rows={3}
              value={p.description || ''}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Every month we ship experiments against a single number — revenue per session..."
              className="rounded-xl text-xs text-slate-600 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">CTA Button Label</Label>
              <div className="relative">
                <Input
                  value={p.ctaText || ''}
                  onChange={(e) => update({ ctaText: e.target.value })}
                  placeholder="Start a CRO audit"
                  className="rounded-xl text-xs pr-8 font-medium"
                />
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">CTA Button URL</Label>
              <Input
                value={p.ctaUrl || ''}
                onChange={(e) => update({ ctaUrl: e.target.value })}
                placeholder="#audit or /audit"
                className="rounded-xl text-xs font-mono"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── RIGHT COLUMN: EXPERIMENT METRICS & CARD ────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2 text-slate-700">
            <Award className="h-4 w-4 text-fuchsia-600" />
            <CardTitle className="text-sm font-semibold">Experiment Card & Winner Badge</CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Set the live test tag, metric subtitle, and winner callout.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-2">
              <Label className="text-xs font-semibold text-slate-700">Experiment Tag / Block</Label>
              <Input
                value={p.experimentTag || ''}
                onChange={(e) => update({ experimentTag: e.target.value })}
                placeholder="Experiment 14 · PDP bundle block"
                className="rounded-xl text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">Winner Badge Text</Label>
              <Input
                value={p.winnerBadge || ''}
                onChange={(e) => update({ winnerBadge: e.target.value })}
                placeholder="WINNER"
                className="rounded-xl text-xs font-bold text-fuchsia-700"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">Metric Title</Label>
            <Input
              value={p.metricTitle || ''}
              onChange={(e) => update({ metricTitle: e.target.value })}
              placeholder="Revenue per session"
              className="rounded-xl text-xs font-semibold"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── COMPARISON BOXES: CONTROL vs VARIANT B ─────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold">Comparison Metric Boxes</CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Set baseline Control numbers alongside winning Variant B growth statistics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Control Column */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Control Box</span>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium text-slate-600">Label</Label>
                <Input
                  value={p.controlLabel || ''}
                  onChange={(e) => update({ controlLabel: e.target.value })}
                  placeholder="Control"
                  className="rounded-lg text-xs h-8 bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium text-slate-600">Number / Value</Label>
                <Input
                  value={p.controlValue || ''}
                  onChange={(e) => update({ controlValue: e.target.value })}
                  placeholder="$1.94"
                  className="rounded-lg text-sm font-bold h-9 bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium text-slate-600">Subtext</Label>
                <Input
                  value={p.controlSubtext || ''}
                  onChange={(e) => update({ controlSubtext: e.target.value })}
                  placeholder="rev / session"
                  className="rounded-lg text-xs h-8 bg-white text-slate-400"
                />
              </div>
            </div>

            {/* Variant B Column */}
            <div className="p-4 rounded-xl bg-pink-50/60 border border-pink-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-fuchsia-700">Variant B (Winner)</span>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium text-fuchsia-700">Label</Label>
                <Input
                  value={p.variantLabel || ''}
                  onChange={(e) => update({ variantLabel: e.target.value })}
                  placeholder="Variant B"
                  className="rounded-lg text-xs h-8 bg-white font-semibold text-fuchsia-600"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium text-fuchsia-700">Winning Value</Label>
                <Input
                  value={p.variantValue || ''}
                  onChange={(e) => update({ variantValue: e.target.value })}
                  placeholder="$2.61"
                  className="rounded-lg text-sm font-bold h-9 bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium text-fuchsia-700">Growth & Confidence Subtext</Label>
                <Input
                  value={p.variantSubtext || ''}
                  onChange={(e) => update({ variantSubtext: e.target.value })}
                  placeholder="+34.5% · 97% conf."
                  className="rounded-lg text-xs h-8 bg-white font-semibold text-fuchsia-600"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── BAR CHART HEIGHTS ────────────────────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2 text-slate-700">
            <BarChart3 className="h-4 w-4 text-fuchsia-600" />
            <CardTitle className="text-sm font-semibold">Progressive Bar Chart (6 Bars)</CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Adjust the relative percentage heights (10% - 100%) of the 6 test progression bars.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-2 sm:gap-3">
            {bars.map((barVal: number, idx: number) => (
              <div key={idx} className="space-y-1 text-center">
                <span className="text-[10px] font-bold text-slate-400">Bar {idx + 1}</span>
                <Input
                  type="number"
                  min={10}
                  max={100}
                  value={barVal}
                  onChange={(e) => handleBarChange(idx, parseInt(e.target.value) || 10)}
                  className="text-center rounded-lg text-xs h-9 px-1 font-semibold"
                />
                <span className="text-[10px] text-slate-400">%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
