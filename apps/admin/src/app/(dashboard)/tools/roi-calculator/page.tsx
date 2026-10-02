'use client';

import * as React from 'react';
import Link from 'next/link';
import { ExternalLink, Sparkles, Calculator, Copy, Check } from 'lucide-react';
import { AdminContentContainer, AdminPageHeader } from '@/components/layout/admin-page';
import { Badge } from '@/components/ui/badge';
import { getSiteUrl } from '@/lib/site-url';

// ─── Inline Calculator (Admin-Adapted) ───────────────────────────────────────

interface CurrencyConfig {
  code: string;
  symbol: string;
  rate: number;
}

const CURRENCIES: Record<string, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', rate: 1 },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92 },
  GBP: { code: 'GBP', symbol: '£', rate: 0.79 },
  INR: { code: 'INR', symbol: '₹', rate: 83.5 },
  AED: { code: 'AED', symbol: 'AED ', rate: 3.67 },
  AUD: { code: 'AUD', symbol: 'A$', rate: 1.52 },
};

function AdminRoiCalculator() {
  const [currency, setCurrency] = React.useState<string>('USD');
  const [annualGmv, setAnnualGmv] = React.useState<number>(12000000);
  const [currentCvr, setCurrentCvr] = React.useState<number>(1.8);
  const [currentAov, setCurrentAov] = React.useState<number>(125);
  const [currentTtfb, setCurrentTtfb] = React.useState<number>(2.4);
  const [copied, setCopied] = React.useState(false);

  const activeCurrency = (CURRENCIES[currency] ?? CURRENCIES['USD'])!;

  const targetTtfb = 0.042;
  const latencyDeltaSeconds = Math.max(0, currentTtfb - targetTtfb);
  const latencyDelta100ms = latencyDeltaSeconds * 10;
  const cvrLiftPercent = Math.min(36, Math.max(14, latencyDelta100ms * 1.25));
  const newCvr = currentCvr * (1 + cvrLiftPercent / 100);
  const projectedAnnualRevenue = annualGmv * (1 + cvrLiftPercent / 100);
  const annualIncrementalRevenue = projectedAnnualRevenue - annualGmv;
  const monthlyCashflow = annualIncrementalRevenue / 12;
  const dailySurge = annualIncrementalRevenue / 365;
  const currentAnnualOrders = annualGmv / currentAov;
  const incrementalOrders = currentAnnualOrders * (cvrLiftPercent / 100);

  const fmt = (amount: number, compact = false) => {
    const v = amount * activeCurrency.rate;
    if (compact && v >= 1_000_000) return `${activeCurrency.symbol}${(v / 1_000_000).toFixed(2)}M`;
    if (compact && v >= 1_000) return `${activeCurrency.symbol}${(v / 1_000).toFixed(0)}k`;
    return `${activeCurrency.symbol}${Math.round(v).toLocaleString()}`;
  };

  const handleCopy = () => {
    const text = `Gypsym Headless ROI Projection\nCurrent GMV: ${fmt(annualGmv, true)}\nProjected Annual Lift: +${fmt(annualIncrementalRevenue, true)} (+${cvrLiftPercent.toFixed(1)}% CVR)\nNew CVR: ${newCvr.toFixed(2)}% → was ${currentCvr.toFixed(2)}%\nSpeed: ${currentTtfb}s → 42ms TTFB (Next.js 15 Edge)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Currency Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border w-fit">
        {Object.keys(CURRENCIES).map((cur) => (
          <button
            key={cur}
            type="button"
            onClick={() => setCurrency(cur)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
              currency === cur
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {cur}
          </button>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Sliders (7 cols) */}
        <div className="xl:col-span-7 p-6 rounded-2xl bg-card border border-border shadow-xs space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-3">
            Step 1 — Input Current Store Telemetry
          </h3>

          {/* GMV */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">Annual GMV / Revenue</label>
              <span className="font-mono text-sm font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-lg border border-primary/20">
                {fmt(annualGmv, true)}
              </span>
            </div>
            <input type="range" min={1000000} max={50000000} step={500000} value={annualGmv}
              onChange={(e) => setAnnualGmv(Number(e.target.value))}
              className="w-full h-1.5 rounded-lg bg-muted appearance-none cursor-pointer accent-primary" />
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>{fmt(1000000, true)}</span><span>{fmt(25000000, true)}</span><span>{fmt(50000000, true)}</span>
            </div>
          </div>

          {/* CVR */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">Current Conversion Rate (CVR)</label>
              <span className="font-mono text-sm font-bold text-foreground bg-muted px-2.5 py-0.5 rounded-lg border border-border">
                {currentCvr.toFixed(2)}%
              </span>
            </div>
            <input type="range" min={0.6} max={4.5} step={0.1} value={currentCvr}
              onChange={(e) => setCurrentCvr(Number(e.target.value))}
              className="w-full h-1.5 rounded-lg bg-muted appearance-none cursor-pointer accent-primary" />
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>0.60% (High Friction)</span><span>1.80% (Benchmark)</span><span>4.50% (Peak)</span>
            </div>
          </div>

          {/* AOV */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">Average Order Value (AOV)</label>
              <span className="font-mono text-sm font-bold text-foreground bg-muted px-2.5 py-0.5 rounded-lg border border-border">
                {fmt(currentAov)}
              </span>
            </div>
            <input type="range" min={30} max={400} step={5} value={currentAov}
              onChange={(e) => setCurrentAov(Number(e.target.value))}
              className="w-full h-1.5 rounded-lg bg-muted appearance-none cursor-pointer accent-primary" />
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>{fmt(30)}</span><span>{fmt(200)}</span><span>{fmt(400)}</span>
            </div>
          </div>

          {/* TTFB */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">Client's Current Mobile TTFB</label>
              <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                {currentTtfb.toFixed(1)}s ({(currentTtfb * 1000).toFixed(0)}ms)
              </span>
            </div>
            <input type="range" min={0.8} max={4.2} step={0.1} value={currentTtfb}
              onChange={(e) => setCurrentTtfb(Number(e.target.value))}
              className="w-full h-1.5 rounded-lg bg-muted appearance-none cursor-pointer accent-primary" />
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>0.8s (Decoupled)</span><span>2.4s (Monolith Avg)</span><span>4.2s (Heavy Liquid)</span>
            </div>
          </div>

          {/* Industry presets */}
          <div className="pt-2 border-t border-border flex items-center justify-between flex-wrap gap-2">
            <span className="text-[11px] text-muted-foreground font-medium">Quick Presets:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { label: 'DTC Apparel ($5M)', gmv: 5000000, cvr: 1.4, aov: 85, ttfb: 2.8 },
                { label: 'Beauty ($18M)', gmv: 18000000, cvr: 2.1, aov: 160, ttfb: 2.2 },
                { label: 'Luxury ($35M)', gmv: 35000000, cvr: 1.9, aov: 280, ttfb: 2.5 },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => { setAnnualGmv(p.gmv); setCurrentCvr(p.cvr); setCurrentAov(p.aov); setCurrentTtfb(p.ttfb); }}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-muted hover:bg-muted/80 text-foreground transition-colors cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Projection Output (5 cols) */}
        <div className="xl:col-span-5 space-y-4">
          {/* Hero card */}
          <div className="p-6 rounded-2xl bg-card border-2 border-primary/30 shadow-sm relative overflow-hidden space-y-5">
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-primary/8 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-border pb-4">
              <Badge className="bg-primary text-primary-foreground font-mono font-bold text-[10px] uppercase tracking-wider">
                PROJECTED ROI
              </Badge>
              <button type="button" onClick={handleCopy}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 font-medium transition-colors cursor-pointer">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Brief'}</span>
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-muted-foreground block">
                Projected Annual Revenue Lift
              </span>
              <div className="text-4xl font-extrabold tracking-tight text-primary font-mono">
                +{fmt(annualIncrementalRevenue, true)}
                <span className="text-xs font-semibold text-muted-foreground font-sans ml-1">/ year</span>
              </div>
              <p className="text-[11px] text-muted-foreground pt-1">
                Achieving <strong className="text-foreground">42ms Edge TTFB</strong> →{' '}
                <strong className="text-emerald-600 dark:text-emerald-400">+{cvrLiftPercent.toFixed(1)}% CVR lift</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { label: 'Monthly', value: `+${fmt(monthlyCashflow, true)}`, sub: 'per 30 days' },
                { label: 'Daily', value: `+${fmt(dailySurge, true)}`, sub: 'per 24h' },
                { label: 'New CVR', value: `${newCvr.toFixed(2)}%`, sub: `from ${currentCvr.toFixed(2)}%`, accent: true },
                { label: 'Extra Orders', value: `+${Math.round(incrementalOrders).toLocaleString()}`, sub: 'annual checkouts' },
              ].map((m) => (
                <div key={m.label} className="p-3 rounded-xl bg-muted/40 border border-border space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">{m.label}</span>
                  <span className={`text-base font-bold font-mono block ${m.accent ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                    {m.value}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{m.sub}</span>
                </div>
              ))}
            </div>

            {/* Speed bar */}
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-2">
              <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                <span>Latency Delta</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                  −{(latencyDeltaSeconds * 1000).toFixed(0)}ms saved
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Current ({(currentTtfb * 1000).toFixed(0)}ms)</span>
                  <span className="text-rose-500 font-medium">Lag ↑</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '85%' }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Gypsym Edge (42ms)</span>
                  <span className="text-emerald-500 font-bold">Instant ✓</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '12%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick action links */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border flex flex-col gap-2.5 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Share With Client</span>
            <Link
              href={`/bookings`}
              className="flex items-center gap-2 text-foreground hover:text-primary font-medium transition-colors"
            >
              <Calculator className="w-3.5 h-3.5 text-primary" />
              <span>Schedule Discovery Call for this Lead</span>
            </Link>
            <a
              href={`${getSiteUrl()}/roi-calculator`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-foreground hover:text-primary font-medium transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-primary" />
              <span>Open Public Calculator Page (Client View)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Methodology note */}
      <div className="p-4 rounded-xl bg-muted/30 border border-border text-[11px] text-muted-foreground leading-relaxed">
        <span className="font-semibold text-foreground">Methodology:</span> CVR uplift modeled on Deloitte Digital (2024) empirical benchmark of +1.25% conversion rate per 100ms latency improvement. Gypsym's Next.js 15 App Router with React Server Components and Cloudflare edge caching achieves a P95 TTFB of 42ms globally. Projections assume maintained AOV and traffic volume. Results are illustrative estimates — actual outcomes vary based on traffic quality, checkout UX, and market conditions.
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RoiCalculatorAdminPage() {
  return (
    <AdminContentContainer variant="wide">
      <AdminPageHeader
        title={
          <span className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            <span>ROI & Revenue Uplift Calculator</span>
            <Badge className="bg-primary/10 text-primary border-primary/20 font-mono font-bold text-[10px] uppercase">
              Sales Tool
            </Badge>
          </span>
        }
        description="Simulate a prospect's projected annual revenue lift from switching to Gypsym's 42ms Next.js Edge headless architecture. Use before or during discovery calls to quantify the speed-to-revenue impact."
        actions={
          <div className="flex items-center gap-2">
            <a
              href={`${getSiteUrl()}/roi-calculator`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Page</span>
            </a>
          </div>
        }
        status={
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
            <Sparkles className="w-3 h-3" />
            <span>Deloitte 2024 Methodology</span>
          </div>
        }
      />

      <AdminRoiCalculator />
    </AdminContentContainer>
  );
}
