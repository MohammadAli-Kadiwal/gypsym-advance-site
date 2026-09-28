'use client';

import * as React from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  ShieldCheck,
  Plus,
  Trash2,
} from 'lucide-react';
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

export interface ContactStudioProps {
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
  { label: 'Projects Delivered', value: '120+', sub: 'Shopify Plus stores' },
  { label: 'Time Zones Covered', value: '12+', sub: 'Global availability' },
  { label: 'Dedicated Engineers', value: '25+', sub: 'Liquid, CRO & Theme leads' },
];

const defaultOutcomes: OutcomeCard[] = [
  {
    title: 'Sub-4-Hour Business Response',
    desc: 'Our senior engineering desk personally triages incoming inquiries and scopes technical feasibility immediately.',
    badge: 'SLA Guaranteed',
  },
  {
    title: 'Zero Sales Decks, Pure Engineering',
    desc: 'You speak with senior practitioners who can review your theme repository, app stack, and technical hurdles on call #1.',
    badge: 'Direct Access',
  },
  {
    title: 'NDA Protected Consultation',
    desc: 'Every client discussion is strictly bound by mutual non-disclosure and intellectual property protection.',
    badge: 'Confidential',
  },
];

export function ContactStudio({ onBack }: ContactStudioProps) {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [pageData, setPageData] = React.useState<PageData | null>(null);

  // ── Hero State ──
  const [heroId, setHeroId] = React.useState<string | null>(null);
  const [heroActive, setHeroActive] = React.useState(true);
  const [heroEyebrow, setHeroEyebrow] = React.useState('GET IN TOUCH');
  const [heroTitle, setHeroTitle] = React.useState('Start a Conversation With Our Engineering Desk');
  const [heroHighlight, setHeroHighlight] = React.useState('Engineering Desk');
  const [heroDescription, setHeroDescription] = React.useState(
    'Whether you need a new Shopify Plus store, a custom theme, a CRO audit, or an ongoing technical partnership — drop us a line.'
  );
  const [heroBackgroundImage, setHeroBackgroundImage] = React.useState('/assets/editorial/agency-hero-editorial.png');
  const [showHeroStrip, setShowHeroStrip] = React.useState(true);
  const [credentials, setCredentials] = React.useState<CredentialItem[]>(defaultCredentials);

  // ── Form & Contact Info State ──
  const [formId, setFormId] = React.useState<string | null>(null);
  const [formActive, setFormActive] = React.useState(true);
  const [formTitle, setFormTitle] = React.useState('Direct Engineering Inquiry');
  const [formSubtitle, setFormSubtitle] = React.useState('Connect with a principal architect within 4 business hours.');
  const [submitButtonText, setSubmitButtonText] = React.useState('Transmit Inquiry');
  const [contactEmail, setContactEmail] = React.useState('hello@gypsym.com');
  const [contactPhone, setContactPhone] = React.useState('+1 (800) 928-4019');
  const [contactAddress, setContactAddress] = React.useState('One World Trade Center, Suite 8500, New York, NY');
  const [contactOfficeHours, setContactOfficeHours] = React.useState('Mon – Fri: 08:00 – 18:00 EST');
  const [whatsappNumber, setWhatsappNumber] = React.useState('+18009284019');
  const [slackChannelInvite, setSlackChannelInvite] = React.useState('https://slack.com');

  // ── Outcomes State ──
  const [outcomesId, setOutcomesId] = React.useState<string | null>(null);
  const [outcomesActive, setOutcomesActive] = React.useState(true);
  const [outcomesEyebrow, setOutcomesEyebrow] = React.useState('OUR COMMITMENT');
  const [outcomesTitle, setOutcomesTitle] = React.useState('What to Expect When You Contact Us');
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
      const page = await fetchApi<PageData>('/pages/contact');
      if (page) {
        setPageData(page);

        // SEO
        const seo = page.seoMetadata;
        setMetaTitle(seo?.metaTitle || page.title || 'Contact Us | Gypsym Technology');
        setMetaDescription(
          seo?.metaDescription ||
            page.description ||
            'Reach out to Gypsym Technology for Shopify Plus development, custom theme engineering, and e-commerce partnerships.'
        );
        setCanonicalUrl(seo?.canonicalUrl || '');
        setOgImageUrl(seo?.ogImageUrl || '/assets/editorial/agency-hero-editorial.png');
        setNoIndex(Boolean(seo?.noIndex));

        // Hero Section
        const rawHero = page.sections?.find(
          (s) => s.sectionIdentifier === 'contact-hero' || s.componentType === 'HERO'
        );
        if (rawHero) {
          setHeroId(rawHero.id);
          setHeroActive(rawHero.isActive);
          const p = (rawHero.contentPayload as any) || {};
          if (p.eyebrow) setHeroEyebrow(p.eyebrow);
          if (p.title) setHeroTitle(p.title);
          if (p.titleHighlight) setHeroHighlight(p.titleHighlight);
          if (p.description) setHeroDescription(p.description);
          if (p.backgroundImage) setHeroBackgroundImage(p.backgroundImage);
          if (p.showHeroStrip !== undefined) setShowHeroStrip(p.showHeroStrip);
          if (Array.isArray(p.credentials) && p.credentials.length > 0) setCredentials(p.credentials);
        }

        // Form Section
        const rawForm = page.sections?.find(
          (s) =>
            s.sectionIdentifier === 'contact-form' ||
            s.sectionIdentifier === 'contact-details' ||
            s.componentType === 'CONTACT' ||
            s.componentType === 'CTA_STRIP'
        );
        if (rawForm) {
          setFormId(rawForm.id);
          setFormActive(rawForm.isActive);
          const p = (rawForm.contentPayload as any) || {};
          if (p.formTitle) setFormTitle(p.formTitle);
          if (p.formSubtitle || p.subheadline) setFormSubtitle(p.formSubtitle || p.subheadline);
          if (p.submitButtonText) setSubmitButtonText(p.submitButtonText);
          if (p.contactInfo?.email) setContactEmail(p.contactInfo.email);
          if (p.contactInfo?.phone) setContactPhone(p.contactInfo.phone);
          if (p.contactInfo?.address) setContactAddress(p.contactInfo.address);
          if (p.contactInfo?.officeHours) setContactOfficeHours(p.contactInfo.officeHours);
          if (p.contactInfo?.whatsapp) setWhatsappNumber(p.contactInfo.whatsapp);
          if (p.contactInfo?.slackInvite) setSlackChannelInvite(p.contactInfo.slackInvite);
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
      notify.error('Could not load Contact page from database.');
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
      await fetchApi('/pages/contact', {
        method: 'PUT',
        body: JSON.stringify({
          title: 'Contact',
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
        title: heroTitle,
        titleHighlight: heroHighlight,
        description: heroDescription,
        backgroundImage: heroBackgroundImage,
        showHeroStrip,
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
        const created = await fetchApi<any>('/pages/contact/sections', {
          method: 'POST',
          body: JSON.stringify({
            sectionIdentifier: 'contact-hero',
            componentType: 'HERO',
            displayOrder: 1,
            contentPayload: heroPayload,
            isActive: heroActive,
          }),
        });
        if (created?.id) setHeroId(created.id);
      }

      // 3. Save Form & Info Section
      const formPayload = {
        formTitle,
        formSubtitle,
        submitButtonText,
        contactInfo: {
          email: contactEmail,
          phone: contactPhone,
          address: contactAddress,
          officeHours: contactOfficeHours,
          whatsapp: whatsappNumber,
          slackInvite: slackChannelInvite,
        },
      };

      if (formId && !formId.startsWith('local-')) {
        await fetchApi(`/sections/${formId}`, {
          method: 'PUT',
          body: JSON.stringify({
            contentPayload: formPayload,
            isActive: formActive,
          }),
        });
      } else {
        const created = await fetchApi<any>('/pages/contact/sections', {
          method: 'POST',
          body: JSON.stringify({
            sectionIdentifier: 'contact-form',
            componentType: 'CONTACT',
            displayOrder: 2,
            contentPayload: formPayload,
            isActive: formActive,
          }),
        });
        if (created?.id) setFormId(created.id);
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
        const created = await fetchApi<any>('/pages/contact/sections', {
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

      notify.success('All Contact Page sections saved successfully.');
    } catch (err: any) {
      notify.error(err?.message || 'Failed to save Contact page sections.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 w-full">
      <SectionsHeader
        pageTitle="Contact"
        pageRoute="/contact"
        layoutLabel="DIRECT INQUIRY DESK"
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
            value="form"
            className="rounded-xl text-xs font-semibold px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
          >
            2. Inquiry Form & Channels
          </TabsTrigger>
          <TabsTrigger
            value="outcomes"
            className="rounded-xl text-xs font-semibold px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
          >
            3. Guarantees & SLA
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
                  Header headline, background artwork, and key response credentials.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Active</span>
                <Switch checked={heroActive} onCheckedChange={setHeroActive} />
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div>
                <Label>Eyebrow</Label>
                <Input
                  value={heroEyebrow}
                  onChange={(e) => setHeroEyebrow(e.target.value)}
                  className="h-10 text-xs rounded-xl border-slate-200/90"
                />
              </div>

              <div className="pt-2">
                <ImageUploadField
                  label="Hero Background Artwork / Graphic"
                  description="Upload or enter URL for the contact hero banner visual."
                  value={heroBackgroundImage}
                  onChange={setHeroBackgroundImage}
                  placeholder="/assets/editorial/agency-hero-editorial.png"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Headline</Label>
                  <Input
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
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
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Response & SLA Strip</h4>
                    <p className="text-[11px] text-slate-500">4 trust credentials displayed in the hero</p>
                  </div>
                  <Switch checked={showHeroStrip} onCheckedChange={setShowHeroStrip} />
                </div>

                {showHeroStrip && (
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
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 2: FORM & CHANNELS ── */}
        <TabsContent value="form" className="space-y-4">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">Inquiry Form & Official Channels</CardTitle>
                <CardDescription className="text-xs">
                  Configure form headers, button copy, and direct email/phone/office details.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Active</span>
                <Switch checked={formActive} onCheckedChange={setFormActive} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Form Title</Label>
                  <Input
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Form Subtitle</Label>
                  <Input
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Submit Button Copy</Label>
                  <Input
                    value={submitButtonText}
                    onChange={(e) => setSubmitButtonText(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 mb-3">Direct Contact Channels</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-blue-600" />
                      <span>Official Email Address</span>
                    </Label>
                    <Input
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Direct Phone / Hotline</span>
                    </Label>
                    <Input
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-rose-600" />
                      <span>Physical Headquarters Address</span>
                    </Label>
                    <Input
                      value={contactAddress}
                      onChange={(e) => setContactAddress(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-amber-600" />
                      <span>Operating Office Hours</span>
                    </Label>
                    <Input
                      value={contactOfficeHours}
                      onChange={(e) => setContactOfficeHours(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                      <span>WhatsApp Direct Number</span>
                    </Label>
                    <Input
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
                      <span>Dedicated Slack Channel Link</span>
                    </Label>
                    <Input
                      value={slackChannelInvite}
                      onChange={(e) => setSlackChannelInvite(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 3: GUARANTEES & OUTCOMES ── */}
        <TabsContent value="outcomes" className="space-y-4">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">Guarantees & SLA Outcomes</CardTitle>
                <CardDescription className="text-xs">
                  Reassurance cards highlighting rapid response, NDA protection, and direct access.
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
                  <h4 className="text-xs font-bold text-slate-800">Outcome Cards ({outcomes.length})</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setOutcomes([
                        ...outcomes,
                        { title: 'New Guarantee', desc: 'Explanation of service level guarantee.', badge: 'SLA' },
                      ])
                    }
                    className="h-8 text-xs font-semibold"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Guarantee
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
              <CardTitle className="text-base font-bold">Contact Page SEO & Metadata</CardTitle>
              <CardDescription className="text-xs">
                Search indexing tags, canonical link, and social card preview.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Meta Title</Label>
                <Input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Contact Us | Gypsym Technology"
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
                    placeholder="https://gypsym.com/contact"
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
