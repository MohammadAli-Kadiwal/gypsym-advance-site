'use client';

import * as React from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import type { BlogFaqItem } from '@/lib/api';

export function getDefaultBlogFaqs(articleTitle: string): BlogFaqItem[] {
  const cleanTitle = articleTitle?.trim() || 'this publication';
  return [
    {
      question: `What are the primary architectural takeaways from "${cleanTitle}"?`,
      answer: `This publication presents production-verified engineering strategies, performance benchmarks, and architectural paradigms designed to scale enterprise digital operations with zero downtime and high fault tolerance.`,
    },
    {
      question: `How does Gypsym assist enterprise teams with these technologies?`,
      answer: `Our Senior Technical Fellows and Principal Engineers collaborate directly with client teams to conduct architectural audits, implement modernization pipelines, and ensure seamless production deployments.`,
    },
    {
      question: `Can these methodologies be integrated into our existing legacy systems?`,
      answer: `Yes. We specialize in incremental modernization and decoupled service architectures, enabling teams to adopt modern engineering advantages without risky and disruptive re-platforming.`,
    },
    {
      question: `How can our engineering leadership schedule a technical consultation?`,
      answer: `You can reach our engineering desk via the contact form or reserve a dedicated discovery session on our advisory calendar.`,
    },
  ];
}

interface BlogFaqAccordionProps {
  faqs?: BlogFaqItem[];
  articleTitle?: string;
}

export function BlogFaqAccordion({ faqs, articleTitle }: BlogFaqAccordionProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const activeFaqs = faqs && faqs.length > 0 ? faqs : getDefaultBlogFaqs(articleTitle || '');

  // Filter out any empty items
  const validFaqs = activeFaqs.filter(
    (f) =>
      (f.question && f.question.trim().length > 0) ||
      ((f as any).q && String((f as any).q).trim().length > 0)
  );

  if (validFaqs.length === 0) {
    return null;
  }

  const toggle = (idx: number) => {
    setOpenIndex((curr) => (curr === idx ? null : idx));
  };

  return (
    <section
      className="mt-12 pt-8 sm:pt-10 border-t border-neutral-200/80 dark:border-neutral-800"
      aria-label="Frequently Asked Questions"
    >
      <div className="mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#d9287c] uppercase mb-2">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Technical FAQ</span>
        </div>
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white leading-tight">
          Frequently Asked Questions
        </h3>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1.5 leading-relaxed">
          Key architectural and technical clarifications regarding{' '}
          <span className="font-medium text-neutral-800 dark:text-neutral-200">
            {articleTitle || 'this publication'}
          </span>
          .
        </p>
      </div>

      <div className="space-y-3.5">
        {validFaqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          const question = faq.question || (faq as any).q || '';
          const answer = faq.answer || (faq as any).a || '';
          const faqId = `blog-faq-panel-${idx}`;
          const buttonId = `blog-faq-button-${idx}`;

          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                isOpen
                  ? 'border-[#d9287c]/30 bg-white dark:bg-neutral-900/95 ring-1 ring-[#d9287c]/10'
                  : 'border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/70 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={faqId}
                onClick={() => toggle(idx)}
                className="w-full py-4 sm:py-4.5 px-5 sm:px-6 text-left flex items-center justify-between gap-4 font-semibold text-neutral-900 dark:text-white hover:text-[#d9287c] dark:hover:text-[#d9287c] transition-colors focus:outline-none cursor-pointer"
              >
                <span className="text-sm sm:text-base leading-snug">{question}</span>
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isOpen
                      ? 'bg-[#d9287c]/10 text-[#d9287c]'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#d9287c]' : ''
                    }`}
                  />
                </span>
              </button>

              {isOpen && (
                <div
                  id={faqId}
                  role="region"
                  aria-labelledby={buttonId}
                  className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed border-t border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/40 dark:bg-neutral-950/20 whitespace-pre-line"
                >
                  {answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

