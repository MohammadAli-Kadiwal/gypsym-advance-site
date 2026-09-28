'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { fetchApi } from '@/lib/api-client';
import { notify } from '@/lib/notifications';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const Label = ({ className = '', ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={`block text-xs font-semibold text-slate-700 ${className}`} {...props} />
);

import {
  Mail,
  Send,
  Save,
  CheckCircle2,
  AlertCircle,
  Lock,
  KeyRound,
  ShieldCheck,
  RotateCcw,
  Loader2,
  CalendarCheck,
  Users,
  Plus,
  X,
  AtSign,
  Copy,
} from 'lucide-react';

interface SmtpSettingsData {
  host: string;
  port: number;
  security: 'none' | 'starttls' | 'tls';
  user: string;
  hasPassword: boolean;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  isConfigured: boolean;
  adminNotificationRecipients?: string[];
  notificationsEnabled: boolean;
  notificationRecipients: string[];
  notificationSubject: string;
  bookingNotificationsEnabled?: boolean;
  bookingNotificationRecipients?: string[];
  bookingNotificationSubject?: string;
  sendAutoReply: boolean;
  autoReplySubject: string;
  autoReplyBody: string;
}

export default function EmailSmtpSettingsPage() {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [sendingTest, setSendingTest] = React.useState(false);

  const [settings, setSettings] = React.useState<SmtpSettingsData>({
    host: '',
    port: 587,
    security: 'starttls',
    user: '',
    hasPassword: false,
    fromName: 'Gypsym Technology',
    fromEmail: '',
    replyTo: '',
    isConfigured: false,
    adminNotificationRecipients: [],
    notificationsEnabled: true,
    notificationRecipients: [],
    notificationSubject: 'New Enterprise Contact Inquiry Received',
    bookingNotificationsEnabled: true,
    bookingNotificationRecipients: [],
    bookingNotificationSubject: 'New Discovery Call Scheduled',
    sendAutoReply: false,
    autoReplySubject: 'Thank you for contacting Gypsym Technology',
    autoReplyBody:
      'Thank you for contacting Gypsym Technology. We have received your inquiry and our enterprise team will respond shortly.',
  });

  // Admin Notification Email List (Multiple Admin Recipients)
  const [adminEmails, setAdminEmails] = React.useState<string[]>([]);
  const [newAdminEmailInput, setNewAdminEmailInput] = React.useState('');

  const [recipientsInput, setRecipientsInput] = React.useState('');
  const [bookingRecipientsInput, setBookingRecipientsInput] = React.useState('');
  const [passwordInput, setPasswordInput] = React.useState('');
  const [changePassword, setChangePassword] = React.useState(false);
  const [testEmailInput, setTestEmailInput] = React.useState('');
  const [showTestModal, setShowTestModal] = React.useState(false);

  // Load existing configuration from backend
  const loadSettings = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchApi<SmtpSettingsData>('/settings/smtp');
      if (data) {
        setSettings(data);
        const resolvedAdminList = Array.isArray(data.adminNotificationRecipients) && data.adminNotificationRecipients.length > 0
          ? data.adminNotificationRecipients
          : Array.isArray(data.notificationRecipients) && data.notificationRecipients.length > 0
          ? data.notificationRecipients
          : data.fromEmail
          ? [data.fromEmail]
          : [];
        setAdminEmails(resolvedAdminList);
        setRecipientsInput(data.notificationRecipients?.join(', ') || '');
        setBookingRecipientsInput(data.bookingNotificationRecipients?.join(', ') || '');
        if (!testEmailInput && data.fromEmail) {
          setTestEmailInput(data.fromEmail);
        }
      }
    } catch {
      notify.error('Unable to load SMTP configuration.');
    } finally {
      setLoading(false);
    }
  }, [testEmailInput]);

  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Admin Email Chip Management
  const handleAddAdminEmail = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newAdminEmailInput.trim().toLowerCase();
    if (!trimmed) return;

    // Support comma or space separated batch pasting in input
    const parts = trimmed
      .split(/[,;\s]+/)
      .map((p) => p.trim())
      .filter((p) => p.includes('@'));

    if (parts.length === 0) {
      notify.warning('Please enter a valid email address.');
      return;
    }

    const updated = Array.from(new Set([...adminEmails, ...parts]));
    setAdminEmails(updated);
    setNewAdminEmailInput('');
    notify.success(`Added ${parts.length} email(s) to admin notification list.`);
  };

  const handleRemoveAdminEmail = (emailToRemove: string) => {
    setAdminEmails((prev) => prev.filter((e) => e !== emailToRemove));
  };

  const handleAddSenderToAdminList = () => {
    if (!settings.fromEmail || !settings.fromEmail.includes('@')) {
      notify.warning('Please configure a valid From Sender Email first.');
      return;
    }
    if (!adminEmails.includes(settings.fromEmail)) {
      setAdminEmails([...adminEmails, settings.fromEmail]);
      notify.success(`Added ${settings.fromEmail} to admin list.`);
    }
  };

  const handleSyncToAllChannels = () => {
    const listStr = adminEmails.join(', ');
    setRecipientsInput(listStr);
    setBookingRecipientsInput(listStr);
    notify.success('Admin notification email list synced to Inbound Leads and Discovery Calls.');
  };

  // Save Settings
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const channelRecipients = recipientsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const bookingRecipients = bookingRecipientsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload: any = {
        host: settings.host,
        port: Number(settings.port) || 587,
        security: settings.security,
        user: settings.user,
        fromName: settings.fromName,
        fromEmail: settings.fromEmail,
        replyTo: settings.replyTo || settings.fromEmail,
        adminNotificationRecipients: adminEmails,
        notificationsEnabled: settings.notificationsEnabled,
        notificationRecipients: channelRecipients.length > 0 ? channelRecipients : adminEmails,
        notificationSubject: settings.notificationSubject,
        bookingNotificationsEnabled: settings.bookingNotificationsEnabled,
        bookingNotificationRecipients: bookingRecipients.length > 0 ? bookingRecipients : adminEmails,
        bookingNotificationSubject: settings.bookingNotificationSubject,
        sendAutoReply: settings.sendAutoReply,
        autoReplySubject: settings.autoReplySubject,
        autoReplyBody: settings.autoReplyBody,
      };

      if (changePassword || !settings.hasPassword) {
        payload.password = passwordInput;
      }

      const updated = await fetchApi<SmtpSettingsData>('/settings/smtp', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      setSettings(updated);
      if (updated.adminNotificationRecipients) {
        setAdminEmails(updated.adminNotificationRecipients);
      }
      setPasswordInput('');
      setChangePassword(false);
      notify.success('✓ SMTP & Admin Notification settings saved successfully.');
    } catch {
      notify.error('Unable to save SMTP settings. Check input parameters.');
    } finally {
      setSaving(false);
    }
  };

  // Send Test Email
  const handleSendTest = async () => {
    if (!testEmailInput || !testEmailInput.includes('@')) {
      notify.warning('Please enter a valid recipient email for the test.');
      return;
    }

    setSendingTest(true);
    try {
      await fetchApi('/settings/smtp/test', {
        method: 'POST',
        body: JSON.stringify({ toEmail: testEmailInput }),
      });
      notify.success('✓ Test email sent successfully.');
      setShowTestModal(false);
    } catch {
      notify.error('Unable to send test email. Check your SMTP configuration.');
    } finally {
      setSendingTest(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full py-6 space-y-4">
        <div className="h-8 w-48 bg-slate-200/60 rounded-xl animate-pulse" />
        <div className="h-64 bg-white rounded-2xl border border-slate-200/80 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full pb-24">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Email & SMTP Configuration
            </h1>
            {settings.isConfigured ? (
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-semibold gap-1.5 py-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Gateway Active
              </Badge>
            ) : (
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs font-semibold gap-1.5 py-0.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Not Configured
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Configure global SMTP transport, multiple admin notification recipients, and automated reply pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowTestModal(true)}
            className="rounded-xl h-9 px-4 text-xs font-semibold border-slate-200 hover:bg-slate-50 gap-1.5"
          >
            <Send className="w-3.5 h-3.5 text-blue-600" />
            Send Test Email
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 px-4 text-xs font-semibold shadow-xs gap-1.5"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Settings
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ── SMTP Server Details ─────────────────────────────────────────── */}
        <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
          <CardHeader className="pb-3 pt-5 px-6 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              SMTP Gateway Credentials
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Outbound mail transport credentials for notifications and customer responses. Credentials remain strictly server-side.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold text-slate-700">SMTP Host</Label>
                <Input
                  placeholder="smtp.example.com or email-smtp.us-east-1.amazonaws.com"
                  value={settings.host}
                  onChange={(e) => setSettings({ ...settings, host: e.target.value })}
                  className="h-9 text-xs rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Port</Label>
                <Input
                  type="number"
                  placeholder="587"
                  value={settings.port}
                  onChange={(e) => setSettings({ ...settings, port: parseInt(e.target.value, 10) || 587 })}
                  className="h-9 text-xs rounded-xl font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Security Mode</Label>
                <select
                  value={settings.security}
                  onChange={(e) => setSettings({ ...settings, security: e.target.value as any })}
                  className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="starttls">STARTTLS (Recommended · Port 587)</option>
                  <option value="tls">TLS / SSL (Direct · Port 465)</option>
                  <option value="none">None (Plaintext · Port 25)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Username</Label>
                <Input
                  placeholder="user@example.com or API Key"
                  value={settings.user}
                  onChange={(e) => setSettings({ ...settings, user: e.target.value })}
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-700">Password</Label>
                  {settings.hasPassword && !changePassword && (
                    <button
                      type="button"
                      onClick={() => setChangePassword(true)}
                      className="text-[11px] text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
                    >
                      <KeyRound className="w-3 h-3" />
                      Change
                    </button>
                  )}
                  {changePassword && (
                    <button
                      type="button"
                      onClick={() => {
                        setChangePassword(false);
                        setPasswordInput('');
                      }}
                      className="text-[11px] text-slate-500 hover:underline font-medium inline-flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Keep Existing
                    </button>
                  )}
                </div>

                {settings.hasPassword && !changePassword ? (
                  <div className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 select-none">
                    <span className="tracking-widest font-mono">••••••••••••••••</span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                      <Lock className="w-3 h-3" />
                      Encrypted
                    </span>
                  </div>
                ) : (
                  <Input
                    type="password"
                    placeholder={settings.hasPassword ? 'Enter new password' : 'Enter SMTP password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="h-9 text-xs rounded-xl font-mono"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">From Sender Name</Label>
                <Input
                  placeholder="Gypsym Technology"
                  value={settings.fromName}
                  onChange={(e) => setSettings({ ...settings, fromName: e.target.value })}
                  className="h-9 text-xs rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">From Email Address</Label>
                <Input
                  type="email"
                  placeholder="hello@gypsym.com"
                  value={settings.fromEmail}
                  onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })}
                  className="h-9 text-xs rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Reply-To Address</Label>
                <Input
                  type="email"
                  placeholder="briefing@gypsym.com"
                  value={settings.replyTo}
                  onChange={(e) => setSettings({ ...settings, replyTo: e.target.value })}
                  className="h-9 text-xs rounded-xl"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Admin Notification Email List (Multiple Admin Recipients) ───── */}
        <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white border-l-4 border-l-indigo-600">
          <CardHeader className="pb-3 pt-5 px-6 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Admin Notification Email List (Multiple Admin Alert Recipients)
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Configure multiple admin email addresses to receive real-time notifications for incoming contact leads, discovery bookings, and system alerts.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs font-semibold py-0.5 px-2.5">
                  {adminEmails.length} {adminEmails.length === 1 ? 'Admin Recipient' : 'Admin Recipients'}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-5">
            {/* Tag / Chip Display */}
            <div>
              <Label className="text-xs font-semibold text-slate-700 mb-2">
                Active Notification Recipients:
              </Label>
              {adminEmails.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 text-center">
                  <p className="text-xs text-slate-400">No admin recipients configured yet. Add your admin emails below.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50/50 min-h-[50px] items-center">
                  {adminEmails.map((email) => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/90 text-xs font-medium text-slate-800 shadow-2xs hover:border-slate-300 transition-colors"
                    >
                      <AtSign className="w-3 h-3 text-indigo-500" />
                      <span>{email}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAdminEmail(email)}
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full p-0.5 transition-colors ml-1"
                        title="Remove recipient"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Add Recipient Form */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <div className="relative flex-1">
                <AtSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Enter admin email (e.g. director@gypsym.com, partner@gypsym.com)"
                  value={newAdminEmailInput}
                  onChange={(e) => setNewAdminEmailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAdminEmail();
                    }
                  }}
                  className="h-9 pl-9 text-xs rounded-xl"
                />
              </div>
              <Button
                type="button"
                onClick={handleAddAdminEmail}
                className="h-9 px-4 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Recipient
              </Button>
            </div>

            {/* Quick Actions & Helpers */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-3">
                {settings.fromEmail && !adminEmails.includes(settings.fromEmail) && (
                  <button
                    type="button"
                    onClick={handleAddSenderToAdminList}
                    className="text-indigo-600 hover:underline font-medium inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add From Sender ({settings.fromEmail})
                  </button>
                )}
                {adminEmails.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSyncToAllChannels}
                    className="text-slate-600 hover:text-slate-900 hover:underline font-medium inline-flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Sync List to Leads & Bookings
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Tip: You can paste multiple comma-separated emails at once.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Inbound Lead Alerts & Auto-Reply ───────────────────────────── */}
        <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
          <CardHeader className="pb-3 pt-5 px-6 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              Contact Form Inbound Leads & Auto-Reply
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Configure internal lead alert recipients and automated confirmation receipts sent upon contact submission.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-5">
            {/* Admin Notifications */}
            <div className="space-y-3 pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Inbound Lead Notifications</h4>
                  <p className="text-[11px] text-slate-500">
                    Dispatch an email alert whenever a contact inquiry is submitted.
                  </p>
                </div>
                <Switch
                  checked={settings.notificationsEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, notificationsEnabled: checked })}
                />
              </div>

              {settings.notificationsEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-slate-700">Specific Lead Recipient Email(s)</Label>
                      {adminEmails.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setRecipientsInput(adminEmails.join(', '))}
                          className="text-[10px] text-indigo-600 hover:underline font-medium"
                        >
                          Use Master Admin List
                        </button>
                      )}
                    </div>
                    <Input
                      placeholder="Leave blank to use Master Admin List"
                      value={recipientsInput}
                      onChange={(e) => setRecipientsInput(e.target.value)}
                      className="h-9 text-xs rounded-xl"
                    />
                    <p className="text-[10px] text-slate-400">
                      Comma-separated. If left blank, automatically alerts all {adminEmails.length} admin recipients.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Email Subject</Label>
                    <Input
                      placeholder="New Contact Inquiry Received"
                      value={settings.notificationSubject}
                      onChange={(e) => setSettings({ ...settings, notificationSubject: e.target.value })}
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Auto-Reply to User */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Automated Acknowledgment to Inquirer</h4>
                  <p className="text-[11px] text-slate-500">
                    Send an immediate confirmation receipt back to the user&apos;s email address.
                  </p>
                </div>
                <Switch
                  checked={settings.sendAutoReply}
                  onCheckedChange={(checked) => setSettings({ ...settings, sendAutoReply: checked })}
                />
              </div>

              {settings.sendAutoReply && (
                <div className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Auto-Reply Subject</Label>
                    <Input
                      placeholder="Thank you for contacting Gypsym Technology"
                      value={settings.autoReplySubject}
                      onChange={(e) => setSettings({ ...settings, autoReplySubject: e.target.value })}
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Auto-Reply Message Body</Label>
                    <textarea
                      rows={4}
                      value={settings.autoReplyBody}
                      onChange={(e) => setSettings({ ...settings, autoReplyBody: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans"
                    />
                    <p className="text-[10px] text-slate-400">
                      Supports dynamic tokens: <code className="font-mono text-slate-600">{'{{fullName}}'}</code>,{' '}
                      <code className="font-mono text-slate-600">{'{{email}}'}</code>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Discovery Call & Meeting Alerts (Multi-Account) ─────────────────── */}
        <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white">
          <CardHeader className="pb-3 pt-5 px-6 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-purple-600" />
              Discovery Call & Booking Notifications (Multi-Account)
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Trigger instant administrative team alerts whenever a client books a discovery call or strategy session.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900">New Booking Admin Notifications</h4>
                <p className="text-[11px] text-slate-500">
                  Notify advisory directors and account executives instantly upon new calendar reservations.
                </p>
              </div>
              <Switch
                checked={settings.bookingNotificationsEnabled !== false}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, bookingNotificationsEnabled: checked })
                }
              />
            </div>

            {settings.bookingNotificationsEnabled !== false && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-slate-700">Specific Booking Recipient Email(s)</Label>
                    {adminEmails.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setBookingRecipientsInput(adminEmails.join(', '))}
                        className="text-[10px] text-indigo-600 hover:underline font-medium"
                      >
                        Use Master Admin List
                      </button>
                    )}
                  </div>
                  <Input
                    placeholder="Leave blank to use Master Admin List"
                    value={bookingRecipientsInput}
                    onChange={(e) => setBookingRecipientsInput(e.target.value)}
                    className="h-9 text-xs rounded-xl"
                  />
                  <p className="text-[10px] text-slate-400">
                    Comma-separated. If left blank, automatically alerts all {adminEmails.length} admin recipients.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Booking Alert Subject</Label>
                  <Input
                    placeholder="New Discovery Call Scheduled"
                    value={settings.bookingNotificationSubject || 'New Discovery Call Scheduled'}
                    onChange={(e) =>
                      setSettings({ ...settings, bookingNotificationSubject: e.target.value })
                    }
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </form>

      {/* ── Test Email Dialog Modal ─────────────────────────────────────── */}
      <Dialog open={showTestModal} onOpenChange={setShowTestModal}>
        <DialogContent className="max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-slate-900">Send SMTP Test Email</DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Verify server credentials and transport connectivity.
              </DialogDescription>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label className="text-xs font-semibold text-slate-700">Test Recipient Email</Label>
            <Input
              type="email"
              placeholder="admin@example.com"
              value={testEmailInput}
              onChange={(e) => setTestEmailInput(e.target.value)}
              className="h-9 text-xs rounded-xl"
              autoFocus
            />
            <p className="text-[11px] text-slate-400">
              A verification message will be dispatched through the currently saved gateway.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowTestModal(false)}
              className="rounded-xl h-9 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSendTest}
              disabled={sendingTest}
              className="rounded-xl h-9 px-5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs gap-1.5"
            >
              {sendingTest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Send Test
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
