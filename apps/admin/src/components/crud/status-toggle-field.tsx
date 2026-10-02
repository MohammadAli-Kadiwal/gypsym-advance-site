'use client';

import * as React from 'react';
import { ItemStatus } from '@/lib/store';

export interface StatusToggleFieldProps {
  value?: ItemStatus | string | boolean;
  onChange: (status: ItemStatus, isActive: boolean) => void;
  label?: string;
  description?: string;
  className?: string;
  variant?: 'card' | 'compact';
}

export function StatusToggleField({
  value = 'PUBLISHED',
  onChange,
  label = 'Publication Status',
  description,
  className = '',
  variant = 'card',
}: StatusToggleFieldProps) {
  // Normalize value to 'PUBLISHED' | 'DRAFT'
  const isPublic =
    value === 'PUBLISHED' ||
    value === true ||
    (typeof value === 'string' && value.toUpperCase() === 'PUBLISHED');

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        {isPublic ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            Public
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-700 border border-amber-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1.5" />
            Draft
          </span>
        )}

        <div className="inline-flex items-center p-0.5 bg-slate-200/80 rounded-xl border border-slate-300/70 shrink-0">
          <button
            type="button"
            onClick={() => onChange('DRAFT', false)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              !isPublic
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Draft
          </button>
          <button
            type="button"
            onClick={() => onChange('PUBLISHED', true)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isPublic
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Public
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
        isPublic
          ? 'bg-emerald-500/5 border-emerald-500/20'
          : 'bg-slate-50/80 border-slate-200/80'
      } ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">{label}</span>
            {isPublic ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                Public (Live on Website)
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-700 border border-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 mr-1.5" />
                Draft (Hidden from Website)
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed max-w-md">
            {description ||
              (isPublic
                ? 'This record is published and visible to visitors on the live website.'
                : 'This record is saved as a draft and hidden from the live website until published.')}
          </p>
        </div>

        {/* Segmented Button: Draft vs Public */}
        <div className="inline-flex items-center p-0.5 bg-slate-200/80 rounded-xl border border-slate-300/70 shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={() => onChange('DRAFT', false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              !isPublic
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Draft
          </button>
          <button
            type="button"
            onClick={() => onChange('PUBLISHED', true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isPublic
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Public
          </button>
        </div>
      </div>
    </div>
  );
}
