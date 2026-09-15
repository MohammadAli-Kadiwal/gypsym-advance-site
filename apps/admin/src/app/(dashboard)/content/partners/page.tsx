'use client';

import * as React from 'react';
import {
  Plus,
  X,
  Handshake,
  Loader2,
  Pencil,
  Trash2,
  Globe,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Search,
  FileCheck,
  FileClock,
  Archive,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { notify } from '@/lib/notifications';
import { fetchApi } from '@/lib/api-client';

// ─── Types ───────────────────────────────────────────────────────────────────

export type PartnerTier = 'GLOBAL_ALLIANCE' | 'PLATINUM' | 'PREMIER' | 'TECHNOLOGY';
export type PartnerStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface Partner {
  id: string;
  slug: string | null;
  name: string;
  tier: PartnerTier;
  logoUrl?: string | null;
  logoDarkUrl?: string | null;
  partnershipOverview?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  websiteUrl?: string | null;
  partnerType?: string | null;
  industry?: string | null;
  displayOrder: number;
  status: PartnerStatus;
  showOnHomepage: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface PartnerFormState {
  name: string;
  slug: string;
  tier: PartnerTier;
  logoUrl: string;
  logoDarkUrl: string;
  shortDescription: string;
  description: string;
  websiteUrl: string;
  partnerType: string;
  industry: string;
  displayOrder: number;
  status: PartnerStatus;
  showOnHomepage: boolean;
}

const EMPTY_FORM: PartnerFormState = {
  name: '',
  slug: '',
  tier: 'TECHNOLOGY',
  logoUrl: '',
  logoDarkUrl: '',
  shortDescription: '',
  description: '',
  websiteUrl: '',
  partnerType: '',
  industry: '',
  displayOrder: 0,
  status: 'PUBLISHED',
  showOnHomepage: true,
};

// ─── Helper Functions ────────────────────────────────────────────────────────

function formatOrder(order: number): string {
  return String(order).padStart(2, '0');
}

function getTierBadge(tier: PartnerTier) {
  switch (tier) {
    case 'GLOBAL_ALLIANCE':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
          GLOBAL ALLIANCE
        </span>
      );
    case 'PLATINUM':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          PLATINUM
        </span>
      );
    case 'PREMIER':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          PREMIER
        </span>
      );
    case 'TECHNOLOGY':
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
          TECHNOLOGY
        </span>
      );
  }
}

function getStatusBadge(status: PartnerStatus) {
  switch (status) {
    case 'PUBLISHED':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          PUBLISHED
        </span>
      );
    case 'DRAFT':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          DRAFT
        </span>
      );
    case 'ARCHIVED':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
          ARCHIVED
        </span>
      );
  }
}

// ─── Partner Modal Dialog ────────────────────────────────────────────────────

interface PartnerDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: PartnerFormState;
  saving: boolean;
  onClose: () => void;
  onSubmit: (form: PartnerFormState) => void;
}

