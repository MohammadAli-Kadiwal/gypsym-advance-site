'use client';

import * as React from 'react';
import Link from 'next/link';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { ServicePriceTier } from '@/lib/api';

interface ServicePricingProps {
  pricing?: ServicePriceTier[];
  serviceTitle: string;
}

export function ServicePricingSection({ pricing, serviceTitle }: ServicePricingProps) {
  const [selectedCurrency, setSelectedCurrency] = React.useState<'USD' | 'GBP' | 'AED'>('USD');

  if (!pricing || pricing.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-8 sm:py-10 md:py-12">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#d9287c] uppercase">
            <span className="inline-block w-2 h-2 rounded-full bg-[#d9287c]" />
            <span>TRANSPARENT PRICING</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-neutral-900 leading-[1.15] sm:leading-[1.12] whitespace-pre-line">
            Investment Tiers for{' '}
            <span className="font-serif italic font-normal text-neutral-900">{serviceTitle}</span>
          </h2>
          <p className="text-base sm:text-lg text-neutral-700 leading-relaxed max-w-2xl mx-auto pt-1">
            No surprise invoices. Choose a fixed-scope milestone or scalable engineering tier.
          </p>

          {/* Currency Toggle Switcher */}
          <div className="mt-6 inline-flex items-center p-1 rounded-xl bg-neutral-100 border border-neutral-200/80">
            {(['USD', 'GBP', 'AED'] as const).map((curr) => {
              const isActive = selectedCurrency === curr;
              return (
                <button
                  key={curr}
                  type="button"
                  onClick={() => setSelectedCurrency(curr)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {curr === 'USD' ? 'USD ($)' : curr === 'GBP' ? 'GBP (£)' : 'AED (د.إ)'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {pricing.map((tier, idx) => {
            const priceObj =
              tier.prices.find((p) => p.currency === selectedCurrency) || tier.prices[0];
            const isPopular = tier.isPopular;

            return (
              <div
                key={idx}
                className={`relative flex flex-col justify-between rounded-2xl p-6 sm:p-8 transition-all duration-300 ${
                  isPopular
                    ? 'bg-neutral-950 text-white shadow-xl shadow-neutral-950/15 border-2 border-neutral-900 md:-translate-y-2'
                    : 'bg-white text-neutral-900 border border-neutral-200/90 shadow-sm hover:border-neutral-300'
                }`}
              >
                {/* Popular Pill */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500 text-neutral-950 text-[11px] font-bold tracking-wider uppercase shadow-sm">
                    <Sparkles className="w-3 h-3" />
                    <span>Most Popular</span>
                  </div>
                )}

                <div>
                  {/* Tier Title & Description */}
                  <h3 className={`text-xl font-bold ${isPopular ? 'text-white' : 'text-neutral-900'}`}>
                    {tier.name}
                  </h3>
                  <p
                    className={`mt-2 text-xs sm:text-sm leading-relaxed min-h-[40px] ${
                      isPopular ? 'text-neutral-300' : 'text-neutral-600'
                    }`}
                  >
                    {tier.description}
                  </p>

                  {/* Price Display */}
                  <div className="mt-6 pt-5 border-t border-current/10 flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                      {priceObj ? `${priceObj.symbol}${priceObj.amount}` : 'Custom'}
                    </span>
                    {priceObj?.period && (
                      <span
                        className={`text-xs sm:text-sm font-medium ${
                          isPopular ? 'text-neutral-400' : 'text-neutral-500'
                        }`}
                      >
                        {priceObj.period}
                      </span>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="mt-6 space-y-2.5">
                    <p
                      className={`text-[11px] font-semibold tracking-wider uppercase ${
                        isPopular ? 'text-neutral-400' : 'text-neutral-500'
                      }`}
                    >
                      Included Deliverables
                    </p>
                    <ul className="space-y-2 text-xs sm:text-[13px]">
                      {tier.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5">
                          <Check
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              isPopular ? 'text-emerald-400' : 'text-emerald-600'
                            }`}
                          />
                          <span className={isPopular ? 'text-neutral-200' : 'text-neutral-700'}>
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="mt-8 pt-6 border-t border-current/10">
                  <Link
                    href={`/book?service=${encodeURIComponent(serviceTitle)}&tier=${encodeURIComponent(
                      tier.name
                    )}`}
                    className={`w-full py-3 sm:py-3.5 px-4 rounded-xl text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                      isPopular
                        ? 'bg-white text-neutral-950 hover:bg-neutral-100 shadow-md'
                        : 'bg-neutral-900 text-white hover:bg-neutral-800'
                    }`}
                  >
                    <span>Get Started with {tier.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
