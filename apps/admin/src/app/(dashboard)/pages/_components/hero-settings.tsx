'use client';

import * as React from 'react';
import { Play, Video, ExternalLink, Building2, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import type { HeroSection, HeroPayload } from './types';

interface HeroSettingsProps {
  section: HeroSection;
  onChange: (updated: HeroSection) => void;
}

/** Helper: extract flat headline text from segmented or plain format */
function getHeadlineText(payload: HeroPayload): string {
  if (Array.isArray(payload.headline?.segments)) {
    return payload.headline.segments.map((s) => s.text || s.value || '').join(' ');
  }
  return '';
}

export function HeroSettings({ section, onChange }: HeroSettingsProps) {
  const p = section.contentPayload;

  /** Generic shallow-merge helper to update a nested key */
  function update(patch: Partial<HeroPayload>) {
    onChange({ ...section, contentPayload: { ...p, ...patch } });
  }

  function updateBg(patch: Partial<NonNullable<HeroPayload['backgroundMedia']>>) {
    update({ backgroundMedia: { ...p.backgroundMedia, ...patch } });
  }

  function updateVideoCta(patch: Partial<NonNullable<HeroPayload['videoCta']>>) {
    update({ videoCta: { ...p.videoCta, ...patch } });
  }

  function updateClientStrip(patch: Partial<NonNullable<HeroPayload['clientStrip']>>) {
    update({ clientStrip: { ...p.clientStrip, ...patch } });
  }

  return (
    <Card className="p-6 rounded-2xl border-slate-200/90 bg-white shadow-xs space-y-5">
      <CardHeader className="p-0 border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-bold text-slate-900">
            Hero Section Configuration
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Configure headline, video showreel, background video/media, and CTA triggers.
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-medium text-slate-500">Active</span>
          <Switch
            checked={section.isActive}
            onCheckedChange={(c) => onChange({ ...section, isActive: c })}
          />
        </div>
      </CardHeader>

      <div className="space-y-4">
        {/* Eyebrow & Stylized Accent Word */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Eyebrow Badge Text</label>
            <Input
              value={p.eyebrow?.text || ''}
              onChange={(e) => update({ eyebrow: { ...p.eyebrow, text: e.target.value } })}
              placeholder="e.g. ✨ Zero-Downtime Sovereign Infrastructure"
              className="text-xs rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Stylized Accent Word (Serif Italic)</label>
            <Input
              value={p.titleHighlight || ''}
              onChange={(e) => update({ titleHighlight: e.target.value })}
              placeholder="e.g. Studio"
              className="text-xs font-serif italic rounded-xl"
            />
            <p className="text-[11px] text-slate-400">
              Word in the headline rendered in Instrument Serif italic font.
            </p>
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Main Editorial Headline</label>
          <Textarea
            rows={2}
            value={getHeadlineText(p)}
            onChange={(e) =>
              update({
                headline: {
                  ...p.headline,
                  segments: [{ text: e.target.value, highlight: false, italic: false }],
                },
              })
            }
            className="text-xs font-bold rounded-xl"
            placeholder="Engineering the Global Enterprise Architecture"
          />
        </div>

        {/* Supporting Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Supporting Description</label>
          <Textarea
            rows={3}
            value={p.description?.content || ''}
            onChange={(e) =>
              update({ description: { ...p.description, content: e.target.value } })
            }
            className="text-xs rounded-xl leading-relaxed"
          />
        </div>

        {/* Play Button & Video Showreel CTA */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
            <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <Play className="h-3.5 w-3.5 text-lime-600 fill-lime-600" />
              <span>Inline Play Button &amp; Modal Video Showreel</span>
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-slate-500 font-medium">Show Play Button</span>
              <Switch
                checked={p.videoCta?.enabled ?? false}
                onCheckedChange={(c) => updateVideoCta({ enabled: c })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">
                Play Button Tooltip / Label
              </label>
              <Input
                value={p.videoCta?.label || ''}
                onChange={(e) => updateVideoCta({ label: e.target.value })}
                placeholder="Watch Showreel"
                className="text-xs rounded-xl bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">
                Modal Video Player URL (.mp4 or stream)
              </label>
              <Input
                value={p.videoCta?.videoUrl || ''}
                onChange={(e) => updateVideoCta({ videoUrl: e.target.value })}
                placeholder="https://assets.gypsym.com/videos/showreel.mp4"
                className="text-xs font-mono rounded-xl bg-white"
              />
            </div>
          </div>
        </div>

        {/* Background Media Settings */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
            <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <Video className="h-3.5 w-3.5 text-blue-600" />
              <span>Background Video &amp; Media Controls</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Daylight Canvas</span>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">
                Background Video URL (Auto-playing Loop)
              </label>
              <Input
                value={p.backgroundMedia?.videoUrl || ''}
                onChange={(e) => updateBg({ videoUrl: e.target.value })}
                placeholder="https://assets.gypsym.com/videos/hero-bg.mp4"
                className="text-xs font-mono rounded-xl bg-white"
              />
            </div>

            <div className="space-y-3">
              <ImageUploadField
                label="Background Poster Image"
                description="Upload poster image directly or enter URL (shown while video loads or as fallback)"
                value={p.backgroundMedia?.desktopImageUrl || ''}
                onChange={(url) => updateBg({ desktopImageUrl: url })}
                placeholder="https://assets.gypsym.com/images/hero-poster.jpg"
                previewDark={true}
              />

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                  <span>Dark Overlay Opacity</span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {Math.round((p.backgroundMedia?.overlayOpacity ?? 0) * 100)}%
                  </span>
                </label>
                <Input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={p.backgroundMedia?.overlayOpacity ?? ''}
                  onChange={(e) =>
                    updateBg({ overlayOpacity: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0.35"
                  className="text-xs font-mono rounded-xl bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Primary CTA Label</label>
            <Input
              value={p.primaryCta?.label || ''}
              onChange={(e) => update({ primaryCta: { ...p.primaryCta, label: e.target.value } })}
              className="text-xs rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Primary CTA URL</label>
            <Input
              value={p.primaryCta?.url || ''}
              onChange={(e) => update({ primaryCta: { ...p.primaryCta, url: e.target.value } })}
              className="text-xs font-mono rounded-xl"
            />
          </div>
        </div>

        {/* Client Marquee Strip */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
            <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <Building2 className="h-3.5 w-3.5 text-blue-600" />
              <span>Client Marquee Strip</span>
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-slate-500 font-medium">Enabled</span>
              <Switch
                checked={p.clientStrip?.enabled ?? false}
                onCheckedChange={(c) => updateClientStrip({ enabled: c })}
              />
            </div>
          </div>

          {/* Strip Title */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-700">Strip Headline Text</label>
            <Input
              value={p.clientStrip?.title || ''}
              onChange={(e) => updateClientStrip({ title: e.target.value })}
              placeholder="THE AGENCY BEHIND THE WORLD'S MOST RESILIENT ENTERPRISES"
              className="text-xs rounded-xl bg-white"
            />
          </div>

          {/* Clients List (from backend payload) */}
          {(p.clientStrip?.clients ?? []).length > 0 ? (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-700">
                Active Clients ({p.clientStrip!.clients!.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {p.clientStrip!.clients!.map((client, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-medium text-slate-700"
                  >
                    {client.name}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-blue-50/60 border border-blue-100">
              <Plus className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              <p className="text-[11px] text-blue-700">
                No clients in strip. Add clients from the Clients manager, then re-save the Home page section.
              </p>
            </div>
          )}

          {/* Link to Clients Manager */}
          <a
            href="/content/clients"
            className="inline-flex items-center space-x-1.5 text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors group"
          >
            <ExternalLink className="h-3 w-3 group-hover:scale-110 transition-transform" />
            <span>Manage All Clients →</span>
          </a>
        </div>
      </div>
    </Card>
  );
}
