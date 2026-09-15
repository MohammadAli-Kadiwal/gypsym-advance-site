import * as React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowUpRight, Mail } from 'lucide-react';
import { getPageBySlug } from '@/lib/api';
import { ContactSection } from '@/components/cms/contact-section';
import { PageSectionDto } from '@/lib/cms-types';
import { ScrollReveal, AnimatedCounter } from '@/components/motion';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('contact');
  const seo = page?.seoMetadata;
  return {
    title: seo?.metaTitle || 'Contact Us | Gypsym Technology',
    description:
      seo?.metaDescription ||
      'Reach out to Gypsym Technology for Shopify Plus development, custom theme engineering, D2C strategy, and e-commerce partnerships. We respond within one business day.',
    openGraph: {
      title: seo?.ogTitle || seo?.metaTitle || 'Contact | Gypsym Technology',
      description:
        seo?.ogDescription ||
        seo?.metaDescription ||
        'Start a conversation with our Shopify Plus engineers. Fast response, zero obligation.',
      images: seo?.ogImageUrl ? [{ url: seo.ogImageUrl }] : undefined,
    },
    robots: seo?.noIndex ? { index: false, follow: false } : undefined,
  };
}

const CONTACT_CREDENTIALS = [
  { label: 'Avg. Response Time', value: '< 4h', sub: 'Business hours' },
  { label: 'Projects Delivered', value: '120+', sub: 'Shopify Plus stores' },
  { label: 'Time Zones Covered', value: '12+', sub: 'Global availability' },
  { label: 'Dedicated Engineers', value: '25+', sub: 'Liquid, CRO & Theme leads' },
];

