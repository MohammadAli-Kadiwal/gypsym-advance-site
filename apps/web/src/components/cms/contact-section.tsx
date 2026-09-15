'use client';

import * as React from 'react';
import { PageSectionDto } from '@/lib/cms-types';
import { renderTitleWithHighlight } from '@/lib/render-title-highlight';
import { ScrollReveal } from '@/components/motion';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Send,
  Globe,
} from 'lucide-react';
import axios from 'axios';
import { useRecaptcha } from '@/lib/use-recaptcha';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface ContactFieldConfig {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox';
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  options?: string[];
  width?: 'full' | 'half';
}

export interface ContactPayload {
  eyebrow?: string;
  title?: string;
  titleHighlight?: string;
  description?: string;
  contactInfo?: {
    useGlobalDefaults?: boolean;
    email?: string;
    phone?: string;
    address?: string;
    officeHours?: string;
  };
  supportCard?: {
    enabled?: boolean;
    title?: string;
    description?: string;
    ctaLabel?: string;
    ctaUrl?: string;
  };
  form?: {
    formTitle?: string;
    formSubtitle?: string;
    submitButtonText?: string;
    privacyNote?: string;
    successTitle?: string;
    successMessage?: string;
    fields?: ContactFieldConfig[];
  };
  globalContactDetails?: {
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    socialLinks?: Array<{ platform: string; url: string }> | null;
  };
}

