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
  Star,
  ShieldCheck,
  ArrowRight,
  MessageSquareQuote,
  Play,
} from 'lucide-react';
import type {
  ClientTestimonialsSection,
  ClientTestimonialsPayload,
} from './types';

const Label = ({ className = '', ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={`block text-xs font-semibold text-slate-700 ${className}`} {...props} />
);

interface ClientTestimonialsSettingsProps {
  section: ClientTestimonialsSection;
  onChange: (updated: ClientTestimonialsSection) => void;
}

export function ClientTestimonialsSettings({ section, onChange }: ClientTestimonialsSettingsProps) {
  const p: ClientTestimonialsPayload = section.contentPayload || {};

  const update = (partial: Partial<ClientTestimonialsPayload>) => {
    onChange({
      ...section,
      contentPayload: {
        ...p,
        ...partial,
      },
    });
  };

  const videoCount = Array.isArray(p.videoTestimonials) ? p.videoTestimonials.length : 0;
  const reviewCount = Array.isArray(p.textTestimonials) ? p.textTestimonials.length : 0;

  return (
    <div className="space-y-6">
      {/* ── SECTION VISIBILITY ─────────────────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm text-slate-800">
                  Client Love &amp; Testimonials Visibility
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
                Display the client video testimonials and review grid on the homepage.
              </p>
            </div>
            <Switch
              checked={section.isActive}
              onCheckedChange={(checked) => onChange({ ...section, isActive: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── AUTOPLAY ALL VIDEOS SETTING ─────────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Play className="w-4 h-4 fill-indigo-600" />
                </div>
                <div>
                  <span className="font-semibold text-sm text-slate-800">
                    Autoplay All Videos (Silent / No Voice)
                  </span>
                  <span
                    className={`ml-2 text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase ${
                      (p.autoplayVideos ?? true)
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {(p.autoplayVideos ?? true) ? 'Autoplay Enabled' : 'Static Posters'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 pl-10">
                Automatically play all testimonial video cards in a continuous silent loop without voice. Users can tap to expand with audio.
              </p>
            </div>
            <Switch
              checked={p.autoplayVideos ?? true}
              onCheckedChange={(checked) => update({ autoplayVideos: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── DEDICATED TESTIMONIALS MENU REDIRECT NOTICE ─────────────────── */}
      <Card className="rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-white shadow-xs overflow-hidden">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
              <MessageSquareQuote className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">
                Manage Video Stories &amp; Client Reviews
              </div>
              <p className="text-xs text-slate-600 mt-0.5 max-w-md">
                Individual video testimonials ({videoCount}) and verified text endorsements ({reviewCount}) are now managed in the dedicated separate <strong>Testimonials</strong> menu.
              </p>
            </div>
          </div>

          <Link href="/content/testimonials" className="shrink-0 self-end sm:self-auto">
            <Button
              type="button"
              className="rounded-xl h-9 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-1.5"
            >
              <span>Open Testimonials Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* ── SECTION HEADINGS & COPY ──────────────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-800">
                Section Header &amp; Copy
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Configure eyebrow tag, title with serif italic accent word, and narrative copy.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cl-eyebrow">Eyebrow Badge</Label>
              <Input
                id="cl-eyebrow"
                value={p.eyebrow || ''}
                onChange={(e) => update({ eyebrow: e.target.value })}
                placeholder="CLIENT LOVE"
                className="mt-1 font-mono text-xs uppercase"
              />
            </div>
            <div>
              <Label htmlFor="cl-title-highlight">Stylized Accent Word (Serif Italic)</Label>
              <Input
                id="cl-title-highlight"
                value={p.titleHighlight || ''}
                onChange={(e) => update({ titleHighlight: e.target.value })}
                placeholder="e.g. founders."
                className="mt-1 font-serif italic text-xs text-blue-600 font-bold"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Word in the title rendered in Instrument Serif italic font.
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="cl-title">Main Headline</Label>
            <Input
              id="cl-title"
              value={p.title || ''}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Hear it from the founders."
              className="mt-1 font-bold text-sm"
            />
          </div>

          <div>
            <Label htmlFor="cl-desc">Supporting Narrative Description</Label>
            <Textarea
              id="cl-desc"
              rows={2}
              value={p.description || ''}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Real experiences from businesses we have helped build, scale, and transform."
              className="mt-1 text-xs leading-relaxed"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── RATING SUMMARY BADGE ────────────────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-slate-800">
                  Rating Summary Badge
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Prominently displays aggregated client score and review statement.
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={p.ratingSummary?.enabled !== false}
              onCheckedChange={(checked) =>
                update({
                  ratingSummary: {
                    ...p.ratingSummary,
                    enabled: checked,
                    ratingValue: p.ratingSummary?.ratingValue ?? 4.9,
                    maxRating: 5.0,
                    reviewCountText: p.ratingSummary?.reviewCountText ?? 'On camera, not a screenshot',
                  },
                })
              }
            />
          </div>
        </CardHeader>
        {p.ratingSummary?.enabled !== false && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cl-rating-val">Rating Value (e.g. 4.9)</Label>
                <Input
                  id="cl-rating-val"
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={p.ratingSummary?.ratingValue ?? 4.9}
                  onChange={(e) =>
                    update({
                      ratingSummary: {
                        ...p.ratingSummary!,
                        ratingValue: parseFloat(e.target.value) || 5.0,
                      },
                    })
                  }
                  className="mt-1 font-bold text-xs"
                />
              </div>
              <div>
                <Label htmlFor="cl-review-text">Review Supporting Text</Label>
                <Input
                  id="cl-review-text"
                  value={p.ratingSummary?.reviewCountText || ''}
                  onChange={(e) =>
                    update({
                      ratingSummary: {
                        ...p.ratingSummary!,
                        reviewCountText: e.target.value,
                      },
                    })
                  }
                  placeholder="On camera, not a screenshot"
                  className="mt-1 text-xs"
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* ── BOTTOM TRUST & CTA BAR ───────────────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-slate-800">
                  Bottom Trust &amp; CTA Strip
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Displays retention statistics and consultation call button.
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={p.bottomTrustBar?.enabled !== false}
              onCheckedChange={(checked) =>
                update({
                  bottomTrustBar: {
                    ...p.bottomTrustBar,
                    enabled: checked,
                    trustStatements: p.bottomTrustBar?.trustStatements ?? '85% of clients stay on after launch · 24h reply time · Enterprise Partner',
                    ctaLabel: p.bottomTrustBar?.ctaLabel ?? 'Book a free strategy call',
                    ctaUrl: p.bottomTrustBar?.ctaUrl ?? '#contact',
                  },
                })
              }
            />
          </div>
        </CardHeader>
        {p.bottomTrustBar?.enabled !== false && (
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cl-trust-text">Trust Statements</Label>
              <Input
                id="cl-trust-text"
                value={p.bottomTrustBar?.trustStatements || ''}
                onChange={(e) =>
                  update({
                    bottomTrustBar: {
                      ...p.bottomTrustBar!,
                      trustStatements: e.target.value,
                    },
                  })
                }
                placeholder="85% of clients stay on after launch · 24h reply time · Enterprise Partner"
                className="mt-1 text-xs"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cl-cta-label">CTA Button Label</Label>
                <Input
                  id="cl-cta-label"
                  value={p.bottomTrustBar?.ctaLabel || ''}
                  onChange={(e) =>
                    update({
                      bottomTrustBar: {
                        ...p.bottomTrustBar!,
                        ctaLabel: e.target.value,
                      },
                    })
                  }
                  placeholder="Book a free strategy call"
                  className="mt-1 text-xs font-semibold"
                />
              </div>
              <div>
                <Label htmlFor="cl-cta-url">CTA URL</Label>
                <Input
                  id="cl-cta-url"
                  value={p.bottomTrustBar?.ctaUrl || ''}
                  onChange={(e) =>
                    update({
                      bottomTrustBar: {
                        ...p.bottomTrustBar!,
                        ctaUrl: e.target.value,
                      },
                    })
                  }
                  placeholder="#contact or /contact"
                  className="mt-1 text-xs font-mono"
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
