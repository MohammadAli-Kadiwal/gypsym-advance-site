'use client';

import * as React from 'react';
import {
  Globe,
  Save,
  Loader2,
  Building2,
  Share2,
  Key,
  BarChart3,
  Plus,
  Trash2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { GlobalSeoSettings } from './types';

interface GlobalSeoTabProps {
  settings: GlobalSeoSettings;
  onChange: (updated: GlobalSeoSettings) => void;
  onSave: () => void;
  saving: boolean;
}

export function GlobalSeoTab({
  settings,
  onChange,
  onSave,
  saving,
}: GlobalSeoTabProps) {
  const [newKeyword, setNewKeyword] = React.useState('');

  const updateField = (field: keyof GlobalSeoSettings, val: any) => {
    onChange({ ...settings, [field]: val });
  };

  const addKeyword = () => {
    const trimmed = newKeyword.trim();
    if (!trimmed) return;
    const current = settings.defaultKeywords || [];
    if (!current.includes(trimmed)) {
      updateField('defaultKeywords', [...current, trimmed]);
    }
    setNewKeyword('');
  };

  const removeKeyword = (kw: string) => {
    const current = settings.defaultKeywords || [];
    updateField('defaultKeywords', current.filter((k) => k !== kw));
  };

  const addSocialProfile = () => {
    const current = settings.socialProfiles || [];
    updateField('socialProfiles', [...current, { platform: 'LinkedIn', url: '' }]);
  };

  const updateSocialProfile = (index: number, field: 'platform' | 'url', val: string) => {
    const current = [...(settings.socialProfiles || [])];
    if (current[index]) {
      current[index] = { ...current[index], [field]: val };
      updateField('socialProfiles', current);
    }
  };

  const removeSocialProfile = (index: number) => {
    const current = settings.socialProfiles || [];
    updateField('socialProfiles', current.filter((_, i) => i !== index));
  };

  const titleLength = (settings.defaultTitle || '').length;
  const descLength = (settings.defaultDescription || '').length;

  return (
    <div className="space-y-6">
      {/* Save Action Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Global Search & Entity Configuration</h3>
          <p className="text-xs text-slate-500">
            Changes are saved directly to PostgreSQL and applied across all server components.
          </p>
        </div>
        <Button
          onClick={onSave}
          disabled={saving}
          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs px-5 h-10 text-xs font-semibold cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" /> Save Global Settings
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: General Metadata */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Primary Search Titles & Meta Descriptions */}
          <Card className="rounded-2xl border-slate-200/80 p-5 space-y-4 bg-white shadow-2xs">
            <CardHeader className="p-0 border-b border-slate-100 pb-3">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-600" />
                <span>Search Engine Result Pages (SERP) Defaults</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Default titles, descriptions, and template formatting for pages without explicit overrides.
              </CardDescription>
            </CardHeader>

            <div className="space-y-4 pt-1">
              {/* Site Name & Site URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Site Name</label>
                  <Input
                    value={settings.siteName || ''}
                    onChange={(e) => updateField('siteName', e.target.value)}
                    placeholder="Gypsym Technology"
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Production Site URL</label>
                  <Input
                    value={settings.siteUrl || ''}
                    onChange={(e) => updateField('siteUrl', e.target.value)}
                    placeholder="https://gypsym.com"
                    className="rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              {/* Title Template */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Meta Title Template</label>
                  <span className="text-[10px] text-slate-400 font-mono">Variables: %s or &#123;pageTitle&#125;</span>
                </div>
                <Input
                  value={settings.metaTitleTemplate || ''}
                  onChange={(e) => updateField('metaTitleTemplate', e.target.value)}
                  placeholder="%s | Gypsym Technology"
                  className="rounded-xl text-xs font-mono"
                />
              </div>

              {/* Default Title */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Default Fallback SEO Title</label>
                  <span className={`text-[10px] font-mono ${titleLength >= 45 && titleLength <= 65 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    {titleLength} / 60 chars
                  </span>
                </div>
                <Input
                  value={settings.defaultTitle || ''}
                  onChange={(e) => updateField('defaultTitle', e.target.value)}
                  placeholder="Gypsym Technology | Shopify & Shopify Plus Agency"
                  className="rounded-xl text-xs"
                />
              </div>

              {/* Default Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Default Fallback Meta Description</label>
                  <span className={`text-[10px] font-mono ${descLength >= 120 && descLength <= 165 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    {descLength} / 160 chars
                  </span>
                </div>
                <Textarea
                  value={settings.defaultDescription || ''}
                  onChange={(e) => updateField('defaultDescription', e.target.value)}
                  rows={3}
                  placeholder="Comprehensive description of the enterprise engineering services..."
                  className="rounded-xl text-xs leading-relaxed"
                />
              </div>

              {/* Keywords Tag Manager */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">Topic Keywords (Planning & AEO Graph)</label>
                <div className="flex gap-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    placeholder="Add topic (e.g. headless commerce)..."
                    className="rounded-xl text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addKeyword}
                    className="rounded-xl text-xs shrink-0 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(settings.defaultKeywords || []).map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium"
                    >
                      <span>{kw}</span>
                      <button
                        type="button"
                        onClick={() => removeKeyword(kw)}
                        className="text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Card 2: Organization Entity & Structured Schema */}
          <Card className="rounded-2xl border-slate-200/80 p-5 space-y-4 bg-white shadow-2xs">
            <CardHeader className="p-0 border-b border-slate-100 pb-3">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-purple-600" />
                <span>Organization Identity & Knowledge Graph Profile</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Poured dynamically into Schema.org Organization, WebSite JSON-LD, and AI Generative search profiles.
              </CardDescription>
            </CardHeader>

            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Legal Organization Name</label>
                  <Input
                    value={settings.organizationName || ''}
                    onChange={(e) => updateField('organizationName', e.target.value)}
                    placeholder="Gypsym Technology"
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Default Author</label>
                  <Input
                    value={settings.defaultAuthor || ''}
                    onChange={(e) => updateField('defaultAuthor', e.target.value)}
                    placeholder="Gypsym Technology Engineering Team"
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Headquarters Address</label>
                  <Input
                    value={settings.address || ''}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="100 Bishopsgate, London EC2N 4AG"
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Country</label>
                  <Input
                    value={settings.country || ''}
                    onChange={(e) => updateField('country', e.target.value)}
                    placeholder="United Kingdom"
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Official Contact Email</label>
                  <Input
                    value={settings.email || ''}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="briefing@gypsym.com"
                    className="rounded-xl text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Official Contact Phone</label>
                  <Input
                    value={settings.phone || ''}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+44 20 7946 0991"
                    className="rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              {/* Social Profiles */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">SameAs Social Profiles (Schema.org & GEO)</label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addSocialProfile}
                    className="h-7 text-xs text-blue-600 hover:bg-blue-50 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Profile
                  </Button>
                </div>

                <div className="space-y-2">
                  {(settings.socialProfiles || []).map((prof, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        value={prof.platform}
                        onChange={(e) => updateSocialProfile(idx, 'platform', e.target.value)}
                        placeholder="Platform (e.g. LinkedIn)"
                        className="w-1/3 rounded-xl text-xs"
                      />
                      <Input
                        value={prof.url}
                        onChange={(e) => updateSocialProfile(idx, 'url', e.target.value)}
                        placeholder="https://..."
                        className="flex-1 rounded-xl text-xs font-mono"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSocialProfile(idx)}
                        className="text-slate-400 hover:text-rose-600 h-9 w-9 p-0 rounded-xl cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Imagery, Webmaster Tokens & Analytics */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 3: Social & OG Imagery */}
          <Card className="rounded-2xl border-slate-200/80 p-5 space-y-4 bg-white shadow-2xs">
            <CardHeader className="p-0 border-b border-slate-100 pb-3">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Share2 className="h-4 w-4 text-emerald-600" />
                <span>Default Open Graph & Social Cards</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Fallback preview media for Facebook, LinkedIn, X, and messaging cards.
              </CardDescription>
            </CardHeader>

            <div className="space-y-4 pt-1">
              <ImageUploadField
                label="Default OG Social Share Banner (1200x630)"
                value={settings.defaultOgImage || ''}
                onChange={(url) => updateField('defaultOgImage', url)}
                description="High-resolution banner (PNG/JPG, 1200x630px recommended)."
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Twitter Card Type</label>
                  <select
                    value={settings.twitterCard || 'summary_large_image'}
                    onChange={(e) => updateField('twitterCard', e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="summary_large_image">summary_large_image</option>
                    <option value="summary">summary</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Twitter Handle</label>
                  <Input
                    value={settings.twitterHandle || ''}
                    onChange={(e) => updateField('twitterHandle', e.target.value)}
                    placeholder="@gypsymtech"
                    className="rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              {/* Favicon path */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Favicon Path</label>
                <Input
                  value={settings.favicon || ''}
                  onChange={(e) => updateField('favicon', e.target.value)}
                  placeholder="/favicon.ico"
                  className="rounded-xl text-xs font-mono"
                />
              </div>
            </div>
          </Card>

          {/* Card 4: Search Engine Webmaster Verification */}
          <Card className="rounded-2xl border-slate-200/80 p-5 space-y-4 bg-white shadow-2xs">
            <CardHeader className="p-0 border-b border-slate-100 pb-3">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Key className="h-4 w-4 text-amber-600" />
                <span>Search Engine Verification Tokens</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Injected into &lt;meta name=&quot;google-site-verification&quot;&gt; tags automatically.
              </CardDescription>
            </CardHeader>

            <div className="space-y-3 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Google Search Console</label>
                <Input
                  value={settings.googleVerification || ''}
                  onChange={(e) => updateField('googleVerification', e.target.value)}
                  placeholder="google-site-verification token..."
                  className="rounded-xl text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Bing Webmaster Tools</label>
                <Input
                  value={settings.bingVerification || ''}
                  onChange={(e) => updateField('bingVerification', e.target.value)}
                  placeholder="msvalidate.01 token..."
                  className="rounded-xl text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Yandex Verification</label>
                  <Input
                    value={settings.yandexVerification || ''}
                    onChange={(e) => updateField('yandexVerification', e.target.value)}
                    placeholder="yandex token..."
                    className="rounded-xl text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Baidu Verification</label>
                  <Input
                    value={settings.baiduVerification || ''}
                    onChange={(e) => updateField('baiduVerification', e.target.value)}
                    placeholder="baidu token..."
                    className="rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Card 5: Analytics & Crawl Directives */}
          <Card className="rounded-2xl border-slate-200/80 p-5 space-y-4 bg-white shadow-2xs">
            <CardHeader className="p-0 border-b border-slate-100 pb-3">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <span>Global Crawling & Locale Defaults</span>
              </CardTitle>
            </CardHeader>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-slate-50/50">
                <div>
                  <span className="text-xs font-semibold text-slate-800">Global Robots Index</span>
                  <p className="text-[11px] text-slate-500">Allow search crawlers to index the site by default</p>
                </div>
                <Switch
                  checked={settings.robotsIndex !== false}
                  onCheckedChange={(checked) => updateField('robotsIndex', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-slate-50/50">
                <div>
                  <span className="text-xs font-semibold text-slate-800">Global Robots Follow</span>
                  <p className="text-[11px] text-slate-500">Allow crawlers to follow links across the site</p>
                </div>
                <Switch
                  checked={settings.robotsFollow !== false}
                  onCheckedChange={(checked) => updateField('robotsFollow', checked)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Default Language</label>
                  <Input
                    value={settings.defaultLanguage || 'en'}
                    onChange={(e) => updateField('defaultLanguage', e.target.value)}
                    className="rounded-xl text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Default Locale</label>
                  <Input
                    value={settings.defaultLocale || 'en_US'}
                    onChange={(e) => updateField('defaultLocale', e.target.value)}
                    className="rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
