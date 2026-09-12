'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Cloud,
  Cpu,
  Network,
  Shield,
  ShieldCheck,
  TrendingUp,
  Zap,
  Layers,
  Radio,
  Server,
  Sparkles,
  Layout,
  Box,
  Palette,
  Globe,
  RefreshCw,
  Clock,
  Smartphone,
  ShoppingCart,
  GraduationCap,
  Calendar,
  Store,
  Home,
  LucideIcon,
} from 'lucide-react';
import { MegaMenuConfig } from '@/lib/cms-types';

const ICON_MAP: Record<string, LucideIcon> = {
  Cloud,
  Cpu,
  Network,
  Shield,
  ShieldCheck,
  TrendingUp,
  Zap,
  Layers,
  Radio,
  Server,
  Sparkles,
  Layout,
  Box,
  Palette,
  Globe,
  RefreshCw,
  Clock,
  Smartphone,
  ShoppingCart,
  GraduationCap,
  Calendar,
  Store,
  Home,
};

interface MegaMenuProps {
  config: MegaMenuConfig;
  isOpen: boolean;
  onClose: () => void;
}

export function MegaMenu({ config, isOpen, onClose }: MegaMenuProps) {
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !config.enabled) return null;

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label={`${config.category} Mega Menu`}
      className="absolute top-full left-0 right-0 w-full mt-3 rounded-2xl border border-neutral-200/80 bg-white text-neutral-900 shadow-[0_8px_40px_-4px_rgba(0,0,0,0.12)] z-50 overflow-hidden animate-in fade-in-0 zoom-in-[0.97] duration-150"
    >
      {/* Inner padding */}
      <div className="px-8 sm:px-10 pt-6 pb-5">
        {/* Category Label */}
        {config.category && (
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400 mb-4">
            {config.category}
          </p>
        )}

        {/* 2-Column Grid Items — matching reference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
          {config.items.map((item, idx) => {
            const Icon = (item.icon && ICON_MAP[item.icon]) || Sparkles;
            return (
              <Link
                key={idx}
                href={item.url}
                onClick={onClose}
                className="group flex items-start gap-3 px-2 py-2.5 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                {/* Square icon */}
                <div className="h-7 w-7 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-500 group-hover:bg-neutral-200 group-hover:text-neutral-800 transition-colors shrink-0 mt-0.5">
                  <Icon className="h-[13px] w-[13px]" strokeWidth={1.8} />
                </div>

                {/* Text — allow wrap, no truncation */}
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-neutral-900 leading-snug">
                    {item.title}
                  </p>
                  <p className="text-[11.5px] text-neutral-400 leading-snug mt-0.5 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Dark CTA Banner — padded inset */}
      {config.featuredCta && config.featuredCta.enabled && (
        <div className="px-5 sm:px-8 pb-5">
          <Link
            href={config.featuredCta.buttonUrl || '/contact'}
            onClick={onClose}
            className="flex items-center justify-between gap-6 bg-[#18181b] hover:bg-black px-6 sm:px-8 py-4 rounded-xl transition-colors group cursor-pointer"
          >
            {/* Left: text */}
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-white leading-snug">
                {config.featuredCta.title}
              </p>
              {config.featuredCta.description && (
                <p className="text-[11.5px] text-neutral-400 leading-snug mt-0.5">
                  {config.featuredCta.description}
                </p>
              )}
            </div>

            {/* Right: lime pill button */}
            {config.featuredCta.buttonText && (
              <span className="shrink-0 inline-flex items-center h-8 px-5 rounded-full bg-[#9ae625] text-neutral-950 text-[12px] font-semibold whitespace-nowrap group-hover:scale-105 transition-transform">
                {config.featuredCta.buttonText}
              </span>
            )}
          </Link>
        </div>
      )}
    </div>
  );
}
