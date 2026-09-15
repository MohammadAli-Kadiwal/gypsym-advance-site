'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { INITIAL_SITE_SETTINGS } from '@/lib/store';
import { Save, Check, ShieldCheck, Mail, ArrowRight } from 'lucide-react';

export default function SiteSettingsPage() {
  const [settings, setSettings] = React.useState(INITIAL_SITE_SETTINGS);
  const [saved, setSaved] = React.useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-border/40 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Global Enterprise Site Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Corporate entity identification, primary contacts, regulatory jurisdictions, and timezones.
        </p>
      </div>

      {/* Quick Security & Messaging Settings Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/site/settings/recaptcha"
          className="group p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                reCAPTCHA v3 & Bot Protection
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Invisible risk analysis for public forms
              </div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/site/settings/email"
          className="group p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Email / SMTP Configuration
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Outbound mail servers and auto-responders
              </div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6 space-y-4">
          <CardHeader className="p-0 border-b border-border/40 pb-3">
            <CardTitle className="text-sm">Corporate Legal Entity</CardTitle>
            <CardDescription className="text-xs">
              Official company naming used across legal disclosures and footer copyright declarations.
            </CardDescription>
          </CardHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Company Name</label>
              <Input
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Corporate Tagline</label>
              <Input
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-foreground">Global Headquarters Address</label>
              <Input
                value={settings.headquarters}
                onChange={(e) => setSettings({ ...settings, headquarters: e.target.value })}
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-foreground">Legal Jurisdiction & Incorporation</label>
              <Input
                value={settings.legalJurisdiction}
                onChange={(e) => setSettings({ ...settings, legalJurisdiction: e.target.value })}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <CardHeader className="p-0 border-b border-border/40 pb-3">
            <CardTitle className="text-sm">Operational Communications</CardTitle>
            <CardDescription className="text-xs">
              Primary briefing inbox and switchboard contact numbers.
            </CardDescription>
          </CardHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Executive Inquiries Email</label>
              <Input
                value={settings.primaryEmail}
                onChange={(e) => setSettings({ ...settings, primaryEmail: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Global Switchboard Phone</label>
              <Input
                value={settings.primaryPhone}
                onChange={(e) => setSettings({ ...settings, primaryPhone: e.target.value })}
              />
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-end">
          <Button type="submit" size="sm" className="shadow-sm">
            {saved ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-400" /> Saved Settings
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 mr-1.5" /> Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
