'use client';

import * as React from 'react';
import {
  Plus,
  X,
  ExternalLink,
  Layers,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { DataTable, ColumnDef } from '@/components/crud/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { BaseRecord, ItemStatus } from '@/lib/store';
import { formatDate } from '@/lib/utils';
import { notify } from '@/lib/notifications';
import { fetchApi } from '@/lib/api-client';

export interface ServiceProcessStep {
  step: string;
  title: string;
  description: string;
}

export interface ServiceRecord extends BaseRecord {
  title: string;
  slug: string;
  tagline: string;
  shortDescription: string;
  detailedContent: string;
  category: string;
  iconName?: string;
  displayOrder: number;
  technologies?: string[];
  deliverables?: string[];
  process?: ServiceProcessStep[];
  benefits?: Array<{ title: string; description: string }>;
  faqs?: Array<{ question: string; answer: string }>;
}

const CATEGORY_PRESETS = [
  'E-Commerce',
  'Design & Engineering',
  'Growth & Search',
  'Operations & Retainers',
  'Performance & CRO',
  'Setup & Launch',
];

interface ServiceFormState {
  title: string;
  slug: string;
  category: string;
  tagline: string;
  shortDescription: string;
  detailedContent: string;
  displayOrder: number;
  status: ItemStatus;
  technologiesText: string;
  deliverables: string[];
  process: ServiceProcessStep[];
}

const DEFAULT_FORM: ServiceFormState = {
  title: '',
  slug: '',
  category: 'E-Commerce',
  tagline: '',
  shortDescription: '',
  detailedContent: '',
  displayOrder: 1,
  status: 'PUBLISHED',
  technologiesText: 'Shopify Plus, Liquid, Hydrogen, React, TypeScript',
  deliverables: [
    'Custom Shopify Theme Development',
    'Core Web Vitals Speed Optimization',
    'Seamless Third-Party App Integrations',
    'Post-Launch Hypercare & Support',
  ],
  process: [
    { step: '01', title: 'Strategy & Architecture', description: 'Catalog and UX blueprinting tailored for high conversion.' },
    { step: '02', title: 'Design & Prototyping', description: 'Bespoke mobile-first visual designs in Figma.' },
    { step: '03', title: 'Liquid Engineering', description: 'Modular OS 2.0 sections with zero app bloat.' },
    { step: '04', title: 'Launch & Hypercare', description: 'Rigorous QA and zero-downtime go-live support.' },
  ],
};

export default function ServicesAdminPage() {
  const [mounted, setMounted] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [services, setServices] = React.useState<ServiceRecord[]>([]);

  // Dialog State
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<ServiceRecord | null>(null);
  const [form, setForm] = React.useState<ServiceFormState>(DEFAULT_FORM);
  const [activeTab, setActiveTab] = React.useState('basic');
  const [newDeliverable, setNewDeliverable] = React.useState('');

  // ── Load live services from NestJS API ──────────────────────────────────────
  const loadServices = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchApi<ServiceRecord[]>('/services');
      if (Array.isArray(data)) {
        setServices(
          data.map((s) => ({
            ...s,
            status: (s.status || 'PUBLISHED') as ItemStatus,
          }))
        );
      } else {
        setServices([]);
      }
    } catch {
      notify.error('Failed to load services from backend database.');
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    setMounted(true);
    loadServices();
  }, [loadServices]);

  // ── Auto-slugify helper ─────────────────────────────────────────────────────
  function handleTitleChange(val: string) {
    if (!editingItem) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setForm((prev) => ({ ...prev, title: val, slug: generatedSlug }));
    } else {
      setForm((prev) => ({ ...prev, title: val }));
    }
  }

  // ── Open Create Dialog ──────────────────────────────────────────────────────
  function handleOpenAdd() {
    setEditingItem(null);
    setForm({
      ...DEFAULT_FORM,
      displayOrder: services.length + 1,
    });
    setActiveTab('basic');
    setNewDeliverable('');
    setDialogOpen(true);
  }

  // ── Open Edit Dialog ────────────────────────────────────────────────────────
  function handleOpenEdit(item: ServiceRecord) {
    setEditingItem(item);
    setForm({
      title: item.title,
      slug: item.slug,
      category: item.category || 'E-Commerce',
      tagline: item.tagline || '',
      shortDescription: item.shortDescription || '',
      detailedContent: item.detailedContent || '',
      displayOrder: item.displayOrder ?? 1,
      status: (item.status || 'PUBLISHED') as ItemStatus,
      technologiesText: (item.technologies || []).join(', '),
      deliverables: item.deliverables && item.deliverables.length > 0
        ? [...item.deliverables]
        : [...DEFAULT_FORM.deliverables],
      process: item.process && item.process.length > 0
        ? [...item.process]
        : [...DEFAULT_FORM.process],
    });
    setActiveTab('basic');
    setNewDeliverable('');
    setDialogOpen(true);
  }

  // ── Submit Save (Create / Update) ───────────────────────────────────────────
  async function handleSave() {
    if (!form.title.trim()) {
      notify.error('Service Name is required.');
      return;
    }
    if (!form.slug.trim()) {
      notify.error('URL Slug is required.');
      return;
    }

    setSaving(true);
    const techArray = form.technologiesText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      category: form.category.trim(),
      tagline: form.tagline.trim(),
      shortDescription: form.shortDescription.trim(),
      detailedContent: form.detailedContent.trim(),
      displayOrder: Number(form.displayOrder) || 1,
      status: form.status,
      technologies: techArray,
      deliverables: form.deliverables,
      process: form.process,
    };

    try {
      if (editingItem) {
        const updated = await fetchApi<ServiceRecord>(`/services/${editingItem.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setServices((prev) =>
          prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
        );
        notify.success(`Service "${updated.title}" updated successfully.`);
      } else {
        const created = await fetchApi<ServiceRecord>('/services', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setServices((prev) => [...prev, created]);
        notify.success(`Service "${created.title}" created successfully.`);
      }
      setDialogOpen(false);
    } catch {
      notify.error('Failed to save service. Please check your input and try again.');
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    const target = services.find((s) => s.id === id);
    try {
      await fetchApi(`/services/${id}`, { method: 'DELETE' });
      setServices((prev) => prev.filter((s) => s.id !== id));
      notify.success(`Service "${target?.title || 'item'}" deleted.`);
    } catch {
      notify.error('Failed to delete service. Please try again.');
    }
  }

  // ── Bulk Delete ─────────────────────────────────────────────────────────────
  async function handleBulkDelete(ids: string[]) {
    try {
      await fetchApi('/services/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      });
      setServices((prev) => prev.filter((s) => !ids.includes(s.id)));
      notify.success(`${ids.length} services deleted.`);
    } catch {
      notify.error('Failed to delete selected services.');
    }
  }

  // ── Bulk Status ─────────────────────────────────────────────────────────────
  async function handleBulkStatus(ids: string[], status: ItemStatus) {
    try {
      await fetchApi('/services/bulk-status', {
        method: 'PUT',
        body: JSON.stringify({ ids, status }),
      });
      setServices((prev) =>
        prev.map((s) => (ids.includes(s.id) ? { ...s, status } : s))
      );
      notify.success(`Updated ${ids.length} services to ${status}.`);
    } catch {
      notify.error('Failed to update status.');
    }
  }

  // ── Deliverable list modifiers ──────────────────────────────────────────────
  function addDeliverable() {
    if (!newDeliverable.trim()) return;
    setForm((prev) => ({
      ...prev,
      deliverables: [...prev.deliverables, newDeliverable.trim()],
    }));
    setNewDeliverable('');
  }

  function removeDeliverable(idx: number) {
    setForm((prev) => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== idx),
    }));
  }

  // ── Columns ─────────────────────────────────────────────────────────────────
  const columns: ColumnDef<ServiceRecord>[] = [
    {
      key: 'title',
      header: 'Service Name & Slug',
      sortable: true,
      render: (item) => (
        <div className="flex items-start justify-between gap-2 max-w-sm">
          <div>
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <span>{item.title}</span>
            </div>
            <div className="font-mono text-[11px] text-slate-400 mt-0.5">/services/{item.slug}</div>
          </div>
          <a
            href={`/services/${item.slug}`}
            target="_blank"
            rel="noreferrer"
            title="Open live service page"
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
          {item.category || 'Specialized'}
        </span>
      ),
    },
    {
      key: 'tagline',
      header: 'Tagline & Narrative',
      render: (item) => (
        <div className="max-w-md">
          <p className="text-xs font-medium text-slate-800 line-clamp-1">{item.tagline || '—'}</p>
          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.shortDescription || '—'}</p>
        </div>
      ),
    },
    {
      key: 'technologies',
      header: 'Tech Stack',
      render: (item) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {(item.technologies || []).slice(0, 3).map((t, idx) => (
            <span
              key={idx}
              className="rounded-md bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] font-mono text-slate-700 shadow-2xs"
            >
              {t}
            </span>
          ))}
          {(item.technologies || []).length > 3 && (
            <span className="text-[10px] font-mono text-slate-400 self-center">
              +{item.technologies!.length - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'deliverables',
      header: 'Deliverables',
      render: (item) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>{item.deliverables?.length || 0} Guaranteed</span>
        </div>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Last Modified',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-[11px] text-slate-500">
          {item.updatedAt ? formatDate(item.updatedAt) : '—'}
        </span>
      ),
    },
  ];

  if (!mounted || loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <>
      <DataTable<ServiceRecord>
        title="Services Studio"
        description="Dynamic management of core practice areas, engineering deliverables, and public service pages."
        data={services}
        columns={columns}
        searchKeys={['title', 'slug', 'category', 'tagline', 'shortDescription']}
        requiredPermission="content:write"
        addButtonLabel="Add Service"
        entityName="service"
        emptyStateTitle="No services found in database."
        emptyStateDescription="Add a new service offering to dynamically display it on the public website."
        onAdd={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        onBulkStatusChange={handleBulkStatus}
      />

      {/* ── Rich Multi-Tab Dialog Editor ────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900">
                  {editingItem ? `Edit Service: ${editingItem.title}` : 'Add New Service'}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Changes save immediately to PostgreSQL and dynamically reflect on the public website.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-3 border-b border-slate-100 bg-white">
              <TabsList className="bg-slate-100/80 p-1">
                <TabsTrigger value="basic" className="text-xs font-semibold">
                  1. General & Status
                </TabsTrigger>
                <TabsTrigger value="content" className="text-xs font-semibold">
                  2. Messaging & Narrative
                </TabsTrigger>
                <TabsTrigger value="deliverables" className="text-xs font-semibold">
                  3. Deliverables & Stack
                </TabsTrigger>
                <TabsTrigger value="playbook" className="text-xs font-semibold">
                  4. 4-Step Playbook
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* ── TAB 1: General & Status ── */}
              <TabsContent value="basic" className="m-0 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Service Name *</label>
                    <Input
                      value={form.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="e.g. E-commerce Solutions"
                      className="text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">URL Slug *</label>
                    <div className="relative">
                      <Input
                        value={form.slug}
                        onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                        placeholder="e-commerce-solutions"
                        className="text-sm font-mono pl-24"
                      />
                      <span className="absolute left-3 top-2.5 text-xs font-mono text-slate-400 select-none">
                        /services/
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Category</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {CATEGORY_PRESETS.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, category: cat }))}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                          form.category === cat
                            ? 'bg-indigo-600 text-white border-indigo-600 font-medium'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <Input
                    value={form.category}
                    onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                    placeholder="Or enter custom category..."
                    className="text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Display Order</label>
                    <Input
                      type="number"
                      value={form.displayOrder}
                      onChange={(e) => setForm((prev) => ({ ...prev, displayOrder: parseInt(e.target.value) || 1 }))}
                      min={1}
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Publishing Status</label>
                    <div className="flex items-center gap-2">
                      {(['PUBLISHED', 'DRAFT', 'ARCHIVED'] as ItemStatus[]).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, status: st }))}
                          className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                            form.status === st
                              ? st === 'PUBLISHED'
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : st === 'DRAFT'
                                ? 'bg-amber-600 text-white border-amber-600'
                                : 'bg-slate-700 text-white border-slate-700'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* ── TAB 2: Messaging & Narrative ── */}
              <TabsContent value="content" className="m-0 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Hero Tagline</label>
                  <Input
                    value={form.tagline}
                    onChange={(e) => setForm((prev) => ({ ...prev, tagline: e.target.value }))}
                    placeholder="e.g. Complete Shopify & Shopify Plus stores designed to sell — not just look pretty."
                    className="text-sm"
                  />
                  <p className="text-[11px] text-slate-400">
                    Rendered below the title in the editorial subpage hero.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Strategic Overview (Short Description)</label>
                  <Textarea
                    rows={3}
                    value={form.shortDescription}
                    onChange={(e) => setForm((prev) => ({ ...prev, shortDescription: e.target.value }))}
                    placeholder="We build complete Shopify stores designed to sell..."
                    className="text-sm leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-400">
                    Displayed on service cards, listings, and the Strategic Approach section.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Deep Technical Implementation Narrative</label>
                  <Textarea
                    rows={5}
                    value={form.detailedContent}
                    onChange={(e) => setForm((prev) => ({ ...prev, detailedContent: e.target.value }))}
                    placeholder="At Gypsym, we engineer full-funnel Shopify and Shopify Plus storefronts..."
                    className="text-sm leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-400">
                    Detailed engineering narrative rendered in the white content card on the inner page.
                  </p>
                </div>
              </TabsContent>

              {/* ── TAB 3: Deliverables & Tech Stack ── */}
              <TabsContent value="deliverables" className="m-0 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Core Technologies & Tooling</label>
                  <Input
                    value={form.technologiesText}
                    onChange={(e) => setForm((prev) => ({ ...prev, technologiesText: e.target.value }))}
                    placeholder="Shopify Plus, Liquid, Hydrogen, React, TypeScript, GraphQL"
                    className="text-sm font-mono"
                  />
                  <p className="text-[11px] text-slate-400">
                    Comma-separated tools displayed as badges on the service inner page.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">Guaranteed Deliverables</label>
                    <span className="text-[11px] text-slate-400">{form.deliverables.length} items</span>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={newDeliverable}
                      onChange={(e) => setNewDeliverable(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addDeliverable();
                        }
                      }}
                      placeholder="Add a new deliverable (e.g. Sub-Second Speed Guarantee)..."
                      className="text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addDeliverable}
                      className="shrink-0"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>

                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {form.deliverables.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-800 group"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{item}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDeliverable(idx)}
                          className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors"
                          title="Remove item"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* ── TAB 4: 4-Step Playbook ── */}
              <TabsContent value="playbook" className="m-0 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    The 4 execution phases showcased on the service page Playbook section.
                  </p>
                </div>

                <div className="space-y-3">
                  {form.process.map((step, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-indigo-600/10 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {step.step || `0${idx + 1}`}
                        </span>
                        <Input
                          value={step.title}
                          onChange={(e) => {
                            const newTitle = e.target.value;
                            setForm((prev) => ({
                              ...prev,
                              process: prev.process.map((p, i) => (i === idx ? { ...p, title: newTitle } : p)),
                            }));
                          }}
                          placeholder="Phase Title"
                          className="text-xs font-semibold bg-white"
                        />
                      </div>
                      <Textarea
                        rows={2}
                        value={step.description}
                        onChange={(e) => {
                          const newDesc = e.target.value;
                          setForm((prev) => ({
                            ...prev,
                            process: prev.process.map((p, i) => (i === idx ? { ...p, description: newDesc } : p)),
                          }));
                        }}
                        placeholder="Phase execution details..."
                        className="text-xs bg-white leading-relaxed"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between sm:justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                {editingItem ? 'Save Changes' : 'Create Service'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
