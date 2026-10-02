'use client';

import * as React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface TablePaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  className?: string;
}

/**
 * Universal, accessible and beautifully styled TablePagination component for Admin pages.
 * Fully supports light/dark themes, responsive views, smart page numbers with ellipses,
 * and page-size selection.
 */
export function TablePagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  itemLabel = 'entries',
  className = '',
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, totalItems);

  // Compute visible page numbers with smart ellipsis window
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    pages.push(1);

    if (safePage > 3) {
      pages.push('ellipsis-start');
    }

    const rangeStart = Math.max(2, safePage - 1);
    const rangeEnd = Math.min(totalPages - 1, safePage + 1);

    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    if (safePage < totalPages - 2) {
      pages.push('ellipsis-end');
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 border-t border-border text-xs text-muted-foreground bg-card select-none ${className}`}
    >
      {/* ── Left: Range Info & Page Size Selector ──────────────────────── */}
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="font-medium text-foreground">
          Showing <span className="font-semibold">{startItem}</span>–
          <span className="font-semibold">{endItem}</span> of{' '}
          <span className="font-semibold">{totalItems}</span> {itemLabel}
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-2 sm:border-l border-border">
            <span className="text-[11px] text-muted-foreground hidden sm:inline">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="rounded-lg border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:border-primary/50 transition-colors"
              aria-label="Rows per page"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / page
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── Right: Page Navigation Controls ────────────────────────────── */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => onPageChange(1)}
          disabled={safePage === 1}
          aria-label="First page"
          title="First page"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </Button>

        {/* Previous Page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          disabled={safePage === 1}
          aria-label="Previous page"
          title="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        {/* Numbered Buttons */}
        <div className="hidden xs:flex items-center gap-1 px-1">
          {pages.map((p, idx) => {
            if (typeof p === 'string') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1.5 py-1 text-muted-foreground font-mono text-xs select-none"
                >
                  …
                </span>
              );
            }

            const isActive = p === safePage;
            return (
              <Button
                key={p}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(p)}
                className={`h-8 min-w-[32px] px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                    : 'border-border text-foreground hover:bg-muted hover:text-foreground'
                }`}
                aria-label={`Page ${p}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {p}
              </Button>
            );
          })}
        </div>

        {/* Mobile current page indicator */}
        <span className="xs:hidden px-2 font-medium text-xs text-foreground">
          {safePage} / {totalPages}
        </span>

        {/* Next Page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
          disabled={safePage === totalPages}
          aria-label="Next page"
          title="Next page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>

        {/* Last Page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => onPageChange(totalPages)}
          disabled={safePage === totalPages}
          aria-label="Last page"
          title="Last page"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
