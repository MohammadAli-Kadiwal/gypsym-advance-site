'use client';

import * as React from 'react';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Code,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Layers,
  Share2,
  HelpCircle,
  FileCode,
} from 'lucide-react';
import { notify } from '@/lib/notifications';
import { settingsService } from '@/services/settings.service';

interface ScriptSettings {
  googleAnalytics: {
    enabled: boolean;
    measurementId: string;
  };
  googleTagManager: {
    enabled: boolean;
    containerId: string;
  };
  facebookPixel: {
    enabled: boolean;
    pixelId: string;
  };
  headerScripts: string;
  footerScripts: string;
}

const DEFAULT_SETTINGS: ScriptSettings = {
  googleAnalytics: {
    enabled: true,
    measurementId: 'G-74X9KLV28P',
  },
  googleTagManager: {
    enabled: false,
    containerId: '',
  },
  facebookPixel: {
    enabled: false,
    pixelId: '',
  },
  headerScripts: '',
  footerScripts: '',
};

export default function AnalyticsScriptsSettingsPage() {
  const [settings, setSettings] = React.useState<ScriptSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);

  // Fetch settings from API
  React.useEffect(() => {
    async function loadSettings() {
      try {
        const res: any = await settingsService.getScripts();
        if (res) {
          setSettings({
            googleAnalytics: {
              enabled: res.googleAnalytics?.enabled !== false,
              measurementId: res.googleAnalytics?.measurementId || '',
            },
            googleTagManager: {
              enabled: !!res.googleTagManager?.enabled,
              containerId: res.googleTagManager?.containerId || '',
            },
            facebookPixel: {
              enabled: !!res.facebookPixel?.enabled,
              pixelId: res.facebookPixel?.pixelId || '',
            },
            headerScripts: res.headerScripts || '',
            footerScripts: res.footerScripts || '',
          });
        }
      } catch (err: any) {
        notify.error('Could not load current script settings. Using standard defaults.');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  // Keyboard shortcut Ctrl/Cmd + S to save
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings]);

  const updateSetting = <K extends keyof ScriptSettings>(key: K, value: ScriptSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Validation checks
    if (settings.googleAnalytics.enabled && settings.googleAnalytics.measurementId) {
      const cleanGa = settings.googleAnalytics.measurementId.trim().toUpperCase();
      if (!cleanGa.startsWith('G-') && !cleanGa.startsWith('UA-')) {
        notify.error('Google Analytics Measurement ID typically starts with "G-" (e.g. G-XXXXXXXXXX).');
      }
    }

    if (settings.googleTagManager.enabled && settings.googleTagManager.containerId) {
      const cleanGtm = settings.googleTagManager.containerId.trim().toUpperCase();
      if (!cleanGtm.startsWith('GTM-')) {
        notify.error('Google Tag Manager Container ID should start with "GTM-" (e.g. GTM-XXXXXXX).');
      }
    }

    setSaving(true);
    try {
      await settingsService.updateScripts(settings);

      setHasChanges(false);
      notify.success('Analytics and custom scripts successfully updated and deployed to public website!');
    } catch (err: any) {
      notify.error(err?.message || 'Failed to update script settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* ── HEADER & ACTIONS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
              Site & Branding
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Tracking & Code Injection</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Code className="w-6 h-6 text-blue-600" />
            <span>Analytics & Custom Scripts</span>
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Integrate Google Analytics (GA4), Meta (Facebook) Pixel, Google Tag Manager, and custom &lt;head&gt; / &lt;body&gt; scripts on all public website pages.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl h-9 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-1.5 min-w-[115px]"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : hasChanges ? (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
          <span className="text-xs">Loading analytics & script settings...</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* ── GOOGLE ANALYTICS (GA4) ── */}
          <Card className="rounded-2xl border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200/70 flex items-center justify-center text-orange-600">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Google Analytics 4 (GA4)
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Automated page views, session measurement, and conversion event tracking.
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={settings.googleAnalytics.enabled}
                  onCheckedChange={(val) =>
                    updateSetting('googleAnalytics', {
                      ...settings.googleAnalytics,
                      enabled: val,
                    })
                  }
                />
                <span className="text-xs font-semibold text-slate-700">
                  {settings.googleAnalytics.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 max-w-lg">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <span>GA4 Measurement ID</span>
                <span className="text-[10px] text-slate-400 font-normal font-mono">(Format: G-XXXXXXXXXX)</span>
              </label>
              <Input
                value={settings.googleAnalytics.measurementId}
                onChange={(e) =>
                  updateSetting('googleAnalytics', {
                    ...settings.googleAnalytics,
                    measurementId: e.target.value.trim(),
                  })
                }
                placeholder="G-74X9KLV28P"
                className="text-xs font-mono rounded-xl h-9"
              />
              <p className="text-[11px] text-slate-500">
                Found in Google Analytics under Admin → Data Streams → Stream details.
              </p>
            </div>
          </Card>

          {/* ── GOOGLE TAG MANAGER (GTM) ── */}
          <Card className="rounded-2xl border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/70 flex items-center justify-center text-blue-600">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Google Tag Manager (GTM)
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Centralized tag firing container for marketing, remarketing, and analytics pixels.
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={settings.googleTagManager.enabled}
                  onCheckedChange={(val) =>
                    updateSetting('googleTagManager', {
                      ...settings.googleTagManager,
                      enabled: val,
                    })
                  }
                />
                <span className="text-xs font-semibold text-slate-700">
                  {settings.googleTagManager.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 max-w-lg">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <span>GTM Container ID</span>
                <span className="text-[10px] text-slate-400 font-normal font-mono">(Format: GTM-XXXXXXX)</span>
              </label>
              <Input
                value={settings.googleTagManager.containerId}
                onChange={(e) =>
                  updateSetting('googleTagManager', {
                    ...settings.googleTagManager,
                    containerId: e.target.value.trim(),
                  })
                }
                placeholder="GTM-N89B72L"
                className="text-xs font-mono rounded-xl h-9"
              />
              <p className="text-[11px] text-slate-500">
                Injected in the &lt;head&gt; container on all public pages.
              </p>
            </div>
          </Card>

          {/* ── META (FACEBOOK) PIXEL ── */}
          <Card className="rounded-2xl border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200/70 flex items-center justify-center text-indigo-600">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Meta (Facebook) Pixel
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Tracks conversion events, custom audiences, and ad performance for Meta ads.
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={settings.facebookPixel.enabled}
                  onCheckedChange={(val) =>
                    updateSetting('facebookPixel', {
                      ...settings.facebookPixel,
                      enabled: val,
                    })
                  }
                />
                <span className="text-xs font-semibold text-slate-700">
                  {settings.facebookPixel.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 max-w-lg">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <span>Meta Pixel ID (Dataset ID)</span>
                <span className="text-[10px] text-slate-400 font-normal font-mono">(Digits only)</span>
              </label>
              <Input
                value={settings.facebookPixel.pixelId}
                onChange={(e) =>
                  updateSetting('facebookPixel', {
                    ...settings.facebookPixel,
                    pixelId: e.target.value.trim(),
                  })
                }
                placeholder="1049284719284729"
                className="text-xs font-mono rounded-xl h-9"
              />
              <p className="text-[11px] text-slate-500">
                Found in Meta Events Manager under Data Sources → Settings → Pixel ID.
              </p>
            </div>
          </Card>

          {/* ── CUSTOM HEADER SCRIPTS (<HEAD>) ── */}
          <Card className="rounded-2xl border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-600">
                <FileCode className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Header Code & Custom Scripts (&lt;head&gt;)
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Raw HTML, &lt;script&gt;, &lt;meta&gt;, or &lt;link&gt; tags injected into the document &lt;head&gt; across the entire public website.
                </CardDescription>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold">HTML / JavaScript Snippet</span>
                <span className="text-[11px] text-slate-400">e.g. Hotjar, Microsoft Clarity, Search Console meta tags</span>
              </div>
              <Textarea
                rows={5}
                value={settings.headerScripts}
                onChange={(e) => updateSetting('headerScripts', e.target.value)}
                placeholder="<!-- Hotjar Tracking Code -->&#10;<script>&#10;  (function(h,o,t,j,a,r){ ... })();&#10;</script>"
                className="font-mono text-xs rounded-xl bg-slate-950 text-emerald-400 border-slate-800 focus:border-blue-500"
              />
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>Ensure scripts are properly wrapped in &lt;script&gt; tags or are valid HTML tags.</span>
              </div>
            </div>
          </Card>

          {/* ── CUSTOM FOOTER / BODY SCRIPTS ── */}
          <Card className="rounded-2xl border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200/70 flex items-center justify-center text-purple-600">
                <Code className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Footer / Body End Scripts (&lt;body&gt;)
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Raw HTML and scripts injected right before the closing &lt;/body&gt; tag (ideal for live chat widgets, popups, and conversion pixels).
                </CardDescription>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold">HTML / JavaScript Snippet</span>
                <span className="text-[11px] text-slate-400">e.g. Intercom, Zendesk Chat, Crisp, HubSpot tracking</span>
              </div>
              <Textarea
                rows={5}
                value={settings.footerScripts}
                onChange={(e) => updateSetting('footerScripts', e.target.value)}
                placeholder="<!-- Live Chat or Conversion Tracker -->&#10;<script>&#10;  window.$crisp=[];window.CRISP_WEBSITE_ID='...';&#10;</script>"
                className="font-mono text-xs rounded-xl bg-slate-950 text-emerald-400 border-slate-800 focus:border-blue-500"
              />
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>Runs after DOM content has loaded without blocking page render speed.</span>
              </div>
            </div>
          </Card>

          {/* Save Button Row */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="rounded-xl h-10 px-6 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deploying Scripts...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save & Deploy Tracking Scripts</span>
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
