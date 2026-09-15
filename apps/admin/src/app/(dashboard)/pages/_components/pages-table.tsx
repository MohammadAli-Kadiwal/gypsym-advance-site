'use client';

import * as React from 'react';
import { ChevronRight, FileText, Loader2, LayoutGrid, Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { PageData } from './types';

export type PageSlug = 'home' | 'our-work';

interface PageEntry {
  slug: PageSlug;
  title: string;
  route: string;
  icon: React.ReactNode;
  layoutType: string;
  sectionCount: number;
  status: string;
}

interface PagesTableProps {
  pageData: PageData | null;
  ourWorkPageData: PageData | null;
  loading: boolean;
  onConfigure: (slug: PageSlug) => void;
}

export function PagesTable({ pageData, ourWorkPageData, loading, onConfigure }: PagesTableProps) {
  const pages: PageEntry[] = [
    {
      slug: 'home',
      title: 'Home',
      route: '/',
      icon: <LayoutGrid className="h-4 w-4" />,
      layoutType: pageData?.layoutType || 'LANDING',
      sectionCount: pageData?.sections?.length ?? 2,
      status: pageData?.status || 'PUBLISHED',
    },
    {
      slug: 'our-work',
      title: 'Portfolio',
      route: '/portfolio',
      icon: <Briefcase className="h-4 w-4" />,
      layoutType: ourWorkPageData?.layoutType || 'PORTFOLIO',
      sectionCount: ourWorkPageData?.sections?.length ?? 1,
      status: ourWorkPageData?.status || 'PUBLISHED',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eaedf3]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <span>Website Pages</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage registered public website pages and live section layouts.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />}
          <Badge
            variant="outline"
            className="text-xs font-mono bg-blue-50/60 text-blue-700 border-blue-200"
          >
            {pages.length} Active Pages
          </Badge>
        </div>
      </div>

      {/* Compact Shadcn Table */}
      <Card className="rounded-2xl border-slate-200/90 bg-white shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Page Directory
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {loading ? 'Syncing...' : 'Backend Database: Connected'}
          </span>
        </div>

        <Table>
          <TableHeader className="bg-slate-50/60">
            <TableRow className="border-b border-slate-100">
              <TableHead className="w-[300px] text-xs font-bold text-slate-600">
                Page Title &amp; Route
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-600">Layout</TableHead>
              <TableHead className="text-xs font-bold text-slate-600">Sections</TableHead>
              <TableHead className="text-xs font-bold text-slate-600">Status</TableHead>
              <TableHead className="text-right text-xs font-bold text-slate-600">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((page) => (
              <TableRow
                key={page.slug}
                onClick={() => onConfigure(page.slug)}
                className="cursor-pointer hover:bg-blue-50/40 transition-colors group"
              >
                <TableCell className="py-3.5">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {page.icon}
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                        {page.title}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">{page.route}</div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-3.5">
                  <Badge
                    variant="outline"
                    className="text-[10px] font-mono font-medium bg-slate-100 text-slate-700"
                  >
                    {page.layoutType}
                  </Badge>
                </TableCell>

                <TableCell className="py-3.5">
                  <span className="inline-flex items-center text-xs font-medium text-slate-700">
                    {page.sectionCount} Live Sections
                  </span>
                </TableCell>

                <TableCell className="py-3.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {page.status}
                  </span>
                </TableCell>

                <TableCell className="py-3.5 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onConfigure(page.slug);
                    }}
                    className="h-8 px-3 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl"
                  >
                    <span>Configure Sections</span>
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