function PartnerDialog({ open, mode, initial = EMPTY_FORM, saving, onClose, onSubmit }: PartnerDialogProps) {
  const [form, setForm] = React.useState<PartnerFormState>(initial);
  const [activeTab, setActiveTab] = React.useState<'general' | 'branding' | 'details'>('general');

  React.useEffect(() => {
    setForm(initial);
    setActiveTab('general');
  }, [initial, open]);

  function patch<K extends keyof PartnerFormState>(key: K, value: PartnerFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleNameChange(name: string) {
    patch('name', name);
    if (mode === 'create' && (!form.slug || form.slug === '')) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      patch('slug', generatedSlug);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      notify.error('Partner name is required.');
      return;
    }
    onSubmit(form);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[95vw] max-w-2xl rounded-2xl border-slate-200/90 bg-white shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Handshake className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                {mode === 'create' ? 'Add Strategic Partner' : 'Edit Partner'}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                {mode === 'create'
                  ? 'Configure partner branding, tier, and homepage visibility.'
                  : 'Update partner profile, logos, and publication settings.'}
              </DialogDescription>
            </div>
          </div>

          {/* Sub-tabs inside modal */}
          <div className="flex space-x-2 pt-4">
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'general'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              General & Display
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('branding')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'branding'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Branding & Logos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'details'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Overview & Details
            </button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* ── TAB 1: General & Display ──────────────────────────────────── */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Partner Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Partner Name <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Amazon Web Services"
                    className="text-xs rounded-xl"
                    autoFocus
                  />
                </div>

                {/* Slug */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Slug <span className="text-slate-400 font-normal">(unique identifier)</span>
                  </label>
                  <Input
                    value={form.slug}
                    onChange={(e) => patch('slug', e.target.value)}
                    placeholder="e.g. amazon-web-services"
                    className="text-xs font-mono rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tier */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Partnership Tier</label>
                  <select
                    value={form.tier}
                    onChange={(e) => patch('tier', e.target.value as PartnerTier)}
                    className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="GLOBAL_ALLIANCE">Global Alliance</option>
                    <option value="PLATINUM">Platinum Partner</option>
                    <option value="PREMIER">Premier Partner</option>
                    <option value="TECHNOLOGY">Technology Partner</option>
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => patch('status', e.target.value as PartnerStatus)}
                    className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Partner Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Partner Type <span className="text-slate-400 font-normal">(e.g. Cloud, AI, Commerce)</span>
                  </label>
                  <Input
                    value={form.partnerType}
                    onChange={(e) => patch('partnerType', e.target.value)}
                    placeholder="e.g. Cloud & Infrastructure"
                    className="text-xs rounded-xl"
                  />
                </div>

                {/* Industry */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Industry / Vertical
                  </label>
                  <Input
                    value={form.industry}
                    onChange={(e) => patch('industry', e.target.value)}
                    placeholder="e.g. Enterprise Cloud Computing"
                    className="text-xs rounded-xl"
                  />
                </div>
              </div>

              {/* Website URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                  <Globe className="h-3.5 w-3.5 text-slate-400" />
                  <span>Website URL</span>
                </label>
                <Input
                  value={form.websiteUrl}
                  onChange={(e) => patch('websiteUrl', e.target.value)}
                  placeholder="https://aws.amazon.com"
                  className="text-xs font-mono rounded-xl"
                />
              </div>

              {/* Homepage Visibility & Display Order Row */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={form.showOnHomepage}
                    onCheckedChange={(checked) => patch('showOnHomepage', checked)}
                    id="show-homepage-toggle"
                  />
                  <div>
                    <label htmlFor="show-homepage-toggle" className="text-xs font-bold text-slate-900 cursor-pointer">
                      Show in Homepage Partners Section
                    </label>
                    <p className="text-[11px] text-slate-500">
                      When active, this partner will be automatically rendered in the centered 8 → 6 → 4 homepage grid.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                    Display Order:
                  </label>
                  <Input
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) => patch('displayOrder', parseInt(e.target.value, 10) || 0)}
                    className="w-20 text-xs font-mono rounded-xl text-center"
                    min={0}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: Branding & Logos ───────────────────────────────────── */}
          {activeTab === 'branding' && (
            <div className="space-y-5">
              {/* Primary Logo */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-800 flex items-center space-x-1.5">
                    <span>Primary Partner Logo (Light / Neutral)</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">SVG, PNG, or WebP recommended</span>
                </div>
                <ImageUploadField
                  value={form.logoUrl}
                  onChange={(url) => patch('logoUrl', url)}
                  label="Primary Logo"
                  description="Used on white / light backgrounds across the site and inside the homepage grid."
                  placeholder="https://cdn.gypsym.com/partners/aws.svg"
                />
              </div>

              {/* Dark Mode Logo */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-800 flex items-center space-x-1.5">
                    <span>Dark Mode Partner Logo</span>
                    <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">For dark / inverted themes</span>
                </div>
                <ImageUploadField
                  value={form.logoDarkUrl}
                  onChange={(url) => patch('logoDarkUrl', url)}
                  label="Dark Mode Logo"
                  description="Inverted or white variant optimized for high-contrast dark sections."
                  placeholder="https://cdn.gypsym.com/partners/aws-white.svg"
                  previewDark={true}
                />
              </div>
            </div>
          )}

          {/* ── TAB 3: Overview & Details ─────────────────────────────────── */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Short Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Short Tagline / Summary <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <Input
                  value={form.shortDescription}
                  onChange={(e) => patch('shortDescription', e.target.value)}
                  placeholder="e.g. Premier Consulting Partner for Cloud Native & Serverless Infrastructure"
                  className="text-xs rounded-xl"
                />
              </div>

              {/* Full Description / Overview */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Partnership Overview & Capabilities <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => patch('description', e.target.value)}
                  placeholder="Describe joint solutions, architectural certifications, and technical capabilities delivered with this partner..."
                  rows={5}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-sans"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <DialogFooter className="pt-4 border-t border-slate-100 gap-2 flex-row justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl h-9 px-4 text-xs font-semibold border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <X className="h-3.5 w-3.5 mr-1.5" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !form.name.trim()}
              className="rounded-xl h-9 px-5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  {mode === 'create' ? 'Create Partner' : 'Update Partner'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Partner Dialog ───────────────────────────────────────────────────

interface DeleteDialogProps {
  open: boolean;
  partnerName: string;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function DeletePartnerDialog({ open, partnerName, deleting, onClose, onConfirm }: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[95vw] max-w-sm rounded-2xl border-slate-200/90 bg-white shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-slate-900">Delete Partner</DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                This will permanently delete this partner and remove it from all sections.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-slate-700">
            Are you sure you want to delete{' '}
            <span className="font-bold text-slate-900">&ldquo;{partnerName}&rdquo;</span>? This action cannot be undone.
          </p>
          <DialogFooter className="gap-2 flex-row justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={deleting}
              className="rounded-xl h-9 px-4 text-xs font-semibold border-slate-200 text-slate-600"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={deleting}
              className="rounded-xl h-9 px-5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Partners Page ──────────────────────────────────────────────────────

export default function PartnersPage() {
  const [mounted, setMounted] = React.useState(false);
  const [partners, setPartners] = React.useState<Partner[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [homepageFilter, setHomepageFilter] = React.useState<string>('ALL');
  const [tierFilter, setTierFilter] = React.useState<string>('ALL');

  // Selected items for bulk actions
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = React.useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = React.useState(false);

  // Modal dialog states
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<Partner | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Partner | null>(null);

  // ── Load Partners from Backend ─────────────────────────────────────────────
  const loadPartners = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchApi<Partner[]>('/partners');
      setPartners(Array.isArray(data) ? data : []);
    } catch {
      notify.error('Could not load partners. Please ensure the API is running.');
      setPartners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    setMounted(true);
    loadPartners();
  }, [loadPartners]);

  // ── Filtered Partner List ──────────────────────────────────────────────────
  const filteredPartners = React.useMemo(() => {
    return partners.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesType = (p.partnerType || '').toLowerCase().includes(q);
        const matchesIndustry = (p.industry || '').toLowerCase().includes(q);
        const matchesDesc = (p.shortDescription || '').toLowerCase().includes(q);
        if (!matchesName && !matchesType && !matchesIndustry && !matchesDesc) {
          return false;
        }
      }

      // Status
      if (statusFilter !== 'ALL' && p.status !== statusFilter) {
        return false;
      }

      // Homepage
      if (homepageFilter === 'HOMEPAGE_ONLY' && !p.showOnHomepage) {
        return false;
      }
      if (homepageFilter === 'EXCLUDED' && p.showOnHomepage) {
        return false;
      }

      // Tier
      if (tierFilter !== 'ALL' && p.tier !== tierFilter) {
        return false;
      }

      return true;
    });
  }, [partners, searchQuery, statusFilter, homepageFilter, tierFilter]);

  // ── Create Partner ─────────────────────────────────────────────────────────
  async function handleCreate(form: PartnerFormState) {
    setSaving(true);
    try {
      const created = await fetchApi<Partner>('/partners', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim() || undefined,
          tier: form.tier,
          logoUrl: form.logoUrl.trim() || undefined,
          logoDarkUrl: form.logoDarkUrl.trim() || undefined,
          shortDescription: form.shortDescription.trim() || undefined,
          description: form.description.trim() || undefined,
          websiteUrl: form.websiteUrl.trim() || undefined,
          partnerType: form.partnerType.trim() || undefined,
          industry: form.industry.trim() || undefined,
          displayOrder: form.displayOrder,
          status: form.status,
          showOnHomepage: form.showOnHomepage,
        }),
      });

      setPartners((prev) => [...prev, created].sort((a, b) => a.displayOrder - b.displayOrder));
      setCreateOpen(false);
      notify.success(`Partner "${created.name}" created successfully.`);
    } catch {
      notify.error('Could not create partner. Please check inputs.');
    } finally {
      setSaving(false);
    }
  }

  // ── Update Partner ─────────────────────────────────────────────────────────
  async function handleUpdate(form: PartnerFormState) {
    if (!editTarget) return;
    setSaving(true);
    try {
      const updated = await fetchApi<Partner>(`/partners/${editTarget.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim() || undefined,
          tier: form.tier,
          logoUrl: form.logoUrl.trim() || undefined,
          logoDarkUrl: form.logoDarkUrl.trim() || undefined,
          shortDescription: form.shortDescription.trim() || undefined,
          description: form.description.trim() || undefined,
          websiteUrl: form.websiteUrl.trim() || undefined,
          partnerType: form.partnerType.trim() || undefined,
          industry: form.industry.trim() || undefined,
          displayOrder: form.displayOrder,
          status: form.status,
          showOnHomepage: form.showOnHomepage,
        }),
      });

      setPartners((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p)).sort((a, b) => a.displayOrder - b.displayOrder),
      );
      setEditTarget(null);
      notify.success(`Partner "${updated.name}" updated successfully.`);
    } catch {
      notify.error('Could not update partner.');
    } finally {
      setSaving(false);
    }
  }

  // ── Delete Partner ─────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetchApi(`/partners/${deleteTarget.id}`, { method: 'DELETE' });
      setPartners((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      notify.success(`Partner "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
    } catch {
      notify.error('Could not delete partner.');
    } finally {
      setDeleting(false);
    }
  }

  // ── Toggle Show on Homepage ────────────────────────────────────────────────
  async function handleToggleHomepage(partner: Partner) {
    const nextVal = !partner.showOnHomepage;

    // Optimistic UI update
    setPartners((prev) =>
      prev.map((p) => (p.id === partner.id ? { ...p, showOnHomepage: nextVal } : p)),
    );

    try {
      await fetchApi(`/partners/${partner.id}/homepage`, {
        method: 'PATCH',
        body: JSON.stringify({ showOnHomepage: nextVal }),
      });

      if (nextVal) {
        notify.success(`"${partner.name}" is now shown on the homepage.`);
      } else {
        notify.info(`"${partner.name}" removed from homepage.`);
      }
    } catch {
      // Revert on error
      setPartners((prev) =>
        prev.map((p) => (p.id === partner.id ? { ...p, showOnHomepage: partner.showOnHomepage } : p)),
      );
      notify.error('Failed to update homepage visibility.');
    }
  }

  // ── Reorder Up / Down ──────────────────────────────────────────────────────
  async function handleMoveOrder(partner: Partner, direction: 'up' | 'down') {
    const currentIndex = partners.findIndex((p) => p.id === partner.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= partners.length) return;

    const currentPartner = partners[currentIndex];
    const otherPartner = partners[targetIndex];
    if (!currentPartner || !otherPartner) return;

    const currentOrder = currentPartner.displayOrder;
    const otherOrder = otherPartner.displayOrder;

    // Swap display order
    const updatedPartners: Partner[] = partners.map((p, i) => {
      if (i === currentIndex) return { ...currentPartner, displayOrder: otherOrder };
      if (i === targetIndex) return { ...otherPartner, displayOrder: currentOrder };
      return p;
    });
    updatedPartners.sort((a, b) => a.displayOrder - b.displayOrder);

    setPartners(updatedPartners);

    try {
      await fetchApi('/partners/reorder', {
        method: 'PUT',
        body: JSON.stringify({
          items: [
            { id: currentPartner.id, displayOrder: otherOrder },
            { id: otherPartner.id, displayOrder: currentOrder },
          ],
        }),
      });
      notify.success('Partners reordered.');
    } catch {
      loadPartners();
      notify.error('Failed to reorder partners.');
    }
  }

  // ── Bulk Selection & Actions ───────────────────────────────────────────────
  const allFilteredSelected =
    filteredPartners.length > 0 && filteredPartners.every((p) => selectedIds.has(p.id));

  function handleSelectAll() {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPartners.map((p) => p.id)));
    }
  }

  function handleToggleSelect(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  }

  async function handleBulkStatus(status: PartnerStatus) {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    try {
      await fetchApi('/partners/bulk-status', {
        method: 'PUT',
        body: JSON.stringify({ ids, status }),
      });
      setPartners((prev) =>
        prev.map((p) => (selectedIds.has(p.id) ? { ...p, status } : p)),
      );
      setSelectedIds(new Set());
      notify.success(`Updated ${ids.length} partners to ${status}.`);
    } catch {
      notify.error('Failed to update partner statuses.');
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    setIsBulkProcessing(true);
    const ids = Array.from(selectedIds);
    try {
      await fetchApi('/partners/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      });
      setPartners((prev) => prev.filter((p) => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
      setBulkDeleteConfirm(false);
      notify.success(`Deleted ${ids.length} partners.`);
    } catch {
      notify.error('Failed to delete selected partners.');
    } finally {
      setIsBulkProcessing(false);
    }
  }

  // ── SSR Guard ──────────────────────────────────────────────────────────────
  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto py-6 space-y-4">
        <div className="h-8 w-48 bg-slate-200/60 rounded-xl animate-pulse" />
        <div className="h-32 bg-white rounded-2xl border border-slate-200/80 animate-pulse" />
      </div>
    );
  }

  const homepageCount = partners.filter((p) => p.showOnHomepage && p.status === 'PUBLISHED').length;

  return (
    <div className="max-w-7xl mx-auto py-2 space-y-6">
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eaedf3]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Handshake className="h-5 w-5" />
            </div>
            <span>Partners & Alliances</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage strategic technology alliances, cloud providers, and enterprise integrations.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />}
          <Badge
            variant="outline"
            className="text-xs font-mono bg-blue-50/60 text-blue-700 border-blue-200"
          >
            {partners.length} Total
          </Badge>
          <Badge
            variant="outline"
            className="text-xs font-mono bg-emerald-50/60 text-emerald-700 border-emerald-200 hidden sm:inline-flex"
          >
            {homepageCount} on Homepage
          </Badge>
          <Button
            onClick={() => setCreateOpen(true)}
            className="h-9 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Partner
          </Button>
        </div>
      </div>

      {/* ── Controls & Filter Bar ────────────────────────────────────────────── */}
      <Card className="rounded-2xl border-slate-200/90 bg-white shadow-xs p-3.5 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, type, industry..."
              className="pl-9 h-9 text-xs rounded-xl border-slate-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published Only</option>
              <option value="DRAFT">Draft Only</option>
              <option value="ARCHIVED">Archived Only</option>
            </select>

            {/* Homepage Filter */}
            <select
              value={homepageFilter}
              onChange={(e) => setHomepageFilter(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Placements</option>
              <option value="HOMEPAGE_ONLY">On Homepage Only</option>
              <option value="EXCLUDED">Excluded from Homepage</option>
            </select>

            {/* Tier Filter */}
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Tiers</option>
              <option value="GLOBAL_ALLIANCE">Global Alliance</option>
              <option value="PLATINUM">Platinum</option>
              <option value="PREMIER">Premier</option>
              <option value="TECHNOLOGY">Technology</option>
            </select>
          </div>
        </div>
      </Card>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <Card className="rounded-2xl border-slate-200/90 bg-white shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Partners Directory
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {loading ? 'Syncing…' : `${filteredPartners.length} of ${partners.length} displayed`}
          </span>
        </div>

        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Handshake className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">No partners found</p>
              <p className="text-xs text-slate-400 mt-1">
                {partners.length === 0
                  ? 'Add your first partner to start populating the homepage centered grid.'
                  : 'Try adjusting your search or filter options.'}
              </p>
            </div>
            {partners.length === 0 && (
              <Button
                onClick={() => setCreateOpen(true)}
                variant="outline"
                className="mt-2 rounded-xl h-9 px-4 text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add First Partner
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50/60">
              <TableRow className="border-b border-slate-100">
                <TableHead className="w-[40px] text-center">
                  <Checkbox
                    checked={allFilteredSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="w-[80px] text-xs font-bold text-slate-600">Order</TableHead>
                <TableHead className="w-[70px] text-xs font-bold text-slate-600">Logo</TableHead>
                <TableHead className="text-xs font-bold text-slate-600">Partner</TableHead>
                <TableHead className="text-xs font-bold text-slate-600 hidden md:table-cell">Tier</TableHead>
                <TableHead className="text-xs font-bold text-slate-600 hidden lg:table-cell">Type & Industry</TableHead>
                <TableHead className="w-[150px] text-xs font-bold text-slate-600 text-center">
                  Homepage Grid
                </TableHead>
                <TableHead className="w-[90px] text-xs font-bold text-slate-600 text-center">Status</TableHead>
                <TableHead className="w-[100px] text-right text-xs font-bold text-slate-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPartners.map((partner, idx) => (
                <TableRow
                  key={partner.id}
                  className={`hover:bg-slate-50/60 transition-colors group ${
                    selectedIds.has(partner.id) ? 'bg-blue-50/30' : ''
                  }`}
                >
                  {/* Select Checkbox */}
                  <TableCell className="py-3 text-center">
                    <Checkbox
                      checked={selectedIds.has(partner.id)}
                      onCheckedChange={() => handleToggleSelect(partner.id)}
                      aria-label={`Select ${partner.name}`}
                    />
                  </TableCell>

                  {/* Order with Quick Reorder Up/Down */}
                  <TableCell className="py-3">
                    <div className="flex items-center space-x-1 font-mono text-xs text-slate-500">
                      <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                        {formatOrder(partner.displayOrder)}
                      </span>
                      <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleMoveOrder(partner, 'up')}
                          disabled={idx === 0}
                          className="hover:text-blue-600 disabled:opacity-20 p-0.5"
                          title="Move Up"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveOrder(partner, 'down')}
                          disabled={idx === filteredPartners.length - 1}
                          className="hover:text-blue-600 disabled:opacity-20 p-0.5"
                          title="Move Down"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </TableCell>

                  {/* Logo Preview */}
                  <TableCell className="py-3">
                    <div className="h-10 w-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-2xs p-1">
                      {partner.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={partner.logoUrl}
                          alt={partner.name}
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Handshake className="h-4 w-4 text-slate-300" />
                      )}
                    </div>
                  </TableCell>

                  {/* Partner Name & Slug & Website */}
                  <TableCell className="py-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-xs text-slate-900">{partner.name}</span>
                        {partner.websiteUrl && (
                          <a
                            href={partner.websiteUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-400 hover:text-blue-600"
                            title={`Open ${partner.name} website`}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono mt-0.5">
                        {partner.slug ? <span>/{partner.slug}</span> : <span className="italic">no slug</span>}
                        {partner.shortDescription && (
                          <span className="text-slate-500 font-sans truncate max-w-[200px] hidden sm:inline">
                            · {partner.shortDescription}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Tier */}
                  <TableCell className="py-3 hidden md:table-cell">
                    {getTierBadge(partner.tier)}
                  </TableCell>

                  {/* Type & Industry */}
                  <TableCell className="py-3 hidden lg:table-cell">
                    <div className="text-xs text-slate-700">
                      {partner.partnerType || <span className="text-slate-300">—</span>}
                    </div>
                    {partner.industry && (
                      <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                        {partner.industry}
                      </div>
                    )}
                  </TableCell>

                  {/* Show on Homepage Switch */}
                  <TableCell className="py-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Switch
                        checked={partner.showOnHomepage}
                        onCheckedChange={() => handleToggleHomepage(partner)}
                        aria-label={`Toggle homepage visibility for ${partner.name}`}
                      />
                      <span
                        className={`text-[11px] font-bold ${
                          partner.showOnHomepage ? 'text-blue-600' : 'text-slate-400'
                        }`}
                      >
                        {partner.showOnHomepage ? 'ACTIVE' : 'OFF'}
                      </span>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-3 text-center">
                    {getStatusBadge(partner.status)}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-3 text-right">
                    <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditTarget(partner)}
                        className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        title="Edit partner"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(partner)}
                        className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete partner"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* ── Dialogs ────────────────────────────────────────────────────────── */}
      <PartnerDialog
        open={createOpen}
        mode="create"
        saving={saving}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />

      <PartnerDialog
        open={!!editTarget}
        mode="edit"
        initial={
          editTarget
            ? {
                name: editTarget.name,
                slug: editTarget.slug || '',
                tier: editTarget.tier,
                logoUrl: editTarget.logoUrl || '',
                logoDarkUrl: editTarget.logoDarkUrl || '',
                shortDescription: editTarget.shortDescription || '',
                description: editTarget.description || '',
                websiteUrl: editTarget.websiteUrl || '',
                partnerType: editTarget.partnerType || '',
                industry: editTarget.industry || '',
                displayOrder: editTarget.displayOrder,
                status: editTarget.status,
                showOnHomepage: editTarget.showOnHomepage,
              }
            : EMPTY_FORM
        }
        saving={saving}
        onClose={() => setEditTarget(null)}
        onSubmit={handleUpdate}
      />

      <DeletePartnerDialog
        open={!!deleteTarget}
        partnerName={deleteTarget?.name || ''}
        deleting={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      {/* ─── Floating Bulk Action Dock ─────────────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center space-x-2.5 rounded-2xl border border-slate-200 bg-white/95 px-5 py-2.5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="text-xs font-semibold text-slate-800 pr-2 border-r border-slate-200">
            {selectedIds.size} selected
          </span>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs rounded-xl border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
            onClick={() => handleBulkStatus('PUBLISHED')}
          >
            <FileCheck className="h-3.5 w-3.5 mr-1 text-emerald-600" />
            <span>Publish</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs rounded-xl border-slate-200 hover:bg-slate-100"
            onClick={() => handleBulkStatus('DRAFT')}
          >
            <FileClock className="h-3.5 w-3.5 mr-1 text-amber-600" />
            <span>Draft</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs rounded-xl border-slate-200 hover:bg-slate-100"
            onClick={() => handleBulkStatus('ARCHIVED')}
          >
            <Archive className="h-3.5 w-3.5 mr-1 text-slate-500" />
            <span>Archive</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            className="h-8 text-xs rounded-xl bg-rose-600 hover:bg-rose-700"
            onClick={() => setBulkDeleteConfirm(true)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            <span>Delete</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-slate-400 hover:text-slate-600 rounded-xl ml-1"
            onClick={() => setSelectedIds(new Set())}
          >
            Clear
          </Button>
        </div>
      )}

      {/* ─── Bulk Delete Confirmation Dialog ───────────────────────── */}
      <ConfirmDialog
        open={bulkDeleteConfirm}
        onOpenChange={(open) => !open && setBulkDeleteConfirm(false)}
        title={`Delete ${selectedIds.size} Partners?`}
        description={`Are you sure you want to delete ${selectedIds.size} selected partners? This action cannot be undone.`}
        confirmLabel={isBulkProcessing ? 'Deleting...' : `Delete ${selectedIds.size} Partners`}
        variant="destructive"
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}
