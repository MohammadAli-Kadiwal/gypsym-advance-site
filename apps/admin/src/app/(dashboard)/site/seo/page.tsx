'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { INITIAL_SEO } from '@/lib/store';
import { Save, Check, Search } from 'lucide-react';

export default function SeoSettingsPage() {
  const [seo, setSeo] = React.useState(INITIAL_SEO);
  const [saved, setSaved] = React.useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const titleLength = seo.defaultTitle.length;
  const descLength = seo.defaultDescription.length;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-border/40 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          SEO, Meta Tags & SERP Simulator
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Configure search engine indexing rules, automated sitemaps, OpenGraph cards, and SERP previews.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Metadata */}
        <Card className="p-6 space-y-4">
          <CardHeader className="p-0 border-b border-border/40 pb-3">
            <CardTitle className="text-sm">Default Search Engine Metadata</CardTitle>
            <CardDescription className="text-xs">
              Fallback meta tags applied to all public routes without custom overrides.
            </CardDescription>
          </CardHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Default Page Title</label>
                <span className={`text-[10px] font-mono ${titleLength > 60 ? 'text-amber-400' : 'text-muted-foreground'}`}>
                  {titleLength} / 60 characters
                </span>
              </div>
              <Input
                value={seo.defaultTitle}
                onChange={(e) => setSeo({ ...seo, defaultTitle: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Default Meta Description</label>
                <span className={`text-[10px] font-mono ${descLength > 155 ? 'text-amber-400' : 'text-muted-foreground'}`}>
                  {descLength} / 155 characters
                </span>
              </div>
              <Textarea
                value={seo.defaultDescription}
                onChange={(e) => setSeo({ ...seo, defaultDescription: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Canonical Domain</label>
                <Input
                  value={seo.canonicalDomain}
                  onChange={(e) => setSeo({ ...seo, canonicalDomain: e.target.value })}
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Twitter / X Handle</label>
                <Input
                  value={seo.twitterHandle}
                  onChange={(e) => setSeo({ ...seo, twitterHandle: e.target.value })}
                  className="font-mono text-xs"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Live Google SERP Simulator */}
        <Card className="p-6 space-y-3 bg-muted/20 border-border">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <span className="font-mono text-xs font-bold text-foreground flex items-center">
              <Search className="h-3.5 w-3.5 mr-1.5 text-primary" /> Google SERP Snippet Preview
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">Desktop Simulation</span>
          </div>

          <div className="rounded-lg bg-card p-4 border border-border space-y-1">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span className="font-mono text-[11px] text-emerald-400">
                {seo.canonicalDomain}
              </span>
              <span>›</span>
              <span>services</span>
            </div>
            <h4 className="text-base font-semibold text-primary hover:underline cursor-pointer leading-tight">
              {seo.defaultTitle}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {seo.defaultDescription}
            </p>
          </div>
        </Card>

        {/* Robots.txt Configuration */}
        <Card className="p-6 space-y-4">
          <CardHeader className="p-0 border-b border-border/40 pb-3">
            <CardTitle className="text-sm">robots.txt Directives</CardTitle>
            <CardDescription className="text-xs">
              Crawler instructions for Googlebot, Bingbot, and AI indexing agents.
            </CardDescription>
          </CardHeader>

          <div className="space-y-1.5">
            <Textarea
              value={seo.robotsTxt}
              onChange={(e) => setSeo({ ...seo, robotsTxt: e.target.value })}
              className="font-mono text-xs"
              rows={4}
            />
          </div>
        </Card>

        <div className="flex items-center justify-end">
          <Button type="submit" size="sm" className="shadow-sm">
            {saved ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-400" /> Saved SEO Settings
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 mr-1.5" /> Save SEO Rules
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
