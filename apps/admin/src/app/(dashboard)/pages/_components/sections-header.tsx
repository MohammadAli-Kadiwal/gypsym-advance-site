'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, RefreshCw, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SectionsHeaderProps {
  saving: boolean;
  loading?: boolean;
  pageTitle?: string;
  pageRoute?: string;
  layoutLabel?: string;
  sectionCount?: number;
  status?: string;
  onBack: () => void;
  onSave: () => void;
  onRefresh?: () => void;
}

export function SectionsHeader({
  saving,
  loading = false,
  pageTitle = 'Home',
  pageRoute = '/',
  layoutLabel = 'LANDING PAGE',
  sectionCount,
  status,
  onBack,
  onSave,
  onRefresh,
}: SectionsHeaderProps) {
  const countLabel =
    sectionCount !== undefined
      ? `${sectionCount} Section${sectionCount !== 1 ? 's' : ''} Configured`
      : null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eaedf3]">
      {/* Left: Back + Title + Badges + Description */}
      <div className="space-y-1">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors group mb-1"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1 group-hover:-translate-x-1 transition-transform" />
          <span>Back to All Pages</span>
        </button>

        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {pageTitle} Page
          </h1>
          <Badge
            variant="outline"
            className="text-[10px] font-mono uppercase bg-blue-50 text-blue-700 border-blue-200"
          >
            {layoutLabel}
          </Badge>
          {countLabel && (
            <Badge
              variant="outline"
              className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-700 border-emerald-200"
            >
              {countLabel}
            </Badge>
          )}
          {status && (
            <Badge
              variant="outline"
              className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-700 border-emerald-200"
            >
              {status}
            </Badge>
          )}
        </div>

        <p className="text-xs text-slate-500">
          Configure content, sections, and settings for the {pageTitle} page.
        </p>
      </div>

      {/* Right: Refresh + Preview + Save */}
      <div className="flex items-center gap-2 shrink-0">
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-slate-500 hover:text-blue-600 rounded-xl"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        )}

        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-9 px-3 text-xs font-semibold rounded-xl border-slate-200"
        >
          <Link
            href={pageRoute}
            target="_blank"
            className="inline-flex items-center gap-1.5"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Preview
          </Link>
        </Button>

        <Button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 px-5 text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
