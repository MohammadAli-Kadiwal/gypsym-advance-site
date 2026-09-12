'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import type { MetricsSection, MetricsPayload, MetricsCard } from './types';

interface MetricsSettingsProps {
  section: MetricsSection;
  onChange: (updated: MetricsSection) => void;
}

/** Helper: extract flat headline text */
function getHeadlineText(payload: MetricsPayload): string {
  if (Array.isArray(payload.headline?.segments)) {
    return payload.headline.segments.map((s) => s.value || s.text || '').join('');
  }
  return '';
}

/** Update a single card by index */
function patchCard(
  cards: MetricsCard[],
  idx: number,
  patch: Partial<MetricsCard>
): MetricsCard[] {
  return cards.map((c, i) => (i === idx ? { ...c, ...patch } : c));
}

export function MetricsSettings({ section, onChange }: MetricsSettingsProps) {
  const p = section.contentPayload;
  const cards = p.cards ?? [];

  function update(patch: Partial<MetricsPayload>) {
    onChange({ ...section, contentPayload: { ...p, ...patch } });
  }

  function updateCard(idx: number, patch: Partial<MetricsCard>) {
    update({ cards: patchCard(cards, idx, patch) });
  }

  function updateCardAppearance(idx: number, cardBg: string) {
    const card = cards[idx];
    updateCard(idx, { appearance: { ...card?.appearance, cardBg } });
  }

  return (
    <Card className="p-6 rounded-2xl border-slate-200/90 bg-white shadow-xs space-y-5">
      <CardHeader className="p-0 border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-bold text-slate-900">
            Verified Results Section Configuration
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Manage section background color token, headline, and the 4 metric cards.
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
        {/* Eyebrow & Background Color */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Eyebrow Label</label>
            <Input
              value={p.eyebrow?.text || ''}
              onChange={(e) => update({ eyebrow: { ...p.eyebrow, text: e.target.value } })}
              placeholder="VERIFIED RESULTS"
              className="text-xs rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Section Background Color</span>
              <span className="text-[10px] font-mono text-slate-400">
                {p.backgroundColor || '#f4f3ef'}
              </span>
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={p.backgroundColor || '#f4f3ef'}
                onChange={(e) => update({ backgroundColor: e.target.value })}
                className="h-9 w-9 rounded-xl border border-slate-300 bg-transparent cursor-pointer shrink-0"
              />
              <Input
                value={p.backgroundColor || ''}
                onChange={(e) => update({ backgroundColor: e.target.value })}
                placeholder="#f4f3ef"
                className="text-xs font-mono rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Section Headline</label>
          <Textarea
            rows={2}
            value={getHeadlineText(p)}
            onChange={(e) =>
              update({
                headline: {
                  segments: [{ type: 'text', value: e.target.value }],
                },
              })
            }
            className="text-xs font-bold rounded-xl"
          />
        </div>

        {/* Stylized Accent Word */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Stylized Accent Word (Serif Italic)</label>
          <Input
            value={p.titleHighlight || ''}
            onChange={(e) => update({ titleHighlight: e.target.value })}
            placeholder="e.g. dashboards"
            className="text-xs font-serif italic rounded-xl"
          />
          <p className="text-[11px] text-slate-400">
            Word in the headline rendered in Instrument Serif italic font.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Supporting Description</label>
          <Textarea
            rows={2}
            value={p.description?.content || ''}
            onChange={(e) =>
              update({ description: { ...p.description, content: e.target.value } })
            }
            className="text-xs rounded-xl"
          />
        </div>

        {/* Audit / NDA Statement */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Audit / NDA Statement</label>
          <Input
            value={p.supportingText?.content || ''}
            onChange={(e) =>
              update({ supportingText: { ...p.supportingText, content: e.target.value } })
            }
            className="text-xs rounded-xl"
          />
        </div>

        {/* 4 Metric Cards */}
        {cards.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Verified Result Cards ({cards.length} Cards)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Category • Value • Period
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {cards.map((card, idx) => (
                <div
                  key={card.id || idx}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                      Card #{idx + 1}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[9px] font-mono bg-white text-emerald-700"
                    >
                      {card.verification?.label || 'VERIFIED ✓'}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {/* Title */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-600">Card Title</label>
                      <Input
                        value={card.title || ''}
                        onChange={(e) => updateCard(idx, { title: e.target.value })}
                        className="text-xs font-bold rounded-lg h-8 bg-white"
                      />
                    </div>

                    {/* Value & Period */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-600">
                          Display Value
                        </label>
                        <Input
                          value={card.metric?.displayValue || ''}
                          onChange={(e) =>
                            updateCard(idx, {
                              metric: { ...card.metric, displayValue: e.target.value },
                            })
                          }
                          className="text-xs font-black rounded-lg h-8 bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-600">
                          Period Label
                        </label>
                        <Input
                          value={card.period?.label || ''}
                          onChange={(e) =>
                            updateCard(idx, {
                              period: { ...card.period, label: e.target.value },
                            })
                          }
                          className="text-xs rounded-lg h-8 bg-white"
                        />
                      </div>
                    </div>

                    {/* Category & Region */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-600">Category</label>
                        <Input
                          value={card.category || ''}
                          onChange={(e) => updateCard(idx, { category: e.target.value })}
                          className="text-xs rounded-lg h-8 bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-600">
                          Region / Geo
                        </label>
                        <Input
                          value={card.region || card.geography || ''}
                          onChange={(e) =>
                            updateCard(idx, {
                              region: e.target.value,
                              geography: e.target.value,
                            })
                          }
                          className="text-xs rounded-lg h-8 bg-white"
                        />
                      </div>
                    </div>

                    {/* Card Background Color */}
                    <div className="space-y-1 pt-1">
                      <label className="text-[10px] font-semibold text-slate-600 flex items-center justify-between">
                        <span>Card Background Color</span>
                        <span className="font-mono text-[9px] text-slate-400">
                          {card.appearance?.cardBg || ''}
                        </span>
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={card.appearance?.cardBg || '#ffffff'}
                          onChange={(e) => updateCardAppearance(idx, e.target.value)}
                          className="h-7 w-7 rounded-lg border border-slate-300 bg-transparent cursor-pointer shrink-0"
                        />
                        <Input
                          value={card.appearance?.cardBg || ''}
                          onChange={(e) => updateCardAppearance(idx, e.target.value)}
                          placeholder="#ffffff"
                          className="text-xs font-mono rounded-lg h-7 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {cards.length === 0 && (
          <div className="py-8 text-center text-xs text-slate-400">
            No metric cards found in backend data.
          </div>
        )}
      </div>
    </Card>
  );
}
