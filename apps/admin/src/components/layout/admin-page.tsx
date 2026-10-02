'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, RefreshCw, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type LayoutVariant = 'standard' | 'wide' | 'full';

interface AdminContentContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: LayoutVariant;
  children: React.ReactNode;
}

/**
 * Standard content container enforcing uniform max-width and responsive padding across all inner admin pages.
 * - Standard: 1440px
 * - Wide: 1680px (for data tables, media library, logs)
 * - Full: 100%
 */
export function AdminContentContainer({
  variant = 'standard',
  className,
  children,
  ...props
}: AdminContentContainerProps) {
  const maxWidthClass = {
    standard: 'max-w-[1440px]',
    wide: 'max-w-[1680px]',
    full: 'max-w-none w-full',
  }[variant];

  return (
    <div
      className={cn('w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6', maxWidthClass, className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface AdminPageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  status?: React.ReactNode;
  tabs?: React.ReactNode;
  backHref?: string;
  onBack?: () => void;
  backLabel?: string;
  className?: string;
}

/**
 * Reusable Admin Page Header
 * Standardized title, description, responsive action placement, status pill, tabs.
 * STRICTLY NO BREADCRUMBS EVER.
 */
export function AdminPageHeader({
  title,
  description,
  actions,
  status,
  tabs,
  backHref,
  onBack,
  backLabel = 'Back',
  className,
}: AdminPageHeaderProps) {
  return (
    <div className={cn('space-y-4 border-b border-border/60 pb-5 sm:pb-6', className)}>
      {/* Optional Back Button (used only for deep nested sub-forms) */}
      {(backHref || onBack) && (
        <div className="flex items-center">
          {backHref ? (
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>{backLabel}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>{backLabel}</span>
            </button>
          )}
        </div>
      )}

      {/* Main Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
              {title}
            </h1>
            {status && <div className="shrink-0">{status}</div>}
          </div>
          {description && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Optional Tabs */}
      {tabs && <div className="pt-2">{tabs}</div>}
    </div>
  );
}

interface AdminToolbarProps {
  children?: React.ReactNode;
  search?: {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
  };
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Standardized CRUD Toolbar: search + filters + actions row
 */
export function AdminToolbar({
  children,
  search,
  actions,
  className,
}: AdminToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-card border border-border shadow-2xs',
        className
      )}
    >
      <div className="flex items-center gap-2.5 flex-1 flex-wrap">
        {search && (
          <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
            <input
              type="text"
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              placeholder={search.placeholder || 'Search records...'}
              className="w-full h-9 pl-3 pr-8 rounded-lg bg-background border border-input text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>
        )}
        {children}
      </div>

      {actions && (
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
}

interface AdminEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: LucideIcon;
  };
  className?: string;
}

/**
 * Standardized Empty State
 */
export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: AdminEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-border bg-card/50',
        className
      )}
    >
      {Icon && (
        <div className="p-3 rounded-full bg-muted text-muted-foreground mb-3">
          <Icon className="h-6 w-6 stroke-[1.5]" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {action && (
        action.href ? (
          <Button asChild size="sm" className="gap-1.5 cursor-pointer">
            <Link href={action.href}>
              {action.icon && <action.icon className="h-3.5 w-3.5" />}
              <span>{action.label}</span>
            </Link>
          </Button>
        ) : (
          <Button size="sm" onClick={action.onClick} className="gap-1.5 cursor-pointer">
            {action.icon && <action.icon className="h-3.5 w-3.5" />}
            <span>{action.label}</span>
          </Button>
        )
      )}
    </div>
  );
}

interface AdminErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Standardized Error State (safe, no stack traces or DB leakage)
 */
export function AdminErrorState({
  title = 'Unable to load content',
  message = 'An unexpected issue occurred while fetching data. Please try again.',
  onRetry,
  className,
}: AdminErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-xl border border-destructive/20 bg-destructive/5',
        className
      )}
    >
      <div className="p-3 rounded-full bg-destructive/10 text-destructive mb-3">
        <AlertCircle className="h-6 w-6 stroke-[1.5]" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-sm mb-4 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="gap-1.5 border-border hover:bg-muted cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Try Again</span>
        </Button>
      )}
    </div>
  );
}

interface AdminLoadingStateProps {
  message?: string;
  className?: string;
}

/**
 * Standardized Loading State
 */
export function AdminLoadingState({
  message = 'Loading data...',
  className,
}: AdminLoadingStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center rounded-xl border border-border bg-card/50',
        className
      )}
    >
      <div className="h-7 w-7 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
      <span className="text-xs font-medium text-muted-foreground">{message}</span>
    </div>
  );
}
