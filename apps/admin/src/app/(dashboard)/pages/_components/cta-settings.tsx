'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Layout,
  Palette,
  MousePointerClick,
} from 'lucide-react';
import type {
  CtaSection,
  CtaPayload,
  CtaAppearance,
  CtaLayout,
  CtaButton,
} from './types';

const Label = ({ className = '', ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={`block text-xs font-semibold text-slate-700 ${className}`} {...props} />
);

interface CtaSettingsProps {
  section: CtaSection;
  onChange: (updated: CtaSection) => void;
}

export function CtaSettings({ section, onChange }: CtaSettingsProps) {
  const p: CtaPayload = section.contentPayload || {};
  const primaryButton: CtaButton = p.primaryButton || {
    label: 'Schedule an Architectural Briefing',
    url: '#contact-inquiry',
    variant: 'glow',
    target: '_self',
  };
  const secondaryButton = p.secondaryButton || {
    enabled: true,
    label: 'Explore Technology Radar',
    url: '/technologies',
    variant: 'outline',
    target: '_self',
  };
  const appearance: CtaAppearance = p.appearance || {
    backgroundType: 'gradient',
    overlayOpacity: 40,
    enableGlow: true,
  };
  const layout: CtaLayout = p.layout || {
    alignment: 'center',
    containerWidth: 'contained',
    borderRadius: '2xl',
  };

  const update = (partial: Partial<CtaPayload>) => {
    onChange({
      ...section,
      contentPayload: {
        ...p,
        ...partial,
      },
    });
  };

  const updatePrimaryButton = (partial: Partial<CtaButton>) => {
    update({
      primaryButton: {
        ...primaryButton,
        ...partial,
      },
    });
  };

  const updateSecondaryButton = (partial: Partial<NonNullable<CtaPayload['secondaryButton']>>) => {
    update({
      secondaryButton: {
        ...secondaryButton,
        ...partial,
      },
    });
  };

  const updateAppearance = (partial: Partial<CtaAppearance>) => {
    update({
      appearance: {
        ...appearance,
        ...partial,
      },
    });
  };

  const updateLayout = (partial: Partial<CtaLayout>) => {
    update({
      layout: {
        ...layout,
        ...partial,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Section Content & Messaging ─────────────────────── */}
      <Card className="rounded-2xl border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  CTA Banner · Content & Copy
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Headline, serif-italic highlight word, and descriptive narrative
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] text-blue-600 bg-blue-50/50 border-blue-200 font-mono">
              CTA_BANNER
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cta-eyebrow">Eyebrow Badge</Label>
              <Input
                id="cta-eyebrow"
                value={p.eyebrow ?? 'ENTERPRISE ARCHITECTURE'}
                onChange={(e) => update({ eyebrow: e.target.value })}
                className="mt-1 text-xs"
                placeholder="ENTERPRISE ARCHITECTURE"
              />
            </div>
            <div>
              <Label htmlFor="cta-highlight">Serif-Italic Accent Word</Label>
              <Input
                id="cta-highlight"
                value={p.titleHighlight ?? 'Transformation'}
                onChange={(e) => update({ titleHighlight: e.target.value })}
                className="mt-1 text-xs"
                placeholder="Transformation"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Word or phrase within the title rendered in font-serif italic accent.
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="cta-title">Headline</Label>
            <Input
              id="cta-title"
              value={p.title ?? 'Ready to Accelerate Your Digital Transformation?'}
              onChange={(e) => update({ title: e.target.value })}
              className="mt-1 text-xs font-semibold"
              placeholder="Ready to Accelerate Your Digital Transformation?"
            />
          </div>

          <div>
            <Label htmlFor="cta-desc">Description</Label>
            <Textarea
              id="cta-desc"
              rows={3}
              value={
                p.description ??
                'Partner with our systems engineers and cloud architects to build resilient, distributed digital infrastructure engineered for uncompromising scale.'
              }
              onChange={(e) => update({ description: e.target.value })}
              className="mt-1 text-xs resize-none"
              placeholder="Describe your executive call to action..."
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Call to Action Buttons ───────────────────────────── */}
      <Card className="rounded-2xl border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <MousePointerClick className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-slate-900">
                Action Buttons
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Configure primary and optional secondary action links
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-xs">
          {/* Primary CTA */}
          <div className="space-y-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/60">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs">Primary Action Button</span>
              <Badge className="text-[9px] bg-blue-600 text-white border-none">Primary</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Button Label</Label>
                <Input
                  value={primaryButton.label}
                  onChange={(e) => updatePrimaryButton({ label: e.target.value })}
                  className="mt-1 h-8 text-xs bg-white"
                />
              </div>
              <div>
                <Label>Destination URL</Label>
                <Input
                  value={primaryButton.url}
                  onChange={(e) => updatePrimaryButton({ url: e.target.value })}
                  className="mt-1 h-8 text-xs font-mono bg-white"
                />
              </div>
              <div>
                <Label>Style Variant</Label>
                <select
                  value={primaryButton.variant ?? 'glow'}
                  onChange={(e) =>
                    updatePrimaryButton({
                      variant: e.target.value as CtaButton['variant'],
                    })
                  }
                  className="mt-1 h-8 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="glow">Luminous Glow</option>
                  <option value="primary">Solid Primary</option>
                  <option value="secondary">Surface Secondary</option>
                  <option value="outline">Subtle Outline</option>
                </select>
              </div>
            </div>
          </div>

          {/* Secondary CTA */}
          <div className="space-y-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-xs">Secondary Action Button</span>
                <Badge variant="outline" className="text-[9px] text-slate-500">Optional</Badge>
              </div>
              <Switch
                checked={secondaryButton.enabled ?? false}
                onCheckedChange={(checked) => updateSecondaryButton({ enabled: checked })}
              />
            </div>

            {secondaryButton.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div>
                  <Label>Button Label</Label>
                  <Input
                    value={secondaryButton.label ?? ''}
                    onChange={(e) => updateSecondaryButton({ label: e.target.value })}
                    className="mt-1 h-8 text-xs bg-white"
                    placeholder="Explore Radar"
                  />
                </div>
                <div>
                  <Label>Destination URL</Label>
                  <Input
                    value={secondaryButton.url ?? ''}
                    onChange={(e) => updateSecondaryButton({ url: e.target.value })}
                    className="mt-1 h-8 text-xs font-mono bg-white"
                    placeholder="/technologies"
                  />
                </div>
                <div>
                  <Label>Style Variant</Label>
                  <select
                    value={secondaryButton.variant ?? 'outline'}
                    onChange={(e) =>
                      updateSecondaryButton({
                        variant: e.target.value as CtaButton['variant'],
                      })
                    }
                    className="mt-1 h-8 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="outline">Subtle Outline</option>
                    <option value="secondary">Surface Secondary</option>
                    <option value="primary">Solid Primary</option>
                    <option value="glow">Luminous Glow</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Appearance & Styling ─────────────────────────────── */}
      <Card className="rounded-2xl border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center font-bold">
              <Palette className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-slate-900">
                Appearance & Backdrop
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Configure background mode, ambient lighting, and backdrop imagery
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Background Mode</Label>
              <select
                value={appearance.backgroundType ?? 'gradient'}
                onChange={(e) =>
                  updateAppearance({
                    backgroundType: e.target.value as CtaAppearance['backgroundType'],
                  })
                }
                className="mt-1 h-8 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="gradient">Deep Atmospheric Gradient</option>
                <option value="brand">Solid Brand Tint</option>
                <option value="surface">Dark Enterprise Surface</option>
                <option value="image">Custom Media Library Image</option>
              </select>
            </div>

            {appearance.backgroundType === 'image' && (
              <div className="md:col-span-2">
                <Label>Backdrop Image URL</Label>
                <Input
                  value={appearance.backgroundImageUrl ?? ''}
                  onChange={(e) => updateAppearance({ backgroundImageUrl: e.target.value })}
                  className="mt-1 h-8 text-xs font-mono bg-white"
                  placeholder="https://... or /media/..."
                />
              </div>
            )}

            <div>
              <Label>Overlay Tint Opacity ({appearance.overlayOpacity ?? 40}%)</Label>
              <input
                type="range"
                min="0"
                max="100"
                value={appearance.overlayOpacity ?? 40}
                onChange={(e) => updateAppearance({ overlayOpacity: parseInt(e.target.value, 10) })}
                className="mt-2 w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <Label className="cursor-pointer">Ambient Glow Effect</Label>
                <p className="text-[10px] text-slate-400">Radiates subtle radial brand glow behind card</p>
              </div>
              <Switch
                checked={appearance.enableGlow ?? true}
                onCheckedChange={(checked) => updateAppearance({ enableGlow: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Layout & Alignment ───────────────────────────────── */}
      <Card className="rounded-2xl border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
              <Layout className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-slate-900">
                Container & Layout
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Control alignment, max width constraints, and curvature
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Text Alignment</Label>
              <select
                value={layout.alignment ?? 'center'}
                onChange={(e) =>
                  updateLayout({
                    alignment: e.target.value as CtaLayout['alignment'],
                  })
                }
                className="mt-1 h-8 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="center">Center Aligned</option>
                <option value="left">Left Aligned</option>
                <option value="right">Right Aligned</option>
              </select>
            </div>

            <div>
              <Label>Container Width</Label>
              <select
                value={layout.containerWidth ?? 'contained'}
                onChange={(e) =>
                  updateLayout({
                    containerWidth: e.target.value as CtaLayout['containerWidth'],
                  })
                }
                className="mt-1 h-8 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="contained">Contained (max-w-5xl)</option>
                <option value="narrow">Narrow Focus (max-w-3xl)</option>
                <option value="wide">Full Horizon (max-w-7xl)</option>
              </select>
            </div>

            <div>
              <Label>Corner Curvature</Label>
              <select
                value={layout.borderRadius ?? '2xl'}
                onChange={(e) =>
                  updateLayout({
                    borderRadius: e.target.value as CtaLayout['borderRadius'],
                  })
                }
                className="mt-1 h-8 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="2xl">2XL Rounded (Default)</option>
                <option value="3xl">3XL Ultra Soft</option>
                <option value="xl">XL Subtle</option>
                <option value="md">Medium</option>
                <option value="none">Sharp / None</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
