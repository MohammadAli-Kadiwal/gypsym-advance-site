'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Save,
  Check,
  ShieldCheck,
  ArrowRight,
  ShieldAlert,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Globe,
  Building2,
  Calendar,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Eye,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { AdminContentContainer, AdminPageHeader } from '@/components/layout/admin-page';
import { fetchApi, normalizeErrorMessage } from '@/lib/api-client';
import { notify } from '@/lib/notifications';

interface ContactSettingsData {
  primaryEmail: string;
  primaryPhone: string;
  secondaryPhone: string;
  whatsappNumber: string;
  whatsappMessage: string;
  whatsappUrl: string;
  bookingUrl: string;
  projectEmail: string;
  advisoryEmail: string;
  securityEmail: string;
  supportEmail: string;
  headquartersAddress: string;
  secondaryAddress: string;
  officeHours: string;
  timezone: string;
  companyName: string;
  legalName: string;
  tagline: string;
  legalJurisdiction: string;
  country: string;
  googleMapsUrl: string;
}

const DEFAULT_SETTINGS: ContactSettingsData = {
  primaryEmail: 'hello@gypsym.com',
  primaryPhone: '+1 (800) 928-4019',
  secondaryPhone: '+44 20 7946 0991',
  whatsappNumber: '+91 73397 26403',
  whatsappMessage: "Hi Gypsym team, I'd like to discuss a Shopify project.",
  whatsappUrl: 'https://wa.me/917339726403?text=Hi%20Gypsym%20team%2C%20I%27d%20like%20to%20discuss%20a%20Shopify%20project.',
  bookingUrl: '/book',
  projectEmail: 'project@gypsym.com',
  advisoryEmail: 'advisory@gypsym.com',
  securityEmail: 'security@gypsym.com',
  supportEmail: 'support@gypsym.com',
  headquartersAddress: '100 Bishopsgate, London EC2N 4AG, United Kingdom',
  secondaryAddress: 'Surat, Gujarat, India (Engineering Hub)',
  officeHours: 'Mon – Fri: 08:00 – 18:00 EST',
  timezone: 'America/New_York (EST)',
  companyName: 'Gypsym Technology',
  legalName: 'Gypsym Global Enterprises Inc.',
  tagline: 'Shopify & Shopify Plus Engineering Agency',
  legalJurisdiction: 'Delaware, United States & London, United Kingdom',
  country: 'United Kingdom',
  googleMapsUrl: '',
};

