import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Gypsym Technology',
  description: 'Enterprise Data Protection, GDPR Compliance, and Global Sovereignty Governance for Gypsym Technology clients.',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'September 22, 2026';

  return (
    <main className="min-h-screen bg-[#fcfcfb] text-neutral-900 pt-28 sm:pt-32 lg:pt-36 pb-20">
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
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-mono font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>GDPR & CCPA Compliant</span>
            </span>
            <span className="text-xs font-mono text-neutral-400">
              Last Revised: {lastUpdated}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900">
            Privacy Policy & Data Sovereignty
          </h1>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 max-w-3xl leading-relaxed">
            Gypsym Technology Inc. is dedicated to protecting client confidential data, high-frequency commerce telemetry, and operational intelligence through zero-trust architectures and strict compliance standards.
          </p>
        </header>

        {/* Content Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Quick Nav / Table of Contents */}
          <aside className="lg:col-span-4 order-2 lg:order-1">
            <div className="sticky top-28 p-6 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-4">
              <h3 className="text-xs font-mono font-bold tracking-wider text-neutral-400 uppercase">
                Table of Contents
              </h3>
              <nav className="space-y-2 text-xs font-medium text-neutral-600">
                <a href="#section-1" className="block hover:text-neutral-900 transition-colors">
                  1. Corporate Commitment & Scope
                </a>
                <a href="#section-2" className="block hover:text-neutral-900 transition-colors">
                  2. Information We Collect & Process
                </a>
                <a href="#section-3" className="block hover:text-neutral-900 transition-colors">
                  3. Legal Basis for Processing (GDPR/CCPA)
                </a>
                <a href="#section-4" className="block hover:text-neutral-900 transition-colors">
                  4. Cryptographic Standards & Storage
                </a>
                <a href="#section-5" className="block hover:text-neutral-900 transition-colors">
                  5. Subprocessors & Cloud Infrastructure
                </a>
                <a href="#section-6" className="block hover:text-neutral-900 transition-colors">
                  6. Client Data Rights & Portability
                </a>
                <a href="#section-7" className="block hover:text-neutral-900 transition-colors">
                  7. Data Protection Officer (DPO) Contact
                </a>
              </nav>

              <div className="pt-4 border-t border-neutral-200/60 text-[11px] text-neutral-500 space-y-1">
                <p>Enterprise Legal Entity:</p>
                <p className="font-mono text-neutral-800 font-semibold">Gypsym Technology Inc.</p>
                <p>Registration: Delaware, US</p>
              </div>
            </div>
          </aside>

          {/* Legal Text */}
          <article className="lg:col-span-8 order-1 lg:order-2 space-y-10 text-sm sm:text-base text-neutral-700 leading-relaxed font-sans">
            <section id="section-1" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900 flex items-center gap-2">
                <span>1. Corporate Commitment & Scope</span>
              </h2>
              <p>
                This Privacy Policy establishes how Gypsym Technology Inc. (&quot;Gypsym&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) handles proprietary source code, e-commerce transactions, operational telemetry, and personal information collected when you access our platforms, engage our senior engineering services, or interact with our digital infrastructure.
              </p>
              <p>
                Our core operational principle is data minimization: we never monetize, sell, or disclose proprietary client architectural code or customer behavioral data to unverified third parties.
              </p>
            </section>

            <section id="section-2" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900 flex items-center gap-2">
                <span>2. Information We Collect & Process</span>
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-neutral-900">Technical Credentials & API Tokens:</strong> Scoped OAuth tokens, webhook secrets, and encrypted repository access keys necessary to perform storefront deployment and cloud orchestration.
                </li>
                <li>
                  <strong className="text-neutral-900">Engagement & Advisory Communications:</strong> Direct architectural requirements, SLA preferences, discovery schedules, and enterprise inquiries submitted through our verified portal.
                </li>
                <li>
                  <strong className="text-neutral-900">Telemetry & Performance Logs:</strong> Server response timings, edge CDN cache hit ratios, and anonymous error traces required to guarantee 99.99% system availability.
                </li>
              </ul>
            </section>

            <section id="section-3" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900 flex items-center gap-2">
                <span>3. Legal Basis for Processing (GDPR & CCPA)</span>
              </h2>
              <p>
                We process personal information under the following statutory grounds:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl border border-neutral-200 bg-white">
                  <div className="font-semibold text-neutral-900 text-xs font-mono uppercase mb-1">
                    Contractual Necessity
                  </div>
                  <p className="text-xs text-neutral-600">
                    Executing Master Service Agreements (MSAs), delivering engineering milestones, and fulfilling client SLAs.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-neutral-200 bg-white">
                  <div className="font-semibold text-neutral-900 text-xs font-mono uppercase mb-1">
                    Legitimate Interest
                  </div>
                  <p className="text-xs text-neutral-600">
                    Maintaining zero-trust perimeter defense, mitigating DDoS vectors, and auditing infrastructural integrity.
                  </p>
                </div>
              </div>
            </section>

            <section id="section-4" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900 flex items-center gap-2">
                <span>4. Cryptographic Standards & Storage</span>
              </h2>
              <p>
                All data at rest is secured via AES-256-GCM encryption with automated KMS key rotation. All communications in-transit require mandatory TLS 1.3 encryption with strict HSTS preloading.
              </p>
              <p>
                Access to client repositories and cloud environments is enforced via continuous cryptographic session attestation and hardware security key (FIDO2/WebAuthn) multi-factor authentication.
              </p>
            </section>

            <section id="section-5" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900 flex items-center gap-2">
                <span>5. Subprocessors & Cloud Infrastructure</span>
              </h2>
              <p>
                Gypsym partners exclusively with ISO 27001 and SOC 2 Type II certified cloud providers located in the United States and the European Economic Area:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                <li>Amazon Web Services (AWS) — Core Cloud Infrastructure & Encrypted Compute</li>
                <li>Cloudflare Enterprise — Global Edge Anycast Network & WAF Protection</li>
                <li>GitHub Enterprise — Secure Source Code Versioning & Audit Logging</li>
              </ul>
            </section>

            <section id="section-6" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900 flex items-center gap-2">
                <span>6. Client Data Rights & Portability</span>
              </h2>
              <p>
                Under applicable regional statutes (including GDPR Chapter III and CCPA §1798.100), you have the right to inspect, export, correct, or permanently delete personal records retained in our active databases.
              </p>
              <p>
                Data export requests are fulfilled in standard machine-readable formats (JSON/CSV) within 30 calendar days upon identity verification.
              </p>
            </section>

            <section id="section-7" className="space-y-3 pt-4 border-t border-neutral-200">
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900 flex items-center gap-2">
                <span>7. Data Protection Officer (DPO) Contact</span>
              </h2>
              <p>
                For questions concerning our data sovereignty frameworks or to exercise statutory privacy rights, contact our Data Protection Officer directly:
              </p>
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-mono space-y-1">
                <div>Email: <a href="mailto:security@gypsym.com" className="text-blue-600 underline">security@gypsym.com</a></div>
                <div>Alternative: <a href="mailto:contact@gypsym.com" className="text-blue-600 underline">contact@gypsym.com</a></div>
                <div>Postal Address: Gypsym Technology Inc., 175 Varick Street, 8th Floor, New York, NY 10014, USA</div>
              </div>
            </section>
          </article>
        </div>
      </div>
    </main>
  );
}
