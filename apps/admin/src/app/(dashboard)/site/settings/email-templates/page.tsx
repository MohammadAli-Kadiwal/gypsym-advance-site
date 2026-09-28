'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { settingsService } from '@/services/settings.service';
import { notify } from '@/lib/notifications';
import {
  FileCode,
  Eye,
  Send,
  Save,
  Copy,
  CalendarCheck,
  CalendarX,
  Mail,
  UserCheck,
  Shield,
  Sparkles,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface EmailTemplate {
  key: string;
  name: string;
  description: string;
  subject: string;
  variables: string[];
  htmlContent: string;
  isActive: boolean;
  updatedAt?: string;
}

const TEMPLATE_META: Record<string, { icon: any; badge: string; color: string }> = {
  booking_confirmed: {
    icon: CalendarCheck,
    badge: 'Client Confirmation',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  booking_admin_alert: {
    icon: Shield,
    badge: 'Team Notification (Multi-Admin)',
    color: 'text-purple-600 bg-purple-50 border-purple-200',
  },
  inquiry_auto_reply: {
    icon: UserCheck,
    badge: 'Lead Auto-Responder',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  inquiry_admin_alert: {
    icon: Mail,
    badge: 'Inbound Advisory Alert (Multi-Admin)',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  booking_cancelled: {
    icon: CalendarX,
    badge: 'Session Cancellation',
    color: 'text-rose-600 bg-rose-50 border-rose-200',
  },
  admin_system_alert: {
    icon: AlertTriangle,
    badge: 'System & Security Alert (Multi-Admin)',
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
};

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = React.useState<Record<string, EmailTemplate>>({});
  const [selectedKey, setSelectedKey] = React.useState<string>('booking_confirmed');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'code' | 'preview' | 'split'>('split');
  const [testRecipient, setTestRecipient] = React.useState('info@gypsym.com');
  const [sendingTest, setSendingTest] = React.useState(false);

  // Form State for currently selected template
  const [currentSubject, setCurrentSubject] = React.useState('');
  const [currentHtml, setCurrentHtml] = React.useState('');
  const [currentActive, setCurrentActive] = React.useState(true);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Load templates from API
  const loadTemplates = React.useCallback(async (targetKey?: string) => {
    setLoading(true);
    try {
      const res = await settingsService.getEmailTemplates();
      const data = (res as any)?.data || res;
      if (data && typeof data === 'object') {
        setTemplates(data);
        const keyToSelect = targetKey || selectedKey || Object.keys(data)[0] || 'booking_confirmed';
        setSelectedKey(keyToSelect);
        if (data[keyToSelect]) {
          setCurrentSubject(data[keyToSelect].subject);
          setCurrentHtml(data[keyToSelect].htmlContent);
          setCurrentActive(data[keyToSelect].isActive !== false);
        }
      }
    } catch (err: any) {
      notify.error(err?.message || 'Could not fetch email templates.');
    } finally {
      setLoading(false);
    }
  }, [selectedKey]);

  React.useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // Handle template selection switch
  const handleSelectTemplate = (key: string) => {
    setSelectedKey(key);
    const tpl = templates[key];
    if (tpl) {
      setCurrentSubject(tpl.subject);
      setCurrentHtml(tpl.htmlContent);
      setCurrentActive(tpl.isActive !== false);
    }
  };

  // Insert variable token into HTML code at cursor position
  const insertVariable = (variable: string) => {
    const token = `{{${variable}}}`;
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = currentHtml;
      const nextText = text.substring(0, start) + token + text.substring(end);
      setCurrentHtml(nextText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + token.length, start + token.length);
      }, 50);
    } else {
      setCurrentHtml((prev) => prev + token);
    }
  };

  // Save changes
  const handleSave = async () => {
    if (!selectedKey) return;
    setSaving(true);
    try {
      const res = await settingsService.updateEmailTemplate(selectedKey, {
        subject: currentSubject,
        htmlContent: currentHtml,
        isActive: currentActive,
      });

      const updated = (res as any)?.data || res;
      setTemplates((prev) => ({ ...prev, [selectedKey]: updated }));

      notify.success(`HTML email template '${templates[selectedKey]?.name || selectedKey}' updated.`);
    } catch (err: any) {
      notify.error(err?.message || 'Failed to update email template.');
    } finally {
      setSaving(false);
    }
  };

  // Send test email
  const handleSendTest = async () => {
    if (!testRecipient || !testRecipient.includes('@')) {
      notify.error('Please enter a valid recipient email address.');
      return;
    }

    setSendingTest(true);
    try {
      await settingsService.testEmailTemplate(selectedKey, testRecipient);

      notify.success(`Sample email sent to ${testRecipient}. Check your inbox.`);
    } catch (err: any) {
      notify.error(err?.message || 'Check SMTP configuration under Email / SMTP menu.');
    } finally {
      setSendingTest(false);
    }
  };

  const selectedTemplate = templates[selectedKey];

  // Sample data for live preview interpolation
  const previewHtml = React.useMemo(() => {
    if (!currentHtml) return '';
    let rendered = currentHtml;
    const sampleData: Record<string, string> = {
      fullName: 'Sarah Jenkins',
      businessEmail: 'sarah.jenkins@lumina-couture.com',
      companyName: 'Lumina Couture D2C',
      phone: '+1 (415) 890-1234',
      websiteUrl: 'https://luminacouture.com',
      serviceInterest: 'Custom Shopify Plus Architecture',
      serviceName: 'Custom Shopify Plus Architecture',
      date: 'Thursday, October 15, 2026',
      time: '02:30 PM EST',
      duration: '30m Strategy Session',
      bookingNumber: 'BK-2026-8941',
      meetingLink: 'https://meet.google.com/gypsym-strategy-session',
      rescheduleLink: 'http://localhost:3000/booking/calendar',
      bookingCalendarUrl: 'http://localhost:3000/booking/calendar',
      adminDashboardUrl: 'http://localhost:3001/content/submissions',
      receivedAt: new Date().toUTCString(),
      cancellationReason: 'Client requested reschedule due to executive board review meeting.',
      alertTitle: 'Database Connection Pool Near Capacity',
      alertLevel: 'WARNING',
      alertMessage: 'Primary PostgreSQL pool connection utilization exceeded 85% for 3 consecutive minutes.',
      sourceDetails: 'gypsym-production-db-cluster-01.us-east-1',
      actionUrl: 'http://localhost:3001/system/health',
      actionLabel: 'Inspect Database Metrics',
      timestamp: new Date().toUTCString(),
      projectDescription: 'Scaling past $15M ARR, seeking sub-second theme speed & checkout extensibility.',
      projectScope: 'Scaling past $15M ARR; seeking sub-second headless migration & custom CRO checkout apps.',
      submittedFieldsTable: `
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0;">
          <tr><td style="padding: 6px 12px; color: #64748b; font-weight: 600;">Monthly GMV</td><td style="padding: 6px 12px; color: #0f172a;">$1.2M</td></tr>
          <tr><td style="padding: 6px 12px; color: #64748b; font-weight: 600;">Current Platform</td><td style="padding: 6px 12px; color: #0f172a;">Shopify Plus Vintage</td></tr>
        </table>
      `,
    };

    for (const [k, v] of Object.entries(sampleData)) {
      rendered = rendered.replace(new RegExp(`{{${k}}}`, 'g'), v);
    }
    return rendered;
  }, [currentHtml]);

  if (loading && Object.keys(templates).length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          <span className="text-xs font-medium">Loading Email Templates Studio...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full pb-24">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Dynamic HTML Template Engine & Database Configuration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Email Templates Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dynamic HTML templates stored in database. Seeded with professional defaults for inquiries, discovery bookings, cancellations, and multi-admin alerts.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">

          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="h-9 text-xs rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs gap-1.5"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save Template
          </Button>
        </div>
      </div>

      {/* Template Switcher Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {Object.keys(templates).map((key) => {
          const t = templates[key];
          if (!t) return null;
          const isSelected = selectedKey === key;
          const tMeta = TEMPLATE_META[key] || {
            icon: Mail,
            badge: 'System Template',
            color: 'text-slate-600 bg-slate-50 border-slate-200',
          };
          const TIcon = tMeta.icon;

          return (
            <button
              key={key}
              type="button"
              onClick={() => handleSelectTemplate(key)}
              className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/20 shadow-md shadow-blue-500/5 ring-1 ring-blue-500/40'
                  : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center border ${tMeta.color}`}
                  >
                    <TIcon className="h-4 w-4" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tMeta.color}`}
                  >
                    {tMeta.badge}
                  </span>
                </div>

                <div className="font-bold text-xs text-slate-900 line-clamp-1 mb-1">
                  {t.name}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {t.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>{t.variables?.length || 0} variables</span>
                {t.isActive !== false ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                  </span>
                ) : (
                  <span className="text-slate-400 font-medium">Inactive</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Studio Area */}
      {selectedTemplate && (
        <Card className="p-6 rounded-2xl border-slate-200/90 shadow-sm bg-white space-y-6">
          {/* Top Bar: Active Toggle & Subject */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pb-5 border-b border-slate-100">
            {/* Subject Input */}
            <div className="lg:col-span-8 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900">
                  Email Subject Line
                </label>
                <span className="text-[11px] text-slate-400">
                  Supports dynamic tokens like {'{{fullName}}'}
                </span>
              </div>
              <Input
                value={currentSubject}
                onChange={(e) => setCurrentSubject(e.target.value)}
                placeholder="e.g. Discovery Call Confirmed: {{fullName}}"
                className="h-10 text-xs rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white font-medium"
              />
            </div>

            {/* Test Email Dispatch Box */}
            <div className="lg:col-span-4 space-y-1.5">
              <label className="text-xs font-bold text-slate-900">
                Send Test Email
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="email"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  placeholder="name@example.com"
                  className="h-10 text-xs rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white"
                />
                <Button
                  size="sm"
                  onClick={handleSendTest}
                  disabled={sendingTest}
                  className="h-10 px-3.5 text-xs rounded-xl bg-slate-900 hover:bg-slate-800 text-white shrink-0 font-medium"
                >
                  <Send className="h-3 w-3 mr-1" />
                  {sendingTest ? 'Sending...' : 'Test'}
                </Button>
              </div>
            </div>
          </div>

          {/* Dynamic Variable Tokens Click-to-Insert Toolbar */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                Available Dynamic Tokens (Click to insert into HTML)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Tokens automatically interpolate at runtime
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(selectedTemplate.variables || []).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => insertVariable(v)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition-colors text-[11px] font-mono shadow-2xs group"
                >
                  <span>&#123;&#123;{v}&#125;&#125;</span>
                  <Copy className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'code'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileCode className="h-3.5 w-3.5 inline mr-1" />
                HTML Source Code
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('split')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'split'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="inline mr-1">&#x25F0;</span>
                Split Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'preview'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="h-3.5 w-3.5 inline mr-1" />
                Live Rendered Preview
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 font-medium">Status:</label>
              <button
                type="button"
                onClick={() => setCurrentActive(!currentActive)}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold border transition-all ${
                  currentActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                {currentActive ? '✓ Enabled' : 'Disabled'}
              </button>
            </div>
          </div>

          {/* Editor Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[550px]">
            {/* Code Editor Column */}
            {(activeTab === 'code' || activeTab === 'split') && (
              <div
                className={`${
                  activeTab === 'split' ? 'lg:col-span-6' : 'lg:col-span-12'
                } flex flex-col space-y-1.5`}
              >
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">HTML Source Code</span>
                  <span className="font-mono text-[11px]">
                    {currentHtml.length} characters
                  </span>
                </div>
                <textarea
                  ref={textareaRef}
                  value={currentHtml}
                  onChange={(e) => setCurrentHtml(e.target.value)}
                  className="w-full flex-1 min-h-[500px] p-4 font-mono text-xs text-slate-800 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed resize-y selection:bg-blue-600"
                  spellCheck={false}
                />
              </div>
            )}

            {/* Live Preview Column */}
            {(activeTab === 'preview' || activeTab === 'split') && (
              <div
                className={`${
                  activeTab === 'split' ? 'lg:col-span-6' : 'lg:col-span-12'
                } flex flex-col space-y-1.5`}
              >
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">
                    Live Sample Render Preview
                  </span>
                  <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-200 bg-blue-50/50">
                    Client View Simulation
                  </Badge>
                </div>
                <div className="w-full flex-1 min-h-[500px] rounded-2xl border border-slate-200 bg-slate-100/50 overflow-hidden flex flex-col">
                  {/* Fake Email Header Bar */}
                  <div className="p-3 bg-white border-b border-slate-200/80 text-xs space-y-1">
                    <div className="flex items-center text-slate-500 text-[11px]">
                      <span className="w-16 font-semibold text-slate-400">Subject:</span>
                      <span className="font-medium text-slate-900">
                        {currentSubject.replace(/{{[a-zA-Z0-9_-]+}}/g, 'Sample Value')}
                      </span>
                    </div>
                    <div className="flex items-center text-slate-500 text-[11px]">
                      <span className="w-16 font-semibold text-slate-400">To:</span>
                      <span>sarah.jenkins@lumina-couture.com</span>
                    </div>
                  </div>
                  {/* Rendered HTML Frame */}
                  <iframe
                    title="Live Preview"
                    srcDoc={previewHtml}
                    className="w-full flex-1 border-0 bg-transparent min-h-[440px]"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
