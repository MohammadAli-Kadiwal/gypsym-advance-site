'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Mail,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Sliders,
  FileText,
  Building,
} from 'lucide-react';
import type {
  ContactSection,
  ContactPayload,
  ContactFieldConfig,
} from './types';

const Label = ({ className = '', ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={`block text-xs font-semibold text-slate-700 ${className}`} {...props} />
);

interface ContactSettingsProps {
  section: ContactSection;
  onChange: (updated: ContactSection) => void;
}

const DEFAULT_FIELDS: ContactFieldConfig[] = [
  {
    id: 'f-name',
    name: 'fullName',
    label: 'Full Name',
    type: 'text',
    placeholder: 'Dr. Evelyn Reed',
    required: true,
    width: 'full',
  },
  {
    id: 'f-email',
    name: 'email',
    label: 'Work Email',
    type: 'email',
    placeholder: 'evelyn@enterprise.com',
    required: true,
    width: 'full',
  },
  {
    id: 'f-company',
    name: 'companyName',
    label: 'Company Name',
    type: 'text',
    placeholder: 'Apex Cloud Systems',
    required: false,
    width: 'half',
  },
  {
    id: 'f-phone',
    name: 'phone',
    label: 'Phone Number',
    type: 'tel',
    placeholder: '+1 (555) 019-2834',
    required: false,
    width: 'half',
  },
  {
    id: 'f-service',
    name: 'serviceInterest',
    label: 'Area of Interest',
    type: 'select',
    placeholder: 'Select solution area...',
    required: false,
    options: [
      'Cloud Architecture & Migration',
      'AI & Data Engineering',
      'Enterprise Application Modernization',
      'Cybersecurity & Compliance',
      'General Partnership Inquiry',
    ],
    width: 'full',
  },
  {
    id: 'f-message',
    name: 'message',
    label: 'Project Details & Scope',
    type: 'textarea',
    placeholder: 'Briefly describe your systems architecture, requirements, and target timeline...',
    required: true,
    width: 'full',
  },
];

export function ContactSettings({ section, onChange }: ContactSettingsProps) {
  const p: ContactPayload = section.contentPayload || {};
  const contactInfo = p.contactInfo || { useGlobalDefaults: true };
  const supportCard = p.supportCard || { enabled: false };
  const form = p.form || {
    formTitle: 'Direct Engineering Inquiry',
    formSubtitle: 'Connect with a principal architect within 24 business hours.',
    submitButtonText: 'Submit Inquiry',
    privacyNote: 'Protected by enterprise NDA standards. No solicitation.',
    successTitle: 'Inquiry Transmitted',
    successMessage: 'Thank you. Our engineering desk has received your briefing and will review specifications shortly.',
    fields: DEFAULT_FIELDS,
  };

  const fields: ContactFieldConfig[] =
    form.fields && form.fields.length > 0 ? form.fields : DEFAULT_FIELDS;

  const update = (partial: Partial<ContactPayload>) => {
    onChange({
      ...section,
      contentPayload: {
        ...p,
        ...partial,
      },
    });
  };

  const updateContactInfo = (partial: Partial<NonNullable<ContactPayload['contactInfo']>>) => {
    update({
      contactInfo: {
        ...contactInfo,
        ...partial,
      },
    });
  };

  const updateSupportCard = (partial: Partial<NonNullable<ContactPayload['supportCard']>>) => {
    update({
      supportCard: {
        ...supportCard,
        ...partial,
      },
    });
  };

  const updateForm = (partial: Partial<NonNullable<ContactPayload['form']>>) => {
    update({
      form: {
        ...form,
        ...partial,
      },
    });
  };

  // Field operations
  const handleAddField = () => {
    const newField: ContactFieldConfig = {
      id: `field-${Date.now()}`,
      name: `field_${fields.length + 1}`,
      label: 'New Field',
      type: 'text',
      placeholder: '',
      required: false,
      width: 'full',
    };
    updateForm({ fields: [...fields, newField] });
  };

  const handleUpdateField = (index: number, partial: Partial<ContactFieldConfig>) => {
    const updated = [...fields];
    const existing = updated[index];
    if (existing) {
      updated[index] = { ...existing, ...partial } as ContactFieldConfig;
      updateForm({ fields: updated });
    }
  };

  const handleDeleteField = (index: number) => {
    const updated = fields.filter((_, i) => i !== index);
    updateForm({ fields: updated });
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    const updated = [...fields];
    const current = updated[index];
    const target = updated[targetIndex];
    if (current && target) {
      updated[index] = target;
      updated[targetIndex] = current;
      updateForm({ fields: updated });
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Section Header / Left Column Copy ──────────────── */}
      <Card className="rounded-2xl border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Left Column · Section Messaging
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Configure heading, italic emphasis, and advisory content
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] text-blue-600 bg-blue-50/50 border-blue-200 font-mono">
              CONTACT_INQUIRY
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact-eyebrow">Eyebrow Badge</Label>
              <Input
                id="contact-eyebrow"
                value={p.eyebrow ?? 'DIRECT ENGAGEMENT'}
                onChange={(e) => update({ eyebrow: e.target.value })}
                className="mt-1 text-xs"
                placeholder="DIRECT ENGAGEMENT"
              />
            </div>
            <div>
              <Label htmlFor="contact-highlight">Serif-Italic Accent Word</Label>
              <Input
                id="contact-highlight"
                value={p.titleHighlight ?? 'Consultation'}
                onChange={(e) => update({ titleHighlight: e.target.value })}
                className="mt-1 text-xs"
                placeholder="Consultation"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Word or phrase in the title styled in elegant font-serif italic.
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="contact-title">Main Headline</Label>
            <Input
              id="contact-title"
              value={p.title ?? 'Initiate an Architectural Consultation'}
              onChange={(e) => update({ title: e.target.value })}
              className="mt-1 text-xs font-semibold"
              placeholder="Initiate an Architectural Consultation"
            />
          </div>

          <div>
            <Label htmlFor="contact-desc">Description</Label>
            <Textarea
              id="contact-desc"
              rows={3}
              value={
                p.description ??
                'Engage directly with our technical leadership. We evaluate system architecture, scale bottlenecks, and enterprise implementation scopes under strict non-disclosure terms.'
              }
              onChange={(e) => update({ description: e.target.value })}
              className="mt-1 text-xs resize-none"
              placeholder="Provide context on engagement models and executive contact..."
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Contact Info & Global Defaults ─────────────────── */}
      <Card className="rounded-2xl border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Building className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Contact Channels & Coordinates
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Inherit global corporate coordinates or set section-specific contact info
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <div>
              <p className="font-semibold text-slate-800 text-xs">Inherit Global Site Settings</p>
              <p className="text-[11px] text-slate-500">
                Automatically pull email, phone, HQ address, and social links from Global Site Settings.
              </p>
            </div>
            <Switch
              checked={contactInfo.useGlobalDefaults ?? true}
              onCheckedChange={(checked) => updateContactInfo({ useGlobalDefaults: checked })}
            />
          </div>

          {!(contactInfo.useGlobalDefaults ?? true) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <Label htmlFor="contact-email">Direct Inquiry Email</Label>
                <Input
                  id="contact-email"
                  value={contactInfo.email ?? ''}
                  onChange={(e) => updateContactInfo({ email: e.target.value })}
                  className="mt-1 text-xs"
                  placeholder="briefings@gypsym.com"
                />
              </div>
              <div>
                <Label htmlFor="contact-phone">Direct Line</Label>
                <Input
                  id="contact-phone"
                  value={contactInfo.phone ?? ''}
                  onChange={(e) => updateContactInfo({ phone: e.target.value })}
                  className="mt-1 text-xs"
                  placeholder="+1 (800) 928-4019"
                />
              </div>
              <div>
                <Label htmlFor="contact-address">Headquarters Address</Label>
                <Input
                  id="contact-address"
                  value={contactInfo.address ?? ''}
                  onChange={(e) => updateContactInfo({ address: e.target.value })}
                  className="mt-1 text-xs"
                  placeholder="One World Trade Center, Suite 8500, New York, NY"
                />
              </div>
              <div>
                <Label htmlFor="contact-hours">Desk Hours</Label>
                <Input
                  id="contact-hours"
                  value={contactInfo.officeHours ?? ''}
                  onChange={(e) => updateContactInfo({ officeHours: e.target.value })}
                  className="mt-1 text-xs"
                  placeholder="Mon - Fri: 08:00 - 18:00 EST"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Left Column Support / Mini CTA Card ────────────── */}
      <Card className="rounded-2xl border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Left Column · Advisory Mini-Card
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Optional highlight badge card under corporate coordinates
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={supportCard.enabled ?? false}
              onCheckedChange={(checked) => updateSupportCard({ enabled: checked })}
            />
          </div>
        </CardHeader>
        {supportCard.enabled && (
          <CardContent className="space-y-4 text-xs pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="support-title">Card Title</Label>
                <Input
                  id="support-title"
                  value={supportCard.title ?? 'Rapid Architecture Assessment'}
                  onChange={(e) => updateSupportCard({ title: e.target.value })}
                  className="mt-1 text-xs"
                  placeholder="Rapid Architecture Assessment"
                />
              </div>
              <div>
                <Label htmlFor="support-cta">Button Label</Label>
                <Input
                  id="support-cta"
                  value={supportCard.ctaLabel ?? 'Book Priority Session'}
                  onChange={(e) => updateSupportCard({ ctaLabel: e.target.value })}
                  className="mt-1 text-xs"
                  placeholder="Book Priority Session"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="support-desc">Card Description</Label>
              <Textarea
                id="support-desc"
                rows={2}
                value={supportCard.description ?? 'Qualifying enterprise projects receive a 45-minute technical roadmap briefing with our CTO office.'}
                onChange={(e) => updateSupportCard({ description: e.target.value })}
                className="mt-1 text-xs resize-none"
              />
            </div>
            <div>
              <Label htmlFor="support-url">Destination URL</Label>
              <Input
                id="support-url"
                value={supportCard.ctaUrl ?? '#inquiry-form'}
                onChange={(e) => updateSupportCard({ ctaUrl: e.target.value })}
                className="mt-1 text-xs font-mono"
                placeholder="#inquiry-form or https://cal.com/..."
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* ── Form Header & Feedback Messaging ───────────────── */}
      <Card className="rounded-2xl border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-slate-900">
                Right Column · Form Messaging & Responses
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Configure form header, submit button, SLA privacy note, and success notification
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="form-title">Form Title</Label>
              <Input
                id="form-title"
                value={form.formTitle ?? 'Direct Engineering Inquiry'}
                onChange={(e) => updateForm({ formTitle: e.target.value })}
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label htmlFor="form-subtitle">Form Subtitle / SLA</Label>
              <Input
                id="form-subtitle"
                value={form.formSubtitle ?? 'Connect with a principal architect within 24 business hours.'}
                onChange={(e) => updateForm({ formSubtitle: e.target.value })}
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label htmlFor="form-btn">Submit Button Text</Label>
              <Input
                id="form-btn"
                value={form.submitButtonText ?? 'Submit Inquiry'}
                onChange={(e) => updateForm({ submitButtonText: e.target.value })}
                className="mt-1 text-xs font-semibold"
              />
            </div>
            <div>
              <Label htmlFor="form-privacy">Privacy / NDA Disclaimer</Label>
              <Input
                id="form-privacy"
                value={form.privacyNote ?? 'Protected by enterprise NDA standards. No solicitation.'}
                onChange={(e) => updateForm({ privacyNote: e.target.value })}
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label htmlFor="form-succ-title">Success Headline</Label>
              <Input
                id="form-succ-title"
                value={form.successTitle ?? 'Inquiry Transmitted'}
                onChange={(e) => updateForm({ successTitle: e.target.value })}
                className="mt-1 text-xs font-semibold text-emerald-700"
              />
            </div>
            <div>
              <Label htmlFor="form-succ-msg">Success Subtext</Label>
              <Input
                id="form-succ-msg"
                value={form.successMessage ?? 'Thank you. Our engineering desk has received your briefing and will review specifications shortly.'}
                onChange={(e) => updateForm({ successMessage: e.target.value })}
                className="mt-1 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Dynamic Field Builder ──────────────────────────── */}
      <Card className="rounded-2xl border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Sliders className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Dynamic Form Field Schema
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  {fields.length} dynamic field{fields.length === 1 ? '' : 's'} configured with live frontend binding
                </CardDescription>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={handleAddField}
              className="inline-flex items-center gap-1.5 h-8 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Add Field
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {fields.map((field, idx) => (
            <div
              key={field.id || idx}
              className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-md bg-slate-200/70 text-slate-700 flex items-center justify-center font-mono text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-slate-800 text-xs">
                    {field.label || 'Untitled Field'}
                  </span>
                  <Badge variant="outline" className="text-[10px] uppercase font-mono">
                    {field.type}
                  </Badge>
                  {field.required && (
                    <Badge className="text-[9px] bg-rose-500/10 text-rose-600 border-none font-semibold">
                      Required
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-[9px] text-slate-500">
                    {field.width === 'half' ? '50% width' : '100% width'}
                  </Badge>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                    disabled={idx === 0}
                    onClick={() => handleMoveField(idx, 'up')}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                    disabled={idx === fields.length - 1}
                    onClick={() => handleMoveField(idx, 'down')}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                    onClick={() => handleDeleteField(idx)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Field edit inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
                <div>
                  <Label>Field Label</Label>
                  <Input
                    value={field.label}
                    onChange={(e) => handleUpdateField(idx, { label: e.target.value })}
                    className="mt-1 h-8 text-xs bg-white"
                  />
                </div>
                <div>
                  <Label>Field Key / Name</Label>
                  <Input
                    value={field.name}
                    onChange={(e) =>
                      handleUpdateField(idx, {
                        name: e.target.value.replace(/[^a-zA-Z0-9_]/g, ''),
                      })
                    }
                    className="mt-1 h-8 text-xs font-mono bg-white"
                  />
                </div>
                <div>
                  <Label>Input Type</Label>
                  <select
                    value={field.type}
                    onChange={(e) =>
                      handleUpdateField(idx, {
                        type: e.target.value as ContactFieldConfig['type'],
                      })
                    }
                    className="mt-1 h-8 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="text">Text (Single Line)</option>
                    <option value="email">Email</option>
                    <option value="tel">Phone / Tel</option>
                    <option value="textarea">Textarea (Multi-line)</option>
                    <option value="select">Dropdown Select</option>
                    <option value="checkbox">Checkbox</option>
                  </select>
                </div>
                <div>
                  <Label>Width</Label>
                  <select
                    value={field.width ?? 'full'}
                    onChange={(e) =>
                      handleUpdateField(idx, {
                        width: e.target.value as 'full' | 'half',
                      })
                    }
                    className="mt-1 h-8 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="full">Full Width (100%)</option>
                    <option value="half">Half Width (50%)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="sm:col-span-2">
                  <Label>Placeholder / Prompt</Label>
                  <Input
                    value={field.placeholder ?? ''}
                    onChange={(e) => handleUpdateField(idx, { placeholder: e.target.value })}
                    className="mt-1 h-8 text-xs bg-white"
                    placeholder="Enter placeholder text..."
                  />
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-4">
                  <Label className="cursor-pointer">Mandatory / Required</Label>
                  <Switch
                    checked={field.required ?? false}
                    onCheckedChange={(checked) => handleUpdateField(idx, { required: checked })}
                  />
                </div>
              </div>

              {/* Options list for select type */}
              {field.type === 'select' && (
                <div className="pt-2 border-t border-slate-200/60">
                  <Label>Dropdown Options (comma-separated)</Label>
                  <Input
                    value={(field.options || []).join(', ')}
                    onChange={(e) =>
                      handleUpdateField(idx, {
                        options: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    className="mt-1 h-8 text-xs bg-white"
                    placeholder="Option 1, Option 2, Option 3"
                  />
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
