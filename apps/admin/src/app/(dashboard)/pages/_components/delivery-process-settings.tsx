'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import {
  Sparkles,
  Layers,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Compass,
} from 'lucide-react';
import type {
  DeliveryProcessSection,
  DeliveryProcessPayload,
  DeliveryProcessStep,
} from './types';

const Label = ({ className = '', ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={`block text-xs font-semibold text-slate-700 ${className}`} {...props} />
);

interface DeliveryProcessSettingsProps {
  section: DeliveryProcessSection;
  onChange: (updated: DeliveryProcessSection) => void;
}

export function DeliveryProcessSettings({ section, onChange }: DeliveryProcessSettingsProps) {
  const p: DeliveryProcessPayload = section.contentPayload || {};

  const update = (partial: Partial<DeliveryProcessPayload>) => {
    onChange({
      ...section,
      contentPayload: {
        ...p,
        ...partial,
      },
    });
  };

  const steps: DeliveryProcessStep[] = Array.isArray(p.steps) ? p.steps : [];

  const updateStep = (index: number, partial: Partial<DeliveryProcessStep>) => {
    const updated = [...steps];
    updated[index] = {
      ...updated[index],
      ...partial,
    };
    update({ steps: updated });
  };

  const addStep = () => {
    const nextIndex = steps.length + 1;
    const newStep: DeliveryProcessStep = {
      id: `step-${Date.now()}`,
      stepNumber: `.${String(nextIndex).padStart(2, '0')}`,
      title: `Step ${nextIndex} Title`,
      description: 'Describe this phase of the delivery methodology.',
      imageUrl: `/images/process/step-${Math.min(nextIndex, 4)}.jpg`,
      altText: `Step ${nextIndex} process illustration`,
    };
    update({ steps: [...steps, newStep] });
  };

  const deleteStep = (index: number) => {
    if (steps.length <= 1) {
      alert('The delivery process must contain at least one step.');
      return;
    }
    const updated = steps.filter((_, i) => i !== index);
    update({ steps: updated });
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    const updated = [...steps];
    const temp = updated[index]!;
    updated[index] = updated[targetIndex]!;
    updated[targetIndex] = temp;
    update({ steps: updated });
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
                  Four-Step Delivery Process Visibility
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
                Display the scroll-driven sequential delivery process section on the homepage.
              </p>
            </div>
            <Switch
              checked={section.isActive}
              onCheckedChange={(checked) => onChange({ ...section, isActive: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── SECTION HEADINGS & COPY ──────────────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-800">
                Section Header &amp; Copy
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Configure the eyebrow label, headline with styled italic accent, and narrative copy.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dp-eyebrow">Eyebrow Badge</Label>
              <Input
                id="dp-eyebrow"
                value={p.eyebrow || ''}
                onChange={(e) => update({ eyebrow: e.target.value })}
                placeholder="e.g. DELIVERY METHODOLOGY"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="dp-title-highlight">Stylized Accent Word (Serif Italic)</Label>
              <Input
                id="dp-title-highlight"
                value={p.titleHighlight || ''}
                onChange={(e) => update({ titleHighlight: e.target.value })}
                placeholder="e.g. Process"
                className="mt-1 font-serif italic"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Word in the title rendered in Instrument Serif font.
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="dp-title">Main Headline</Label>
            <Input
              id="dp-title"
              value={p.title || ''}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="e.g. Our Four Step Delivery Process"
              className="mt-1 font-semibold"
            />
          </div>

          <div>
            <Label htmlFor="dp-desc">Supporting Narrative Description</Label>
            <Textarea
              id="dp-desc"
              rows={3}
              value={p.description || ''}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Explain how your delivery methodology ensures speed, clarity, and enterprise results..."
              className="mt-1 text-sm leading-relaxed"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── SCROLL & INTERACTION SETTINGS ───────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-800">
                Scroll &amp; Pinned Experience
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Control the sticky scroll-driven sequential reveal behavior.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
            <div>
              <span className="text-xs font-semibold text-slate-800 block">
                Sticky Scroll-Driven Progression
              </span>
              <p className="text-[11px] text-slate-500">
                Pins the section on desktop and smoothly advances Step 01 → 02 → 03 → 04 as user scrolls.
              </p>
            </div>
            <Switch
              checked={p.stickyScrollEnabled !== false}
              onCheckedChange={(checked) => update({ stickyScrollEnabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── STEP MANAGER ───────────────────────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-slate-800">
                  Step Manager ({steps.length} Steps)
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Add, edit, reorder, and upload imagery for each delivery phase.
                </CardDescription>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addStep}
              className="text-xs font-semibold gap-1.5 rounded-lg border-indigo-200 text-indigo-600 hover:bg-indigo-50"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Step
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {steps.map((step, idx) => {
            return (
              <div
                key={step.id || idx}
                className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-4 relative"
              >
                {/* Step Item Top Header Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white text-xs font-bold font-mono flex items-center justify-center shadow-xs">
                      {step.stepNumber || `.${String(idx + 1).padStart(2, '0')}`}
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {step.title || `Step ${idx + 1}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={idx === 0}
                      onClick={() => moveStep(idx, 'up')}
                      className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800 disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={idx === steps.length - 1}
                      onClick={() => moveStep(idx, 'down')}
                      className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800 disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteStep(idx)}
                      className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 ml-1"
                      title="Delete Step"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Step Fields */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-3">
                    <Label htmlFor={`step-num-${idx}`}>Step Number Tag</Label>
                    <Input
                      id={`step-num-${idx}`}
                      value={step.stepNumber || ''}
                      onChange={(e) => updateStep(idx, { stepNumber: e.target.value })}
                      placeholder=".01"
                      className="mt-1 font-mono text-xs"
                    />
                  </div>
                  <div className="md:col-span-9">
                    <Label htmlFor={`step-title-${idx}`}>Step Title</Label>
                    <Input
                      id={`step-title-${idx}`}
                      value={step.title || ''}
                      onChange={(e) => updateStep(idx, { title: e.target.value })}
                      placeholder="e.g. Discovery & Strategy"
                      className="mt-1 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`step-desc-${idx}`}>Description</Label>
                  <Textarea
                    id={`step-desc-${idx}`}
                    rows={2}
                    value={step.description || ''}
                    onChange={(e) => updateStep(idx, { description: e.target.value })}
                    placeholder="Explain what happens during this step..."
                    className="mt-1 text-xs leading-relaxed"
                  />
                </div>

                {/* Image Upload & Alt Text */}
                <div className="pt-2 border-t border-slate-200/60">
                  <ImageUploadField
                    label="Step Image"
                    description="Upload an illustration or photograph for this phase (SVG, WebP, PNG, JPG)."
                    value={step.imageUrl || ''}
                    onChange={(url) => updateStep(idx, { imageUrl: url })}
                    placeholder="/images/process/step-1.jpg"
                  />
                  <div className="mt-3">
                    <Label htmlFor={`step-alt-${idx}`}>Image Alt Text (Accessibility)</Label>
                    <Input
                      id={`step-alt-${idx}`}
                      value={step.altText || ''}
                      onChange={(e) => updateStep(idx, { altText: e.target.value })}
                      placeholder="e.g. Discovery & Strategy workshop with enterprise team"
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>

                {/* Optional CTA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200/60">
                  <div>
                    <Label htmlFor={`step-cta-text-${idx}`}>Optional Link Label</Label>
                    <Input
                      id={`step-cta-text-${idx}`}
                      value={step.ctaText || ''}
                      onChange={(e) => updateStep(idx, { ctaText: e.target.value })}
                      placeholder="e.g. Learn about Discovery"
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`step-cta-url-${idx}`}>Optional Link URL</Label>
                    <Input
                      id={`step-cta-url-${idx}`}
                      value={step.ctaUrl || ''}
                      onChange={(e) => updateStep(idx, { ctaUrl: e.target.value })}
                      placeholder="e.g. /services/discovery"
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
