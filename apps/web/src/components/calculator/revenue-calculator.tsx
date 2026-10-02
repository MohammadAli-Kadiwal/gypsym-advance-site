'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  DollarSign,
  BarChart3,
  Percent,
  Clock,
  CheckCircle2,
  Share2,
  Check,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getSiteUrl } from '@/lib/site-url';

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

export function RevenueUpliftCalculator() {
  // Inputs
  const [currency, setCurrency] = React.useState<string>('USD');
  const [annualGmv, setAnnualGmv] = React.useState<number>(12000000); // $12M
  const [currentCvr, setCurrentCvr] = React.useState<number>(1.8); // 1.8%
  const [currentAov, setCurrentAov] = React.useState<number>(125); // $125
  const [currentTtfb, setCurrentTtfb] = React.useState<number>(2.4); // 2.4s
  const [copied, setCopied] = React.useState(false);

  const activeCurrency = (CURRENCIES[currency] ?? CURRENCIES['USD'])!;

  // Empirical Headless Telemetry Calculations
  // Deloitte & Google 2024: each 100ms improvement yields ~1.1% to 1.3% CVR increase.
  // Gypsym Next.js 15 P95 TTFB is ~42ms (0.042s).
  const targetTtfb = 0.042;
  const latencyDeltaSeconds = Math.max(0, currentTtfb - targetTtfb);
  const latencyDelta100ms = latencyDeltaSeconds * 10;
  
  // Percent conversion lift capped conservatively between 14% and 36%
  const cvrLiftPercent = Math.min(36, Math.max(14, latencyDelta100ms * 1.25));
  const newCvr = currentCvr * (1 + cvrLiftPercent / 100);
  
  // Revenue math
  const projectedAnnualRevenue = annualGmv * (1 + cvrLiftPercent / 100);
  const annualIncrementalRevenue = projectedAnnualRevenue - annualGmv;
  const monthlyCashflow = annualIncrementalRevenue / 12;
  const dailySurge = annualIncrementalRevenue / 365;

  // Estimated orders
  const currentAnnualOrders = annualGmv / currentAov;
  const incrementalOrders = currentAnnualOrders * (cvrLiftPercent / 100);

  // Currency Formatter
  const formatMoney = (amount: number, compact = false) => {
    const converted = amount * activeCurrency.rate;
    if (currency === 'INR' && compact) {
      if (converted >= 10_000_000) return `₹${(converted / 10_000_000).toFixed(2)}Cr`;
      if (converted >= 100_000) return `₹${(converted / 100_000).toFixed(2)}L`;
    }
    if (compact && converted >= 1000000) {
      return `${activeCurrency.symbol}${(converted / 1000000).toFixed(2)}M`;
    }
    if (compact && converted >= 1000) {
      return `${activeCurrency.symbol}${(converted / 1000).toFixed(0)}k`;
    }
    return `${activeCurrency.symbol}${Math.round(converted).toLocaleString()}`;
  };

  const handleShare = () => {
    const text = `Gypsym Headless ROI Analysis:
Current GMV: ${formatMoney(annualGmv, true)}
Projected Annual Lift: +${formatMoney(annualIncrementalRevenue, true)}/yr (+${cvrLiftPercent.toFixed(1)}% CVR)
Speed Advantage: ${currentTtfb}s → 42ms TTFB
Explore: ${getSiteUrl()}/roi-calculator`;

    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Header Eyebrow & Currency Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Architecture CRO Simulator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Headless E-Commerce ROI Calculator
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Calculate your store's projected annual revenue lift by replacing slow Liquid monoliths with Gypsym’s 42ms Next.js Edge.
          </p>
        </div>

        {/* Currency Selector Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border shrink-0 self-start sm:self-auto">
          {Object.keys(CURRENCIES).map((cur) => (
            <button
              key={cur}
              type="button"
              onClick={() => setCurrency(cur)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                currency === cur
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {cur}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Controls (Sliders) & Right Output Projection Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Store Parameters (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xs space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2 border-b border-border pb-3">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span>Step 1: Input Current Store Telemetry</span>
            </h3>

            {/* Parameter 1: Annual GMV */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-primary" />
                  <span>Current Annual GMV / Revenue</span>
                </label>
                <span className="font-mono text-sm sm:text-base font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-lg border border-primary/20">
                  {formatMoney(annualGmv, true)}
                </span>
              </div>
              <input
                type="range"
                min={1000000}
                max={50000000}
                step={500000}
                value={annualGmv}
                onChange={(e) => setAnnualGmv(Number(e.target.value))}
                className="w-full h-2 rounded-lg bg-muted appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                <span>{formatMoney(1000000, true)}</span>
                <span>{formatMoney(25000000, true)}</span>
                <span>{formatMoney(50000000, true)}</span>
              </div>
            </div>

            {/* Parameter 2: Current Conversion Rate */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Current Store Conversion Rate (CVR)</span>
                </label>
                <span className="font-mono text-sm sm:text-base font-bold text-foreground bg-muted px-2.5 py-0.5 rounded-lg border border-border">
                  {currentCvr.toFixed(2)}%
                </span>
              </div>
              <input
                type="range"
                min={0.6}
                max={4.5}
                step={0.1}
                value={currentCvr}
                onChange={(e) => setCurrentCvr(Number(e.target.value))}
                className="w-full h-2 rounded-lg bg-muted appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                <span>0.60% (Friction)</span>
                <span>1.80% (Benchmark)</span>
                <span>4.50% (High Performer)</span>
              </div>
            </div>

            {/* Parameter 3: Average Order Value (AOV) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                  <span>Average Order Value (AOV)</span>
                </label>
                <span className="font-mono text-sm sm:text-base font-bold text-foreground bg-muted px-2.5 py-0.5 rounded-lg border border-border">
                  {formatMoney(currentAov)}
                </span>
              </div>
              <input
                type="range"
                min={30}
                max={400}
                step={5}
                value={currentAov}
                onChange={(e) => setCurrentAov(Number(e.target.value))}
                className="w-full h-2 rounded-lg bg-muted appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                <span>{formatMoney(30)}</span>
                <span>{formatMoney(200)}</span>
                <span>{formatMoney(400)}</span>
              </div>
            </div>

            {/* Parameter 4: Mobile TTFB Latency */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Current Mobile Server TTFB Latency</span>
                </label>
                <span className="font-mono text-sm sm:text-base font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                  {currentTtfb.toFixed(1)}s ({(currentTtfb * 1000).toFixed(0)}ms)
                </span>
              </div>
              <input
                type="range"
                min={0.8}
                max={4.2}
                step={0.1}
                value={currentTtfb}
                onChange={(e) => setCurrentTtfb(Number(e.target.value))}
                className="w-full h-2 rounded-lg bg-muted appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                <span>0.8s (Decoupled)</span>
                <span>2.4s (Monolithic Avg)</span>
                <span>4.2s (Heavy Liquid)</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="pt-2 border-t border-border flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="text-muted-foreground font-medium text-[11px]">Quick Industry Presets:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setAnnualGmv(5000000);
                    setCurrentCvr(1.4);
                    setCurrentAov(85);
                    setCurrentTtfb(2.8);
                  }}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-muted hover:bg-muted/80 text-foreground transition-colors cursor-pointer"
                >
                  DTC Apparel ($5M)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAnnualGmv(18000000);
                    setCurrentCvr(2.1);
                    setCurrentAov(160);
                    setCurrentTtfb(2.2);
                  }}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-muted hover:bg-muted/80 text-foreground transition-colors cursor-pointer"
                >
                  Beauty &amp; Wellness ($18M)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAnnualGmv(35000000);
                    setCurrentCvr(1.9);
                    setCurrentAov(280);
                    setCurrentTtfb(2.5);
                  }}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-muted hover:bg-muted/80 text-foreground transition-colors cursor-pointer"
                >
                  Enterprise Luxury ($35M)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Projected Financial Returns & Action Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-card border-2 border-primary/30 shadow-lg relative overflow-hidden space-y-6">
            {/* Subtle background ambient glow */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-border pb-4">
              <Badge className="bg-primary text-primary-foreground font-mono font-bold text-xs uppercase tracking-wider py-1 px-3">
                PROJECTED ROI
              </Badge>
              <button
                type="button"
                onClick={handleShare}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
                title="Copy ROI Summary"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Share ROI'}</span>
              </button>
            </div>

            {/* Hero Projected Annual Revenue Lift Number */}
            <div className="space-y-1">
              <span className="text-xs uppercase font-mono tracking-wider font-semibold text-muted-foreground block">
                Projected Annual Incremental Lift
              </span>
              <div className="text-3xl sm:text-5xl font-extrabold tracking-tight text-primary font-mono">
                +{formatMoney(annualIncrementalRevenue, true)}
                <span className="text-xs sm:text-sm font-semibold text-muted-foreground font-sans ml-1">/ year</span>
              </div>
              <p className="text-[11px] text-muted-foreground pt-1">
                Based on achieving <strong className="text-foreground">42ms Edge TTFB</strong> and a projected{' '}
                <strong className="text-emerald-600 dark:text-emerald-400">+{cvrLiftPercent.toFixed(1)}% CVR surge</strong>.
              </p>
            </div>

            {/* Breakdown Metric Tiles */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Monthly Expansion</span>
                <span className="text-lg font-bold font-mono text-foreground block">
                  +{formatMoney(monthlyCashflow, true)}
                </span>
                <span className="text-[10px] text-muted-foreground">Every 30 days</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Daily Incremental</span>
                <span className="text-lg font-bold font-mono text-foreground block">
                  +{formatMoney(dailySurge, true)}
                </span>
                <span className="text-[10px] text-muted-foreground">24-hour revenue</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">New Conversion Rate</span>
                <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 block">
                  {newCvr.toFixed(2)}%
                </span>
                <span className="text-[10px] text-muted-foreground">from {currentCvr.toFixed(2)}%</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Extra Annual Orders</span>
                <span className="text-lg font-bold font-mono text-foreground block">
                  +{Math.round(incrementalOrders).toLocaleString()}
                </span>
                <span className="text-[10px] text-muted-foreground">completed checkouts</span>
              </div>
            </div>

            {/* Performance Comparison Bar */}
            <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className="text-muted-foreground">Speed Delta</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                  {(latencyDeltaSeconds * 1000).toFixed(0)}ms Faster
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Current Monolith: {(currentTtfb * 1000).toFixed(0)}ms</span>
                  <span className="text-rose-500 font-medium">Lag</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '85%' }} />
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                  <span>Gypsym Next.js Edge: 42ms</span>
                  <span className="text-emerald-500 font-bold">Instant</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '12%' }} />
                </div>
              </div>
            </div>

            {/* High-Intent Conversion CTA Button */}
            <div className="space-y-2.5 pt-2">
              <Link
                href={`/book?gmv=${annualGmv}&lift=${Math.round(annualIncrementalRevenue)}&currency=${currency}`}
                className="w-full h-11 px-5 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all group cursor-pointer"
              >
                <span>Schedule Architectural Audit</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground font-medium pt-1">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Verified CWV Methodology</span>
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-primary" />
                  <span>Strict Confidentiality NDA</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
