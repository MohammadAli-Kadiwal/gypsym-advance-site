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
import { AdminContentContainer, AdminPageHeader } from '@/components/layout/admin-page';

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
    <AdminContentContainer variant="standard" className="space-y-6 pb-24">
      {/* ── HEADER & ACTIONS ── */}
      <AdminPageHeader
        title="Analytics & Custom Scripts"
        description="Integrate Google Analytics (GA4), Meta (Facebook) Pixel, Google Tag Manager, and custom <head> / <body> scripts on all public website pages."
        actions={
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl h-9 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs flex items-center gap-1.5 min-w-[115px]"
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
        }
      />

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
          <span className="text-xs">Loading analytics & script settings...</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* ── GOOGLE ANALYTICS (GA4) ── */}
          <Card className="rounded-2xl border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-card-foreground">
                    Google Analytics 4 (GA4)
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
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
                <span className="text-xs font-semibold text-foreground">
                  {settings.googleAnalytics.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 max-w-lg">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span>GA4 Measurement ID</span>
                <span className="text-[10px] text-muted-foreground font-normal font-mono">(Format: G-XXXXXXXXXX)</span>
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
              <p className="text-[11px] text-muted-foreground">
                Found in Google Analytics under Admin → Data Streams → Stream details.
              </p>
            </div>
          </Card>

          {/* ── GOOGLE TAG MANAGER (GTM) ── */}
          <Card className="rounded-2xl border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-card-foreground">
                    Google Tag Manager (GTM)
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
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
                <span className="text-xs font-semibold text-foreground">
                  {settings.googleTagManager.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 max-w-lg">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span>GTM Container ID</span>
                <span className="text-[10px] text-muted-foreground font-normal font-mono">(Format: GTM-XXXXXXX)</span>
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
              <p className="text-[11px] text-muted-foreground">
                Injected in the &lt;head&gt; container on all public pages.
              </p>
            </div>
          </Card>

          {/* ── META (FACEBOOK) PIXEL ── */}
          <Card className="rounded-2xl border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-card-foreground">
                    Meta (Facebook) Pixel
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
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
                <span className="text-xs font-semibold text-foreground">
                  {settings.facebookPixel.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 max-w-lg">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span>Meta Pixel ID (Dataset ID)</span>
                <span className="text-[10px] text-muted-foreground font-normal font-mono">(Digits only)</span>
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
              <p className="text-[11px] text-muted-foreground">
                Found in Meta Events Manager under Data Sources → Settings → Pixel ID.
              </p>
            </div>
          </Card>

          {/* ── CUSTOM HEADER SCRIPTS (<HEAD>) ── */}
          <Card className="rounded-2xl border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-border/50 pb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <FileCode className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-card-foreground">
                  Header Code & Custom Scripts (&lt;head&gt;)
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Raw HTML, &lt;script&gt;, &lt;meta&gt;, or &lt;link&gt; tags injected into the document &lt;head&gt; across the entire public website.
                </CardDescription>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">HTML / JavaScript Snippet</span>
                <span className="text-[11px] text-muted-foreground">e.g. Hotjar, Microsoft Clarity, Search Console meta tags</span>
              </div>
              <Textarea
                rows={5}
                value={settings.headerScripts}
                onChange={(e) => updateSetting('headerScripts', e.target.value)}
                placeholder="<!-- Hotjar Tracking Code -->&#10;<script>&#10;  (function(h,o,t,j,a,r){ ... })();&#10;</script>"
                className="font-mono text-xs rounded-xl bg-slate-950 text-emerald-400 border-slate-800 focus:border-primary"
              />
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Ensure scripts are properly wrapped in &lt;script&gt; tags or are valid HTML tags.</span>
              </div>
            </div>
          </Card>

          {/* ── CUSTOM FOOTER / BODY SCRIPTS ── */}
          <Card className="rounded-2xl border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-border/50 pb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Code className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-card-foreground">
                  Footer / Body End Scripts (&lt;body&gt;)
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Raw HTML and scripts injected right before the closing &lt;/body&gt; tag (ideal for live chat widgets, popups, and conversion pixels).
                </CardDescription>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">HTML / JavaScript Snippet</span>
                <span className="text-[11px] text-muted-foreground">e.g. Intercom, Zendesk Chat, Crisp, HubSpot tracking</span>
              </div>
              <Textarea
                rows={5}
                value={settings.footerScripts}
                onChange={(e) => updateSetting('footerScripts', e.target.value)}
                placeholder="<!-- Live Chat or Conversion Tracker -->&#10;<script>&#10;  window.$crisp=[];window.CRISP_WEBSITE_ID='...';&#10;</script>"
                className="font-mono text-xs rounded-xl bg-slate-950 text-emerald-400 border-slate-800 focus:border-primary"
              />
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Runs after DOM content has loaded without blocking page render speed.</span>
              </div>
            </div>
          </Card>

          {/* Save Button Row */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="rounded-xl h-10 px-6 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs flex items-center gap-2"
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
    </AdminContentContainer>
  );
}
