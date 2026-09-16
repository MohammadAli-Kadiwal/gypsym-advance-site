import type { Metadata } from 'next';
import { ArrowDown, MessageSquare } from 'lucide-react';
import { getPageBySlug } from '@/lib/api';
import { SubpageHero, CredentialItem } from '@/components/ui/subpage-hero';
import { BookingCalendarSection } from '@/components/cms/booking-calendar-section';
import { DirectContactSection } from '@/components/cms/direct-contact-section';
import { ClientOutcomesSection } from '@/components/cms/client-outcomes-section';
import { ScrollReveal } from '@/components/motion';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Book a Discovery Call | Gypsym Technology',
  description:
    'Schedule a 30-minute discovery session directly with our lead Shopify Plus engineers. Live store audit, zero sales deck, actionable technical insights.',
  openGraph: {
    title: 'Book a Discovery Call | Gypsym Technology',
    description:
      'Schedule a 30-minute discovery session directly with our lead Shopify Plus engineers.',
    url: 'https://gypsym.com/book',
  },
};

const CREDENTIAL_ITEMS: CredentialItem[] = [
  { value: '< 60m', label: 'Average Response Time', sub: 'Business Hours' },
  { value: '120+', label: 'Shopify Stores Built', sub: 'Global Brands' },
  { value: '25+', label: 'Senior Engineers', sub: 'Liquid & Hydrogen' },
  { value: '99%', label: 'Client Satisfaction', sub: 'CSAT Rating' },
];

export default async function BookPage() {
  const page = await getPageBySlug('book').catch(() => null);

  const rawHeroSection = page?.sections?.find(
    (s: any) =>
      s.componentType === 'HERO' ||
      s.sectionIdentifier === 'book-hero'
  );
  const heroPayload = (rawHeroSection?.contentPayload as any) || {};

  const rawBookingSection = page?.sections?.find(
    (s: any) =>
      s.componentType === 'BOOKING_CALENDAR' ||
      s.componentType === 'DISCOVERY_BOOKING' ||
      s.sectionIdentifier === 'book-discovery' ||
      s.sectionIdentifier === 'discovery-call'
  );

  const rawDirectContactSection = page?.sections?.find(
    (s: any) =>
      s.componentType === 'DIRECT_CONTACT' ||
      s.componentType === 'DIRECT_CHANNELS' ||
      s.componentType === 'REACH_US_DIRECTLY' ||
      s.sectionIdentifier === 'direct-contact' ||
      s.sectionIdentifier === 'reach-us-directly'
  );

  const rawOutcomesSection = page?.sections?.find(
    (s: any) =>
      s.componentType === 'CLIENT_OUTCOMES' ||
      s.componentType === 'STORE_OUTCOMES' ||
      s.sectionIdentifier === 'client-outcomes' ||
      s.sectionIdentifier === 'store-outcomes'
  );

  const heroBackgroundImage =
    heroPayload.backgroundImage ||
    heroPayload.heroBackgroundImage ||
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2200&auto=format&fit=crop';

  const credentials =
    Array.isArray(heroPayload.credentials) && heroPayload.credentials.length > 0
      ? heroPayload.credentials
      : CREDENTIAL_ITEMS;

  return (
    <div className="w-full">
      {/* ── 1. Hero Section: Using Canonical SubpageHero Component ── */}
      <SubpageHero
        ariaLabel="Book Discovery Call Hero"
        backgroundImageUrl={heroBackgroundImage}
        imageAlt="Gypsym Technology Technical Discovery Session"
        eyebrow={heroPayload.eyebrow || 'Gypsym Technology · Discovery Call'}
        eyebrowBulletColor="bg-[#d9287c]"
        titlePrefix={heroPayload.headline || heroPayload.title || 'Schedule a Technical Discovery'}
        titleHighlight={heroPayload.highlight || heroPayload.titleHighlight || 'Session'}
        description={
          heroPayload.description ||
          'Connect directly with our lead Shopify Plus architects. Live review of your storefront, zero sales pitch, and tailored engineering recommendations.'
        }
        credentials={credentials}
        showHeroStrip={heroPayload.showHeroStrip !== undefined ? heroPayload.showHeroStrip : true}
        actions={
          <>
            <a
              href="#booking-widget"
              className="inline-flex items-center px-6 sm:px-7 py-3 rounded-full bg-white text-neutral-950 font-semibold text-xs sm:text-sm hover:bg-neutral-100 hover:scale-105 transition-all shadow-xl shadow-black/20"
            >
              <span>Pick Date & Time</span>
              <ArrowDown className="ml-1.5 h-3.5 w-3.5" />
            </a>
            <a
              href="#reach-us-directly"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/25 text-white font-medium text-xs sm:text-sm transition-all"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Direct Channels</span>
            </a>
          </>
        }
      />

      {/* ── 2. Discovery Call & Timezone Slot Picker Section ───────── */}
      <div id="booking-widget" className="w-full relative overflow-x-clip">
        <ScrollReveal direction="up" intensity="subtle" className="w-full">
          <BookingCalendarSection section={rawBookingSection} />
        </ScrollReveal>
      </div>

      {/* ── 3. Or Reach Us Directly (Direct Channels) ──────────────── */}
      <div id="reach-us-directly" className="w-full relative overflow-x-clip">
        <ScrollReveal direction="up" intensity="subtle" className="w-full">
          <DirectContactSection section={rawDirectContactSection} />
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