export default async function ContactPage() {
  const [page, homePage] = await Promise.all([
    getPageBySlug('contact'),
    getPageBySlug('home'),
  ]);

  const rawContactSection = page?.sections?.find(
    (s: any) =>
      s.componentType === 'CONTACT' ||
      s.sectionIdentifier === 'contact-form' ||
      s.sectionIdentifier === 'contact',
  );

  const rawHomeContact = homePage?.sections?.find(
    (s: any) =>
      s.componentType === 'CONTACT' ||
      s.sectionIdentifier === 'contact-inquiry',
  );
  const globalContactDetails =
    (rawHomeContact?.contentPayload as any)?.globalContactDetails || null;

  const contactSectionToRender: PageSectionDto = rawContactSection || {
    id: 'contact-page-form-section',
    pageId: page?.id || 'contact',
    sectionIdentifier: 'contact-form',
    componentType: 'CONTACT',
    displayOrder: 2,
    isActive: true,
    contentPayload: {
      eyebrow: 'GET IN TOUCH',
      title: 'Start a Conversation With Our Team',
      titleHighlight: 'Conversation',
      description:
        'Whether you need a new Shopify Plus store, a custom theme, a CRO audit, or a long-term development partner — drop us a line. Our team reviews every inquiry personally.',
      contactInfo: {
        useGlobalDefaults: true,
        email: 'hello@gypsym.com',
        phone: '+1 (800) 928-4019',
        address: 'One World Trade Center, Suite 8500, New York, NY',
        officeHours: 'Mon – Fri: 08:00 – 18:00 EST',
      },
      globalContactDetails,
      supportCard: {
        enabled: true,
        title: 'Free Shopify Store Audit',
        description:
          'Qualifying brands receive a complimentary 30-minute performance audit with one of our senior Shopify engineers — no strings attached.',
        ctaLabel: 'Claim your free audit',
        ctaUrl: '#contact-form',
      },
      form: {
        formTitle: 'Send Us a Message',
        formSubtitle: 'We respond to every message within one business day.',
        submitButtonText: 'Send Message',
        privacyNote: 'Your details are private. No spam, ever.',
        successTitle: 'Message Sent!',
        successMessage:
          'Thanks for reaching out. One of our Shopify engineers will be in touch within one business day.',
        fields: [
          {
            id: 'cf-name',
            name: 'fullName',
            label: 'Full Name',
            type: 'text',
            placeholder: 'Jane Smith',
            required: true,
            width: 'half',
          },
          {
            id: 'cf-email',
            name: 'email',
            label: 'Email Address',
            type: 'email',
            placeholder: 'jane@yourbrand.com',
            required: true,
            width: 'half',
          },
          {
            id: 'cf-company',
            name: 'companyName',
            label: 'Company / Brand Name',
            type: 'text',
            placeholder: 'Your Brand Inc.',
            required: false,
            width: 'half',
          },
          {
            id: 'cf-phone',
            name: 'phone',
            label: 'Phone Number',
            type: 'tel',
            placeholder: '+1 (555) 000-0000',
            required: false,
            width: 'half',
          },
          {
            id: 'cf-service',
            name: 'serviceInterest',
            label: 'What Can We Help With?',
            type: 'select',
            placeholder: 'Select a service...',
            required: false,
            options: [
              'New Shopify Plus Store',
              'Custom Theme Development',
              'Conversion Rate Optimisation',
              'Shopify Migration',
              'Ongoing Retainer Support',
              'Other / General Enquiry',
            ],
            width: 'full',
          },
          {
            id: 'cf-message',
            name: 'message',
            label: 'Tell Us About Your Project',
            type: 'textarea',
            placeholder:
              'Share a brief overview of your project, goals, or questions...',
            required: true,
            width: 'full',
          },
        ],
      },
    },
  };

  return (
    <div className="w-full">
      <div className="w-full bg-[#f4f3ef] px-1.5 sm:px-2 md:px-3 pt-[clamp(6px,1vw,10px)]">
        <section
          aria-label="Contact Hero"
          className="relative isolate w-full rounded-[18px] sm:rounded-[22px] md:rounded-[28px] overflow-hidden flex flex-col shadow-sm border border-neutral-200/50"
          style={{
            minHeight: 'calc(100dvh - clamp(10px, 2vw, 16px) - 16px)',
            height: 'calc(100dvh - clamp(10px, 2vw, 16px) - 16px)',
          }}
        >
          <div className="absolute inset-0 z-0 overflow-hidden select-none">
            <Image
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2200&auto=format&fit=crop"
              alt="Gypsym Technology — Modern collaborative workspace"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center scale-105 animate-in fade-in duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-950/45 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/35 via-transparent to-transparent pointer-events-none" />
          </div>

          <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-8 md:px-12 pt-[clamp(80px,14vw,130px)] pb-6 max-w-5xl mx-auto space-y-5 sm:space-y-6">
            <ScrollReveal direction="down" delay={60}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] sm:text-[12px] font-mono uppercase tracking-[0.2em] text-neutral-200 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#d9287c] animate-pulse shadow-[0_0_8px_rgba(217,40,124,0.8)]" />
                <span>Gypsym Technology · Get In Touch</span>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={120}>
              <h1 className="text-[clamp(32px,6.5vw,66px)] font-semibold tracking-[-0.025em] text-white leading-[1.12] drop-shadow-md">
                {"Let's Build Something"}{' '}
                <span className="font-serif italic font-normal text-white drop-shadow-md text-[clamp(36px,7.5vw,74px)] inline-block leading-none mx-1.5 sm:mx-2.5">
                  Remarkable
                </span>{' '}
                Together
              </h1>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={180}>
              <p className="text-[14px] sm:text-[16px] md:text-[17px] text-neutral-200 max-w-[90%] sm:max-w-2xl mx-auto leading-[1.65] font-normal drop-shadow">
                Whether you need a new Shopify Plus storefront, a performance overhaul, or a long-term engineering partner — our team is ready. Every message is read personally and replied to within one business day.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={240}>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-3.5">
                <a
                  href="#contact-form"
                  className="inline-flex items-center px-6 sm:px-7 py-3 rounded-full bg-white text-neutral-950 font-semibold text-xs sm:text-sm hover:bg-neutral-100 hover:scale-105 transition-all shadow-xl shadow-black/20"
                >
                  <span>Send Us a Message</span>
                  <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                </a>
                <a
                  href="mailto:hello@gypsym.com"
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/25 text-white font-medium text-xs sm:text-sm transition-all"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>hello@gypsym.com</span>
                </a>
              </div>
            </ScrollReveal>
          </div>

          <div className="w-full relative z-10 mt-auto border-t border-white/15 bg-white/95 backdrop-blur-md">
            <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8 py-3.5 sm:py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 divide-y md:divide-y-0 md:divide-x divide-neutral-200/80">
                {CONTACT_CREDENTIALS.map((item, i) => (
                  <div
                    key={i}
                    className={`flex flex-col justify-center ${i > 0 ? 'pt-2 md:pt-0 md:pl-6' : ''}`}
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="text-[17px] sm:text-[20px] md:text-[22px] font-bold text-neutral-900 tracking-tight">
                        <AnimatedCounter
                          value={item.value}
                          duration={1.8}
                          delay={i * 120}
                          threshold={0}
                          rootMargin="100px 0px 100px 0px"
                        />
                      </span>
                    </div>
                    <span className="text-[11px] sm:text-[12px] font-semibold text-neutral-800 tracking-tight">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {item.sub}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <section id="contact-form" className="w-full relative overflow-x-clip">
        <ScrollReveal direction="up" intensity="subtle" className="w-full">
          <ContactSection section={contactSectionToRender} />
        </ScrollReveal>
      </section>
    </div>
  );
}