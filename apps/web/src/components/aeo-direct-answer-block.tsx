import * as React from 'react';
import { PublicAeoItem } from '@/lib/api/seo';

interface AeoDirectAnswerBlockProps {
  items: PublicAeoItem[];
  title?: string;
  eyebrow?: string;
}

/**
 * AEO (Answer Engine Optimization) Direct Answer Block.
 * Renders concise, high-authority Q&A semantically for AI answer engines,
 * voice search, and human readers. Fully dynamic and database-driven.
 */
export function AeoDirectAnswerBlock({
  items,
  title = 'Direct Insights & Architecture Answers',
  eyebrow = 'ANSWER ENGINE OPTIMIZATION',
}: AeoDirectAnswerBlockProps) {
  if (!items || items.length === 0) return null;

  // JSON-LD FAQPage schema generation for answer engines
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.detailedAnswer ? `${item.shortAnswer} ${item.detailedAnswer}` : item.shortAnswer,
      },
    })),
  };

  return (
    <section
      aria-label="Direct Architectural Answers"
      className="w-full py-12 sm:py-16 bg-white dark:bg-card border-y border-neutral-200/80 dark:border-border"
    >
      {/* Semantic JSON-LD for Answer Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 md:px-8">
        {eyebrow && (
          <div className="flex items-center space-x-2 text-[11px] font-mono tracking-widest uppercase text-blue-600 dark:text-blue-400 font-semibold mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
            <span>{eyebrow}</span>
          </div>
        )}

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mb-8">
          {title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <article
              key={item.id}
              className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/90 dark:border-neutral-800 space-y-3"
            >
              <div className="flex items-center justify-between text-xs text-neutral-500 font-mono">
                {item.topic && <span className="uppercase tracking-wider font-semibold">{item.topic}</span>}
                {item.entity && <span className="text-[10px] bg-neutral-200/70 dark:bg-neutral-800 px-2 py-0.5 rounded">{item.entity}</span>}
              </div>

              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                {item.question}
              </h3>

              {/* Direct Concise Answer */}
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 leading-relaxed bg-white dark:bg-neutral-950 p-3.5 rounded-xl border border-blue-500/20 shadow-2xs">
                <span className="font-semibold text-blue-600 dark:text-blue-400 mr-1.5">Direct Answer:</span>
                {item.shortAnswer}
              </p>

              {/* Detailed Supporting Explanation */}
              {item.detailedAnswer && (
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed pt-1">
                  {item.detailedAnswer}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
