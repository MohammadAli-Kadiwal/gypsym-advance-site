'use client';

import * as React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Check, 
  ShoppingBag, 
  Layout, 
  Search, 
  ShieldCheck, 
  Sliders, 
  Zap, 
  Rocket, 
  Layers,
  Sparkles
} from 'lucide-react';
import { ServiceItemDto } from '@/lib/api';

const ICON_MAP: Record<string, React.ElementType> = {
  ShoppingBag,
  Layout,
  Search,
  ShieldCheck,
  Sliders,
  Zap,
  Rocket,
  Layers,
};

interface ServicesFilterGridProps {
  services: ServiceItemDto[];
  showFilter?: boolean;
}

export function ServicesFilterGrid({ services, showFilter = false }: ServicesFilterGridProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return ['all', ...Array.from(set)];
  }, [services]);

  const filteredServices = React.useMemo(() => {
    if (!showFilter || selectedCategory === 'all') return services;
    return services.filter((s) => s.category?.toLowerCase() === selectedCategory.toLowerCase());
  }, [services, selectedCategory, showFilter]);

  return (
    <div className="w-full">
      {/* Category Filter Pills (hidden by default per user specification) */}
      {showFilter && (
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-8 sm:mb-10">
          {categories.map((cat) => {
            const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
            const label = cat === 'all' ? 'All Services' : cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-md shadow-neutral-900/10 scale-102'
                    : 'bg-neutral-100/90 text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Services Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
        {filteredServices.map((service) => {
          const IconComponent = ICON_MAP[service.iconName || 'Layers'] || Layers;
          const starterPrice = service.pricing?.[0]?.prices?.find((p) => p.currency === 'USD');

          return (
            <div
              key={service.slug}
              className="group relative flex flex-col justify-between rounded-2xl bg-white border border-neutral-200/80 p-6 sm:p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_36px_-6px_rgba(0,0,0,0.08)] hover:border-neutral-300 transition-all duration-300 hover:-translate-y-1"
            >
              <div>
                {/* Header: Icon & Category Badge */}
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 group-hover:bg-neutral-900 group-hover:text-white transition-colors duration-300">
                    <IconComponent className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  {service.category && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-neutral-100 text-neutral-600">
                      {service.category}
                    </span>
                  )}
                </div>

                {/* Service Title */}
                <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 group-hover:text-neutral-950 transition-colors">
                  <Link href={`/services/${service.slug}`} className="focus:outline-none">
                    <span className="absolute inset-0" aria-hidden="true" />
                    {service.title}
                  </Link>
                </h3>

                {/* Tagline / Short Description */}
                <p className="mt-2.5 text-sm sm:text-[15px] leading-relaxed text-neutral-600 line-clamp-3">
                  {service.tagline || service.shortDescription}
                </p>

                {/* Key Deliverables Bullet Points */}
                {service.keyFeatures && service.keyFeatures.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-neutral-100 space-y-2">
                    <p className="text-xs font-semibold tracking-wider uppercase text-neutral-600">
                      What's Included
                    </p>
                    <ul className="space-y-1.5">
                      {service.keyFeatures.slice(0, 3).map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs sm:text-[13px] text-neutral-600">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Card Footer: Starting Price & Link */}
              <div className="mt-7 pt-4 border-t border-neutral-100 flex items-center justify-between">
                <div>
                  {starterPrice ? (
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-neutral-600 font-medium block">Starting from</span>
                      <span className="text-base font-bold text-neutral-900">
                        {starterPrice.symbol}{starterPrice.amount}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-neutral-600 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Custom Scope</span>
                    </div>
                  )}
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-900 group-hover:translate-x-1 transition-transform duration-300">
                  <span>Explore</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
