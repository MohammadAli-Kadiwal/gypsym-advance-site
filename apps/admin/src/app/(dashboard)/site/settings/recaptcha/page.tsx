'use client';

import * as React from 'react';
import Link from 'next/link';
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
import { fetchApi } from '@/lib/api-client';
import { notify } from '@/lib/notifications';
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
  ArrowLeft,
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
      const data = await fetchApi<RecaptchaConfigData>('/settings/recaptcha');
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

      const updated = await fetchApi<RecaptchaConfigData>('/settings/recaptcha', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

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
      const res = await fetchApi<{
        success: boolean;
        score: number;
        action?: string;
        errorCodes?: string[];
      }>('/settings/recaptcha/test', {
        method: 'POST',
        body: JSON.stringify({ token: testTokenInput.trim() }),
      });

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
      <div className="space-y-6 max-w-4xl animate-in fade-in-50 duration-200">
        <div className="h-8 w-64 bg-slate-200/60 rounded-xl animate-pulse" />
        <div className="h-44 bg-white rounded-2xl border border-slate-200 animate-pulse" />
        <div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eaedf3]">
        <div className="space-y-1">
          <Link
            href="/site/settings"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors group mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Workspace Settings</span>
          </Link>

          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              reCAPTCHA v3 & Bot Protection
            </h1>

            {settings.enabled && settings.isConfigured ? (
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-mono uppercase"
              >
                <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
                Active Protection
              </Badge>
            ) : settings.enabled && !settings.isConfigured ? (
              <Badge
                variant="outline"
                className="bg-amber-50 text-amber-700 border-amber-200 text-xs font-mono uppercase"
              >
                <AlertCircle className="h-3 w-3 mr-1 text-amber-600" />
                Keys Incomplete
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-slate-100 text-slate-600 border-slate-200 text-xs font-mono uppercase"
              >
                Disabled
              </Badge>
            )}
          </div>

          <p className="text-xs text-slate-500">
            Invisible Google reCAPTCHA v3 protection against automated bot spam and credential stuffing on public forms.
          </p>
        </div>

        <Button
          onClick={() => handleSave()}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 px-5 text-xs font-semibold shadow-sm transition-all active:scale-[0.98] shrink-0"
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
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Master Enable Switch */}
        <Card className="rounded-2xl border-slate-200/90 shadow-xs overflow-hidden">
          <CardHeader className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Enable reCAPTCHA v3 Bot Shield
                  </CardTitle>
                </div>
                <CardDescription className="text-xs text-slate-500">
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

          <CardContent className="p-5 sm:p-6 text-xs text-slate-600 space-y-2">
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-blue-800">
              <Sparkles className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold text-blue-900">Zero-Friction Invisible Verification</span>
                <p className="text-[11.5px] text-blue-700/90 leading-relaxed">
                  reCAPTCHA v3 never interrupts human visitors with image puzzles or checkboxes. It runs in the background and generates a behavioral risk score from 0.0 (bot) to 1.0 (human).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Google API Credentials */}
        <Card className="rounded-2xl border-slate-200/90 shadow-xs">
          <CardHeader className="p-5 sm:p-6 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-sm font-bold text-slate-900">
                  Google reCAPTCHA v3 API Keys
                </CardTitle>
              </div>

              <a
                href="https://www.google.com/recaptcha/admin"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                <span>Google reCAPTCHA Console</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
            <CardDescription className="text-xs text-slate-500 mt-1">
              Create a v3 key in the Google reCAPTCHA admin console and add your domains (e.g., localhost, gypsym.com).
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 space-y-5">
            {/* Site Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Site Key <span className="font-normal text-slate-400">(Client-facing public key)</span>
              </label>
              <Input
                placeholder="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                value={settings.siteKey}
                onChange={(e) => setSettings({ ...settings, siteKey: e.target.value })}
                className="font-mono text-xs h-10 rounded-xl"
              />
              <p className="text-[11px] text-slate-400">
                This public key is loaded in the browser to tokenize user interactions.
              </p>
            </div>

            {/* Secret Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Secret Key <span className="font-normal text-slate-400">(Server-side verification key)</span></span>
                {settings.hasSecretKey && !changeSecretKey && (
                  <button
                    type="button"
                    onClick={() => {
                      setChangeSecretKey(true);
                      setSecretKeyInput('');
                    }}
                    className="text-[11px] text-blue-600 hover:underline font-semibold"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <p className="text-[11px] text-slate-400">
                Stored securely on the backend server. Never exposed to web visitors.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 3. Threshold Configuration */}
        <Card className="rounded-2xl border-slate-200/90 shadow-xs">
          <CardHeader className="p-5 sm:p-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm font-bold text-slate-900">
                Minimum Risk Score Threshold
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500 mt-1">
              Google reCAPTCHA v3 returns a score between 0.0 (likely bot) and 1.0 (likely human).
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-800">
                  Required Human Confidence Score:
                </span>
                <p className="text-[11.5px] text-slate-500">
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
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-rose-400 transition-all duration-300"
                  style={{ width: `${settings.minScore * 100}%` }}
                />
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${(1 - settings.minScore) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>0.0 (Permissive)</span>
                <span className="font-bold text-slate-700">0.5 (Recommended Standard)</span>
                <span>1.0 (Ultra-Strict)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div
                onClick={() => setSettings({ ...settings, minScore: 0.3 })}
                className={`p-3 rounded-xl border cursor-pointer transition-all text-left ${
                  settings.minScore === 0.3
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-2 ring-blue-600/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-bold text-xs">Low (0.3)</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  High tolerance. Minimal false-positives.
                </div>
              </div>

              <div
                onClick={() => setSettings({ ...settings, minScore: 0.5 })}
                className={`p-3 rounded-xl border cursor-pointer transition-all text-left ${
                  settings.minScore === 0.5
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-2 ring-blue-600/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>Balanced (0.5)</span>
                  <span className="text-[10px] font-mono font-semibold text-emerald-600">Default</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Enterprise standard. Optimal protection.
                </div>
              </div>

              <div
                onClick={() => setSettings({ ...settings, minScore: 0.7 })}
                className={`p-3 rounded-xl border cursor-pointer transition-all text-left ${
                  settings.minScore === 0.7
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-2 ring-blue-600/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-bold text-xs">Strict (0.7)</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Maximum filter for high-spam environments.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Token Diagnostic Tool */}
        <Card className="rounded-2xl border-slate-200/90 shadow-xs">
          <CardHeader className="p-5 sm:p-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm font-bold text-slate-900">
                reCAPTCHA Token Verification Test
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500 mt-1">
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
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50/80 border-rose-200 text-rose-900'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
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
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-6 text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
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
    </div>
  );
}
