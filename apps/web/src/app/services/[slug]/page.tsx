import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  ArrowUpRight, 
  Check, 
  ArrowRight, 
  Workflow, 
  CheckCircle2 
} from 'lucide-react';
import { getServiceBySlug, getServices, getPageBySlug } from '@/lib/api';
import { ServicePricingSection } from '@/components/services/service-pricing';
import { ServiceFaqAccordion } from '@/components/services/service-faq';
import { CtaSection } from '@/components/cms/cta-section';
import { PageSectionDto } from '@/lib/cms-types';
import { SubpageHero } from '@/components/ui/subpage-hero';

export const dynamic = 'force-dynamic';

interface ServicePageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const service = await getServiceBySlug(params.slug);
  if (!service) {
    return {
      title: 'Service Not Found | Gypsym Technology',
    };
  }

  return {
    title: `${service.title} | Shopify Plus Services | Gypsym Technology`,
    description: service.tagline || service.shortDescription,
    openGraph: {
      title: `${service.title} | Gypsym Technology`,
      description: service.tagline || service.shortDescription,
      images: [{ url: '/assets/editorial/agency-hero-editorial.png' }],
    },
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const [service, allServices, homePage] = await Promise.all([
    getServiceBySlug(params.slug),
    getServices(),
    getPageBySlug('home'),
  ]);

  if (!service) {
    notFound();
  }

  // Filter out current service for "Other Services" section
  const otherServices = allServices.filter((s) => s.slug !== service.slug);

  const rawCtaSection = homePage?.sections?.find(
    (s: any) => s.componentType === 'CTA' || s.sectionIdentifier === 'homepage-cta'
  );

  const ctaSectionToRender: PageSectionDto = rawCtaSection || {
    id: `service-cta-${service.slug}`,
    pageId: `service-${service.slug}`,
    sectionIdentifier: 'service-cta',
    componentType: 'CTA',
    displayOrder: 99,
    isActive: true,
    contentPayload: {
      eyebrow: 'GET IN TOUCH',
      title: `Ready to Elevate Your Store with ${service.title}?`,
      titleHighlight: 'Elevate',
      description:
        'Schedule a 30-minute discovery call with our senior e-commerce engineering leads to review your requirements, technical timeline, and receive a fixed-scope proposal.',
      primaryButton: {
        label: 'Schedule Strategy Call',
        url: `/book?service=${encodeURIComponent(service.title)}`,
        variant: 'primary',
      },
    },
  };

  return (
    <div className="w-full bg-[#f4f3ef] min-h-screen">
      {/* ── 1. Editorial Hero Section using Standard SubpageHero ── */}
      <SubpageHero
        ariaLabel={`${service.title} Hero`}
        backgroundImageUrl="/assets/editorial/agency-hero-editorial.png"
        imageAlt={service.title}
        eyebrow={service.category || 'Specialized Capability'}
        titlePrefix={service.title}
        description={service.tagline || service.shortDescription}
        actions={
          <>
            <Link
              href={`/book?service=${encodeURIComponent(service.title)}`}
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-white text-neutral-900 font-semibold text-xs sm:text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 group"
            >
              <span>Schedule Consultation</span>
              <ArrowUpRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href={`/contact?service=${encodeURIComponent(service.title)}`}
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/25 text-white font-semibold text-xs sm:text-sm transition-all"
            >
              <span>Inquire Now</span>
            </Link>
          </>
        }
        credentials={[
          { label: 'Cost Savings', value: '40–60%', sub: 'vs traditional agencies' },
          { label: 'Page Load Target', value: '< 0.8s', sub: 'Core Web Vitals 90+' },
          { label: 'Code Ownership', value: '100%', sub: 'Direct GitHub access' },
          { label: 'Emergency SLA', value: '< 60 Min', sub: 'Direct Slack channel' },
        ]}
      />

      {/* ── 2. Our Strategic Approach Narrative ── */}
      <section className="w-full py-8 sm:py-10 md:py-12">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-start">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#d9287c] uppercase">
                <span className="inline-block w-2 h-2 rounded-full bg-[#d9287c]" />
                <span>OUR STRATEGIC APPROACH</span>
              </div>
              <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-neutral-900 leading-[1.15] sm:leading-[1.12]">
                Engineered for Speed, Scalability, and{' '}
                <span className="font-serif italic font-normal text-neutral-900">Commercial Lift</span>
              </h2>
              <p className="text-base sm:text-lg text-neutral-700 leading-relaxed max-w-2xl">
                {service.shortDescription}
              </p>

              {/* Technologies Pill Tags */}
              {service.technologies && service.technologies.length > 0 && (
                <div className="pt-4">
                  <p className="text-xs font-semibold tracking-wider uppercase text-neutral-500 mb-2.5">
                    Core Tech Stack & Tooling
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {service.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-white text-neutral-800 border border-neutral-200/80 shadow-xs"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 space-y-5 shadow-xs">
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900 flex items-center gap-2">
                <Workflow className="w-5 h-5 text-[#d9287c]" />
                <span>Deep Technical Implementation</span>
              </h3>
              <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                {service.detailedContent}
              </p>

              {service.deliverables && service.deliverables.length > 0 && (
                <div className="pt-3 border-t border-neutral-200/60">
                  <p className="text-xs font-semibold tracking-wider uppercase text-neutral-500 mb-3">
                    Guaranteed Project Deliverables
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {service.deliverables.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Engineering Process (4 Steps) ── */}
      {service.process && service.process.length > 0 && (
        <section className="w-full py-8 sm:py-10 md:py-12">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#d9287c] uppercase">
                <span className="inline-block w-2 h-2 rounded-full bg-[#d9287c]" />
                <span>HOW WE EXECUTE</span>
              </div>
              <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-neutral-900 leading-[1.15] sm:leading-[1.12] whitespace-pre-line">
                Our 4-Step Engineering{' '}
                <span className="font-serif italic font-normal text-neutral-900">Playbook</span>
              </h2>
              <p className="text-base sm:text-lg text-neutral-700 leading-relaxed max-w-2xl mx-auto pt-1">
                A predictable, transparent workflow designed for zero surprises and rapid delivery.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {service.process.map((step, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-white border border-neutral-200/80 p-6 flex flex-col justify-between shadow-xs relative overflow-hidden group hover:border-neutral-300 transition-colors"
                >
                  <div>
                    <span className="text-3xl sm:text-4xl font-black text-neutral-200 group-hover:text-neutral-900 transition-colors">
                      {step.step}
                    </span>
                    <h3 className="mt-3 text-base sm:text-lg font-bold text-neutral-900">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 4. Key Benefits Grid (6 Cards) ── */}
      {service.benefits && service.benefits.length > 0 && (
        <section className="w-full py-8 sm:py-10 md:py-12">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#d9287c] uppercase">
                <span className="inline-block w-2 h-2 rounded-full bg-[#d9287c]" />
                <span>MEASURABLE IMPACT</span>
              </div>
              <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-neutral-900 leading-[1.15] sm:leading-[1.12] whitespace-pre-line">
                Key Benefits for Your{' '}
                <span className="font-serif italic font-normal text-neutral-900">Bottom Line</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {service.benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-neutral-200/80 bg-white p-6 sm:p-7 shadow-xs hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#f4f3ef] border border-neutral-200 flex items-center justify-center text-neutral-900 mb-4">
                    <Check className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 5. Interactive Pricing Tiers ── */}
      <ServicePricingSection pricing={service.pricing} serviceTitle={service.title} />

      {/* ── 6. FAQ Accordion ── */}
      <ServiceFaqAccordion faqs={service.faqs} serviceTitle={service.title} />

      {/* ── 7. Related / Other Services Strip ── */}
      {otherServices.length > 0 && (
        <section className="w-full py-8 sm:py-10 md:py-12">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#d9287c] uppercase mb-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#d9287c]" />
                  <span>COMPLEMENTARY SERVICES</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900">
                  Other Ways We Can{' '}
                  <span className="font-serif italic font-normal text-neutral-900">Help You Scale</span>
                </h2>
              </div>
              <Link
                href="/services"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-900 hover:text-[#d9287c] transition-colors"
              >
                <span>View All Services</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {otherServices.slice(0, 3).map((other) => (
                <Link
                  key={other.slug}
                  href={`/services/${other.slug}`}
                  className="group rounded-2xl border border-neutral-200/80 p-5 sm:p-6 hover:border-neutral-400 hover:shadow-md transition-all flex flex-col justify-between bg-white shadow-xs"
                >
                  <div>
                    {other.category && (
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block mb-2">
                        {other.category}
                      </span>
                    )}
                    <h3 className="text-base sm:text-lg font-bold text-neutral-900 group-hover:text-neutral-950 transition-colors">
                      {other.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-neutral-600 line-clamp-2">
                      {other.tagline || other.shortDescription}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold text-neutral-900">
                    <span>Learn more</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 8. Global Conversion CTA Section ── */}
      <CtaSection section={ctaSectionToRender} />
    </div>
  );
}
