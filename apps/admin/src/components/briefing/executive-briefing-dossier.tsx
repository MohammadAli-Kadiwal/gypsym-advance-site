'use client';

import * as React from 'react';
import {
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Building2,
  Clock,
  Globe,
  Mail,
  FileText,
  X,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { notify } from '@/lib/notifications';

export interface BriefingData {
  clientName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  storeUrl?: string | null;
  bookingNumber?: string | null;
  scheduledDate?: string | null;
  slotTime?: string | null;
  timezone?: string | null;
  source?: string | null;
  notes?: string | null;
  inquiryMessage?: string | null;
  status?: string | null;
}

interface ExecutiveBriefingDossierProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: BriefingData | null;
}

export function ExecutiveBriefingDossier({
  open,
  onOpenChange,
  data,
}: ExecutiveBriefingDossierProps) {
  const [copied, setCopied] = React.useState(false);

  if (!data) return null;

  const refNumber =
    data.bookingNumber ||
    `GYP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleCopySummary = () => {
    const text = `GYPSYM TECHNOLOGY · EXECUTIVE ARCHITECTURE DOSSIER
Reference: ${refNumber}
Date: ${currentDate}
Client: ${data.clientName} (${data.company || 'Enterprise'})
Email: ${data.email}
Store URL: ${data.storeUrl || 'N/A'}
Scheduled: ${data.scheduledDate ? `${data.scheduledDate} at ${data.slotTime} (${data.timezone})` : 'Inbound Inquiry'}
Status: ${data.status || 'Active'}
Notes: ${data.notes || data.inquiryMessage || 'None provided'}`;

    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopied(true);
      notify.success('Dossier summary copied to clipboard.');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideCloseButton
        className="max-w-3xl w-[94vw] sm:w-full p-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-card shadow-2xl max-h-[92vh] flex flex-col"
      >
        <DialogTitle className="sr-only">Executive Architecture Dossier</DialogTitle>
        <DialogDescription className="sr-only">
          Confidential technical briefing and enterprise audit dossier for {data.clientName}.
        </DialogDescription>

        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="print:hidden px-6 py-4 border-b border-border bg-muted/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold gap-1.5 py-1 px-3"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Executive Briefing Dossier</span>
            </Badge>
            <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
              Ref: {refNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopySummary}
              className="gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground cursor-pointer rounded-xl"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Printable Dossier Paper Canvas */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 bg-card text-foreground font-sans print:p-0 print:space-y-6">
          {/* 1. Header & Confidential Branding */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-border">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs shadow-xs">
                  GT
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                    Gypsym Technology
                  </h1>
                  <p className="text-[11px] text-muted-foreground tracking-wider uppercase font-semibold">
                    Global Headless E-Commerce Architecture Practice
                  </p>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                Confidential · NDA Protected
              </span>
              <div className="text-xs font-mono text-muted-foreground">
                Dossier #{refNumber}
              </div>
              <div className="text-[11px] text-muted-foreground">
                Date: {currentDate}
              </div>
            </div>
          </div>

          {/* 2. Client & Prospect Overview Cards */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-primary" />
              <span>Client &amp; Stakeholder Dossier</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Executive Contact</span>
                <p className="text-xs font-bold text-foreground truncate">{data.clientName}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
                  <Mail className="w-3 h-3 shrink-0" />
                  <span className="truncate">{data.email}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Entity / Brand</span>
                <p className="text-xs font-bold text-foreground truncate">{data.company || 'Enterprise Store'}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
                  <Globe className="w-3 h-3 shrink-0" />
                  <span className="truncate">{data.storeUrl || 'Direct Flagship'}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Session Schedule</span>
                <p className="text-xs font-bold text-foreground">
                  {data.scheduledDate ? `${data.scheduledDate}` : 'Immediate Triage'}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>{data.slotTime ? `${data.slotTime} (${data.timezone || 'Local'})` : 'Inbound Lead'}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Status &amp; Channel</span>
                <p className="text-xs font-bold text-foreground">{data.status || 'CONFIRMED'}</p>
                <div className="text-[11px] text-muted-foreground truncate">
                  Source: {data.source || 'Website Booking Engine'}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Preliminary Architecture Assessment */}
          <div className="p-5 rounded-2xl bg-muted/20 border border-border space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span>Preliminary Headless Architecture Blueprint</span>
              </h2>
              <span className="text-[10px] font-mono text-primary font-bold">
                Target P95 TTFB: ≤ 42ms
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Frontend Framework</span>
                <p className="font-bold text-foreground">Next.js 15 (App Router)</p>
                <p className="text-[11px] text-muted-foreground">React Server Components, Partial Prerendering (PPR)</p>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Commerce Engine</span>
                <p className="font-bold text-foreground">Shopify Storefront API</p>
                <p className="text-[11px] text-muted-foreground">Hydrogen edge connectors, Cart v2025 mutation</p>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Edge CDN &amp; Caching</span>
                <p className="font-bold text-foreground">Cloudflare &amp; Vercel Edge</p>
                <p className="text-[11px] text-muted-foreground">310+ Global PoPs, Stale-While-Revalidate TTL</p>
              </div>
            </div>
          </div>

          {/* 4. Client Notes & Requirements */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span>Requirements &amp; Scope Discovery</span>
            </h2>

            <div className="p-4 rounded-2xl bg-muted/30 border border-border text-xs leading-relaxed text-foreground">
              {data.notes || data.inquiryMessage ? (
                <p className="whitespace-pre-line font-medium">{data.notes || data.inquiryMessage}</p>
              ) : (
                <p className="text-muted-foreground italic">
                  No custom notes entered. Discovery session will address Shopify Plus theme decoupling, core web vitals optimization, checkout friction reduction, and global internationalization.
                </p>
              )}
            </div>
          </div>

          {/* 5. 4-Phase Delivery Methodology */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Standard 4-Phase Enterprise Execution Plan
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-left text-xs">
              <div className="p-3 rounded-xl border border-border bg-card space-y-1">
                <span className="text-[10px] font-bold text-primary font-mono block">PHASE 01</span>
                <p className="font-semibold text-foreground text-[11px]">Architecture Audit</p>
                <p className="text-[10px] text-muted-foreground">CWV telemetry, app bloat audit, technical schema</p>
              </div>

              <div className="p-3 rounded-xl border border-border bg-card space-y-1">
                <span className="text-[10px] font-bold text-primary font-mono block">PHASE 02</span>
                <p className="font-semibold text-foreground text-[11px]">Headless Build</p>
                <p className="text-[10px] text-muted-foreground">Next.js storefront, design system, API bridge</p>
              </div>

              <div className="p-3 rounded-xl border border-border bg-card space-y-1">
                <span className="text-[10px] font-bold text-primary font-mono block">PHASE 03</span>
                <p className="font-semibold text-foreground text-[11px]">CRO Integration</p>
                <p className="text-[10px] text-muted-foreground">A/B experimentation, bundle blocks, 1-click buy</p>
              </div>

              <div className="p-3 rounded-xl border border-border bg-card space-y-1">
                <span className="text-[10px] font-bold text-primary font-mono block">PHASE 04</span>
                <p className="font-semibold text-foreground text-[11px]">Zero-Downtime Cutover</p>
                <p className="text-[10px] text-muted-foreground">DNS switch, 99.99% Edge SLA, post-launch hypercare</p>
              </div>
            </div>
          </div>

          {/* 6. Legal / Sign-off Footer */}
          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[10px] text-muted-foreground font-mono">
            <div>
              Generated by Gypsym Command Engine · San Francisco · London · Dubai
            </div>
            <div className="flex items-center gap-1.5 text-primary font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>Enterprise SLA: 99.99% Uptime Guarantee</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