export default function SiteSettingsPage() {
  const [formData, setFormData] = React.useState<ContactSettingsData>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('channels');
  const [lastSavedTime, setLastSavedTime] = React.useState<string | null>(null);

  // Load existing contact settings from API
  const loadSettings = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetchApi<any>('/settings/contact');
      const data = res?.data || res || {};
      setFormData((prev) => ({
        ...prev,
        ...data,
      }));
    } catch (err) {
      notify.error({
        title: 'Failed to load contact settings',
        description: normalizeErrorMessage(err),
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Update a field and auto-update WhatsApp URL if applicable
  const handleChange = (field: keyof ContactSettingsData, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === 'whatsappNumber' || field === 'whatsappMessage') {
        const cleanNumber = (field === 'whatsappNumber' ? value : prev.whatsappNumber).replace(/[^0-9]/g, '');
        const msg = field === 'whatsappMessage' ? value : prev.whatsappMessage;
        if (cleanNumber) {
          updated.whatsappUrl = `https://wa.me/${cleanNumber}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`;
        }
      }

      return updated;
    });
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setIsSaving(true);
      await fetchApi('/settings/contact', {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      setIsSaved(true);
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      notify.success({
        title: 'Contact Settings Synchronized',
        description: 'Global site contact info, WhatsApp links, and search schemas are now updated across all channels.',
      });
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      notify.error({
        title: 'Save Failed',
        description: normalizeErrorMessage(err),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminContentContainer variant="standard" className="space-y-6 pb-28">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <AdminPageHeader
          title="All-in-One Site Contact & Entity Settings"
          description="Centrally manage primary communications, WhatsApp hotline, global office headquarters, departmental inboxes, and legal corporate identity across all pages, footers, forms, and schemas."
        />
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadSettings}
            disabled={isLoading || isSaving}
            className="text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => handleSave()}
            disabled={isLoading || isSaving}
            className="shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Saving...
              </>
            ) : isSaved ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-300" /> Saved!
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 mr-1.5" /> Save All Contact Info
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Integration & Security Quick Hub Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Link
          href="/site/settings/email"
          className="group p-4 rounded-xl bg-card border border-border/80 hover:border-primary/50 hover:shadow-sm transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0">
              <Mail className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                Email & SMTP Relay
              </div>
              <div className="text-[11px] text-muted-foreground truncate">
                Inquiry routing & alerts
              </div>
            </div>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
        </Link>

        <Link
          href="/settings/footer"
          className="group p-4 rounded-xl bg-card border border-border/80 hover:border-blue-500/50 hover:shadow-sm transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform shrink-0">
              <Layers className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                Global Footer Builder
              </div>
              <div className="text-[11px] text-muted-foreground truncate">
                Columns, links & badges
              </div>
            </div>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
        </Link>

        <Link
          href="/site/seo"
          className="group p-4 rounded-xl bg-card border border-border/80 hover:border-purple-500/50 hover:shadow-sm transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                SEO & Schema Center
              </div>
              <div className="text-[11px] text-muted-foreground truncate">
                Org schema & OG images
              </div>
            </div>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
        </Link>

        <Link
          href="/site/settings/recaptcha"
          className="group p-4 rounded-xl bg-card border border-border/80 hover:border-emerald-500/50 hover:shadow-sm transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                reCAPTCHA Defense
              </div>
              <div className="text-[11px] text-muted-foreground truncate">
                Lead spam protection
              </div>
            </div>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
        </Link>
      </div>

      {/* Sync Status Bar */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span>
            Changes saved here automatically sync with <strong className="text-foreground">general:contact</strong>,{' '}
            <strong className="text-foreground">general:entity</strong>, and mirror into{' '}
            <strong className="text-foreground">seo:global</strong> JSON-LD schemas.
          </span>
        </div>
        {lastSavedTime && (
          <span className="text-[11px] text-muted-foreground shrink-0 hidden sm:inline-block">
            Last synced: {lastSavedTime}
          </span>
        )}
      </div>

      {/* Tabbed Configuration Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full h-auto p-1 gap-1 bg-muted/50 rounded-xl border border-border/60">
          <TabsTrigger value="channels" className="text-xs py-2 data-[state=active]:bg-card flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" />
            <span>Primary & WhatsApp</span>
          </TabsTrigger>
          <TabsTrigger value="offices" className="text-xs py-2 data-[state=active]:bg-card flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            <span>Offices & Hours</span>
          </TabsTrigger>
          <TabsTrigger value="departments" className="text-xs py-2 data-[state=active]:bg-card flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            <span>Department Inboxes</span>
          </TabsTrigger>
          <TabsTrigger value="entity" className="text-xs py-2 data-[state=active]:bg-card flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            <span>Corporate Entity</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="text-xs py-2 data-[state=active]:bg-card flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            <span>Live Site Preview</span>
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSave} className="space-y-6">
          {/* ── TAB 1: Primary Channels & WhatsApp Hotline ────────────────── */}
          <TabsContent value="channels" className="space-y-6 m-0">
            <Card className="p-6 border-border/80">
              <CardHeader className="p-0 border-b border-border/40 pb-4 mb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      Primary Customer & Client Channels
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      The core email, telephone, and direct communication conduits displayed across the Contact page, hero quick-actions, and header.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-[11px] bg-primary/5 text-primary border-primary/20">
                    High Visibility
                  </Badge>
                </div>
              </CardHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    Executive Inquiries Email <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={formData.primaryEmail}
                    onChange={(e) => handleChange('primaryEmail', e.target.value)}
                    placeholder="hello@gypsym.com"
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Shown on the main Contact page, hero email action, and general inquiries.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    Global Switchboard Phone <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={formData.primaryPhone}
                    onChange={(e) => handleChange('primaryPhone', e.target.value)}
                    placeholder="+1 (800) 928-4019"
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Toll-free or global primary voice line with international country code.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    Secondary / Regional Phone
                  </label>
                  <Input
                    value={formData.secondaryPhone}
                    onChange={(e) => handleChange('secondaryPhone', e.target.value)}
                    placeholder="+44 20 7946 0991"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    UK, Europe, or alternative operational telephone line.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    Booking Calendar URL
                  </label>
                  <Input
                    value={formData.bookingUrl}
                    onChange={(e) => handleChange('bookingUrl', e.target.value)}
                    placeholder="/book"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Relative route (e.g. <code className="text-foreground">/book</code>) or external Calendly link.
                  </p>
                </div>
              </div>
            </Card>

            {/* WhatsApp Integration Hub Card */}
            <Card className="p-6 border-emerald-500/30 bg-emerald-500/[0.02]">
              <CardHeader className="p-0 border-b border-emerald-500/20 pb-4 mb-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base text-foreground">
                        WhatsApp Business & Click-to-Chat Hotline
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        Drives the floating quick-chat button, Direct Channels section, and Booking Calendar fallback.
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                    Live Hotline
                  </Badge>
                </div>
              </CardHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    WhatsApp Business Number <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={formData.whatsappNumber}
                    onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                    placeholder="+91 73397 26403"
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Include country code (+91, +1, +44). Digits are automatically stripped for wa.me links.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Pre-filled Client Welcome Message
                  </label>
                  <Input
                    value={formData.whatsappMessage}
                    onChange={(e) => handleChange('whatsappMessage', e.target.value)}
                    placeholder="Hi Gypsym team, I'd like to discuss a Shopify project."
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Auto-populates in the client's WhatsApp chat window when clicked.
                  </p>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Generated Click-to-Chat URL (wa.me)</span>
                    {formData.whatsappUrl && (
                      <a
                        href={formData.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <span>Test WhatsApp Link</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </label>
                  <Input
                    value={formData.whatsappUrl}
                    onChange={(e) => handleChange('whatsappUrl', e.target.value)}
                    placeholder="https://wa.me/917339726403?text=..."
                    className="font-mono text-xs bg-muted/30"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Calculated automatically from number and message above. You can also paste an explicit custom wa.link or api.whatsapp.com URL.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ── TAB 2: Office Coordinates & Working Hours ───────────────── */}
          <TabsContent value="offices" className="space-y-6 m-0">
            <Card className="p-6 border-border/80">
              <CardHeader className="p-0 border-b border-border/40 pb-4 mb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Physical Headquarters & Operational Hours
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      Displayed on the Contact page corporate card, website footer, and structured local business schema.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-[11px]">
                    Global Presence
                  </Badge>
                </div>
              </CardHeader>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    Global Headquarters Address <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={formData.headquartersAddress}
                    onChange={(e) => handleChange('headquartersAddress', e.target.value)}
                    placeholder="100 Bishopsgate, London EC2N 4AG, United Kingdom"
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Primary corporate address referenced in footer copyright and official legal notices.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    Secondary / Engineering Hub Address
                  </label>
                  <Input
                    value={formData.secondaryAddress}
                    onChange={(e) => handleChange('secondaryAddress', e.target.value)}
                    placeholder="Surat, Gujarat, India (Engineering Hub)"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Development center, regional satellite office, or operations hub.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      Office Working Hours
                    </label>
                    <Input
                      value={formData.officeHours}
                      onChange={(e) => handleChange('officeHours', e.target.value)}
                      placeholder="Mon – Fri: 08:00 – 18:00 EST"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Shown on contact cards & customer care notice.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      Operating Timezone
                    </label>
                    <Input
                      value={formData.timezone}
                      onChange={(e) => handleChange('timezone', e.target.value)}
                      placeholder="America/New_York (EST)"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Reference timezone for booking availability.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      Country of Domicile
                    </label>
                    <Input
                      value={formData.country}
                      onChange={(e) => handleChange('country', e.target.value)}
                      placeholder="United Kingdom"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Used in international SEO schema markup.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    Google Maps Link / Coordinates
                  </label>
                  <Input
                    value={formData.googleMapsUrl}
                    onChange={(e) => handleChange('googleMapsUrl', e.target.value)}
                    placeholder="https://maps.google.com/?q=100+Bishopsgate+London"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Optional direct link to Google Maps or embed URL.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ── TAB 3: Department Inboxes ────────────────────────────────── */}
          <TabsContent value="departments" className="space-y-6 m-0">
            <Card className="p-6 border-border/80">
              <CardHeader className="p-0 border-b border-border/40 pb-4 mb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      Specialized Departmental Inboxes
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      Route project RFPs, security advisories, enterprise partnerships, and post-launch maintenance to dedicated team members.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-[11px]">
                    Email Routing
                  </Badge>
                </div>
              </CardHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-4 rounded-xl border border-border/70 bg-card/60 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <Mail className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">Project Briefs & RFPs</div>
                      <div className="text-[10px] text-muted-foreground">Direct Channels card #2</div>
                    </div>
                  </div>
                  <Input
                    value={formData.projectEmail}
                    onChange={(e) => handleChange('projectEmail', e.target.value)}
                    placeholder="project@gypsym.com"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Used on the "Email us for briefs, RFPs and attachments" card.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border/70 bg-card/60 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Mail className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">Advisory & Enterprise Sales</div>
                      <div className="text-[10px] text-muted-foreground">Enterprise audits & retainers</div>
                    </div>
                  </div>
                  <Input
                    value={formData.advisoryEmail}
                    onChange={(e) => handleChange('advisoryEmail', e.target.value)}
                    placeholder="advisory@gypsym.com"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Addressed in client audit consultations and high-growth advisory inquiries.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border/70 bg-card/60 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
                      <ShieldAlert className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">Security, Privacy & Compliance</div>
                      <div className="text-[10px] text-muted-foreground">Privacy policy & SOC2 reports</div>
                    </div>
                  </div>
                  <Input
                    value={formData.securityEmail}
                    onChange={(e) => handleChange('securityEmail', e.target.value)}
                    placeholder="security@gypsym.com"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Referenced in Privacy, Cookie Policy, Terms of Service, and Certifications.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border/70 bg-card/60 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">Client Support & Help Desk</div>
                      <div className="text-[10px] text-muted-foreground">Existing store accounts</div>
                    </div>
                  </div>
                  <Input
                    value={formData.supportEmail}
                    onChange={(e) => handleChange('supportEmail', e.target.value)}
                    placeholder="support@gypsym.com"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Dedicated ticket inbox for ongoing retainer clients and technical triage.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ── TAB 4: Corporate Entity & Legal Registration ─────────────── */}
          <TabsContent value="entity" className="space-y-6 m-0">
            <Card className="p-6 border-border/80">
              <CardHeader className="p-0 border-b border-border/40 pb-4 mb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      Corporate Legal Entity Registration
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      Official company legal names used for copyright declarations, legal disclaimers, invoices, and organization schema.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-[11px]">
                    Legal Disclosures
                  </Badge>
                </div>
              </CardHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Operating Brand Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    placeholder="Gypsym Technology"
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Public customer-facing agency brand name (used in headers & SEO titles).
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Incorporated Legal Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={formData.legalName}
                    onChange={(e) => handleChange('legalName', e.target.value)}
                    placeholder="Gypsym Global Enterprises Inc."
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Full corporate registered company name as filed with the state/registrar.
                  </p>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-foreground">Corporate Tagline</label>
                  <Input
                    value={formData.tagline}
                    onChange={(e) => handleChange('tagline', e.target.value)}
                    placeholder="Shopify & Shopify Plus Engineering Agency"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Agency mission phrase or descriptor.
                  </p>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-foreground">
                    Legal Jurisdiction & Incorporation
                  </label>
                  <Input
                    value={formData.legalJurisdiction}
                    onChange={(e) => handleChange('legalJurisdiction', e.target.value)}
                    placeholder="Delaware, United States & London, United Kingdom"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Governing jurisdiction for contract resolution, terms, and tax disclosures.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ── TAB 5: Live Site Preview ─────────────────────────────────── */}
          <TabsContent value="preview" className="space-y-6 m-0">
            <Card className="p-6 border-border/80">
              <CardHeader className="p-0 border-b border-border/40 pb-4 mb-5">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    Live Website Integration Preview
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Visual simulation of how your updated contact settings appear across live site components.
                  </CardDescription>
                </div>
              </CardHeader>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contact Page Coordinates Card Preview */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 text-muted-foreground">
                    <span>1. Contact Page Corporate Card</span>
                  </div>
                  <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Direct Channels
                    </div>
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-[#d9287c]">
                          <Mail className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-semibold text-muted-foreground">Executive Desk</div>
                          <div className="font-semibold text-foreground">{formData.primaryEmail || 'hello@gypsym.com'}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-[#d9287c]">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-semibold text-muted-foreground">Direct Telephone</div>
                          <div className="font-semibold text-foreground">{formData.primaryPhone || '+1 (800) 928-4019'}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-[#d9287c]">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-semibold text-muted-foreground">Headquarters</div>
                          <div className="font-semibold text-foreground">{formData.headquartersAddress || '100 Bishopsgate, London'}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-[#d9287c]">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-semibold text-muted-foreground">Working Hours</div>
                          <div className="font-semibold text-foreground">{formData.officeHours || 'Mon – Fri: 08:00 – 18:00 EST'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Channels Cards Preview */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 text-muted-foreground">
                    <span>2. Direct Channels Cards (Contact & Booking)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-card border border-border space-y-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-xs font-bold">Email us</div>
                      <div className="text-[11px] text-muted-foreground">Briefs, RFPs & attachments</div>
                      <div className="text-xs font-semibold text-primary">{formData.projectEmail || formData.primaryEmail} →</div>
                    </div>

                    <div className="p-4 rounded-xl bg-card border border-emerald-500/30 bg-emerald-500/[0.02] space-y-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <MessageCircle className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-xs font-bold">WhatsApp</div>
                      <div className="text-[11px] text-muted-foreground">Quick questions & direct chat</div>
                      <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{formData.whatsappNumber} →</div>
                    </div>
                  </div>
                </div>

                {/* Footer Preview */}
                <div className="space-y-3 lg:col-span-2">
                  <div className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 text-muted-foreground">
                    <span>3. Global Footer Contact Declaration</span>
                  </div>
                  <div className="p-5 rounded-2xl bg-neutral-950 text-neutral-100 border border-neutral-800 space-y-3 font-mono text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                      <div className="font-sans font-bold text-base text-white">{formData.companyName}</div>
                      <div className="text-[11px] text-neutral-400">
                        {formData.legalName} • {formData.country}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-6 text-neutral-300 text-xs">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{formData.primaryEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{formData.primaryPhone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{formData.headquartersAddress}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Sticky Bottom Save Actions */}
          <div className="sticky bottom-4 z-20 flex items-center justify-between p-4 rounded-xl bg-card/95 backdrop-blur-md border border-border shadow-lg">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {isSaved ? (
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-4 w-4" /> All contact info saved and synchronized
                </span>
              ) : (
                <span>Remember to click save to update global site channels and SEO schemas.</span>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSaving}
              className="shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 px-6"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Saving Changes...
                </>
              ) : isSaved ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-emerald-300" /> Saved Successfully
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" /> Save All Contact Info
                </>
              )}
            </Button>
          </div>
        </form>
      </Tabs>
    </AdminContentContainer>
  );
}
