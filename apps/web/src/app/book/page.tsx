import type { Metadata } from 'next';
import { getPageBySlug } from '@/lib/api';
import { BookingCalendarSection } from '@/components/cms/booking-calendar-section';
import { DirectContactSection } from '@/components/cms/direct-contact-section';
import { ClientOutcomesSection } from '@/components/cms/client-outcomes-section';
import { ScrollReveal, AnimatedCounter } from '@/components/motion';

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

const CREDENTIAL_ITEMS = [
  { value: 4, label: 'Avg. Response Time', sub: 'Hours' },
  { value: 120, label: 'Shopify Stores Built', sub: 'Global' },
  { value: 100, label: 'Senior Engineers', sub: 'Direct Contact' },
  { value: 99, label: 'Client Satisfaction', sub: 'CSAT Score' },
];

export default async function BookPage() {
  const page = await getPageBySlug('book').catch(() => null);

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

  return (
    <div className="flex flex-col min-h-screen bg-[#fafaf9] dark:bg-background transition-colors duration-300">
      {/* ── 1. Hero Section: Matching Contact Page Pattern ────────── */}
      <div className="w-full px-1.5 sm:px-2 md:px-3 pt-2">
        <section
          aria-label="Book Discovery Call Hero"
          className="relative min-h-[360px] sm:min-h-[420px] md:min-h-[460px] rounded-2xl md:rounded-3xl overflow-hidden bg-neutral-950 text-white flex flex-col justify-between p-6 sm:p-10 md:p-14 lg:p-16 border border-neutral-800/80 shadow-2xl"
        >
          {/* Ambient lighting effects */}
          <div
            aria-hidden="true"
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-600/15 blur-3xl pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-[#127a51]/10 blur-3xl pointer-events-none"
          />

          {/* Top Row: Eyebrow + Live Indicator */}
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-emerald-400 uppercase">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>DISCOVERY & ARCHITECTURE</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Host Time: Gujarat, India (IST)</span>
            </div>
          </div>

          {/* Center Content: Headline & Description */}
          <div className="relative z-10 my-auto py-8 sm:py-10 max-w-4xl">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Schedule a Technical Discovery{' '}
              <span className="font-serif italic font-normal text-emerald-400">
                Session
              </span>
            </h1>
            <p className="mt-4 sm:mt-5 text-base sm:text-lg md:text-xl text-neutral-300 max-w-2xl font-normal leading-relaxed">
              Connect directly with our lead Shopify Plus architects. Live review of your store, zero sales pitch, and tailored recommendations.
            </p>
          </div>

          {/* Bottom Row: Key Credentials Strip */}
          <div className="relative z-10 pt-6 border-t border-neutral-800/60">
            <div className="max-w-5xl mx-auto rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-white/[0.04] backdrop-blur-md border border-white/10 shadow-xs">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
                {CREDENTIAL_ITEMS.map((item, i) => (
                  <div
                    key={item.label}
                    className={`flex flex-col items-center justify-center text-center ${
                      i > 0 ? 'pt-3 sm:pt-0' : ''
                    }`}
                  >
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl sm:text-2xl md:text-3xl font-bold font-mono tracking-tight text-white">
                        <AnimatedCounter
                          from={0}
                          value={item.value}
                          duration={1.8}
                          delay={i * 120}
                          threshold={0}
                          rootMargin="100px 0px 100px 0px"
                        />
                      </span>
                    </div>
                    <span className="text-[11px] sm:text-[12px] font-semibold text-neutral-200 tracking-tight">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {item.sub}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

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
