'use client';

import * as React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Layers,
  HelpCircle,
  Cpu,
  Route,
  Link2,
  ImageIcon,
  Type,
  AlignLeft,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SeoDashboardTabProps {
  data: any;
  loading: boolean;
  onRefresh: () => void;
  onNavigateTab: (tab: string) => void;
}

// ── Circular SVG Gauge ──────────────────────────────────────────
function CircularGauge({ score }: { score: number }) {
  const radius = 48;
  const stroke = 9;
  const norm = radius - stroke / 2;
  const circ = 2 * Math.PI * norm;
  const filled = ((score / 100) * circ).toFixed(2);
  const color = score >= 85 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  const track = score >= 85 ? '#d1fae5' : score >= 60 ? '#fef3c7' : '#fee2e2';

  return (
    <div className="relative flex items-center justify-center" style={{ width: 112, height: 112 }}>
      <svg width={112} height={112} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={56} cy={56} r={norm} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={56} cy={56} r={norm} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circ}`}
          style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[22px] font-black leading-none" style={{ color }}>{score}%</span>
        <span className="text-[9px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">Health</span>
      </div>
    </div>
  );
}

// ── Rule Progress Row ───────────────────────────────────────────
function RuleRow({
  icon: Icon,
  label,
  passed,
  total,
  iconClass,
}: {
  icon: React.ElementType;
  label: string;
  passed: number;
  total: number;
  iconClass: string;
}) {
  const pct = total > 0 ? Math.round((passed / total) * 100) : 100;
  const good = pct >= 80;
  const warn = pct >= 50 && pct < 80;

  return (
    <div className="flex items-center gap-3">
      <div className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 ${iconClass}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-slate-700 truncate">{label}</span>
          <span className={`text-[11px] font-bold ml-2 shrink-0 tabular-nums ${good ? 'text-emerald-600' : warn ? 'text-amber-600' : 'text-rose-600'}`}>
            {pct}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${good ? 'bg-emerald-500' : warn ? 'bg-amber-400' : 'bg-rose-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{passed}/{total} pages</div>
      </div>
      <div className="shrink-0">
        {good
          ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          : <XCircle className={`h-4 w-4 ${warn ? 'text-amber-500' : 'text-rose-500'}`} />
        }
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────
export function SeoDashboardTab({
  data,
  loading,
  onRefresh,
  onNavigateTab,
}: SeoDashboardTabProps) {
  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-slate-500">Calculating live SEO &amp; discoverability audit...</p>
      </div>
    );
  }

  const score = data.healthScore ?? 100;
  const isHealthy = score >= 85;
  const isWarning = score >= 60 && score < 85;

  const total     = data.totalTrackedUrls || 0;
  const titlesOk  = total - (data.missingTitles || 0);
  const descsOk   = total - (data.missingDescriptions || 0);
  const canonOk   = total - (data.missingCanonicals || 0);
  const ogOk      = total - (data.missingOgImages || 0);

  const titlePct  = total > 0 ? Math.round((titlesOk / total) * 100) : 100;
  const descPct   = total > 0 ? Math.round((descsOk  / total) * 100) : 100;
  const canonPct  = total > 0 ? Math.round((canonOk  / total) * 100) : 100;
  const ogPct     = total > 0 ? Math.round((ogOk     / total) * 100) : 100;

  const statusLabel = data.status || (isHealthy ? 'GOOD' : isWarning ? 'WARNING' : 'CRITICAL');

  return (
    <div className="space-y-6">

      {/* ── Top Banner ──────────────────────────────────────────── */}
      <Card className="rounded-2xl border-slate-200/80 shadow-xs overflow-hidden bg-white">
        <div className="p-4">
          {/* Row 1: Title + Status + Re-Audit */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <Badge
                variant="outline"
                className={`text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider shrink-0 ${
                  isHealthy
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : isWarning
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {statusLabel}
              </Badge>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight truncate">
                Enterprise SEO, AEO &amp; GEO Health
              </h2>
              <span className="text-[10px] text-slate-400 font-mono hidden md:inline shrink-0">100% Dynamic DB-Driven</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="rounded-xl border-slate-200 h-7 px-2.5 hover:bg-slate-50 text-slate-700 cursor-pointer text-[11px] font-semibold shrink-0"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Re-Audit
            </Button>
          </div>

          {/* Row 2: Mini score cards + Gauge + Rules — all inline */}
          <div className="flex items-stretch gap-3">

            {/* Left: 4 per-signal score cards stacked 2×2 */}
            <div className="grid grid-cols-2 gap-2 flex-1">
              {[
                { label: 'Page Title',   pct: titlePct, count: `${titlesOk}/${total}`, icon: Type,      bg: 'bg-blue-50 text-blue-600' },
                { label: 'Description',  pct: descPct,  count: `${descsOk}/${total}`,  icon: AlignLeft, bg: 'bg-indigo-50 text-indigo-600' },
                { label: 'Canonical',    pct: canonPct, count: `${canonOk}/${total}`,  icon: Link2,     bg: 'bg-teal-50 text-teal-600' },
                { label: 'OG Image',     pct: ogPct,    count: `${ogOk}/${total}`,     icon: ImageIcon, bg: 'bg-pink-50 text-pink-600' },
              ].map(({ label, pct, count, icon: Icon, bg }) => (
                <div key={label} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2">
                  <div className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 ${bg}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider truncate">{label}</p>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-sm font-black leading-none ${pct >= 80 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                        {pct}%
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">{count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="w-px bg-slate-200 shrink-0 self-stretch" />

            {/* Center: Circular Gauge */}
            <div className="flex flex-col items-center justify-center shrink-0 gap-0.5">
              <CircularGauge score={score} />
              <span className="text-[8px] text-slate-400 font-mono uppercase tracking-wider">Health Score</span>
            </div>

            {/* Divider */}
            <div className="w-px bg-slate-200 shrink-0 self-stretch" />

            {/* Right: Measurable Rules */}
            <div className="shrink-0 w-[220px] space-y-1.5">
              <div className="flex items-center gap-1 mb-1.5">
                <TrendingUp className="h-3 w-3 text-slate-400" />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Measurable Rules</span>
                <span className="ml-auto text-[8px] font-mono text-slate-400">{total} × 4</span>
              </div>
              <RuleRow icon={Type}      label="Page Title Set"       passed={titlesOk} total={total} iconClass="bg-blue-50 text-blue-600" />
              <RuleRow icon={AlignLeft} label="Meta Description Set" passed={descsOk}  total={total} iconClass="bg-indigo-50 text-indigo-600" />
              <RuleRow icon={Link2}     label="Explicit Canonical"   passed={canonOk}  total={total} iconClass="bg-teal-50 text-teal-600" />
              <RuleRow icon={ImageIcon} label="OG / Social Image"    passed={ogOk}     total={total} iconClass="bg-pink-50 text-pink-600" />
            </div>
          </div>
        </div>
      </Card>

      {/* ── Critical Safety Notice ─────────────────────────────── */}
      {data.hasDangerousRobots && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold">CRITICAL WARNING: robots.txt is currently configured with Disallow: /</span>
            <p className="mt-0.5 text-rose-700">
              All search engine and AI crawlers are currently prevented from indexing your production site. Review your rules in the Robots.txt tab.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => onNavigateTab('robots')}
            className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs shrink-0 cursor-pointer"
          >
            Fix Robots.txt
          </Button>
        </div>
      )}

      {/* ── Primary Metrics Grid ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-slate-200/80 p-5 space-y-3 bg-white shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tracked URLs</span>
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{data.totalTrackedUrls || 0}</div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span>{data.totalPages || 0} Pages</span>
            <span>•</span>
            <span>{data.totalServices || 0} Services</span>
            <span>•</span>
            <span>{data.totalPortfolio || 0} Portfolio</span>
          </div>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 p-5 space-y-3 bg-white shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Indexing Controls</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Eye className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{data.indexedPages || 0}</span>
            <span className="text-xs text-emerald-600 font-semibold">Indexed</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <EyeOff className="h-3.5 w-3.5 text-slate-400" />
            <span>{data.noindexPages || 0} Pages marked Noindex</span>
          </div>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 p-5 space-y-3 bg-white shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Missing Meta Data</span>
            <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${
              (data.missingTitles + data.missingDescriptions) > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{data.missingTitles || 0}</span>
            <span className="text-xs text-amber-600 font-semibold">Missing Titles</span>
          </div>
          <div className="text-[11px] text-slate-500">
            <span>{data.missingDescriptions || 0} without meta description</span>
          </div>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 p-5 space-y-3 bg-white shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AEO / GEO Knowledge</span>
            <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Cpu className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{data.aeoCount || 0}</span>
            <span className="text-xs text-purple-600 font-semibold">Q&amp;A Knowledge Items</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Badge
              variant="outline"
              className={`text-[9px] px-1.5 py-0 ${
                data.geoConfigured ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {data.geoConfigured ? 'GEO Configured' : 'GEO Incomplete'}
            </Badge>
          </div>
        </Card>
      </div>

      {/* ── Detailed Breakdown ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl border-slate-200/80 p-6 space-y-4 bg-white shadow-2xs">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <span>On-Page SEO &amp; Content Quality Audit</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live automated verification against search engine best practices.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                <span className={`w-2 h-2 rounded-full ${data.missingCanonicals > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                <span>Explicit Canonical URLs</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-900">
                  {data.totalTrackedUrls - (data.missingCanonicals || 0)} / {data.totalTrackedUrls}
                </span>
                {data.missingCanonicals > 0 && (
                  <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                    {data.missingCanonicals} Auto
                  </Badge>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                <span className={`w-2 h-2 rounded-full ${data.missingOgImages > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                <span>Dedicated Open Graph Images</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-900">
                  {data.totalTrackedUrls - (data.missingOgImages || 0)} / {data.totalTrackedUrls}
                </span>
                {data.missingOgImages > 0 && (
                  <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                    {data.missingOgImages} Using Global
                  </Badge>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                <span className={`w-2 h-2 rounded-full ${data.duplicateTitlesCount > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                <span>Duplicate Meta Titles</span>
              </div>
              <Badge variant="outline" className={`text-[10px] ${data.duplicateTitlesCount > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                {data.duplicateTitlesCount > 0 ? `${data.duplicateTitlesCount} Duplicates Detected` : 'None (Clean)'}
              </Badge>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                <span className={`w-2 h-2 rounded-full ${data.duplicateDescriptionsCount > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                <span>Duplicate Descriptions</span>
              </div>
              <Badge variant="outline" className={`text-[10px] ${data.duplicateDescriptionsCount > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                {data.duplicateDescriptionsCount > 0 ? `${data.duplicateDescriptionsCount} Duplicates Detected` : 'None (Clean)'}
              </Badge>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateTab('pages')}
            className="w-full text-xs font-semibold rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
          >
            <span>Manage Page-by-Page SEO Overrides</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 p-6 space-y-4 bg-white shadow-2xs">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-purple-600" />
              <span>Technical Discoverability &amp; Machine Readiness</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Robots crawlers, XML sitemap health, and Answer Engine Optimization graph.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                <Route className="h-4 w-4 text-blue-600" />
                <span>URL Redirect Rules (301/302/308)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-900">{data.redirectCount || 0} Active</span>
                <Button variant="ghost" size="sm" onClick={() => onNavigateTab('redirects')} className="h-6 px-2 text-[10px] font-semibold text-blue-600 hover:bg-blue-50 cursor-pointer">
                  Manage
                </Button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                <FileText className="h-4 w-4 text-emerald-600" />
                <span>Dynamic XML Sitemap (/sitemap.xml)</span>
              </div>
              <Badge variant="outline" className={`text-[10px] ${data.sitemapStatus === 'GOOD' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                {data.sitemapStatus || 'GOOD'}
              </Badge>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                <ShieldCheck className="h-4 w-4 text-slate-600" />
                <span>Robots.txt Crawl Directives</span>
              </div>
              <Badge variant="outline" className={`text-[10px] ${data.robotsStatus === 'GOOD' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : data.robotsStatus === 'WARNING' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                {data.robotsStatus || 'GOOD'}
              </Badge>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span>AEO Knowledge Graph Coverage</span>
              </div>
              <Badge variant="outline" className={`text-[10px] ${data.aeoCount > 0 ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                {data.aeoCount > 0 ? `${data.aeoCount} Items Configured` : 'Needs Q&A Configuration'}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => onNavigateTab('aeo')} className="flex-1 text-xs font-semibold rounded-xl text-purple-600 border-purple-200 hover:bg-purple-50 cursor-pointer">
              <HelpCircle className="h-3.5 w-3.5 mr-1.5" />
              Configure AEO
            </Button>
            <Button variant="outline" size="sm" onClick={() => onNavigateTab('geo')} className="flex-1 text-xs font-semibold rounded-xl text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer">
              <Cpu className="h-3.5 w-3.5 mr-1.5" />
              GEO Entity Profile
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
