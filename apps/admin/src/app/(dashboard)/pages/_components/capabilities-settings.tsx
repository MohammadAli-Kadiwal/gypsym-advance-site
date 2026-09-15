'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Cpu,
  Sparkles,
  Plus,
  Trash2,
  Image as ImageIcon,
  Palette,
  RotateCcw,
} from 'lucide-react';
import type { CapabilitiesSection, CapabilitiesPayload, TechItem } from './types';

const Label = ({ className = '', ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={`block text-xs font-semibold text-slate-700 ${className}`} {...props} />
);

interface CapabilitiesSettingsProps {
  section: CapabilitiesSection;
  onChange: (updated: CapabilitiesSection) => void;
}

const DEFAULT_TECH_STACK: TechItem[] = [
  { name: 'Figma', category: 'Design Systems' },
  { name: 'Webflow', category: 'Visual Development' },
  { name: 'Relume', category: 'Component Library' },
  { name: 'Midjourney', category: 'Generative Visuals' },
  { name: 'Framer', category: 'Interactivity & Motion' },
  { name: 'React.js', category: 'UI Engineering' },
  { name: 'NEXT.js', category: 'Full-Stack Architecture' },
  { name: 'node.js', category: 'High-Throughput Runtime' },
  { name: 'Tailwind css', category: 'Utility Design System' },
];

export function CapabilitiesSettings({ section, onChange }: CapabilitiesSettingsProps) {
  const p: CapabilitiesPayload = section.contentPayload || {};

  const update = (partial: Partial<CapabilitiesPayload>) => {
    onChange({
      ...section,
      contentPayload: {
        ...p,
        ...partial,
      },
    });
  };

  const technologies = (p.technologies && p.technologies.length > 0) ? p.technologies : DEFAULT_TECH_STACK;

  const updateTech = (index: number, partial: { name?: string; category?: string; icon?: string }) => {
    const updated = [...technologies];
    const current = updated[index];
    if (!current) return;
    updated[index] = {
      ...current,
      name: partial.name !== undefined ? partial.name : current.name,
      category: partial.category !== undefined ? partial.category : current.category,
      icon: partial.icon !== undefined ? partial.icon : current.icon,
    };
    update({ technologies: updated });
  };

  const addTech = () => {
    update({
      technologies: [
        ...technologies,
        { name: 'New Technology', category: 'Framework / Tool' },
      ],
    });
  };

  const removeTech = (index: number) => {
    update({
      technologies: technologies.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* ── SECTION VISIBILITY ─────────────────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm text-slate-800">
                  Our Capabilities Section Visibility
                </span>
                <span
                  className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase ${
                    section.isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {section.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Displays the capabilities card with engineer photo & 3x3 tech stack after OUR METHODOLOGY.
              </p>
            </div>
            <Switch
              checked={section.isActive}
              onCheckedChange={(checked) => onChange({ ...section, isActive: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── BACKGROUND COLOR & STYLING ─────────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Palette className="w-4 h-4 text-emerald-600" />
            <CardTitle className="text-base font-bold text-slate-900">
              Section Background Color
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Customize the background color or gradient for the capabilities card container.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Color / Gradient Presets</Label>
              <span className="text-[11px] font-mono text-slate-500">
                {p.backgroundColor || 'Default Emerald Gradient'}
              </span>
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {[
                { label: 'Deep Emerald', value: 'linear-gradient(to bottom right, #064e42, #053d34, #032a24)' },
                { label: 'Midnight Navy', value: 'linear-gradient(to bottom right, #0f172a, #0b1329, #020617)' },
                { label: 'Obsidian Black', value: '#0b0f17' },
                { label: 'Dark Forest', value: '#042f2c' },
              ].map((preset) => {
                const isSelected = (!p.backgroundColor && preset.label === 'Deep Emerald') || p.backgroundColor === preset.value;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => update({ backgroundColor: preset.value })}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/50 text-emerald-950 font-medium'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-lg border border-white/20 shrink-0 shadow-xs"
                      style={{ background: preset.value }}
                    />
                    <span className="text-[11px] leading-tight truncate">
                      {preset.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Color Input & Color Picker */}
            <div className="pt-2 flex items-center gap-2.5">
              <input
                type="color"
                value={p.backgroundColor?.startsWith('#') && p.backgroundColor.length === 7 ? p.backgroundColor : '#064e42'}
                onChange={(e) => update({ backgroundColor: e.target.value })}
                className="h-9 w-9 rounded-xl border border-slate-300 bg-transparent cursor-pointer shrink-0"
                title="Choose Color"
              />
              <Input
                value={p.backgroundColor ?? ''}
                onChange={(e) => update({ backgroundColor: e.target.value })}
                placeholder="e.g. #064e42 or linear-gradient(...)"
                className="h-9 text-xs font-mono"
              />
              {p.backgroundColor && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => update({ backgroundColor: '' })}
                  className="h-9 px-2.5 text-xs text-slate-600 rounded-xl shrink-0"
                  title="Reset to default gradient"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Reset
                </Button>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Enter any valid hex code (e.g. <code className="text-slate-700 font-mono">#0f172a</code>) or CSS gradient. Leave empty to use the default deep emerald gradient.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── HEADER & TYPOGRAPHY ─────────────────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <CardTitle className="text-base font-bold text-slate-900">
              Header & Typography
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Configure the section eyebrow, headline, and Instrument Serif highlight word.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Eyebrow Pill</Label>
            <Input
              value={p.eyebrow ?? 'OUR CAPABILITIES'}
              onChange={(e) => update({ eyebrow: e.target.value })}
              placeholder="OUR CAPABILITIES"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Main Headline</Label>
            <Input
              value={p.title ?? 'Engineered with modern tools for scalable digital products'}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Engineered with modern tools for scalable digital products"
              className="h-9 text-xs font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Highlight Word (Instrument Serif Italic Accent)</Label>
            <Input
              value={p.titleHighlight ?? 'Engineered'}
              onChange={(e) => update({ titleHighlight: e.target.value })}
              placeholder="e.g. Engineered, modern, scalable"
              className="h-9 text-xs font-serif italic"
            />
            <p className="text-[11px] text-slate-500 italic">
              Matches any occurrence in the headline and renders it in elegant serif italic green.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={
                p.description ??
                'We combine world-class design systems with robust, high-performance engineering. Our multidisciplinary team leverages the modern web ecosystem to build digital experiences that load instantly, convert visitors, and scale seamlessly.'
              }
              onChange={(e) => update({ description: e.target.value })}
              className="text-xs leading-relaxed"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── ENGINEER PHOTO & FLOATING BADGE ─────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            <CardTitle className="text-base font-bold text-slate-900">
              Left Column Photo & Floating Badge
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Portrait image of the engineer and floating assurance badge.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Image URL / Local Path</Label>
            <Input
              value={p.image?.url ?? '/images/capabilities-engineer.jpg'}
              onChange={(e) =>
                update({
                  image: {
                    ...p.image,
                    url: e.target.value,
                  },
                })
              }
              placeholder="/images/capabilities-engineer.jpg"
              className="h-9 text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Alt Text</Label>
            <Input
              value={p.image?.alt ?? 'Senior Software & Solutions Engineer'}
              onChange={(e) =>
                update({
                  image: {
                    ...p.image,
                    alt: e.target.value,
                  },
                })
              }
              placeholder="Senior Software & Solutions Engineer"
              className="h-9 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── 3x3 TECH STACK LOGOS ───────────────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <CardTitle className="text-base font-bold text-slate-900">
                Technology Logos ({technologies.length})
              </CardTitle>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addTech}
              className="h-7 text-xs flex items-center gap-1 border-slate-200"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Logo</span>
            </Button>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Logos rendered in the 3x3 grid with page-matching background.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {technologies.map((tech, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 font-bold">
                    #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeTech(idx)}
                    className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors"
                    title="Remove technology"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-1">
                  <Label>Technology Name</Label>
                  <Input
                    value={tech.name}
                    onChange={(e) => updateTech(idx, { name: e.target.value })}
                    placeholder="e.g. Figma, Next.js, React"
                    className="h-8 text-xs font-semibold bg-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
