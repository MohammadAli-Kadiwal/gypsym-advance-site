'use client';

import * as React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { seoService } from '@/services/seo.service';
import { PageSeoItem } from './types';

interface PageAuditDialogProps {
  page: PageSeoItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditPage: (page: PageSeoItem) => void;
}

export function PageAuditDialog({ page, open, onOpenChange, onEditPage }: PageAuditDialogProps) {
  const [auditData, setAuditData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open && page) {
      setLoading(true);
      seoService
        .auditPage(page.id)
        .then((res) => setAuditData(res))
        .catch((err) => console.error('Failed to run audit:', err))
        .finally(() => setLoading(false));
    } else {
      setAuditData(null);
    }
  }, [open, page]);

  if (!page) return null;

  const titleLength = page.seoMetadata?.metaTitle?.length || 0;
  const descLength = page.seoMetadata?.metaDescription?.length || 0;

  const checks = [
    {
      label: 'Page Title',
      status: !page.seoMetadata?.metaTitle
        ? 'CRITICAL'
        : titleLength < 30 || titleLength > 65
        ? 'WARNING'
        : 'GOOD',
      details: !page.seoMetadata?.metaTitle
        ? 'Missing SEO title. Search engines will generate an arbitrary title.'
        : `Current length: ${titleLength} characters (Recommended: 50-60 characters).`,
    },
    {
      label: 'Meta Description',
      status: !page.seoMetadata?.metaDescription
        ? 'CRITICAL'
        : descLength < 70 || descLength > 165
        ? 'WARNING'
        : 'GOOD',
      details: !page.seoMetadata?.metaDescription
        ? 'Missing meta description. Click-through rates from search results will suffer.'
        : `Current length: ${descLength} characters (Recommended: 120-160 characters).`,
    },
    {
      label: 'Canonical URL',
      status: page.seoMetadata?.canonicalUrl ? 'GOOD' : 'WARNING',
      details: page.seoMetadata?.canonicalUrl
        ? `Explicit canonical configured: ${page.seoMetadata.canonicalUrl}`
        : 'Using automatic canonical derived from URL hierarchy.',
    },
    {
      label: 'Indexability & Robots Directives',
      status: page.seoMetadata?.robotsIndex !== false ? 'GOOD' : 'WARNING',
      details:
        page.seoMetadata?.robotsIndex !== false
          ? 'Page is marked for indexing (index, follow).'
          : 'Page is marked as noindex (excluded from Google search index).',
    },
    {
      label: 'Open Graph Social Sharing Image',
      status: page.seoMetadata?.ogImageUrl ? 'GOOD' : 'WARNING',
      details: page.seoMetadata?.ogImageUrl
        ? 'Custom page social image defined.'
        : 'No page-level OG image; inherits Global SEO default share image.',
    },
    {
      label: 'Structured Data / JSON-LD',
      status: page.seoMetadata?.structuredData ? 'GOOD' : 'INFO',
      details: page.seoMetadata?.structuredData
        ? 'Custom page-level structured schema configured.'
        : 'Inherits global WebPage structured data.',
    },
  ];

  const criticalCount = checks.filter((c) => c.status === 'CRITICAL').length;
  const warningCount = checks.filter((c) => c.status === 'WARNING').length;
  const goodCount = checks.filter((c) => c.status === 'GOOD').length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <DialogTitle>On-Page SEO Audit: {page.title}</DialogTitle>
          </div>
          <DialogDescription className="font-mono text-xs">
            Path: /{page.slug} | Status: {page.status}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing page metadata...
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border bg-rose-500/10 border-rose-500/30 text-center">
                <div className="text-xl font-bold text-rose-600 dark:text-rose-400">{criticalCount}</div>
                <div className="text-[11px] font-medium text-rose-700 dark:text-rose-300">Critical Issues</div>
              </div>
              <div className="p-3 rounded-lg border bg-amber-500/10 border-amber-500/30 text-center">
                <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{warningCount}</div>
                <div className="text-[11px] font-medium text-amber-700 dark:text-amber-300">Warnings</div>
              </div>
              <div className="p-3 rounded-lg border bg-emerald-500/10 border-emerald-500/30 text-center">
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{goodCount}</div>
                <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">Passed Checks</div>
              </div>
            </div>

            {auditData?.summary && (
              <p className="text-xs text-muted-foreground p-3 bg-muted/40 rounded-lg">
                {auditData.summary}
              </p>
            )}

            {/* Checklist */}
            <div className="space-y-2.5">
              {checks.map((chk, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-lg border flex items-start gap-3 ${
                    chk.status === 'CRITICAL'
                      ? 'bg-rose-500/5 border-rose-500/30'
                      : chk.status === 'WARNING'
                      ? 'bg-amber-500/5 border-amber-500/30'
                      : 'bg-card'
                  }`}
                >
                  {chk.status === 'CRITICAL' ? (
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  ) : chk.status === 'WARNING' ? (
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-foreground">{chk.label}</span>
                      <Badge
                        variant="outline"
                        className={
                          chk.status === 'CRITICAL'
                            ? 'bg-rose-500/10 text-rose-600 border-rose-500/30 text-[10px]'
                            : chk.status === 'WARNING'
                            ? 'bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px]'
                            : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]'
                        }
                      >
                        {chk.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{chk.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              onEditPage(page);
            }}
          >
            Edit Page SEO
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
