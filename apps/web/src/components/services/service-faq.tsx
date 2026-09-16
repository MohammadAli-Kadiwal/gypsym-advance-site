'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { ServiceFaq } from '@/lib/api';

interface ServiceFaqProps {
  faqs?: ServiceFaq[];
  serviceTitle: string;
}

export function ServiceFaqAccordion({ faqs, serviceTitle }: ServiceFaqProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  if (!faqs || faqs.length === 0) {
    return null;
  }

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="w-full py-8 sm:py-10 md:py-12">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#d9287c] uppercase">
            <span className="inline-block w-2 h-2 rounded-full bg-[#d9287c]" />
            <span>GOT QUESTIONS?</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-neutral-900 leading-[1.15] sm:leading-[1.12] whitespace-pre-line">
            Frequently Asked Questions About{' '}
            <span className="font-serif italic font-normal text-neutral-900">{serviceTitle}</span>
          </h2>
          <p className="text-base sm:text-lg text-neutral-700 leading-relaxed max-w-2xl mx-auto pt-1">
            Clear answers to common questions about our technical execution and delivery timelines.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="rounded-xl border border-neutral-200/80 bg-white overflow-hidden transition-all duration-200 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full py-4 sm:py-5 px-5 sm:px-6 text-left flex items-center justify-between gap-4 font-semibold text-neutral-900 hover:text-neutral-950 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base">{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 sm:w-5 sm:h-5 text-neutral-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-neutral-900' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 bg-neutral-50/30">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
