import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Cookie } from 'lucide-react';
import { JsonLd, buildBreadcrumbsSchema, buildWebPageSchema } from '@/components/seo/json-ld';
import { getSiteUrl } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Cookie Declaration & Tracking Policy | Gypsym Technology',
  description: 'Learn how Gypsym Technology utilizes cookies, analytics telemetry, and browser storage tokens in accordance with GDPR and ePrivacy directives.',
};

export default function CookieDeclarationPage() {
  const lastUpdated = 'September 22, 2026';

  const breadcrumbs = buildBreadcrumbsSchema([
    { name: 'Home', item: '/' },
    { name: 'Cookie Policy', item: '/cookies' },
  ]);

  const webPageSchema = buildWebPageSchema({
    name: 'Cookie Declaration & Tracking Policy | Gypsym Technology',
    description: 'Learn how Gypsym Technology utilizes cookies, analytics telemetry, and browser storage tokens in accordance with GDPR and ePrivacy directives.',
    url: `${getSiteUrl()}/cookies`,
  });

  const cookieCategories = [
    {
      name: 'Strictly Necessary Cookies',
      required: true,
      desc: 'Essential for technical operation, user authentication session persistence, load balancing routing, and CSRF attack prevention. These cannot be disabled.',
      examples: [
        { name: 'gypsym_session_id', purpose: 'Preserves encrypted user session attestation', expiry: 'Session' },
        { name: 'csrf_token', purpose: 'Prevents Cross-Site Request Forgery on forms', expiry: 'Session' },
        { name: 'cookie_consent', purpose: 'Stores visitor privacy consent preferences', expiry: '12 Months' },
      ],
    },
    {
      name: 'Performance & Analytics Cookies',
      required: false,
      desc: 'Enables measurement of aggregate visitor telemetry, edge CDN routing latency, and Core Web Vitals to optimize page responsiveness. No personal identifiers are logged.',
      examples: [
        { name: '_gyp_perf', purpose: 'Measures time-to-first-byte and edge render latency', expiry: '30 Days' },
        { name: '_cwv_metrics', purpose: 'Aggregates anonymous Largest Contentful Paint telemetry', expiry: 'Session' },
      ],
    },
    {
      name: 'Functional & Preferences Cookies',
      required: false,
      desc: 'Remembers user interface customizations such as active theme mode (dark / light), typography scale preferences, and geographic region selection.',
      examples: [
        { name: 'gypsym_theme', purpose: 'Remembers dark/light interface preference', expiry: '12 Months' },
        { name: 'gypsym_region', purpose: 'Remembers preferred regional office currency and market directory', expiry: '6 Months' },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-[#fcfcfb] text-neutral-900 pt-28 sm:pt-32 lg:pt-36 pb-20">
      <JsonLd data={breadcrumbs} />
      <JsonLd data={webPageSchema} />
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Gypsym Home</span>
          </Link>
        </div>

        {/* Header */}
        <header className="border-b border-neutral-200 pb-10 mb-12">
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60 text-xs font-mono font-semibold flex items-center gap-1.5">
              <Cookie className="w-3.5 h-3.5" />
              <span>ePrivacy & GDPR Disclosures</span>
            </span>
            <span className="text-xs font-mono text-neutral-400">
              Last Updated: {lastUpdated}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900">
            Cookie Declaration & Consent Policy
          </h1>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 max-w-3xl leading-relaxed">
            This declaration provides transparent information regarding browser cookies, local storage keys, and telemetry technologies utilized across Gypsym Technology platforms.
          </p>
        </header>

        {/* Categories */}
        <div className="space-y-10 mb-16">
          {cookieCategories.map((cat) => (
            <section
              key={cat.name}
              className="p-6 sm:p-8 rounded-2xl bg-white border border-neutral-200/90 shadow-xs space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">{cat.name}</h2>
                  <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-2xl leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-semibold self-start sm:self-auto shrink-0 ${
                    cat.required
                      ? 'bg-neutral-100 text-neutral-800 border border-neutral-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  }`}
                >
                  {cat.required ? 'Strictly Necessary' : 'Optional / Configurable'}
                </span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-neutral-200 text-neutral-400 uppercase text-[10px]">
                      <th className="pb-2 font-semibold">Cookie Identifier</th>
                      <th className="pb-2 font-semibold">Purpose & Function</th>
                      <th className="pb-2 font-semibold text-right">Retention Period</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-700">
                    {cat.examples.map((item) => (
                      <tr key={item.name}>
                        <td className="py-2.5 font-bold text-neutral-900">{item.name}</td>
                        <td className="py-2.5 font-sans pr-4">{item.purpose}</td>
                        <td className="py-2.5 text-right text-neutral-500 whitespace-nowrap">
                          {item.expiry}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>

        {/* Managing Preferences */}
        <section className="p-8 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-4">
          <h3 className="text-lg font-bold text-neutral-900">How to Manage Cookie Preferences</h3>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-3xl">
            You can modify your browser preferences at any time to block or alert you about specific cookies. However, disabling strictly necessary cookies may impair authentication states and high-availability routing across our services.
          </p>
          <div className="text-xs font-mono text-neutral-500 pt-2">
            Inquiries regarding cookie governance: <a href="mailto:security@gypsym.com" className="text-blue-600 underline">security@gypsym.com</a>
          </div>
        </section>
      </div>
    </main>
  );
}