interface ContactSectionProps {
  section: PageSectionDto;
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

export function ContactSection({ section }: ContactSectionProps) {
  const p = (section.contentPayload as ContactPayload) || {};

  const eyebrow = p.eyebrow?.trim() || 'DIRECT ENGAGEMENT';
  const title = p.title?.trim() || 'Initiate an Architectural Consultation';
  const titleHighlight = p.titleHighlight?.trim() || 'Consultation';
  const description =
    p.description?.trim() ||
    'Engage directly with our technical leadership. We evaluate system architecture, scale bottlenecks, and enterprise implementation scopes under strict non-disclosure terms.';

  const useGlobal = p.contactInfo?.useGlobalDefaults !== false;
  const globals = p.globalContactDetails;

  const email = useGlobal && globals?.email ? globals.email : p.contactInfo?.email || 'briefings@gypsym.com';
  const phone = useGlobal && globals?.phone ? globals.phone : p.contactInfo?.phone || '+1 (800) 928-4019';
  const address = useGlobal && globals?.address ? globals.address : p.contactInfo?.address || 'One World Trade Center, Suite 8500, New York, NY';
  const officeHours = p.contactInfo?.officeHours || 'Mon – Fri: 08:00 – 18:00 EST';
  const socialLinks = globals?.socialLinks || [];

  const supportCard = p.supportCard;
  const form = p.form;
  const fields = form?.fields && form.fields.length > 0 ? form.fields : DEFAULT_FIELDS;

  return (
    <div
      id={section.sectionIdentifier || 'contact-inquiry'}
      className="w-full py-8 sm:py-10 md:py-12 bg-transparent transition-colors duration-300 relative overflow-hidden"
    >
      {/* Ambient background glow matching site theme */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-[#d9287c]/6 via-[#d9287c]/2 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* ── LEFT COLUMN: Context & Contact Details (50%) ────────────────── */}
          <ScrollReveal direction="left" delay={50}>
            <div className="space-y-6 sm:space-y-8 text-left">
              <div className="space-y-3 sm:space-y-4">
                {/* Eyebrow matching other section */}
                {eyebrow && (
                  <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#d9287c] uppercase">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#d9287c]" />
                    <span>{eyebrow}</span>
                  </div>
                )}

                {/* Title with Serif-Italic Highlight (Font size standardized with other sections) */}
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white leading-tight whitespace-pre-line">
                  {renderTitleWithHighlight(
                    title,
                    titleHighlight,
                    'font-serif italic font-normal text-[1.06em] tracking-normal inline-block text-neutral-900 dark:text-white leading-normal'
                  )}
                </h2>

                {/* Description (Font size standardized with other sections) */}
                {description && (
                  <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl">
                    {description}
                  </p>
                )}
              </div>

              {/* Corporate Coordinates Card */}
              <div className="p-5 sm:p-7 rounded-[22px] sm:rounded-[32px] bg-white dark:bg-card border border-neutral-200/80 dark:border-border shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-4 sm:space-y-5">
                <h3 className="text-xs font-bold tracking-wider uppercase text-neutral-500 dark:text-neutral-400">
                  Direct Channels
                </h3>

                <div className="space-y-3.5 sm:space-y-4 text-xs sm:text-sm">
                  {email && (
                    <a
                      href={`mailto:${email}`}
                      className="flex items-center gap-3.5 text-neutral-800 dark:text-neutral-200 hover:text-[#d9287c] dark:hover:text-[#d9287c] transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#d9287c]/10 border border-[#d9287c]/20 flex items-center justify-center text-[#d9287c] group-hover:scale-105 transition-transform shrink-0 shadow-2xs">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400">Executive Desk</div>
                        <div className="font-semibold text-neutral-900 dark:text-white group-hover:text-[#d9287c] truncate">{email}</div>
                      </div>
                    </a>
                  )}

                  {phone && (
                    <a
                      href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                      className="flex items-center gap-3.5 text-neutral-800 dark:text-neutral-200 hover:text-[#d9287c] dark:hover:text-[#d9287c] transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#d9287c]/10 border border-[#d9287c]/20 flex items-center justify-center text-[#d9287c] group-hover:scale-105 transition-transform shrink-0 shadow-2xs">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400">Direct Telephone</div>
                        <div className="font-semibold text-neutral-900 dark:text-white group-hover:text-[#d9287c] truncate">{phone}</div>
                      </div>
                    </a>
                  )}

                  {address && (
                    <div className="flex items-center gap-3.5 text-neutral-800 dark:text-neutral-200">
                      <div className="w-10 h-10 rounded-xl bg-[#d9287c]/10 border border-[#d9287c]/20 flex items-center justify-center text-[#d9287c] shrink-0 shadow-2xs">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400">Global Headquarters</div>
                        <div className="font-semibold text-neutral-900 dark:text-white">{address}</div>
                      </div>
                    </div>
                  )}

                  {officeHours && (
                    <div className="flex items-center gap-3.5 text-neutral-800 dark:text-neutral-200">
                      <div className="w-10 h-10 rounded-xl bg-[#d9287c]/10 border border-[#d9287c]/20 flex items-center justify-center text-[#d9287c] shrink-0 shadow-2xs">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400">Operating Windows</div>
                        <div className="font-semibold text-neutral-900 dark:text-white">{officeHours}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Social Channels */}
                {socialLinks.length > 0 && (
                  <div className="pt-3 sm:pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="text-[11px] uppercase font-semibold text-neutral-400 mr-1">Alliances:</span>
                    {socialLinks.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 sm:px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-[#d9287c]/10 hover:text-[#d9287c] text-neutral-700 dark:text-neutral-300 text-xs font-medium transition-colors inline-flex items-center gap-1.5"
                      >
                        <Globe className="w-3.5 h-3.5 text-[#d9287c]" />
                        <span>{link.platform}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Optional Advisory Mini-Card */}
              {supportCard?.enabled && (
                <div className="p-5 sm:p-6 rounded-2xl bg-[#fce7ec] border border-[#fbcfe8] text-neutral-900 shadow-sm space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#d9287c]/15 text-[#d9287c]">
                      Priority Briefing
                    </span>
                    <ShieldCheck className="w-4 h-4 text-[#d9287c]" />
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-neutral-900">
                    {supportCard.title || 'Rapid Architecture Assessment'}
                  </h4>
                  <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                    {supportCard.description ||
                      'Qualifying enterprise projects receive a 45-minute technical roadmap briefing with our CTO office.'}
                  </p>
                  {supportCard.ctaLabel && (
                    <a
                      href={supportCard.ctaUrl || '#contact-inquiry'}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#d9287c] hover:underline pt-1"
                    >
                      <span>{supportCard.ctaLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* ── RIGHT COLUMN: Dynamic Interactive Form (50%) - Sticky on Desktop ────────────────── */}
          <ScrollReveal direction="right" delay={150} className="w-full lg:sticky lg:top-24 self-start">
            <div className="w-full">
              <ContactForm form={form} fields={fields} />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}

// ── Client Form Component ──────────────────────────────────────────────────────────
function ContactForm({
  form,
  fields,
}: {
  form: ContactPayload['form'];
  fields: ContactFieldConfig[];
}) {
  const { isEnabled: isRecaptchaEnabled, executeRecaptcha } = useRecaptcha();
  const [formData, setFormData] = React.useState<Record<string, any>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const formTitle = form?.formTitle || 'Direct Engineering Inquiry';
  const formSubtitle =
    form?.formSubtitle || 'Connect with a principal architect within 24 business hours.';
  const submitText = form?.submitButtonText || 'Submit Inquiry';
  const privacyNote =
    form?.privacyNote || 'Protected by enterprise NDA standards. No solicitation.';
  const successTitle = form?.successTitle || 'Inquiry Transmitted';
  const successMessage =
    form?.successMessage ||
    'Thank you. Our engineering desk has received your briefing and will review specifications shortly.';

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach((f) => {
      const val = formData[f.name];
      if (f.required) {
        if (f.type === 'checkbox' && !val) {
          newErrors[f.name] = `${f.label} is required`;
        } else if (!val || (typeof val === 'string' && !val.trim())) {
          newErrors[f.name] = `${f.label} is required`;
        }
      }

      if (f.type === 'email' && val) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(val).trim())) {
          newErrors[f.name] = 'Please provide a valid work email address';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const recaptchaToken = await executeRecaptcha('contact_inquiry');

      const fullName = formData.fullName || formData.name || formData.contactName || 'Corporate Inquirer';
      const email = formData.email || formData.businessEmail || formData.workEmail || '';
      const companyName = formData.companyName || formData.organization || formData.company;
      const phone = formData.phone || formData.phoneNumber || formData.tel;
      const serviceInterest = formData.serviceInterest || formData.service || formData.subject;
      const projectDescription = formData.message || formData.description || formData.projectBrief || '';

      await axios.post(`${API_BASE_URL}/inquiries`, {
        recaptchaToken: recaptchaToken || undefined,
        data: {
          ...formData,
          recaptchaToken: recaptchaToken || undefined,
          fullName,
          email,
          businessEmail: email,
          companyName,
          phone,
          serviceInterest,
          projectDescription,
        },
        fullName,
        businessEmail: email,
        companyName,
        phone,
        serviceInterest,
        projectDescription,
        submittedData: formData,
        source: 'homepage-contact-section',
      });

      setSubmitted(true);
    } catch (err: any) {
      if (err.response?.status === 429) {
        setErrorMessage('Rate limit reached: Maximum 5 inquiries per 10 minutes. Please try again shortly.');
      } else if (err.response?.status === 400 && err.response?.data?.message?.toLowerCase().includes('recaptcha')) {
        setErrorMessage(
          err.response?.data?.message || 'reCAPTCHA verification failed. Please refresh and try again.'
        );
      } else {
        setErrorMessage(
          err.response?.data?.message || 'Unable to transmit inquiry. Please check your network and try again.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-5 sm:p-7 md:p-9 rounded-[22px] sm:rounded-[36px] bg-white dark:bg-card border border-neutral-200/80 dark:border-border shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] relative">
      {/* Header */}
      <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4 sm:pb-5 mb-5 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">{formTitle}</h3>
          <span className="self-start sm:self-auto text-[11px] sm:text-xs font-bold text-[#d9287c] bg-[#d9287c]/8 border border-[#d9287c]/20 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider">
            24H SLA
          </span>
        </div>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">{formSubtitle}</p>
      </div>

      {submitted ? (
        /* Success Message State */
        <div className="py-12 px-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">{successTitle}</h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-md mx-auto leading-relaxed">
            {successMessage}
          </p>
          <div className="pt-4">
            <button
              type="button"
              onClick={() => {
                setFormData({});
                setSubmitted(false);
              }}
              className="text-xs font-bold text-[#d9287c] hover:underline transition-colors"
            >
              Submit another specification
            </button>
          </div>
        </div>
      ) : (
        /* Form Inputs */
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <p className="leading-snug">{errorMessage}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            {fields.map((field) => {
              const spanClass = field.width === 'half' ? 'sm:col-span-1' : 'sm:col-span-2';
              const error = errors[field.name];

              return (
                <div key={field.id} className={`${spanClass} space-y-1.5 text-left`}>
                  <label
                    htmlFor={`field-${field.name}`}
                    className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200"
                  >
                    {field.label} {field.required && <span className="text-[#d9287c]">*</span>}
                  </label>

                  {/* Field Input Variant */}
                  {field.type === 'textarea' ? (
                    <textarea
                      id={`field-${field.name}`}
                      rows={4}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      placeholder={field.placeholder || ''}
                      className={`w-full rounded-xl bg-white dark:bg-neutral-900 border px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#d9287c] focus:ring-2 focus:ring-[#d9287c]/20 transition-all resize-none shadow-2xs ${
                        error ? 'border-rose-500' : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                      }`}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      id={`field-${field.name}`}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      className={`w-full rounded-xl bg-white dark:bg-neutral-900 border px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-[#d9287c] focus:ring-2 focus:ring-[#d9287c]/20 transition-all shadow-2xs ${
                        error ? 'border-rose-500' : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                      }`}
                    >
                      <option value="">{field.placeholder || 'Select...'}</option>
                      {(field.options || []).map((opt, oIdx) => (
                        <option key={oIdx} value={opt} className="bg-white text-neutral-900">
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id={`field-${field.name}`}
                        checked={Boolean(formData[field.name])}
                        onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                        className="w-4 h-4 rounded border-neutral-300 text-[#d9287c] focus:ring-[#d9287c]"
                      />
                      <label htmlFor={`field-${field.name}`} className="text-xs text-neutral-700 dark:text-neutral-300">
                        {field.placeholder || field.label}
                      </label>
                    </div>
                  ) : (
                    <input
                      id={`field-${field.name}`}
                      type={field.type}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      placeholder={field.placeholder || ''}
                      className={`w-full rounded-xl bg-white dark:bg-neutral-900 border px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#d9287c] focus:ring-2 focus:ring-[#d9287c]/20 transition-all shadow-2xs ${
                        error ? 'border-rose-500' : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                      }`}
                    />
                  )}

                  {error && <p className="text-[11px] text-rose-500 leading-none pt-0.5">{error}</p>}
                </div>
              );
            })}
          </div>

          {/* Submit Button & Subtext */}
          <div className="pt-2 sm:pt-3 space-y-2.5 sm:space-y-3">
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 sm:h-13 px-8 rounded-full font-bold text-sm sm:text-base bg-neutral-900 hover:bg-[#d9287c] text-white shadow-sm hover:shadow-lg hover:shadow-[#d9287c]/25 transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Transmitting Briefing…</span>
                </>
              ) : (
                <>
                  <span>{submitText}</span>
                  <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {privacyNote && (
              <p className="text-center text-[11px] sm:text-xs text-neutral-500 flex items-center justify-center gap-1.5 pt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{privacyNote}</span>
              </p>
            )}

            {isRecaptchaEnabled && (
              <p className="text-center text-[10px] sm:text-[11px] text-neutral-400 dark:text-neutral-500 leading-relaxed px-2 pt-1">
                Protected by reCAPTCHA and the Google{' '}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a
                  href="https://policies.google.com/terms"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  Terms of Service
                </a>{' '}
                apply.
              </p>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
