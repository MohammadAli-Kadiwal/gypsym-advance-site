'use client';

import * as React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { settingsService } from '@/services/settings.service';
import { notify } from '@/lib/notifications';
import { AdminContentContainer, AdminPageHeader } from '@/components/layout/admin-page';
import {
  ShieldCheck,
  KeyRound,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Sliders,
  Sparkles,
  Loader2,
  HelpCircle,
} from 'lucide-react';

interface RecaptchaConfigData {
  enabled: boolean;
  siteKey: string;
  hasSecretKey: boolean;
  maskedSecretKey: string;
  minScore: number;
  isConfigured: boolean;
}

export default function RecaptchaSettingsPage() {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [testing, setTesting] = React.useState(false);

  const [settings, setSettings] = React.useState<RecaptchaConfigData>({
    enabled: false,
    siteKey: '',
    hasSecretKey: false,
    maskedSecretKey: '',
    minScore: 0.5,
    isConfigured: false,
  });

  const [secretKeyInput, setSecretKeyInput] = React.useState('');
  const [showSecretKey, setShowSecretKey] = React.useState(false);
  const [changeSecretKey, setChangeSecretKey] = React.useState(false);
  const [testTokenInput, setTestTokenInput] = React.useState('');
  const [testResult, setTestResult] = React.useState<{
    tested: boolean;
    success: boolean;
    score?: number;
    message?: string;
  } | null>(null);

  // Load existing configuration from API
  const loadSettings = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await settingsService.getRecaptcha();
      if (data) {
        setSettings(data);
        if (data.hasSecretKey) {
          setSecretKeyInput(data.maskedSecretKey || '••••••••••••••••');
        }
      }
    } catch {
      notify.error('Unable to load reCAPTCHA configuration.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Save Settings
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, any> = {
        enabled: settings.enabled,
        siteKey: settings.siteKey.trim(),
        minScore: settings.minScore,
      };

      // Only include secretKey if user changed it and it's not the masked placeholder
      if (changeSecretKey && secretKeyInput.trim() && !secretKeyInput.includes('••')) {
        payload.secretKey = secretKeyInput.trim();
      }

      const updated = await settingsService.updateRecaptcha(payload);

      if (updated) {
        setSettings(updated);
        setChangeSecretKey(false);
        if (updated.hasSecretKey) {
          setSecretKeyInput(updated.maskedSecretKey);
        }
        notify.success('reCAPTCHA settings saved successfully.');
      }
    } catch {
      notify.error('Failed to save reCAPTCHA settings.');
    } finally {
      setSaving(false);
    }
  };

  // Test Verification
  const handleTestToken = async () => {
    if (!testTokenInput.trim()) {
      notify.error('Please enter a response token to verify.');
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await settingsService.testRecaptcha({ token: testTokenInput.trim() });

      if (res) {
        setTestResult({
          tested: true,
          success: res.success,
          score: res.score,
          message: res.success
            ? `Token verified! Risk score: ${res.score} (Action: ${res.action || 'default'})`
            : `Verification failed. Score: ${res.score}. Errors: ${res.errorCodes?.join(', ') || 'Invalid token'}`,
        });
        if (res.success) {
          notify.success(`reCAPTCHA verified with score ${res.score}`);
        } else {
          notify.warning(`reCAPTCHA verification failed (Score: ${res.score})`);
        }
      }
    } catch (err: any) {
      setTestResult({
        tested: true,
        success: false,
        message: err.message || 'Network request failed',
      });
      notify.error('Verification request failed.');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <AdminContentContainer variant="standard" className="space-y-6 pb-24">
        <div className="h-8 w-64 bg-muted rounded-xl animate-pulse" />
        <div className="h-64 bg-card rounded-2xl border border-border animate-pulse" />
      </AdminContentContainer>
    );
  }

  const statusBadge = settings.enabled && settings.isConfigured ? (
    <Badge
      variant="outline"
      className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-mono uppercase"
    >
      <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600 dark:text-emerald-400" />
      Active Protection
    </Badge>
  ) : settings.enabled && !settings.isConfigured ? (
    <Badge
      variant="outline"
      className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs font-mono uppercase"
    >
      <AlertCircle className="h-3 w-3 mr-1 text-amber-600 dark:text-amber-400" />
      Keys Incomplete
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="bg-muted text-muted-foreground border-border text-xs font-mono uppercase"
    >
      Disabled
    </Badge>
  );

  return (
    <AdminContentContainer variant="standard" className="space-y-6 pb-24">
      {/* ── HEADER & ACTIONS ── (Strictly NO breadcrumbs) */}
      <AdminPageHeader
        title="reCAPTCHA v3 & Bot Protection"
        description="Invisible Google reCAPTCHA v3 protection against automated bot spam and credential stuffing on public forms."
        status={statusBadge}
        actions={
          <Button
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-9 px-5 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] shrink-0"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        }
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Master Enable Switch */}
        <Card className="rounded-2xl border-border bg-card shadow-xs overflow-hidden">
          <CardHeader className="p-5 sm:p-6 border-b border-border/50 bg-muted/30">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-bold text-card-foreground">
                    Enable reCAPTCHA v3 Bot Shield
                  </CardTitle>
                </div>
                <CardDescription className="text-xs text-muted-foreground">
                  When enabled, all public submissions must execute invisible reCAPTCHA v3 risk analysis.
                </CardDescription>
              </div>

              <Switch
                checked={settings.enabled}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, enabled: checked }))
                }
              />
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 text-xs text-muted-foreground space-y-2">
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-primary/5 border border-primary/15 text-foreground">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold text-foreground">Zero-Friction Invisible Verification</span>
                <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                  reCAPTCHA v3 never interrupts human visitors with image puzzles or checkboxes. It runs in the background and generates a behavioral risk score from 0.0 (bot) to 1.0 (human).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Google API Credentials */}
        <Card className="rounded-2xl border-border bg-card shadow-xs">
          <CardHeader className="p-5 sm:p-6 border-b border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-bold text-card-foreground">
                  Google reCAPTCHA v3 API Keys
                </CardTitle>
              </div>

              <a
                href="https://www.google.com/recaptcha/admin"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <span>Google reCAPTCHA Console</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Create a v3 key in the Google reCAPTCHA admin console and add your domains (e.g., localhost, gypsym.com).
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 space-y-5">
            {/* Site Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Site Key <span className="font-normal text-muted-foreground">(Client-facing public key)</span>
              </label>
              <Input
                placeholder="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                value={settings.siteKey}
                onChange={(e) => setSettings({ ...settings, siteKey: e.target.value })}
                className="font-mono text-xs h-10 rounded-xl"
              />
              <p className="text-[11px] text-muted-foreground">
                This public key is loaded in the browser to tokenize user interactions.
              </p>
            </div>

            {/* Secret Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>Secret Key <span className="font-normal text-muted-foreground">(Server-side verification key)</span></span>
                {settings.hasSecretKey && !changeSecretKey && (
                  <button
                    type="button"
                    onClick={() => {
                      setChangeSecretKey(true);
                      setSecretKeyInput('');
                    }}
                    className="text-[11px] text-primary hover:underline font-semibold"
                  >
                    Replace Secret Key
                  </button>
                )}
              </label>

              <div className="relative">
                <Input
                  type={showSecretKey ? 'text' : 'password'}
                  placeholder={
                    settings.hasSecretKey && !changeSecretKey
                      ? settings.maskedSecretKey
                      : 'Enter 40-character secret key from Google console...'
                  }
                  value={secretKeyInput}
                  disabled={settings.hasSecretKey && !changeSecretKey}
                  onChange={(e) => setSecretKeyInput(e.target.value)}
                  className="font-mono text-xs h-10 rounded-xl pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <p className="text-[11px] text-muted-foreground">
                Stored securely on the backend server. Never exposed to web visitors.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 3. Threshold Configuration */}
        <Card className="rounded-2xl border-border bg-card shadow-xs">
          <CardHeader className="p-5 sm:p-6 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-bold text-card-foreground">
                Minimum Risk Score Threshold
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Google reCAPTCHA v3 returns a score between 0.0 (likely bot) and 1.0 (likely human).
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-foreground">
                  Required Human Confidence Score:
                </span>
                <p className="text-[11.5px] text-muted-foreground">
                  Submissions scoring below this threshold will be immediately rejected with 400 Bad Request.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={settings.minScore}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) {
                      setSettings({ ...settings, minScore: Math.max(0, Math.min(1, val)) });
                    }
                  }}
                  className="w-20 font-mono text-center font-bold text-sm h-10 rounded-xl"
                />
              </div>
            </div>

            {/* Visual Threshold Bar */}
            <div className="space-y-2 pt-2">
              <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-rose-500 transition-all duration-300"
                  style={{ width: `${settings.minScore * 100}%` }}
                />
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${(1 - settings.minScore) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                <span>0.0 (Permissive)</span>
                <span className="font-bold text-foreground">0.5 (Recommended Standard)</span>
                <span>1.0 (Ultra-Strict)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div
                onClick={() => setSettings({ ...settings, minScore: 0.3 })}
                className={`p-3 rounded-xl border cursor-pointer transition-all text-left ${
                  settings.minScore === 0.3
                    ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50 bg-card'
                }`}
              >
                <div className="font-bold text-xs">Low (0.3)</div>
                <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  High tolerance. Minimal false-positives.
                </div>
              </div>

              <div
                onClick={() => setSettings({ ...settings, minScore: 0.5 })}
                className={`p-3 rounded-xl border cursor-pointer transition-all text-left ${
                  settings.minScore === 0.5
                    ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50 bg-card'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>Balanced (0.5)</span>
                  <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">Default</span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  Enterprise standard. Optimal protection.
                </div>
              </div>

              <div
                onClick={() => setSettings({ ...settings, minScore: 0.7 })}
                className={`p-3 rounded-xl border cursor-pointer transition-all text-left ${
                  settings.minScore === 0.7
                    ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50 bg-card'
                }`}
              >
                <div className="font-bold text-xs">Strict (0.7)</div>
                <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  Maximum filter for high-spam environments.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Token Diagnostic Tool */}
        <Card className="rounded-2xl border-border bg-card shadow-xs">
          <CardHeader className="p-5 sm:p-6 border-b border-border/50">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-bold text-card-foreground">
                reCAPTCHA Token Verification Test
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Validate that the server can successfully reach Google&apos;s siteverify API with your configured secret key.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Input
                placeholder="Paste a client-side grecaptcha.execute() token to verify..."
                value={testTokenInput}
                onChange={(e) => setTestTokenInput(e.target.value)}
                className="font-mono text-xs h-10 rounded-xl flex-1"
              />

              <Button
                type="button"
                variant="outline"
                onClick={handleTestToken}
                disabled={testing || !settings.hasSecretKey}
                className="h-10 px-4 text-xs font-semibold rounded-xl shrink-0"
              >
                {testing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Test Token'
                )}
              </Button>
            </div>

            {testResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                    : 'bg-destructive/10 border-destructive/20 text-destructive'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5 min-w-0">
                  <div className="font-bold">
                    {testResult.success ? 'Verification Succeeded' : 'Verification Failed'}
                  </div>
                  <div className="text-[11.5px] opacity-90">{testResult.message}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-10 px-6 text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Configuration...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save reCAPTCHA Settings</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </AdminContentContainer>
  );
}
