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
        <p className="text-sm font-medium text-slate-500">Calculating live SEO & discoverability audit...</p>
      </div>
    );
  }

  const score = data.healthScore ?? 100;
  const isHealthy = score >= 85;
  const isWarning = score >= 60 && score < 85;

  return (
    <div className="space-y-6">
      {/* Top Banner: Health Score & High-Level Summary */}
      <Card className="rounded-2xl border-slate-200/80 shadow-2xs overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-blue-50/20">
        <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <Badge
                variant="outline"
                className={`text-xs px-2.5 py-0.5 font-bold uppercase tracking-wider ${
                  isHealthy
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : isWarning
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {data.status || (isHealthy ? 'GOOD' : isWarning ? 'WARNING' : 'CRITICAL')}
              </Badge>
              <span className="text-xs text-slate-400 font-mono">100% Dynamic DB-Driven SEO Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Enterprise SEO, AEO & GEO Health
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              Real-time audit across all published dynamic CMS pages, services, portfolio projects, and structured knowledge graphs. Zero hardcoded fallbacks.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* Health Score Pill */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-slate-200 shadow-xs min-w-[120px]">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Health Score</span>
              <span
                className={`text-3xl sm:text-4xl font-black mt-0.5 ${
                  isHealthy ? 'text-emerald-600' : isWarning ? 'text-amber-600' : 'text-rose-600'
                }`}
              >
                {score}%
              </span>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5">Measurable rules</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="rounded-xl border-slate-200 h-10 px-3.5 hover:bg-slate-50 text-slate-700 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4 mr-1.5" />
              Re-Audit
            </Button>
          </div>
        </div>
      </Card>

      {/* Critical Safety Notice if Robots.txt blocks everything */}
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

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Tracked URLs */}
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

        {/* Metric 2: Indexing Status */}
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

        {/* Metric 3: Missing Metadata */}
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

        {/* Metric 4: AEO & GEO Knowledge */}
        <Card className="rounded-2xl border-slate-200/80 p-5 space-y-3 bg-white shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AEO / GEO Knowledge</span>
            <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Cpu className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{data.aeoCount || 0}</span>
            <span className="text-xs text-purple-600 font-semibold">Q&A Knowledge Items</span>
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

      {/* Secondary Detailed Breakdown: Audits & Quick Fix Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* On-Page Audits & Duplication Watch */}
        <Card className="rounded-2xl border-slate-200/80 p-6 space-y-4 bg-white shadow-2xs">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <span>On-Page SEO & Content Quality Audit</span>
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
              <Badge
                variant="outline"
                className={`text-[10px] ${
                  data.duplicateTitlesCount > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {data.duplicateTitlesCount > 0 ? `${data.duplicateTitlesCount} Duplicates Detected` : 'None (Clean)'}
              </Badge>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                <span className={`w-2 h-2 rounded-full ${data.duplicateDescriptionsCount > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                <span>Duplicate Descriptions</span>
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] ${
                  data.duplicateDescriptionsCount > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
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

        {/* Technical Discoverability & AI Engines */}
        <Card className="rounded-2xl border-slate-200/80 p-6 space-y-4 bg-white shadow-2xs">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-purple-600" />
              <span>Technical Discoverability & Machine Readiness</span>
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigateTab('redirects')}
                  className="h-6 px-2 text-[10px] font-semibold text-blue-600 hover:bg-blue-50 cursor-pointer"
                >
                  Manage
                </Button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                <FileText className="h-4 w-4 text-emerald-600" />
                <span>Dynamic XML Sitemap (/sitemap.xml)</span>
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] ${
                  data.sitemapStatus === 'GOOD'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {data.sitemapStatus || 'GOOD'}
              </Badge>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                <ShieldCheck className="h-4 w-4 text-slate-600" />
                <span>Robots.txt Crawl Directives</span>
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] ${
                  data.robotsStatus === 'GOOD'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : data.robotsStatus === 'WARNING'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {data.robotsStatus || 'GOOD'}
              </Badge>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span>AEO Knowledge Graph Coverage</span>
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] ${
                  data.aeoCount > 0 ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {data.aeoCount > 0 ? `${data.aeoCount} Items Configured` : 'Needs Q&A Configuration'}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('aeo')}
              className="flex-1 text-xs font-semibold rounded-xl text-purple-600 border-purple-200 hover:bg-purple-50 cursor-pointer"
            >
              <HelpCircle className="h-3.5 w-3.5 mr-1.5" />
              Configure AEO
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('geo')}
              className="flex-1 text-xs font-semibold rounded-xl text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              <Cpu className="h-3.5 w-3.5 mr-1.5" />
              GEO Entity Profile
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
