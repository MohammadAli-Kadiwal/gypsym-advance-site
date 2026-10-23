'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Edit3,
  ShieldCheck,
  Eye,
  EyeOff,
  Type,
  AlignLeft,
  Link2,
  ImageIcon,
  X,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TablePagination } from '@/components/ui/table-pagination';
import { PageSeoItem } from './types';

interface PageSeoTabProps {
  pages: PageSeoItem[];
  loading?: boolean;
  onEditPage: (page: PageSeoItem) => void;
  onAuditPage: (pageId: string) => void;
  onRefresh?: () => void;
}

type RuleFilterType =
  | 'ALL'
  | 'MISSING_CANONICAL'
  | 'MISSING_OG'
  | 'MISSING_DESC'
  | 'MISSING_TITLE'
  | 'MISSING_ANY'
  | 'PASSED_ALL'
  | 'HAS_CANONICAL'
  | 'HAS_OG';

function mapParamToRule(param: string | null): RuleFilterType {
  if (!param) return 'ALL';
  const clean = param.toLowerCase().replace(/_/g, '-');
  if (clean === 'missing-canonical' || clean === 'no-canonical') return 'MISSING_CANONICAL';
  if (clean === 'missing-og' || clean === 'no-og' || clean === 'missing-image') return 'MISSING_OG';
  if (clean === 'missing-description' || clean === 'missing-desc') return 'MISSING_DESC';
  if (clean === 'missing-title') return 'MISSING_TITLE';
  if (clean === 'missing-any' || clean === 'incomplete') return 'MISSING_ANY';
  if (clean === 'passed-all' || clean === 'complete') return 'PASSED_ALL';
  if (clean === 'has-canonical') return 'HAS_CANONICAL';
  if (clean === 'has-og') return 'HAS_OG';
  return 'ALL';
}

