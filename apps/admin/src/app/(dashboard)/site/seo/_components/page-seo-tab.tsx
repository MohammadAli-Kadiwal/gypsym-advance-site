'use client';

import * as React from 'react';
import {
  Search,
  Edit3,
  ShieldCheck,
  Eye,
  EyeOff,
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

export function PageSeoTab({
  pages,
  onEditPage,
  onAuditPage,
}: PageSeoTabProps) {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('ALL');
  const [missingOnly, setMissingOnly] = React.useState(false);

  const filteredPages = React.useMemo(() => {
    return pages.filter((p) => {
      if (search) {
        const q = search.toLowerCase();
        const matches =
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          (p.seoMetadata.metaTitle || '').toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (statusFilter !== 'ALL' && p.status !== statusFilter) {
        return false;
      }

      if (missingOnly) {
        const hasTitle = Boolean(p.seoMetadata.metaTitle);
        const hasDesc = Boolean(p.seoMetadata.metaDescription);
        if (hasTitle && hasDesc) return false;
      }

      return true;
    });
  }, [pages, search, statusFilter, missingOnly]);

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const paginatedPages = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPages.slice(start, start + pageSize);
  }, [filteredPages, page, pageSize]);

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <Card className="rounded-2xl border-slate-200/80 p-4 bg-white shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search pages by title or slug..."
                className="pl-9 rounded-xl text-xs"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={missingOnly}
                onChange={(e) => {
                  setMissingOnly(e.target.checked);
                  setPage(1);
                }}
                className="rounded accent-blue-600 h-4 w-4 cursor-pointer"
              />
              <span>Missing SEO Only</span>
            </label>

            <span className="text-xs text-slate-400 font-mono">
              Showing {filteredPages.length} of {pages.length} pages
            </span>
          </div>
        </div>
      </Card>

      {/* Pages Table */}
      <Card className="rounded-2xl border-slate-200/80 overflow-hidden bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Page & Path</th>
                <th className="py-3.5 px-4">Meta Title</th>
                <th className="py-3.5 px-4">Meta Description</th>
                <th className="py-3.5 px-4">Robots Index</th>
                <th className="py-3.5 px-4">Quality Score</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No pages matched your current search filters.
                  </td>
                </tr>
              ) : (
                paginatedPages.map((page) => {
                  const hasCustomTitle = Boolean(page.seoMetadata.metaTitle);
                  const displayTitle = page.seoMetadata.metaTitle || page.title;
                  const titleLen = displayTitle.length;

                  const hasCustomDesc = Boolean(page.seoMetadata.metaDescription);
                  const displayDesc = page.seoMetadata.metaDescription || 'No description set';
                  const descLen = page.seoMetadata.metaDescription?.length || 0;

                  const isIndexed = page.seoMetadata.robotsIndex !== false;

                  return (
                    <tr key={page.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Column 1: Page & Path */}
                      <td className="py-3 px-4 font-medium text-slate-900 max-w-[220px]">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-bold">{page.title}</span>
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1.5 py-0 font-mono uppercase bg-slate-50 border-slate-200 text-slate-600"
                          >
                            {page.layoutType || 'PAGE'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px] mt-0.5">
                          <span>/{page.slug === 'home' ? '' : page.slug}</span>
                        </div>
                      </td>

                      {/* Column 2: Meta Title */}
                      <td className="py-3 px-4 max-w-[220px]">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate font-medium text-slate-800">{displayTitle}</span>
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
                            <Badge variant="outline" className="text-[9px] bg-slate-50 text-slate-500 border-slate-200">
                              Fallback
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* Column 3: Meta Description */}
                      <td className="py-3 px-4 max-w-[280px]">
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
                            {descLen > 0 ? `${descLen} chars` : 'Missing Description'}
                          </span>
                          {!hasCustomDesc && (
                            <Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-600 border-amber-200">
                              Missing
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* Column 4: Robots Index */}
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

                      {/* Column 5: Audit Score */}
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAuditPage(page.id)}
                          className="h-7 px-2.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 mr-1 text-blue-600" />
                          <span>Audit</span>
                        </Button>
                      </td>

                      {/* Column 6: Actions */}
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          onClick={() => onEditPage(page)}
                          className="h-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 cursor-pointer shadow-2xs"
                        >
                          <Edit3 className="h-3.5 w-3.5 mr-1" />
                          <span>Edit SEO</span>
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
