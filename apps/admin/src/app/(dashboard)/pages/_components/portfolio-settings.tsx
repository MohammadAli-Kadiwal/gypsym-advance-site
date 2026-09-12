'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useCmsCollection } from '@/lib/store';
import {
  Sparkles,
  Layers,
  Box,
  Eye,
  Briefcase,
  ExternalLink,
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
  const { data: portfolioItems } = useCmsCollection('portfolio');

  const update = (partial: Partial<PortfolioPayload>) => {
    onChange({
      ...section,
      contentPayload: {
        ...p,
        ...partial,
      },
    });
  };

  const catalogCount =
    portfolioItems && portfolioItems.length > 0
      ? portfolioItems.length
      : Array.isArray(p.projects) && p.projects.length > 0
      ? p.projects.length
      : 5;

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
                Display the 2 → 1 → 2 interactive showcase grid on the public home page.
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

      {/* ── HOME PAGE DISPLAY LIMIT ────────────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#d9127b]" />
            <CardTitle className="text-base font-bold text-slate-900">
              Home Page Projects Display Count
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Control how many projects are shown in the Home page section. On mobile, projects are rendered in an interactive swipeable slider.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="max-w-md space-y-1.5">
            <Label>Number of Projects to Display on Home Page</Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={1}
                max={catalogCount || 50}
                value={p.maxDisplayCount !== undefined && p.maxDisplayCount !== null ? p.maxDisplayCount : ''}
                onChange={(e) => {
                  const val = e.target.value.trim() === '' ? undefined : parseInt(e.target.value, 10);
                  update({ maxDisplayCount: isNaN(val as number) ? undefined : val });
                }}
                placeholder={`All (${catalogCount})`}
                className="text-xs h-9 w-36"
              />
              <span className="text-xs text-slate-500">
                {p.maxDisplayCount ? `Displaying top ${p.maxDisplayCount} of ${catalogCount} projects` : `Displaying all ${catalogCount} projects`}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Enter a number (e.g. 3, 4, 5) to restrict the number of projects shown on the home page, or leave blank to display all {catalogCount} projects.
            </p>
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
              Card Hover & View Button Interaction
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Configure the floating &quot;View Project&quot; button, backdrop glass blur, and zoom transitions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <div>
                <Label>Hover Effects</Label>
                <p className="text-[11px] text-slate-500">Enable card hover interactions</p>
              </div>
              <Switch
                checked={p.hoverEffectsEnabled !== false}
                onCheckedChange={(checked) => update({ hoverEffectsEnabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <div>
                <Label>View Button</Label>
                <p className="text-[11px] text-slate-500">Floating &quot;View Project&quot; button</p>
              </div>
              <Switch
                checked={p.viewButtonEnabled !== false}
                onCheckedChange={(checked) => update({ viewButtonEnabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <div>
                <Label>Dark/Glass Overlay</Label>
                <p className="text-[11px] text-slate-500">Subtle background tint on hover</p>
              </div>
              <Switch
                checked={p.overlayEnabled !== false}
                onCheckedChange={(checked) => update({ overlayEnabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <div>
                <Label>Backdrop Blur</Label>
                <p className="text-[11px] text-slate-500">Controlled glassmorphism filter</p>
              </div>
              <Switch
                checked={p.backdropBlurEnabled !== false}
                onCheckedChange={(checked) => update({ backdropBlurEnabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 col-span-1 sm:col-span-2">
              <div>
                <Label>Image Zoom</Label>
                <p className="text-[11px] text-slate-500">Subtle 1.04x scale inside card</p>
              </div>
              <Switch
                checked={p.imageZoomEnabled !== false}
                onCheckedChange={(checked) => update({ imageZoomEnabled: checked })}
              />
            </div>
          </div>

          <div className="max-w-md space-y-1.5 pt-2">
            <Label>View Button Label</Label>
            <Input
              value={p.viewButtonLabel || 'View'}
              onChange={(e) => update({ viewButtonLabel: e.target.value })}
              placeholder="View"
              className="text-xs h-9"
            />
            <p className="text-[11px] text-slate-400">
              Text displayed inside the floating interaction button when hovering over project cards.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── 3D SCROLL & PARALLAX SETTINGS ─────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-[#d9127b]" />
            <CardTitle className="text-base font-bold text-slate-900">
              3D Scroll & Mouse Parallax Physics
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Controlled 3D depth perspective and desktop mouse tracking. Respects prefers-reduced-motion.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <div>
                <Label>3D Scroll Depth</Label>
                <p className="text-[11px] text-slate-500">Perspective rotation on scroll</p>
              </div>
              <Switch
                checked={p.threeDScrollEnabled !== false}
                onCheckedChange={(checked) => update({ threeDScrollEnabled: checked })}
              />
            </div>

            <div className="space-y-1.5 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <Label>3D Intensity Preset</Label>
              <select
                value={p.threeDIntensity || 'premium'}
                onChange={(e) =>
                  update({
                    threeDIntensity: e.target.value as 'subtle' | 'premium',
                  })
                }
                className="w-full h-8 rounded-md border border-input bg-background px-2 py-0.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
              >
                <option value="premium">Premium (Dynamic Depth)</option>
                <option value="subtle">Subtle (Restrained)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <div>
                <Label>Mouse Parallax</Label>
                <p className="text-[11px] text-slate-500">Desktop-only micro tilt</p>
              </div>
              <Switch
                checked={p.mouseParallaxEnabled !== false}
                onCheckedChange={(checked) => update({ mouseParallaxEnabled: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

