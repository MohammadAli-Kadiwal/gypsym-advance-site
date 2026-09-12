'use client';

import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { notify } from '@/lib/notifications';
import { normalizeErrorMessage } from '@/lib/api-client';

export interface FieldConfig {
  name: string;
  label: string;
  type?: 'text' | 'textarea' | 'select' | 'switch' | 'number';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  description?: string;
  section?: string; // Logical grouping e.g. "Basic Information", "Publishing"
}

interface CrudSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: FieldConfig[];
  initialData?: Record<string, any> | null;
  onSubmit: (formData: Record<string, any>) => Promise<void> | void;
  submitLabel?: string;
  successMessage?: string;
}

export function CrudSheet({
  open,
  onOpenChange,
  title,
  description,
  fields,
  initialData,
  onSubmit,
  submitLabel,
  successMessage,
}: CrudSheetProps) {
  const [formData, setFormData] = React.useState<Record<string, any>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const isEdit = !!initialData?.id;
  const resolvedSubmitLabel = submitLabel || (isEdit ? 'Save Changes' : 'Create Record');

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        const defaults: Record<string, any> = {};
        fields.forEach((f) => {
          defaults[f.name] = f.type === 'switch' ? false : '';
        });
        setFormData(defaults);
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [open, initialData, fields]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    fields.forEach((f) => {
      const val = formData[f.name];
      if (f.required && (val === undefined || val === null || val === '')) {
        newErrors[f.name] = `${f.label} is required.`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      notify.warning('Please resolve required form fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      if (successMessage) {
        notify.success(successMessage);
      } else {
        notify.success(isEdit ? 'Changes saved successfully.' : 'Record created successfully.');
      }
      onOpenChange(false);
    } catch (err) {
      notify.error(normalizeErrorMessage(err, 'Unable to save changes. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group fields by section if provided
  const groupedFields = React.useMemo(() => {
    const groups: { [key: string]: FieldConfig[] } = {};
    fields.forEach((field) => {
      const sec = field.section || 'General';
      if (!groups[sec]) groups[sec] = [];
      groups[sec].push(field);
    });
    return groups;
  }, [fields]);

  const sectionKeys = Object.keys(groupedFields);
  const hasMultipleSections = sectionKeys.length > 1;

  return (
    <Sheet open={open} onOpenChange={(o) => !isSubmitting && onOpenChange(o)}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md md:max-w-lg border-l border-slate-200 bg-white p-0 shadow-2xl flex flex-col h-full"
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <SheetTitle className="text-lg font-bold text-slate-900">{title}</SheetTitle>
            {description && (
              <SheetDescription className="text-xs text-slate-500 mt-1">
                {description}
              </SheetDescription>
            )}
          </SheetHeader>

          {/* Form Fields Body */}
          <div className="flex-1 space-y-6 px-6 py-6 overflow-y-auto">
            {sectionKeys.map((sectionName) => (
              <div key={sectionName} className="space-y-4">
                {hasMultipleSections && (
                  <div className="pb-1 border-b border-slate-100">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {sectionName}
                    </h3>
                  </div>
                )}

                <div className="space-y-4">
                  {(groupedFields[sectionName] || []).map((field) => {
                    const error = errors[field.name];
                    return (
                      <div key={field.name} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-700">
                            {field.label}{' '}
                            {field.required && <span className="text-rose-500">*</span>}
                          </label>
                          {field.description && (
                            <span className="text-[11px] text-slate-400">{field.description}</span>
                          )}
                        </div>

                        {field.type === 'textarea' ? (
                          <Textarea
                            value={formData[field.name] || ''}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            className={`rounded-xl text-xs border-slate-200 focus-visible:border-blue-500 ${
                              error ? 'border-rose-400 focus-visible:border-rose-500' : ''
                            }`}
                            rows={3}
                          />
                        ) : field.type === 'select' ? (
                          <Select
                            value={formData[field.name] || ''}
                            onValueChange={(val) => handleChange(field.name, val)}
                          >
                            <SelectTrigger
                              className={`rounded-xl text-xs border-slate-200 focus:border-blue-500 ${
                                error ? 'border-rose-400' : ''
                              }`}
                            >
                              <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 text-xs">
                              {field.options?.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : field.type === 'switch' ? (
                          <div className="flex items-center space-x-3 pt-1">
                            <Switch
                              checked={!!formData[field.name]}
                              onCheckedChange={(val) => handleChange(field.name, val)}
                            />
                            <span className="text-xs font-medium text-slate-600">
                              {formData[field.name] ? 'Active / Enabled' : 'Inactive / Disabled'}
                            </span>
                          </div>
                        ) : (
                          <Input
                            type={field.type || 'text'}
                            value={formData[field.name] ?? ''}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            className={`h-9 rounded-xl text-xs border-slate-200 focus-visible:border-blue-500 ${
                              error ? 'border-rose-400 focus-visible:border-rose-500' : ''
                            }`}
                          />
                        )}

                        {error && (
                          <p className="text-[11px] font-medium text-rose-500">{error}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <SheetFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 h-9 px-4 text-xs font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 px-5 text-xs font-semibold shadow-sm transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                resolvedSubmitLabel
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
