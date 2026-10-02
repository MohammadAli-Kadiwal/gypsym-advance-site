import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { JsonLd, buildBreadcrumbsSchema, buildWebPageSchema } from '@/components/seo/json-ld';
import { getSiteUrl } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Terms of Service | Gypsym Technology',
  description: 'Enterprise Master Service Agreement, Intellectual Property Ownership, and Commercial Terms of Gypsym Technology Inc.',
};

export default function TermsOfServicePage() {
  const lastUpdated = 'September 22, 2026';

  const breadcrumbs = buildBreadcrumbsSchema([
    { name: 'Home', item: '/' },
    { name: 'Terms of Service', item: '/terms' },
  ]);

  const webPageSchema = buildWebPageSchema({
    name: 'Terms of Service & Master Engineering Agreement | Gypsym Technology',
    description: 'Enterprise Master Service Agreement, Intellectual Property Ownership, and Commercial Terms of Gypsym Technology Inc.',
    url: `${getSiteUrl()}/terms`,
  });

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
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 text-xs font-mono font-semibold flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Master Engineering Agreement</span>
            </span>
            <span className="text-xs font-mono text-neutral-400">
              Effective Date: {lastUpdated}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900">
            Terms of Service & Engineering Covenant
          </h1>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 max-w-3xl leading-relaxed">
            These terms govern enterprise engagements, customized Liquid / Hydrogen development, cloud architecture retainers, and use of digital services delivered by Gypsym Technology Inc.
          </p>
        </header>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Quick Nav */}
          <aside className="lg:col-span-4 order-2 lg:order-1">
            <div className="sticky top-28 p-6 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-4">
              <h3 className="text-xs font-mono font-bold tracking-wider text-neutral-400 uppercase">
                Contractual Sections
              </h3>
              <nav className="space-y-2 text-xs font-medium text-neutral-600">
                <a href="#terms-1" className="block hover:text-neutral-900 transition-colors">
                  1. Scope of Engagement & SOWs
                </a>
                <a href="#terms-2" className="block hover:text-neutral-900 transition-colors">
                  2. Intellectual Property Rights
                </a>
                <a href="#terms-3" className="block hover:text-neutral-900 transition-colors">
                  3. Service Level Agreements (SLAs)
                </a>
                <a href="#terms-4" className="block hover:text-neutral-900 transition-colors">
                  4. Confidentiality & Non-Disclosure
                </a>
                <a href="#terms-5" className="block hover:text-neutral-900 transition-colors">
                  5. Payment Terms & Milestone Acceptance
                </a>
                <a href="#terms-6" className="block hover:text-neutral-900 transition-colors">
                  6. Limitation of Liability
                </a>
                <a href="#terms-7" className="block hover:text-neutral-900 transition-colors">
                  7. Governing Law & Jurisdiction
                </a>
              </nav>

              <div className="pt-4 border-t border-neutral-200/60 text-[11px] text-neutral-500 space-y-1">
                <p>Corporate Headquarters:</p>
                <p className="font-mono text-neutral-800 font-semibold">175 Varick St, 8th Fl, New York, NY</p>
                <p>Governing Law: Delaware, USA</p>
              </div>
            </div>
          </aside>

          {/* Legal Clauses */}
          <article className="lg:col-span-8 order-1 lg:order-2 space-y-10 text-sm sm:text-base text-neutral-700 leading-relaxed font-sans">
            <section id="terms-1" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
                1. Scope of Engagement & Statements of Work
              </h2>
              <p>
                Gypsym Technology Inc. executes enterprise software engineering services pursuant to Statements of Work (&quot;SOW&quot;) executed between Gypsym and client organizations. Each SOW defines deliverables, acceptance criteria, milestone timelines, and fee schedules.
              </p>
              <p>
                Any conflict between these general Terms of Service and an executed SOW shall be resolved in favor of the terms articulated in the specific SOW.
              </p>
            </section>

            <section id="terms-2" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
                2. Intellectual Property Rights & Sovereign Ownership
              </h2>
              <p>
                <strong className="text-neutral-900">Client Work Product:</strong> Upon full payment of applicable fees, all custom source code, Liquid themes, headless storefront templates, and domain-specific algorithms authored exclusively for the Client become the exclusive intellectual property of the Client.
              </p>
              <p>
                <strong className="text-neutral-900">Pre-Existing Gypsym Core:</strong> Gypsym retains proprietary ownership in its reusable developer frameworks, boilerplate scaffolds, and modular utility libraries. Gypsym grants the Client a perpetual, royalty-free, worldwide license to utilize these embedded utilities as part of their production deployment.
              </p>
            </section>

            <section id="terms-3" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
                3. Service Level Agreements (SLAs)
              </h2>
              <p>
                Clients under dedicated monthly engineering retainers receive guaranteed service availability and response SLAs:
              </p>
              <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-1.5">
                  <span className="font-semibold text-neutral-800">Priority 1 (Storefront Down / Revenue Impairment)</span>
                  <span className="font-mono font-bold text-emerald-600">&lt; 30 minutes</span>
                </div>
                <div className="flex items-center justify-between border-b border-neutral-100 pb-1.5">
                  <span className="font-semibold text-neutral-800">Priority 2 (Degraded Performance / Checkout Bug)</span>
                  <span className="font-mono font-bold text-blue-600">&lt; 2 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-800">Priority 3 (Feature Enhancements / Non-Critical Tasks)</span>
                  <span className="font-mono font-bold text-neutral-600">&lt; 1 business day</span>
                </div>
              </div>
            </section>

            <section id="terms-4" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
                4. Confidentiality & Non-Disclosure
              </h2>
              <p>
                Both parties agree to hold all non-public technical documentation, system architectures, trade secrets, and business metrics in strict confidence. Such obligations survive termination of the commercial engagement for a minimum period of five (5) years.
              </p>
            </section>

            <section id="terms-5" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
                5. Payment Terms & Milestone Acceptance
              </h2>
              <p>
                Invoices for milestone deliverables are payable within thirty (30) calendar days from receipt unless otherwise specified. Deliverables are deemed accepted if no substantive deficiency notice is submitted within fourteen (14) calendar days following deployment to staging environments.
              </p>
            </section>

            <section id="terms-6" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
                6. Limitation of Liability
              </h2>
              <p>
                Except for breaches of confidentiality or gross negligence, neither party shall be liable for indirect, incidental, or consequential damages. Aggregate liability under any claim arising from an SOW shall not exceed the fees actually paid to Gypsym under that specific SOW during the preceding twelve (12) months.
              </p>
            </section>

            <section id="terms-7" className="space-y-3 pt-4 border-t border-neutral-200">
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
                7. Governing Law & Jurisdiction
              </h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to conflicts of law provisions.
              </p>
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-mono">
                Legal Notice Contact: <a href="mailto:contact@gypsym.com" className="text-blue-600 underline">contact@gypsym.com</a>
              </div>
            </section>
          </article>
        </div>
      </div>
    </main>
  );
}
