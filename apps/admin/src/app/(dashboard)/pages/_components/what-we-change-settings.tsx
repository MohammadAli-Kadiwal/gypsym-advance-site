'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, ShoppingCart, Zap, LayoutTemplate } from 'lucide-react';
import type { WhatWeChangeSection, WhatWeChangePayload, WhatWeChangeCard } from './types';

const Label = ({ className = '', ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={`block text-xs font-semibold text-slate-700 ${className}`} {...props} />
);

interface WhatWeChangeSettingsProps {
  section: WhatWeChangeSection;
  onChange: (updated: WhatWeChangeSection) => void;
}

export function WhatWeChangeSettings({ section, onChange }: WhatWeChangeSettingsProps) {
  const p: WhatWeChangePayload = section.contentPayload || {};

  const update = (partial: Partial<WhatWeChangePayload>) => {
    onChange({
      ...section,
      contentPayload: {
        ...p,
        ...partial,
      },
    });
  };

  const cards: WhatWeChangeCard[] = Array.isArray(p.cards) && p.cards.length === 3 ? p.cards : [
    {
      id: 'card-1',
      type: 'cart',
      title: 'Fewer steps to buy',
      description: 'We strip the friction between product page and paid order — variants, upsells, and checkout included.',
      cartLabel: 'Cart',
      cartStep: '1 step',
      checkoutButtonText: 'Checkout · $89.00',
    },
    {
      id: 'card-2',
      type: 'speed',
      title: 'Fast on real phones',
      description: "Tested on mid-range devices and slow networks, not on a developer's laptop. Core Web Vitals pass before launch.",
      metrics: [
        { label: 'LCP', value: '0.9s', percent: 75 },
        { label: 'CLS', value: '0.02', percent: 88 },
      ],
    },
    {
      id: 'card-3',
      type: 'theme',
      title: 'Yours to run after',
      description: 'Clean Liquid and native theme sections, so your team edits the store without opening a ticket.',
      items: [
        { title: 'Hero section', badge: 'Editable' },
        { title: 'Bundle block', badge: 'Editable' },
        { title: 'Reviews', badge: 'Editable' },
      ],
    },
  ];

  const updateCard = (index: number, partial: Partial<WhatWeChangeCard>) => {
    const updated = [...cards];
    updated[index] = {
      ...updated[index],
      ...partial,
    };
    update({ cards: updated });
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
                  What We Actually Change Section Visibility
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
                Display the 3-column &ldquo;What We Actually Change&rdquo; feature grid on the homepage.
              </p>
            </div>
            <Switch
              checked={section.isActive}
              onCheckedChange={(checked) => onChange({ ...section, isActive: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── SECTION HEADER ──────────────────────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2 text-slate-700">
            <Sparkles className="h-4 w-4 text-fuchsia-600" />
            <CardTitle className="text-sm font-semibold">Section Header & Eyebrow</CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Customize the section badge, headline, and narrative.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">Eyebrow Tag (Fuchsia / Uppercase)</Label>
            <Input
              value={p.eyebrow || ''}
              onChange={(e) => update({ eyebrow: e.target.value })}
              placeholder="WHAT WE ACTUALLY CHANGE"
              className="rounded-xl text-xs font-bold text-fuchsia-700 tracking-wider"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">Section Title</Label>
            <Input
              value={p.title || ''}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Give shoppers fewer reasons to leave"
              className="rounded-xl text-sm font-bold text-slate-900"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">Stylized Accent Word (Serif Italic)</Label>
            <Input
              value={p.titleHighlight || ''}
              onChange={(e) => update({ titleHighlight: e.target.value })}
              placeholder="e.g. fewer"
              className="rounded-xl text-xs font-serif italic"
            />
            <p className="text-[11px] text-slate-400">
              Word in the title rendered in Instrument Serif italic font.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">Section Description</Label>
            <Textarea
              rows={2}
              value={p.description || ''}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Every store we touch gets the same three things fixed first — the ones that move revenue before any new traffic is bought."
              className="rounded-xl text-xs text-slate-600 leading-relaxed"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── CARD 1: CART / CHECKOUT ────────────────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2 text-slate-700">
            <ShoppingCart className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-sm font-semibold">Card 1: Fewer Steps to Buy</CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Cart optimization and frictionless checkout settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">Card Title</Label>
              <Input
                value={cards[0]?.title || ''}
                onChange={(e) => updateCard(0, { title: e.target.value })}
                placeholder="Fewer steps to buy"
                className="rounded-xl text-xs font-semibold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">Checkout Button Text</Label>
              <Input
                value={cards[0]?.checkoutButtonText || ''}
                onChange={(e) => updateCard(0, { checkoutButtonText: e.target.value })}
                placeholder="Checkout · $89.00"
                className="rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">Cart Pill Label</Label>
              <Input
                value={cards[0]?.cartLabel || ''}
                onChange={(e) => updateCard(0, { cartLabel: e.target.value })}
                placeholder="Cart"
                className="rounded-xl text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">Step Badge</Label>
              <Input
                value={cards[0]?.cartStep || ''}
                onChange={(e) => updateCard(0, { cartStep: e.target.value })}
                placeholder="1 step"
                className="rounded-xl text-xs font-semibold text-fuchsia-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">Card Description</Label>
            <Textarea
              rows={2}
              value={cards[0]?.description || ''}
              onChange={(e) => updateCard(0, { description: e.target.value })}
              placeholder="We strip the friction between product page and paid order — variants, upsells, and checkout included."
              className="rounded-xl text-xs text-slate-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── CARD 2: SPEED / CORE WEB VITALS ────────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2 text-slate-700">
            <Zap className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-sm font-semibold">Card 2: Fast on Real Phones</CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Mobile performance metrics and Core Web Vitals targets.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">Card Title</Label>
            <Input
              value={cards[1]?.title || ''}
              onChange={(e) => updateCard(1, { title: e.target.value })}
              placeholder="Fast on real phones"
              className="rounded-xl text-xs font-semibold"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">Card Description</Label>
            <Textarea
              rows={2}
              value={cards[1]?.description || ''}
              onChange={(e) => updateCard(1, { description: e.target.value })}
              placeholder="Tested on mid-range devices and slow networks, not on a developer's laptop. Core Web Vitals pass before launch."
              className="rounded-xl text-xs text-slate-600"
            />
          </div>

          {/* Metric 1 & Metric 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* LCP */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <span className="text-xs font-bold text-slate-700">Metric 1 (e.g. LCP)</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] text-slate-500">Metric Label</Label>
                  <Input
                    value={cards[1]?.metrics?.[0]?.label || 'LCP'}
                    onChange={(e) => {
                      const m = [...(cards[1]?.metrics || [{ label: 'LCP', value: '0.9s', percent: 75 }])];
                      m[0] = { ...m[0], label: e.target.value };
                      updateCard(1, { metrics: m });
                    }}
                    className="h-8 text-xs bg-white rounded-lg"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-slate-500">Target Value</Label>
                  <Input
                    value={cards[1]?.metrics?.[0]?.value || '0.9s'}
                    onChange={(e) => {
                      const m = [...(cards[1]?.metrics || [{ label: 'LCP', value: '0.9s', percent: 75 }])];
                      m[0] = { ...m[0], value: e.target.value };
                      updateCard(1, { metrics: m });
                    }}
                    className="h-8 text-xs bg-white rounded-lg font-bold"
                  />
                </div>
              </div>
            </div>

            {/* CLS */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <span className="text-xs font-bold text-slate-700">Metric 2 (e.g. CLS)</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] text-slate-500">Metric Label</Label>
                  <Input
                    value={cards[1]?.metrics?.[1]?.label || 'CLS'}
                    onChange={(e) => {
                      const m = [...(cards[1]?.metrics || [
                        { label: 'LCP', value: '0.9s', percent: 75 },
                        { label: 'CLS', value: '0.02', percent: 88 },
                      ])];
                      m[1] = { ...m[1], label: e.target.value };
                      updateCard(1, { metrics: m });
                    }}
                    className="h-8 text-xs bg-white rounded-lg"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-slate-500">Target Value</Label>
                  <Input
                    value={cards[1]?.metrics?.[1]?.value || '0.02'}
                    onChange={(e) => {
                      const m = [...(cards[1]?.metrics || [
                        { label: 'LCP', value: '0.9s', percent: 75 },
                        { label: 'CLS', value: '0.02', percent: 88 },
                      ])];
                      m[1] = { ...m[1], value: e.target.value };
                      updateCard(1, { metrics: m });
                    }}
                    className="h-8 text-xs bg-white rounded-lg font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── CARD 3: THEME SECTIONS FREEDOM ─────────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2 text-slate-700">
            <LayoutTemplate className="h-4 w-4 text-emerald-600" />
            <CardTitle className="text-sm font-semibold">Card 3: Yours to Run After</CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Native theme editable blocks without technical lock-in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">Card Title</Label>
            <Input
              value={cards[2]?.title || ''}
              onChange={(e) => updateCard(2, { title: e.target.value })}
              placeholder="Yours to run after"
              className="rounded-xl text-xs font-semibold"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">Card Description</Label>
            <Textarea
              rows={2}
              value={cards[2]?.description || ''}
              onChange={(e) => updateCard(2, { description: e.target.value })}
              placeholder="Clean Liquid and native theme sections, so your team edits the store without opening a ticket."
              className="rounded-xl text-xs text-slate-600"
            />
          </div>

          <div className="space-y-2.5 pt-2">
            <Label className="text-xs font-semibold text-slate-700">Visual Theme Blocks (3 items)</Label>
            {(cards[2]?.items || [
              { title: 'Hero section', badge: 'Editable' },
              { title: 'Bundle block', badge: 'Editable' },
              { title: 'Reviews', badge: 'Editable' },
            ]).map((item: any, idx: number) => (
              <div key={idx} className="flex items-center space-x-3">
                <Input
                  value={item.title || ''}
                  onChange={(e) => {
                    const itms = [...(cards[2]?.items || [
                      { title: 'Hero section', badge: 'Editable' },
                      { title: 'Bundle block', badge: 'Editable' },
                      { title: 'Reviews', badge: 'Editable' },
                    ])];
                    itms[idx] = { ...itms[idx], title: e.target.value };
                    updateCard(2, { items: itms });
                  }}
                  placeholder={`Section ${idx + 1}`}
                  className="rounded-lg text-xs h-8 flex-1"
                />
                <Input
                  value={item.badge || 'Editable'}
                  onChange={(e) => {
                    const itms = [...(cards[2]?.items || [
                      { title: 'Hero section', badge: 'Editable' },
                      { title: 'Bundle block', badge: 'Editable' },
                      { title: 'Reviews', badge: 'Editable' },
                    ])];
                    itms[idx] = { ...itms[idx], badge: e.target.value };
                    updateCard(2, { items: itms });
                  }}
                  placeholder="Editable"
                  className="rounded-lg text-xs h-8 w-28 text-slate-400 font-medium"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
