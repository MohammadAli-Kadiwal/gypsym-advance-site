'use client';

import * as React from 'react';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  ShieldAlert,
  ShieldCheck,
  Save,
  Loader2,
  CheckCircle2,
  Lock,
  Unlock,
  AlertTriangle,
  Clock,
  RefreshCw,
  Globe,
} from 'lucide-react';
import { notify } from '@/lib/notifications';
import { authService } from '@/services/auth.service';

interface SecuritySettings {
  maxFailedAttempts: number;
  lockoutDurationMinutes: number;
  sessionExpiryDays: number;
  ipBlockEnabled: boolean;
}

interface BlockedIpRecord {
  ip: string;
  failedCount: number;
  lockedUntil: string;
  remainingMinutes: number;
}

const DEFAULT_SECURITY: SecuritySettings = {
  maxFailedAttempts: 5,
  lockoutDurationMinutes: 15,
  sessionExpiryDays: 7,
  ipBlockEnabled: true,
};

export default function SecuritySettingsPage() {
  const [settings, setSettings] = React.useState<SecuritySettings>(DEFAULT_SECURITY);
  const [blockedIps, setBlockedIps] = React.useState<BlockedIpRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [unblockingIp, setUnblockingIp] = React.useState<string | null>(null);
  const [hasChanges, setHasChanges] = React.useState(false);

  const loadData = React.useCallback(async () => {
    try {
      const [secRes, ipsRes] = await Promise.all([
        authService.getSecuritySettings().catch(() => null),
        authService.getBlockedIps().catch(() => []),
      ]);

      if (secRes) {
        setSettings({
          maxFailedAttempts: Number(secRes.maxFailedAttempts) || 5,
          lockoutDurationMinutes: Number(secRes.lockoutDurationMinutes) || 15,
          sessionExpiryDays: Number(secRes.sessionExpiryDays) || 7,
          ipBlockEnabled: secRes.ipBlockEnabled !== false,
        });
      }

      if (Array.isArray(ipsRes)) {
        setBlockedIps(ipsRes);
      }
    } catch {
      notify.error('Could not load security settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Keyboard shortcut Ctrl/Cmd + S
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

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setSaving(true);
    try {
      await authService.updateSecuritySettings(settings);

      setHasChanges(false);
      notify.success('Security policies and session expiration updated successfully!');
    } catch (err: any) {
      notify.error(err?.message || 'Failed to update security settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleUnblock = async (ip: string) => {
    setUnblockingIp(ip);
    try {
      await authService.unblockIp(ip);
      notify.success(`IP address ${ip} has been unblocked.`);
      setBlockedIps((prev) => prev.filter((item) => item.ip !== ip));
    } catch (err: any) {
      notify.error(err?.message || `Failed to unblock ${ip}.`);
    } finally {
      setUnblockingIp(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* ── HEADER & ACTIONS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
              Site & Security
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Session & Brute-Force Defense</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
            <span>Security & Login Protection</span>
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Configure failed password lockout rules, temporary IP address bans, and persistent enterprise session expiration lifetime.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => loadData()}
            className="rounded-xl h-9 text-xs font-semibold border-slate-200 hover:bg-slate-100 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl h-9 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs flex items-center gap-1.5 min-w-[115px]"
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
          <Loader2 className="w-7 h-7 animate-spin text-rose-600" />
          <span className="text-xs">Loading security configuration...</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* ── BRUTE FORCE IP BLOCKING CONFIGURATION ── */}
          <Card className="rounded-2xl border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200/70 flex items-center justify-center text-rose-600">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Brute-Force & Incorrect Password Lockout
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Automatically restrict IP addresses attempting consecutive incorrect passwords.
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={settings.ipBlockEnabled}
                  onCheckedChange={(val) => {
                    setSettings({ ...settings, ipBlockEnabled: val });
                    setHasChanges(true);
                  }}
                />
                <span className="text-xs font-semibold text-slate-700">
                  {settings.ipBlockEnabled ? 'Protection Active' : 'Disabled'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
              {/* Max Attempts */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Maximum Failed Attempts</span>
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={settings.maxFailedAttempts}
                    onChange={(e) => {
                      setSettings({
                        ...settings,
                        maxFailedAttempts: Math.max(1, parseInt(e.target.value, 10) || 5),
                      });
                      setHasChanges(true);
                    }}
                    className="text-xs font-mono rounded-xl h-9 w-28"
                  />
                  <span className="text-xs text-slate-500 font-medium">consecutive wrong passwords</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Default: 5 attempts. User sees remaining attempts before their IP is blocked.
                </p>
              </div>

              {/* Lockout Duration */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                  <span>IP Lockout Duration</span>
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={1}
                    max={10080}
                    value={settings.lockoutDurationMinutes}
                    onChange={(e) => {
                      setSettings({
                        ...settings,
                        lockoutDurationMinutes: Math.max(1, parseInt(e.target.value, 10) || 15),
                      });
                      setHasChanges(true);
                    }}
                    className="text-xs font-mono rounded-xl h-9 w-28"
                  />
                  <span className="text-xs text-slate-500 font-medium">minutes</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  {[15, 30, 60, 1440].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => {
                        setSettings({ ...settings, lockoutDurationMinutes: mins });
                        setHasChanges(true);
                      }}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border transition-all ${
                        settings.lockoutDurationMinutes === mins
                          ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {mins === 1440 ? '24 Hours' : `${mins}m`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* ── SESSION EXPIRATION CONFIGURATION ── */}
          <Card className="rounded-2xl border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/70 flex items-center justify-center text-blue-600">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Admin Session Expiry Lifetime
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  How long administrators stay logged in before having to re-authenticate.
                </CardDescription>
              </div>
            </div>

            <div className="space-y-3 max-w-lg">
              <label className="text-xs font-semibold text-slate-800">
                Session Duration (Days)
              </label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={settings.sessionExpiryDays}
                  onChange={(e) => {
                    setSettings({
                      ...settings,
                      sessionExpiryDays: Math.max(1, parseInt(e.target.value, 10) || 7),
                    });
                    setHasChanges(true);
                  }}
                  className="text-xs font-mono rounded-xl h-9 w-28"
                />
                <span className="text-xs text-slate-600 font-medium">days active session</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {[1, 7, 14, 30, 90].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => {
                      setSettings({ ...settings, sessionExpiryDays: days });
                      setHasChanges(true);
                    }}
                    className={`text-[11px] px-3 py-1 rounded-xl border transition-all ${
                      settings.sessionExpiryDays === days
                        ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {days === 7 ? '7 Days (Recommended)' : `${days} Days`}
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-blue-800 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Permanent 7-Day Session Fix Applied:</span>
                </div>
                <p className="text-blue-700/90 leading-relaxed">
                  Your JWT access tokens, database sessions, and browser cookies are now fully synchronized to remain valid for {settings.sessionExpiryDays} days. Transient network glitches or server restarts will no longer kick you out or delete your login credentials.
                </p>
              </div>
            </div>
          </Card>

          {/* ── CURRENTLY BLOCKED IPS LIST ── */}
          <Card className="rounded-2xl border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/70 flex items-center justify-center text-amber-600">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Currently Blocked IP Addresses ({blockedIps.length})
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    IP addresses temporarily restricted due to excessive failed password attempts.
                  </CardDescription>
                </div>
              </div>

              <Badge
                variant="outline"
                className={`text-[11px] font-mono ${
                  blockedIps.length > 0
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {blockedIps.length > 0 ? `${blockedIps.length} Blocked` : 'All Clear'}
              </Badge>
            </div>

            {blockedIps.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl space-y-2">
                <ShieldCheck className="w-7 h-7 text-emerald-500 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">No IP addresses are currently blocked</p>
                <p className="text-[11px] text-slate-400">
                  All enterprise connection endpoints are functioning normally with zero active lockouts.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {blockedIps.map((record) => (
                  <div
                    key={record.ip}
                    className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                          {record.ip}
                        </span>
                        <Badge variant="outline" className="text-[10px] text-rose-600 border-rose-200 bg-rose-50">
                          {record.failedCount} Failed Attempts
                        </Badge>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>
                          Locked for approx. <strong className="text-slate-700">{record.remainingMinutes} minute(s)</strong> remaining
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={unblockingIp === record.ip}
                      onClick={() => handleUnblock(record.ip)}
                      className="rounded-xl h-8 px-3 text-xs font-semibold text-rose-700 border-rose-200 hover:bg-rose-50 flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      {unblockingIp === record.ip ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Unblocking...</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Unblock IP</span>
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Submit Button Row */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="rounded-xl h-10 px-6 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Policy...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Security Policies</span>
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
