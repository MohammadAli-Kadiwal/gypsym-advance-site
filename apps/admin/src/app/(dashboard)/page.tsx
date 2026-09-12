'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  FileText,
  BookOpen,
  Building2,
  Layers,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { useCmsCollection } from '@/lib/store';

export default function DashboardPage() {
  const { data: pages } = useCmsCollection('pages');
  const { data: blogs } = useCmsCollection('blogs');
  const { data: media } = useCmsCollection('media');
  const { data: services } = useCmsCollection('services');

  const totalEntities = pages.length + blogs.length + services.length + media.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* 1. Welcome Banner (Clean & Focused) */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-100/80 bg-gradient-to-r from-purple-50/80 via-indigo-50/50 to-blue-50/60 p-6 sm:p-8 shadow-xs">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-100/90 text-purple-700 text-xs font-semibold shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-purple-600" />
            <span>Enterprise CMS Suite</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome back, Admin 👋
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Here is your daily operational summary, content health, and platform performance.
          </p>
        </div>
      </div>

      {/* 2. Top Metric Cards Row (4 Cards Matching Reference) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pages */}
        <Link
          href="/pages"
          className="group p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Pages
            </span>
            <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-blue-100 transition-colors">
              <FileText className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {pages.length}
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[11px]">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> +12.4%
              </span>
              <span className="text-[11px] text-slate-400 font-medium">vs last month</span>
            </div>
          </div>
        </Link>

        {/* Card 2: Articles */}
        <Link
          href="/editorial/blog"
          className="group p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Published Articles
            </span>
            <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-emerald-100 transition-colors">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {blogs.length}
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> +4.2%
              </span>
              <span className="text-[11px] text-slate-400 font-medium">overall indexed</span>
            </div>
          </div>
        </Link>

        {/* Card 3: Services */}
        <Link
          href="/content/services"
          className="group p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Practice Services
            </span>
            <div className="h-10 w-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-amber-100 transition-colors">
              <Layers className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {services.length}
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold text-[11px]">
                Active
              </span>
              <span className="text-[11px] text-slate-400 font-medium">solutions live</span>
            </div>
          </div>
        </Link>

        {/* Card 4: Clients & Alliances */}
        <Link
          href="/content/clients"
          className="group p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Client Marquee Strip
            </span>
            <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-blue-100 transition-colors">
              <Building2 className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              10
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[11px]">
                Active
              </span>
              <span className="text-[11px] text-slate-400 font-medium">marquee clients live</span>
            </div>
          </div>
        </Link>
      </div>

      {/* 3. Lower Row: Telemetry Chart & Content Structure Breakdown (Matching Reference) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Traffic & Publishing Velocity (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Traffic & Publishing Velocity
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Monthly visitor requests and editorial release trend
              </p>
            </div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live System</span>
            </div>
          </div>

          {/* SVG Telemetry Chart */}
          <div className="pt-4 pb-2">
            <div className="h-48 w-full relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal grid lines */}
                <line x1="0" y1="30" x2="600" y2="30" stroke="#f1f5f9" strokeDasharray="3 3" strokeWidth="1" />
                <line x1="0" y1="80" x2="600" y2="80" stroke="#f1f5f9" strokeDasharray="3 3" strokeWidth="1" />
                <line x1="0" y1="130" x2="600" y2="130" stroke="#f1f5f9" strokeDasharray="3 3" strokeWidth="1" />

                {/* Shaded Area */}
                <path
                  d="M 0 160 Q 100 140, 180 90 T 320 110 T 450 40 T 600 65 L 600 170 L 0 170 Z"
                  fill="url(#areaGradient)"
                />

                {/* Smooth Curve Line */}
                <path
                  d="M 0 160 Q 100 140, 180 90 T 320 110 T 450 40 T 600 65"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Interactive Highlight Nodes */}
                <circle cx="180" cy="90" r="4" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                <circle cx="450" cy="40" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                <circle cx="600" cy="65" r="4" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
              </svg>
            </div>

            {/* X-Axis labels */}
            <div className="flex justify-between text-[11px] font-medium text-slate-400 pt-2 border-t border-slate-100 px-1">
              <span>Jan</span>
              <span>Mar</span>
              <span>May</span>
              <span>Jul</span>
              <span>Sep</span>
              <span>Nov</span>
              <span>Dec</span>
            </div>
          </div>
        </div>

        {/* Right: Content Structure Breakdown (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Content Structure Breakdown
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Entities registered in Gypsym database
            </p>
          </div>

          {/* Donut Chart Visual */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative h-40 w-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="12"
                />
                {/* Pages Segment (Blue) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#3b82f6"
                  strokeWidth="12"
                  strokeDasharray="251.2"
                  strokeDashoffset="100"
                  strokeLinecap="round"
                />
                {/* Articles Segment (Green) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="12"
                  strokeDasharray="251.2"
                  strokeDashoffset="180"
                  strokeLinecap="round"
                />
                {/* Services Segment (Amber) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="12"
                  strokeDasharray="251.2"
                  strokeDashoffset="225"
                  strokeLinecap="round"
                />
              </svg>

              {/* Center Content */}
              <div className="absolute flex flex-col items-center text-center">
                <span className="text-2xl font-extrabold text-slate-900">
                  {totalEntities}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Total Items
                </span>
              </div>
            </div>
          </div>

          {/* Legend Matching Reference */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50">
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span className="text-slate-600 font-medium">Pages</span>
              </div>
              <span className="font-bold text-slate-900">{pages.length}</span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50">
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600 font-medium">Articles</span>
              </div>
              <span className="font-bold text-slate-900">{blogs.length}</span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50">
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-600 font-medium">Services</span>
              </div>
              <span className="font-bold text-slate-900">{services.length}</span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50">
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                <span className="text-slate-600 font-medium">Media</span>
              </div>
              <span className="font-bold text-slate-900">{media.length > 0 ? media.length : '420'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
