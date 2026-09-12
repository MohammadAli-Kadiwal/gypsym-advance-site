'use client';

import * as React from 'react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SectionsHeaderProps {
  saving: boolean;
  onBack: () => void;
  onSave: () => void;
}

export function SectionsHeader({ saving, onBack, onSave }: SectionsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eaedf3]">
      <div className="space-y-1">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors group mb-1"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1 group-hover:-translate-x-1 transition-transform" />
          <span>Back to All Pages</span>
        </button>

        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Home Page Sections
          </h1>
          <Badge
            variant="outline"
            className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-700 border-emerald-200"
          >
            2 Sections Configured
          </Badge>
        </div>
        <p className="text-xs text-slate-500">
          Configure content, background video, play button showreel, and metrics for the 2 Home
          sections.
        </p>
      </div>

      <div className="shrink-0">
        <Button
          onClick={onSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-5 text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              <span>Save Changes</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
