import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, CheckCircle2, Server, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Security, Trust & Certifications | Gypsym Technology',
  description: 'Enterprise Security Posture, ISO 27001 Certification, SOC 2 Type II Audit, and Zero-Trust Compliance Standards of Gypsym Technology.',
};

export default function TrustAndCertificationsPage() {
  const auditDate = 'Q3 2026';

  const certifications = [
    {
      title: 'ISO/IEC 27001:2022',
      badge: 'Certified Standard',
      desc: 'Comprehensive Information Security Management System (ISMS) governing infrastructure, staff security, access governance, and incident recovery.',
      status: 'Active & Verified',
      scope: 'Global Cloud Architecture & Development Operations',
    },
    {
      title: 'SOC 2 Type II Audited',
      badge: 'AICPA Standard',
      desc: 'Rigorous third-party evaluation covering Security, High Availability, and Confidentiality controls over a continuous 12-month audit window.',
      status: 'Unqualified Audit Opinion',
      scope: 'Enterprise Core Services & Client Dedicated Hosting',
    },
    {
      title: 'GDPR & EU Data Sovereignty',
      badge: 'Statutory Compliance',
      desc: 'Architectural compliance with European General Data Protection Regulation and cross-border data transfer requirements.',
      status: 'Fully Compliant',
      scope: 'Global Customer & Behavioral Telemetry',
    },
    {
      title: 'Shopify Plus Certified Partner',
      badge: 'E-Commerce Excellence',
      desc: 'Official verification of technical capabilities, large-scale storefront stability, and deep Liquid/Hydrogen framework engineering.',
      status: 'Accredited Partner',
      scope: 'Enterprise Storefront Implementations & Custom Apps',
    },
  ];

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
              <span>Enterprise Trust Center</span>
            </span>
            <span className="text-xs font-mono text-neutral-400">
              Audit Period: {auditDate}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900">
            Security, Compliance & Certifications
          </h1>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 max-w-3xl leading-relaxed">
            Gypsym Technology delivers zero-trust security architectures engineered for high-frequency e-commerce, institutional brands, and resilient cloud systems.
          </p>
        </header>

        {/* Certifications Grid */}
        <div className="space-y-8 mb-16">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">
            Official Accreditations & Standards
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certifications.map((cert) => (
              <div
                key={cert.title}
                className="p-6 rounded-2xl bg-white border border-neutral-200/90 shadow-xs space-y-4 hover:border-neutral-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded bg-neutral-100 text-neutral-700 text-[11px] font-mono font-semibold">
                    {cert.badge}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{cert.status}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900">{cert.title}</h3>
                  <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
                    {cert.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-100 text-[11px] font-mono text-neutral-400">
                  Audit Scope: <span className="text-neutral-700">{cert.scope}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Controls & Core Pillars */}
        <div className="space-y-8 mb-16">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">
            Zero-Trust Architectural Principles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-neutral-900 text-sm">Continuous Attestation</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                eBPF kernel-level session observability and hardware-backed cryptographic credentials guarantee zero session hijacking.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
                <Server className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-neutral-900 text-sm">Automated Patching</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Immutable container deployments, automated vulnerability scanning (SBOM), and sub-hour zero-day dependency remediation.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-neutral-900 text-sm">Edge Isolation</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Cloudflare Enterprise Edge WAF, rate limiting, bot intelligence, and volumetric DDoS mitigation absorbing 100+ Tbps.
              </p>
            </div>
          </div>
        </div>

        {/* Responsible Disclosure Contact */}
        <div className="p-8 rounded-2xl bg-neutral-900 text-white space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Vulnerability Disclosure & Bug Bounty</span>
          </div>
          <h3 className="text-xl font-bold">Reporting Security Vulnerabilities</h3>
          <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
            If you discover a potential security flaw in Gypsym platforms or client architectures, please notify our dedicated security response team under our responsible disclosure program.
          </p>
          <div className="pt-2">
            <a
              href="mailto:security@gypsym.com"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-neutral-900 text-xs font-bold hover:bg-neutral-100 transition-colors"
            >
              <span>Email: security@gypsym.com</span>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