export function PageSeoTab({
  pages,
  onEditPage,
  onAuditPage,
}: PageSeoTabProps) {
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('ALL');
  const [statusFilter, setStatusFilter] = React.useState('ALL');
  const [ruleFilter, setRuleFilter] = React.useState<RuleFilterType>(() =>
    mapParamToRule(searchParams.get('rule'))
  );

  // Sync rule filter if URL search param changes
  React.useEffect(() => {
    const fromParam = mapParamToRule(searchParams.get('rule'));
    if (fromParam !== ruleFilter) {
      setRuleFilter(fromParam);
    }
  }, [searchParams]);

  // Update URL search param when ruleFilter changes
  const handleRuleFilterChange = (newRule: RuleFilterType) => {
    setRuleFilter(newRule);
    setPage(1);

    const url = new URL(window.location.href);
    url.searchParams.set('tab', 'page-seo');
    if (newRule === 'ALL') {
      url.searchParams.delete('rule');
    } else {
      url.searchParams.set('rule', newRule.toLowerCase().replace(/_/g, '-'));
    }
    window.history.pushState({}, '', url.toString());
  };

  // Compute live Measurable Rules stats across all pages
  const stats = React.useMemo(() => {
    const total = pages.length;
    const withTitle = pages.filter((p) => Boolean(p.seoMetadata?.metaTitle)).length;
    const withDesc = pages.filter((p) => Boolean(p.seoMetadata?.metaDescription)).length;
    const withCanonical = pages.filter((p) => Boolean(p.seoMetadata?.canonicalUrl)).length;
    const withOg = pages.filter((p) => Boolean(p.seoMetadata?.ogImageUrl)).length;

    const missingTitle = total - withTitle;
    const missingDesc = total - withDesc;
    const missingCanonical = total - withCanonical;
    const missingOg = total - withOg;

    const missingAny = pages.filter(
      (p) =>
        !p.seoMetadata?.metaTitle ||
        !p.seoMetadata?.metaDescription ||
        !p.seoMetadata?.canonicalUrl ||
        !p.seoMetadata?.ogImageUrl
    ).length;

    const titlePct = total > 0 ? Math.round((withTitle / total) * 100) : 100;
    const descPct = total > 0 ? Math.round((withDesc / total) * 100) : 100;
    const canonPct = total > 0 ? Math.round((withCanonical / total) * 100) : 100;
    const ogPct = total > 0 ? Math.round((withOg / total) * 100) : 100;

    return {
      total,
      withTitle,
      missingTitle,
      titlePct,
      withDesc,
      missingDesc,
      descPct,
      withCanonical,
      missingCanonical,
      canonPct,
      withOg,
      missingOg,
      ogPct,
      missingAny,
      passedAll: total - missingAny,
    };
  }, [pages]);

  // Filtered pages based on all controls
  const filteredPages = React.useMemo(() => {
    return pages.filter((p) => {
      // 1. Entity Type
      if (typeFilter !== 'ALL') {
        const itemType = (p.type || 'PAGE').toUpperCase();
        if (itemType !== typeFilter) return false;
      }

      // 2. Publication Status
      if (statusFilter !== 'ALL' && p.status !== statusFilter) {
        return false;
      }

      // 3. Search Query
      if (search) {
        const q = search.toLowerCase();
        const matches =
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          (p.path && p.path.toLowerCase().includes(q)) ||
          (p.seoMetadata?.metaTitle || '').toLowerCase().includes(q) ||
          (p.seoMetadata?.canonicalUrl || '').toLowerCase().includes(q);
        if (!matches) return false;
      }

      // 4. Measurable Rules Filter
      const hasTitle = Boolean(p.seoMetadata?.metaTitle);
      const hasDesc = Boolean(p.seoMetadata?.metaDescription);
      const hasCanonical = Boolean(p.seoMetadata?.canonicalUrl);
      const hasOg = Boolean(p.seoMetadata?.ogImageUrl);

      switch (ruleFilter) {
        case 'MISSING_CANONICAL':
          if (hasCanonical) return false;
          break;
        case 'MISSING_OG':
          if (hasOg) return false;
          break;
        case 'MISSING_DESC':
          if (hasDesc) return false;
          break;
        case 'MISSING_TITLE':
          if (hasTitle) return false;
          break;
        case 'MISSING_ANY':
          if (hasTitle && hasDesc && hasCanonical && hasOg) return false;
          break;
        case 'PASSED_ALL':
          if (!hasTitle || !hasDesc || !hasCanonical || !hasOg) return false;
          break;
        case 'HAS_CANONICAL':
          if (!hasCanonical) return false;
          break;
        case 'HAS_OG':
          if (!hasOg) return false;
          break;
        case 'ALL':
        default:
          break;
      }

      return true;
    });
  }, [pages, search, statusFilter, typeFilter, ruleFilter]);

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const paginatedPages = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPages.slice(start, start + pageSize);
  }, [filteredPages, page, pageSize]);

  return (
    <div className="space-y-5">
      {/* ── Measurable Rules Metric Cards ───────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Page Title */}
        <Card
          onClick={() =>
            handleRuleFilterChange(ruleFilter === 'MISSING_TITLE' ? 'ALL' : 'MISSING_TITLE')
          }
          className={`p-4 rounded-2xl border transition-all cursor-pointer select-none hover:shadow-xs ${
            ruleFilter === 'MISSING_TITLE'
              ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20'
              : 'border-slate-200/80 bg-white hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Type className="h-4 w-4" />
            </div>
            <Badge
              variant="outline"
              className={`text-[10px] font-mono font-bold ${
                stats.titlePct >= 80
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {stats.titlePct}%
            </Badge>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold text-slate-800">Page Title Set</div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              {stats.withTitle} / {stats.total} pages
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
            <span
              className={
                stats.missingTitle > 0 ? 'text-amber-600 font-semibold' : 'text-slate-400'
              }
            >
              {stats.missingTitle > 0 ? `${stats.missingTitle} missing` : 'All titles set'}
            </span>
            <span className="text-[10px] text-blue-600 font-bold">
              {ruleFilter === 'MISSING_TITLE' ? 'Active ✕' : 'Filter →'}
            </span>
          </div>
        </Card>

        {/* Card 2: Meta Description */}
        <Card
          onClick={() =>
            handleRuleFilterChange(ruleFilter === 'MISSING_DESC' ? 'ALL' : 'MISSING_DESC')
          }
          className={`p-4 rounded-2xl border transition-all cursor-pointer select-none hover:shadow-xs ${
            ruleFilter === 'MISSING_DESC'
              ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20'
              : 'border-slate-200/80 bg-white hover:border-indigo-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <AlignLeft className="h-4 w-4" />
            </div>
            <Badge
              variant="outline"
              className={`text-[10px] font-mono font-bold ${
                stats.descPct >= 80
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {stats.descPct}%
            </Badge>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold text-slate-800">Meta Description Set</div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              {stats.withDesc} / {stats.total} pages
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
            <span
              className={
                stats.missingDesc > 0 ? 'text-amber-600 font-semibold' : 'text-slate-400'
              }
            >
              {stats.missingDesc > 0 ? `${stats.missingDesc} missing` : 'All descriptions set'}
            </span>
            <span className="text-[10px] text-indigo-600 font-bold">
              {ruleFilter === 'MISSING_DESC' ? 'Active ✕' : 'Filter →'}
            </span>
          </div>
        </Card>

        {/* Card 3: Explicit Canonical */}
        <Card
          onClick={() =>
            handleRuleFilterChange(
              ruleFilter === 'MISSING_CANONICAL' ? 'ALL' : 'MISSING_CANONICAL'
            )
          }
          className={`p-4 rounded-2xl border transition-all cursor-pointer select-none hover:shadow-xs ${
            ruleFilter === 'MISSING_CANONICAL'
              ? 'border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20'
              : 'border-slate-200/80 bg-white hover:border-teal-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="h-8 w-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Link2 className="h-4 w-4" />
            </div>
            <Badge
              variant="outline"
              className={`text-[10px] font-mono font-bold ${
                stats.canonPct >= 80
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {stats.canonPct}%
            </Badge>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold text-slate-800">Canonical URLs</div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              {stats.withCanonical} / {stats.total} pages active
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
            <span className="text-emerald-600 font-semibold">
              {stats.missingCanonical === 0 ? '100% Auto-Covered' : `${stats.withCanonical} configured`}
            </span>
            <span className="text-[10px] text-teal-600 font-bold">
              {ruleFilter === 'MISSING_CANONICAL' ? 'Active ✕' : 'Filter →'}
            </span>
          </div>
        </Card>

        {/* Card 4: OG / Social Image */}
        <Card
          onClick={() =>
            handleRuleFilterChange(ruleFilter === 'MISSING_OG' ? 'ALL' : 'MISSING_OG')
          }
          className={`p-4 rounded-2xl border transition-all cursor-pointer select-none hover:shadow-xs ${
            ruleFilter === 'MISSING_OG'
              ? 'border-pink-500 bg-pink-50/50 ring-2 ring-pink-500/20'
              : 'border-slate-200/80 bg-white hover:border-pink-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="h-8 w-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <ImageIcon className="h-4 w-4" />
            </div>
            <Badge
              variant="outline"
              className={`text-[10px] font-mono font-bold ${
                stats.ogPct >= 80
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {stats.ogPct}%
            </Badge>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold text-slate-800">OG / Social Image</div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              {stats.withOg} / {stats.total} pages
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
            <span
              className={
                stats.missingOg > 0 ? 'text-rose-600 font-semibold' : 'text-slate-400'
              }
            >
              {stats.missingOg > 0 ? `${stats.missingOg} missing` : 'All OG images set'}
            </span>
            <span className="text-[10px] text-pink-600 font-bold">
              {ruleFilter === 'MISSING_OG' ? 'Active ✕' : 'Filter →'}
            </span>
          </div>
        </Card>
      </div>

      {/* ── Control Bar ─────────────────────────────────────────── */}
      <Card className="rounded-2xl border-slate-200/80 p-4 bg-white shadow-2xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by title, path, or slug..."
                className="pl-9 rounded-xl text-xs h-9"
              />
            </div>

            {/* Measurable Rule Filter Dropdown */}
            <div className="relative">
              <select
                value={ruleFilter}
                onChange={(e) => handleRuleFilterChange(e.target.value as RuleFilterType)}
                className={`h-9 rounded-xl border px-3 text-xs font-semibold appearance-none cursor-pointer pr-8 focus:outline-hidden focus:ring-2 ${
                  ruleFilter !== 'ALL'
                    ? 'border-blue-500 bg-blue-50/50 text-blue-700 ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <option value="ALL">All Measurable Rules (134)</option>
                <option value="MISSING_CANONICAL">
                  🔴 Missing Explicit Canonical ({stats.missingCanonical})
                </option>
                <option value="MISSING_OG">
                  🔴 Missing OG / Social Image ({stats.missingOg})
                </option>
                <option value="MISSING_DESC">
                  🔴 Missing Meta Description ({stats.missingDesc})
                </option>
                <option value="MISSING_TITLE">
                  🔴 Missing Page Title ({stats.missingTitle})
                </option>
                <option value="MISSING_ANY">
                  ⚠️ Fails Any Rule / Incomplete ({stats.missingAny})
                </option>
                <option value="PASSED_ALL">
                  🟢 100% Fully Compliant ({stats.passedAll})
                </option>
                <option value="HAS_CANONICAL">
                  🔗 Has Explicit Canonical ({stats.withCanonical})
                </option>
                <option value="HAS_OG">
                  🖼️ Has OG / Social Image ({stats.withOg})
                </option>
              </select>
              <Filter className="h-3.5 w-3.5 absolute right-2.5 top-3 text-slate-400 pointer-events-none" />
            </div>

            {/* Entity Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
            >
              <option value="ALL">All Types ({pages.length})</option>
              <option value="PAGE">
                Pages ({pages.filter((p) => !p.type || p.type === 'PAGE').length})
              </option>
              <option value="SERVICE">
                Services ({pages.filter((p) => p.type === 'SERVICE').length})
              </option>
              <option value="BLOG">
                Blogs ({pages.filter((p) => p.type === 'BLOG').length})
              </option>
              <option value="PORTFOLIO">
                Portfolio ({pages.filter((p) => p.type === 'PORTFOLIO').length})
              </option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>

          {/* Active Filter Clear & Total Count */}
          <div className="flex items-center gap-2.5 justify-between lg:justify-end shrink-0">
            {ruleFilter !== 'ALL' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRuleFilterChange('ALL')}
                className="h-8 px-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer gap-1"
              >
                <X className="h-3.5 w-3.5" />
                <span>Reset Rule Filter</span>
              </Button>
            )}

            <span className="text-xs text-slate-500 font-mono bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              Showing <strong>{filteredPages.length}</strong> of {pages.length} URLs
            </span>
          </div>
        </div>
      </Card>

      {/* ── Pages Table with Explicit Canonical & OG Columns ────── */}
      <Card className="rounded-2xl border-slate-200/80 overflow-hidden bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 min-w-[210px]">Page &amp; Path</th>
                <th className="py-3.5 px-4 min-w-[200px]">Meta Title</th>
                <th className="py-3.5 px-4 min-w-[220px]">Meta Description</th>
                <th className="py-3.5 px-4 min-w-[130px]">Canonical</th>
                <th className="py-3.5 px-4 min-w-[120px]">OG Image</th>
                <th className="py-3.5 px-4 min-w-[80px]">Robots</th>
                <th className="py-3.5 px-4 min-w-[70px]">Audit</th>
                <th className="py-3.5 px-4 text-right min-w-[90px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPages.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Filter className="h-6 w-6 mx-auto mb-2 opacity-40 text-slate-400" />
                    <span>No pages match the active filters.</span>
                    {ruleFilter !== 'ALL' && (
                      <div className="mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRuleFilterChange('ALL')}
                          className="text-xs rounded-xl"
                        >
                          Clear Rule Filter
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedPages.map((page) => {
                  const hasCustomTitle = Boolean(page.seoMetadata?.metaTitle);
                  const displayTitle = page.seoMetadata?.metaTitle || page.title;
                  const titleLen = displayTitle.length;

                  const hasCustomDesc = Boolean(page.seoMetadata?.metaDescription);
                  const displayDesc =
                    page.seoMetadata?.metaDescription || 'No description set';
                  const descLen = page.seoMetadata?.metaDescription?.length || 0;

                  const hasOgImage = Boolean(page.seoMetadata?.ogImageUrl);

                  const isIndexed = page.seoMetadata?.robotsIndex !== false;

                  return (
                    <tr
                      key={page.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Column 1: Page & Path */}
                      <td className="py-3 px-4 font-medium text-slate-900 max-w-[240px]">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-bold">{page.title}</span>
                          <Badge
                            variant="outline"
                            className={`text-[9px] px-1.5 py-0 font-mono uppercase font-semibold shrink-0 ${
                              page.type === 'SERVICE'
                                ? 'bg-blue-50 border-blue-200 text-blue-700'
                                : page.type === 'BLOG'
                                ? 'bg-purple-50 border-purple-200 text-purple-700'
                                : page.type === 'PORTFOLIO'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : 'bg-slate-50 border-slate-200 text-slate-600'
                            }`}
                          >
                            {page.type || page.layoutType || 'PAGE'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px] mt-0.5 truncate">
                          <span>
                            {page.path ||
                              (page.slug === 'home' ? '/' : `/${page.slug}`)}
                          </span>
                        </div>
                      </td>

                      {/* Column 2: Meta Title */}
                      <td className="py-3 px-4 max-w-[210px]">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate font-medium text-slate-800">
                            {displayTitle}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`text-[10px] font-mono ${
                              titleLen >= 45 && titleLen <= 65
                                ? 'text-emerald-600 font-bold'
                                : titleLen > 65
                                ? 'text-amber-600'
                                : 'text-slate-400'
                            }`}
                          >
                            {titleLen} chars
                          </span>
                          {!hasCustomTitle && (
                            <Badge
                              variant="outline"
                              className="text-[9px] bg-slate-50 text-slate-500 border-slate-200"
                            >
                              Fallback
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* Column 3: Meta Description */}
                      <td className="py-3 px-4 max-w-[230px]">
                        <p className="truncate text-slate-600">{displayDesc}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`text-[10px] font-mono ${
                              descLen >= 120 && descLen <= 165
                                ? 'text-emerald-600 font-bold'
                                : descLen > 0
                                ? 'text-amber-600'
                                : 'text-rose-500 font-bold'
                            }`}
                          >
                            {descLen > 0 ? `${descLen} chars` : 'Missing'}
                          </span>
                          {!hasCustomDesc && (
                            <Badge
                              variant="outline"
                              className="text-[9px] bg-rose-50 text-rose-600 border-rose-200 font-semibold"
                            >
                              Missing
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* Column 4: Canonical */}
                      <td className="py-3 px-4">
                        {page.seoMetadata?.isAutoCanonical ? (
                          <div className="flex items-center gap-1.5" title={page.seoMetadata.canonicalUrl || undefined}>
                            <Badge
                              variant="outline"
                              className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold flex items-center gap-1"
                            >
                              <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />
                              <span>Auto</span>
                            </Badge>
                          </div>
                        ) : page.seoMetadata?.canonicalUrl ? (
                          <div className="flex items-center gap-1.5" title={page.seoMetadata.canonicalUrl || undefined}>
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-semibold flex items-center gap-1"
                            >
                              <Link2 className="h-3 w-3 shrink-0 text-blue-600" />
                              <span>Custom</span>
                            </Badge>
                          </div>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold"
                          >
                            Auto
                          </Badge>
                        )}
                      </td>

                      {/* Column 5: OG / Social Image */}
                      <td className="py-3 px-4">
                        {hasOgImage && page.seoMetadata.ogImageUrl ? (
                          <div className="flex items-center gap-1.5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={page.seoMetadata.ogImageUrl}
                              alt=""
                              className="h-5 w-8 rounded object-cover border border-slate-200 shrink-0"
                            />
                            <Badge
                              variant="outline"
                              className="bg-pink-50 text-pink-700 border-pink-200 text-[10px] font-semibold"
                            >
                              Set
                            </Badge>
                          </div>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-rose-50 text-rose-600 border-rose-200 text-[10px] font-semibold"
                          >
                            Missing
                          </Badge>
                        )}
                      </td>

                      {/* Column 6: Robots Index */}
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={`text-[10px] flex items-center gap-1 w-fit ${
                            isIndexed
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {isIndexed ? (
                            <>
                              <Eye className="h-3 w-3" />
                              <span>Index</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3" />
                              <span>Noindex</span>
                            </>
                          )}
                        </Badge>
                      </td>

                      {/* Column 7: Audit Score */}
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAuditPage(page.id)}
                          className="h-7 px-2 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                        </Button>
                      </td>

                      {/* Column 8: Actions */}
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          onClick={() => onEditPage(page)}
                          className="h-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 cursor-pointer shadow-2xs"
                        >
                          <Edit3 className="h-3.5 w-3.5 mr-1" />
                          <span>Edit</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredPages.length > 0 && (
          <TablePagination
            currentPage={page}
            totalItems={filteredPages.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            itemLabel="pages"
          />
        )}
      </Card>
    </div>
  );
}
