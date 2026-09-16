import * as React from 'react';
import type { Metadata } from 'next';
import { ArrowUpRight, Mail } from 'lucide-react';
import { getPageBySlug } from '@/lib/api';
import { ContactSection } from '@/components/cms/contact-section';
import { ClientOutcomesSection } from '@/components/cms/client-outcomes-section';
import { DirectContactSection } from '@/components/cms/direct-contact-section';
import { PageSectionDto } from '@/lib/cms-types';
import { ScrollReveal } from '@/components/motion';
import { SubpageHero } from '@/components/ui/subpage-hero';

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

  const rawOutcomesSection = page?.sections?.find(
    (s: any) =>
      s.componentType === 'CLIENT_OUTCOMES' ||
      s.componentType === 'STORE_OUTCOMES' ||
      s.sectionIdentifier === 'client-outcomes' ||
      s.sectionIdentifier === 'store-outcomes',
  );

  const rawDirectContactSection = page?.sections?.find(
    (s: any) =>
      s.componentType === 'DIRECT_CONTACT' ||
      s.componentType === 'DIRECT_CHANNELS' ||
      s.componentType === 'REACH_US_DIRECTLY' ||
      s.sectionIdentifier === 'direct-contact' ||
      s.sectionIdentifier === 'reach-us-directly' ||
      s.sectionIdentifier === 'direct-channels',
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
      <SubpageHero
        ariaLabel="Contact Hero"
        backgroundImageUrl="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2200&auto=format&fit=crop"
        imageAlt="Gypsym Technology — Modern collaborative workspace"
        eyebrow="Gypsym Technology · Get In Touch"
        eyebrowBulletColor="bg-[#d9287c]"
        titlePrefix="Let's Build Something"
        titleHighlight="Remarkable"
        titleSuffix="Together"
        description="Whether you need a new Shopify Plus storefront, a performance overhaul, or a long-term engineering partner — our team is ready. Every message is read personally and replied to within one business day."
        credentials={CONTACT_CREDENTIALS}
        showHeroStrip={true}
        actions={
          <>
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
          </>
        }
      />

      <div id="contact-form" className="w-full relative overflow-x-clip">
        <ScrollReveal direction="up" intensity="subtle" className="w-full">
          <ContactSection section={contactSectionToRender} />
        </ScrollReveal>
      </div>

      {/* ── 3. Or Reach Us Directly (Direct Channels) ── */}
      <div id="reach-us-directly" className="w-full relative overflow-x-clip">
        <ScrollReveal direction="up" intensity="subtle" className="w-full">
          <DirectContactSection
            section={rawDirectContactSection}
            payload={rawDirectContactSection?.contentPayload || contactSectionToRender?.contentPayload?.directChannels}
          />
        </ScrollReveal>
      </div>

      {/* ── 4. How Store Owners Like You Use Gypsym (Outcomes & Proof) ── */}
      <div id="client-outcomes" className="w-full relative overflow-x-clip">
        <ScrollReveal direction="up" intensity="subtle" className="w-full">
          <ClientOutcomesSection section={rawOutcomesSection} />
        </ScrollReveal>
      </div>
    </div>
  );
}