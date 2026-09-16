'use client';

import * as React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { notify } from '@/lib/notifications';
import { fetchApi } from '@/lib/api-client';
import { SectionsHeader } from './sections-header';
import type { PageData } from './types';

const Label = ({ className = '', ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={`block text-xs font-semibold text-slate-700 mb-1.5 ${className}`} {...props} />
);

export interface BookStudioProps {
  onBack?: () => void;
}

interface CredentialItem {
  label: string;
  value: string;
  sub: string;
}

interface OutcomeCard {
  title: string;
  desc: string;
  badge?: string;
}

const defaultCredentials: CredentialItem[] = [
  { label: 'Avg. Response Time', value: '< 4h', sub: 'Business hours' },
  { label: 'Shopify Stores Built', value: '120+', sub: 'Global enterprise' },
  { label: 'Senior Engineers', value: '100%', sub: 'Direct contact' },
  { label: 'Client Satisfaction', value: '99%', sub: 'CSAT score' },
];

const defaultOutcomes: OutcomeCard[] = [
  {
    title: 'Live Store & Theme Audit',
    desc: 'We inspect your Liquid codebase, apps, and Core Web Vitals live during the 30-minute call.',
    badge: 'Live Audit',
  },
  {
    title: 'Zero Sales Slide Decks',
    desc: 'Direct interaction with lead architects focused on architectural solutions and technical execution.',
    badge: 'Engineering First',
  },
  {
    title: 'Actionable Technical Roadmap',
    desc: 'You leave with clear next steps for scaling, whether you hire Gypsym or implement internally.',
    badge: 'No Obligation',
  },
];

export function BookStudio({ onBack }: BookStudioProps) {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [pageData, setPageData] = React.useState<PageData | null>(null);

  // ── Hero State ──
  const [heroId, setHeroId] = React.useState<string | null>(null);
  const [heroActive, setHeroActive] = React.useState(true);
  const [heroEyebrow, setHeroEyebrow] = React.useState('DISCOVERY & ARCHITECTURE');
  const [heroHeadline, setHeroHeadline] = React.useState('Schedule a Technical Discovery Session');
  const [heroHighlight, setHeroHighlight] = React.useState('Session');
  const [heroDescription, setHeroDescription] = React.useState(
    'Connect directly with our lead Shopify Plus architects. Live review of your store, zero sales pitch, and tailored recommendations.'
  );
  const [hostTimezone, setHostTimezone] = React.useState('Host Time: Gujarat, India (IST)');
  const [credentials, setCredentials] = React.useState<CredentialItem[]>(defaultCredentials);

  // ── Discovery Booking State ──
  const [bookingId, setBookingId] = React.useState<string | null>(null);
  const [bookingActive, setBookingActive] = React.useState(true);
  const [bookingTitle, setBookingTitle] = React.useState('Select Date & Time');
  const [bookingSubtitle, setBookingSubtitle] = React.useState('30-minute discovery video consultation with senior engineering.');
  const [meetingDuration, setMeetingDuration] = React.useState('30 Minutes');
  const [meetingFormat, setMeetingFormat] = React.useState('Google Meet video conference');
  const [calendarUrl, setCalendarUrl] = React.useState('https://cal.com/gypsym/discovery');
  const [expectations, setExpectations] = React.useState<string[]>([
    'Review your current store speed & Liquid architecture bottlenecks',
    'Evaluate custom app or ERP migration feasibility',
    'Discuss fixed-scope timeline and cost estimates',
  ]);

  // ── Outcomes State ──
  const [outcomesId, setOutcomesId] = React.useState<string | null>(null);
  const [outcomesActive, setOutcomesActive] = React.useState(true);
  const [outcomesEyebrow, setOutcomesEyebrow] = React.useState('SESSION BENEFITS');
  const [outcomesTitle, setOutcomesTitle] = React.useState('What We Cover in 30 Minutes');
  const [outcomes, setOutcomes] = React.useState<OutcomeCard[]>(defaultOutcomes);

  // ── SEO State ──
  const [metaTitle, setMetaTitle] = React.useState('');
  const [metaDescription, setMetaDescription] = React.useState('');
  const [canonicalUrl, setCanonicalUrl] = React.useState('');
  const [ogImageUrl, setOgImageUrl] = React.useState('');
  const [noIndex, setNoIndex] = React.useState(false);

  const updateCredential = (idx: number, field: keyof CredentialItem, val: string) => {
    setCredentials((prev) => {
      const copy = [...prev];
      const curr = copy[idx];
      if (curr) {
        copy[idx] = { ...curr, [field]: val };
      }
      return copy;
    });
  };

  const updateOutcome = (idx: number, field: keyof OutcomeCard, val: string) => {
    setOutcomes((prev) => {
      const copy = [...prev];
      const curr = copy[idx];
      if (curr) {
        copy[idx] = { ...curr, [field]: val };
      }
      return copy;
    });
  };

  // ── Load Data ──
  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const page = await fetchApi<PageData>('/pages/book');
      if (page) {
        setPageData(page);

        // SEO
        const seo = page.seoMetadata;
        setMetaTitle(seo?.metaTitle || page.title || 'Book a Discovery Call | Gypsym Technology');
        setMetaDescription(
          seo?.metaDescription ||
            page.description ||
            'Schedule a 30-minute discovery session directly with our lead Shopify Plus engineers.'
        );
        setCanonicalUrl(seo?.canonicalUrl || '');
        setOgImageUrl(seo?.ogImageUrl || '/assets/editorial/agency-hero-editorial.png');
        setNoIndex(Boolean(seo?.noIndex));

        // Hero Section
        const rawHero = page.sections?.find(
          (s) => s.sectionIdentifier === 'book-hero' || s.componentType === 'HERO'
        );
        if (rawHero) {
          setHeroId(rawHero.id);
          setHeroActive(rawHero.isActive);
          const p = (rawHero.contentPayload as any) || {};
          if (p.eyebrow) setHeroEyebrow(p.eyebrow);
          if (p.headline) setHeroHeadline(p.headline);
          if (p.highlight) setHeroHighlight(p.highlight);
          if (p.description) setHeroDescription(p.description);
          if (p.hostTimezone) setHostTimezone(p.hostTimezone);
          if (Array.isArray(p.credentials) && p.credentials.length > 0) setCredentials(p.credentials);
        }

        // Booking Section
        const rawBooking = page.sections?.find(
          (s) =>
            s.sectionIdentifier === 'book-discovery' ||
            s.componentType === 'BOOKING_CALENDAR' ||
            s.componentType === 'DISCOVERY_BOOKING'
        );
        if (rawBooking) {
          setBookingId(rawBooking.id);
          setBookingActive(rawBooking.isActive);
          const p = (rawBooking.contentPayload as any) || {};
          if (p.title) setBookingTitle(p.title);
          if (p.subtitle) setBookingSubtitle(p.subtitle);
          if (p.meetingDuration) setMeetingDuration(p.meetingDuration);
          if (p.meetingFormat) setMeetingFormat(p.meetingFormat);
          if (p.calendarUrl) setCalendarUrl(p.calendarUrl);
          if (Array.isArray(p.expectations) && p.expectations.length > 0) setExpectations(p.expectations);
        }

        // Outcomes Section
        const rawOutcomes = page.sections?.find(
          (s) =>
            s.sectionIdentifier === 'client-outcomes' ||
            s.componentType === 'CLIENT_OUTCOMES' ||
            s.componentType === 'STORE_OUTCOMES'
        );
        if (rawOutcomes) {
          setOutcomesId(rawOutcomes.id);
          setOutcomesActive(rawOutcomes.isActive);
          const p = (rawOutcomes.contentPayload as any) || {};
          if (p.eyebrow) setOutcomesEyebrow(p.eyebrow);
          if (p.title) setOutcomesTitle(p.title);
          if (Array.isArray(p.outcomes) && p.outcomes.length > 0) setOutcomes(p.outcomes);
        }
      }
    } catch {
      notify.error('Could not load Book page from database.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Save Handler ──
  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Update Page SEO
      await fetchApi('/pages/book', {
        method: 'PUT',
        body: JSON.stringify({
          title: 'Book',
          description: metaDescription,
          seoMetadata: {
            metaTitle,
            metaDescription,
            canonicalUrl: canonicalUrl || null,
            ogTitle: metaTitle,
            ogDescription: metaDescription,
            ogImageUrl: ogImageUrl || null,
            noIndex,
          },
        }),
      });

      // 2. Save Hero Section
      const heroPayload = {
        eyebrow: heroEyebrow,
        headline: heroHeadline,
        highlight: heroHighlight,
        description: heroDescription,
        hostTimezone,
        credentials,
      };

      if (heroId && !heroId.startsWith('local-')) {
        await fetchApi(`/sections/${heroId}`, {
          method: 'PUT',
          body: JSON.stringify({
            contentPayload: heroPayload,
            isActive: heroActive,
          }),
        });
      } else {
        const created = await fetchApi<any>('/pages/book/sections', {
          method: 'POST',
          body: JSON.stringify({
            sectionIdentifier: 'book-hero',
            componentType: 'HERO',
            displayOrder: 1,
            contentPayload: heroPayload,
            isActive: heroActive,
          }),
        });
        if (created?.id) setHeroId(created.id);
      }

      // 3. Save Booking Calendar Section
      const bookingPayload = {
        title: bookingTitle,
        subtitle: bookingSubtitle,
        meetingDuration,
        meetingFormat,
        calendarUrl,
        expectations,
      };

      if (bookingId && !bookingId.startsWith('local-')) {
        await fetchApi(`/sections/${bookingId}`, {
          method: 'PUT',
          body: JSON.stringify({
            contentPayload: bookingPayload,
            isActive: bookingActive,
          }),
        });
      } else {
        const created = await fetchApi<any>('/pages/book/sections', {
          method: 'POST',
          body: JSON.stringify({
            sectionIdentifier: 'book-discovery',
            componentType: 'BOOKING_CALENDAR',
            displayOrder: 2,
            contentPayload: bookingPayload,
            isActive: bookingActive,
          }),
        });
        if (created?.id) setBookingId(created.id);
      }

      // 4. Save Outcomes Section
      const outcomesPayload = {
        eyebrow: outcomesEyebrow,
        title: outcomesTitle,
        outcomes,
      };

      if (outcomesId && !outcomesId.startsWith('local-')) {
        await fetchApi(`/sections/${outcomesId}`, {
          method: 'PUT',
          body: JSON.stringify({
            contentPayload: outcomesPayload,
            isActive: outcomesActive,
          }),
        });
      } else {
        const created = await fetchApi<any>('/pages/book/sections', {
          method: 'POST',
          body: JSON.stringify({
            sectionIdentifier: 'client-outcomes',
            componentType: 'CLIENT_OUTCOMES',
            displayOrder: 3,
            contentPayload: outcomesPayload,
            isActive: outcomesActive,
          }),
        });
        if (created?.id) setOutcomesId(created.id);
      }

      notify.success('All Book Page sections saved successfully.');
    } catch (err: any) {
      notify.error(err?.message || 'Failed to save Book page sections.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-6xl">
      <SectionsHeader
        pageTitle="Book"
        pageRoute="/book"
        layoutLabel="DISCOVERY SCHEDULER"
        sectionCount={3}
        status={pageData?.status || 'PUBLISHED'}
        saving={saving}
        loading={loading}
        onBack={onBack || (() => {})}
        onSave={handleSave}
        onRefresh={loadData}
      />

      <Tabs defaultValue="hero" className="w-full space-y-6">
        <TabsList className="bg-slate-100 p-1.5 rounded-2xl h-auto flex flex-wrap gap-1.5 border border-slate-200/80">
          <TabsTrigger
            value="hero"
            className="rounded-xl text-xs font-semibold px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
          >
            1. Hero & Metrics
          </TabsTrigger>
          <TabsTrigger
            value="calendar"
            className="rounded-xl text-xs font-semibold px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
          >
            2. Booking Scheduler & Calendar
          </TabsTrigger>
          <TabsTrigger
            value="outcomes"
            className="rounded-xl text-xs font-semibold px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
          >
            3. Session Outcomes
          </TabsTrigger>
          <TabsTrigger
            value="seo"
            className="rounded-xl text-xs font-semibold px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
          >
            4. SEO & OpenGraph
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: HERO ── */}
        <TabsContent value="hero" className="space-y-6">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white overflow-hidden">
            <CardHeader className="p-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Hero Section</CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Hero headline, highlight, availability notice, and credentials.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Active</span>
                <Switch checked={heroActive} onCheckedChange={setHeroActive} />
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Eyebrow</Label>
                  <Input
                    value={heroEyebrow}
                    onChange={(e) => setHeroEyebrow(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Host Timezone & Availability Notice</Label>
                  <Input
                    value={hostTimezone}
                    onChange={(e) => setHostTimezone(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Headline</Label>
                  <Input
                    value={heroHeadline}
                    onChange={(e) => setHeroHeadline(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Headline Highlight</Label>
                  <Input
                    value={heroHighlight}
                    onChange={(e) => setHeroHighlight(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={heroDescription}
                  onChange={(e) => setHeroDescription(e.target.value)}
                  rows={3}
                  className="mt-1 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-800">Credentials Strip</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {credentials.map((cred, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
                      <Label>Metric {idx + 1} Value</Label>
                      <Input
                        value={cred.value}
                        onChange={(e) => updateCredential(idx, 'value', e.target.value)}
                        className="h-8 text-xs font-bold"
                      />
                      <Label>Label</Label>
                      <Input
                        value={cred.label}
                        onChange={(e) => updateCredential(idx, 'label', e.target.value)}
                        className="h-8 text-xs"
                      />
                      <Label>Subtext</Label>
                      <Input
                        value={cred.sub}
                        onChange={(e) => updateCredential(idx, 'sub', e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 2: CALENDAR SCHEDULER ── */}
        <TabsContent value="calendar" className="space-y-4">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">Booking Scheduler & Calendar Integration</CardTitle>
                <CardDescription className="text-xs">
                  Meeting duration, format, and embedded Cal.com / Calendly integration.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Active</span>
                <Switch checked={bookingActive} onCheckedChange={setBookingActive} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Section Title</Label>
                  <Input
                    value={bookingTitle}
                    onChange={(e) => setBookingTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Calendar Integration URL (Cal.com or Calendly)</Label>
                  <Input
                    value={calendarUrl}
                    onChange={(e) => setCalendarUrl(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Meeting Duration</Label>
                  <Input
                    value={meetingDuration}
                    onChange={(e) => setMeetingDuration(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Meeting Format</Label>
                  <Input
                    value={meetingFormat}
                    onChange={(e) => setMeetingFormat(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Subtitle</Label>
                <Input
                  value={bookingSubtitle}
                  onChange={(e) => setBookingSubtitle(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800">What to Expect Bullet Points ({expectations.length})</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setExpectations([...expectations, 'New consultation topic'])}
                    className="h-8 text-xs font-semibold"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Topic
                  </Button>
                </div>

                <div className="space-y-2">
                  {expectations.map((exp, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={exp}
                        onChange={(e) => {
                          const copy = [...expectations];
                          copy[idx] = e.target.value;
                          setExpectations(copy);
                        }}
                        className="text-xs"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setExpectations(expectations.filter((_, i) => i !== idx))}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 3: OUTCOMES ── */}
        <TabsContent value="outcomes" className="space-y-4">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">Session Benefits & Deliverables</CardTitle>
                <CardDescription className="text-xs">
                  Value proposition cards explaining what prospective clients gain from the session.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Active</span>
                <Switch checked={outcomesActive} onCheckedChange={setOutcomesActive} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Eyebrow</Label>
                  <Input
                    value={outcomesEyebrow}
                    onChange={(e) => setOutcomesEyebrow(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Section Title</Label>
                  <Input
                    value={outcomesTitle}
                    onChange={(e) => setOutcomesTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800">Benefit Cards ({outcomes.length})</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setOutcomes([
                        ...outcomes,
                        { title: 'New Benefit', desc: 'Explanation of consultation benefit.', badge: 'Deliverable' },
                      ])
                    }
                    className="h-8 text-xs font-semibold"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Card
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {outcomes.map((oc, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Card #{idx + 1}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setOutcomes(outcomes.filter((_, i) => i !== idx))}
                          className="h-6 w-6 p-0 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <Label>Badge</Label>
                      <Input
                        value={oc.badge || ''}
                        onChange={(e) => updateOutcome(idx, 'badge', e.target.value)}
                        className="h-8 text-xs"
                      />
                      <Label>Title</Label>
                      <Input
                        value={oc.title}
                        onChange={(e) => updateOutcome(idx, 'title', e.target.value)}
                        className="h-8 text-xs font-semibold"
                      />
                      <Label>Description</Label>
                      <Textarea
                        value={oc.desc}
                        onChange={(e) => updateOutcome(idx, 'desc', e.target.value)}
                        rows={2}
                        className="text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 4: SEO ── */}
        <TabsContent value="seo" className="space-y-4">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Book Page SEO & Metadata</CardTitle>
              <CardDescription className="text-xs">
                Search indexing tags, canonical link, and social preview.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Meta Title</Label>
                <Input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Book a Discovery Call | Gypsym Technology"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Meta Description</Label>
                <Textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  className="mt-1 text-xs"
                />
              </div>

              <div className="space-y-5">
                <div>
                  <Label>Canonical URL</Label>
                  <Input
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder="https://gypsym.com/book"
                    className="h-10 text-xs font-mono rounded-xl border-slate-200/90"
                  />
                </div>
                <div>
                  <ImageUploadField
                    label="Social OpenGraph (OG) Image"
                    description="Upload directly or specify a URL (1200x630 recommended for LinkedIn, X, and WhatsApp previews)."
                    value={ogImageUrl}
                    onChange={setOgImageUrl}
                    placeholder="/assets/editorial/agency-hero-editorial.png"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-800">Prevent Search Indexing (noindex)</span>
                  <p className="text-[11px] text-slate-500">Keep this off for production search visibility.</p>
                </div>
                <Switch checked={noIndex} onCheckedChange={setNoIndex} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
