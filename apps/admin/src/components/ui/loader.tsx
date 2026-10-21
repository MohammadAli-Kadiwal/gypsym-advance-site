'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminContentContainer, type LayoutVariant } from '@/components/layout/admin-page';

export type LoaderSize = 'sm' | 'md' | 'lg' | 'xl';

interface LoaderSpinnerProps {
  size?: LoaderSize;
  className?: string;
}

const sizeClasses: Record<LoaderSize, { ring: string; icon: string; wrapper: string }> = {
  sm: {
    wrapper: 'h-6 w-6',
    ring: 'h-6 w-6 border-[1.5px]',
    icon: 'h-4 w-4',
  },
  md: {
    wrapper: 'h-10 w-10',
    ring: 'h-10 w-10 border-2',
    icon: 'h-6 w-6',
  },
  lg: {
    wrapper: 'h-14 w-14',
    ring: 'h-14 w-14 border-2',
    icon: 'h-8 w-8',
  },
  xl: {
    wrapper: 'h-20 w-20',
    ring: 'h-20 w-20 border-[3px]',
    icon: 'h-11 w-11',
  },
}; 33

/**
 * Standardized Unified Brand Spinner
 * Common visual signature across all admin loading elements
 */
export function LoaderSpinner({ size = 'md', className }: LoaderSpinnerProps) {
  const cfg = sizeClasses[size];

  return (
    <div className={cn('relative flex items-center justify-center shrink-0', cfg.wrapper, className)}>
      {/* Outer ambient glow pulse */}
      <span className="absolute -inset-1 rounded-full bg-primary/15 animate-pulse blur-xs" />

      {/* Outer ping echo */}
      <span className={cn('absolute rounded-full border-primary/25 animate-ping', cfg.ring)} />

      {/* Rotating spinner icon */}
      <Loader2 className={cn('text-primary animate-spin relative z-10', cfg.icon)} />
    </div>
  );
}

export interface AdminLoadingStateProps {
  title?: string;
  message?: string;
  description?: string;
  badge?: string;
  size?: LoaderSize;
  className?: string;
  minHeight?: string;
}

/**
 * Standardized Card / Section Loader
 * To be used inside page cards, tabs, and module panels
 */
export function AdminLoadingState({
  title,
  message = 'Loading operational data...',
  description,
  badge = 'LIVE CLUSTER SYNC',
  size = 'lg',
  className,
  minHeight = 'min-h-[280px]',
}: AdminLoadingStateProps) {
  const displayTitle = title || message;
  const displaySubtitle = title ? message : (description || 'Connecting and synchronizing with Gypsym platform API...');

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-border/80 bg-card/60 shadow-2xs backdrop-blur-xs animate-in fade-in duration-200',
        minHeight,
        className
      )}
    >
      <LoaderSpinner size={size} className="mb-4" />

      {badge && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono font-semibold tracking-wider uppercase mb-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span>{badge}</span>
        </div>
      )}

      <h4 className="text-sm font-bold text-foreground tracking-tight mb-1">{displayTitle}</h4>
      {displaySubtitle && (
        <p className="text-xs text-muted-foreground max-w-md leading-relaxed">{displaySubtitle}</p>
      )}
    </div>
  );
}

export interface AdminPageLoadingStateProps {
  title?: string;
  message?: string;
  description?: string;
  badge?: string;
  variant?: LayoutVariant;
}

/**
 * Standardized Full Page Loader
 * To be used for page mount data loads and Next.js route transitions
 */
export function AdminPageLoadingState({
  title = 'Loading Operational Workstation',
  message = 'Fetching latest system configuration and live records...',
  description = 'Establishing secure cluster session and synchronizing state...',
  badge = 'ENTERPRISE SUITE',
  variant = 'standard',
}: AdminPageLoadingStateProps) {
  return (
    <AdminContentContainer variant={variant} className="space-y-6 pb-24 animate-in fade-in duration-150">
      {/* Pinned Header Skeleton Bar */}
      <div className="space-y-3 border-b border-border/60 pb-5">
        <div className="h-7 w-60 bg-muted/80 rounded-xl animate-pulse" />
        <div className="h-4 w-96 max-w-full bg-muted/50 rounded-lg animate-pulse" />
      </div>

      {/* Unified Center Card */}
      <AdminLoadingState
        title={title}
        message={message}
        description={description}
        badge={badge}
        size="lg"
        minHeight="min-h-[400px]"
      />
    </AdminContentContainer>
  );
}

export interface AdminTableLoaderProps {
  colSpan: number;
  title?: string;
  message?: string;
  className?: string;
}

/**
 * Standardized Table Row Loader
 * Placed within <tbody> for any data table when loading records
 */
export function AdminTableLoader({
  colSpan,
  title = 'Loading records...',
  message = 'Fetching latest operational datasets from database...',
  className,
}: AdminTableLoaderProps) {
  return (
    <tr>
      <td colSpan={colSpan} className={cn('h-64 text-center text-muted-foreground py-16', className)}>
        <div className="flex flex-col items-center justify-center space-y-3 max-w-sm mx-auto">
          <LoaderSpinner size="md" />
          <div className="font-bold text-foreground text-sm tracking-tight">{title}</div>
          <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>
        </div>
      </td>
    </tr>
  );
}

/**
 * Fullscreen Cluster Gateway Loader (Used for auth / session transitions)
 */
export function AdminFullscreenLoader({
  message = 'Securing cluster session...',
  badge = 'ZERO-TRUST GATEWAY',
}: {
  message?: string;
  badge?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background text-foreground antialiased">
      <div className="flex flex-col items-center gap-3 text-center p-6">
        <LoaderSpinner size="lg" className="mb-2" />
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono font-semibold tracking-wider uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span>{badge}</span>
        </div>
        <span className="text-xs font-semibold text-muted-foreground tracking-tight">{message}</span>
      </div>
    </div>
  );
}
