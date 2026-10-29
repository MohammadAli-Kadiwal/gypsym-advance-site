'use client';

import * as React from 'react';
import {
  Plus,
  X,
  Handshake,
  Loader2,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
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
import { AdminContentContainer, AdminPageHeader, AdminPageLoadingState } from '@/components/layout/admin-page';
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
import { fetchApi, normalizeErrorMessage, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/api-client';
import { TablePagination } from '@/components/ui/table-pagination';

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
  logoUrl: string;
}

const EMPTY_FORM: PartnerFormState = {
  name: '',
  logoUrl: '',
};

// ─── Helper Functions ────────────────────────────────────────────────────────

function formatOrder(order: number): string {
  return String(order).padStart(2, '0');
}


function getStatusBadge(status: PartnerStatus) {
  switch (status) {
    case 'PUBLISHED':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          PUBLIC
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
  const [form, setForm] = React.useState<PartnerFormState>(() => initial);

  // Sync initial data only when dialog opens (false -> true transition)
  const prevOpenRef = React.useRef(open);
  React.useEffect(() => {
    if (open && !prevOpenRef.current) {
      setForm(initial);
    }
    prevOpenRef.current = open;
  }, [open, initial]);

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
      <DialogContent className="w-[95vw] max-w-lg rounded-2xl border-border bg-card shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 py-5 border-b border-border/60 bg-muted/20">
          <div className="flex items-center space-x-3.5">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Handshake className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {mode === 'create' ? 'Add Strategic Partner' : 'Edit Partner'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {mode === 'create'
                  ? 'Add partner name and brand logo image.'
                  : 'Update partner name and brand logo image.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Partner Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Partner Name <span className="text-destructive">*</span>
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Amazon Web Services"
              className="h-10 text-xs rounded-xl border-input bg-background"
              autoFocus
            />
          </div>

          {/* Partner Logo */}
          <ImageUploadField
            value={form.logoUrl}
            onChange={(url) => setForm((f) => ({ ...f, logoUrl: url }))}
            label="Partner Logo"
            description="Upload SVG, PNG, or WebP brand logo, or paste a direct image URL."
            placeholder="https://cdn.gypsym.com/partners/aws.svg"
          />

          {/* Footer Actions */}
          <DialogFooter className="pt-4 border-t border-border/60 gap-2 flex-row justify-end items-center">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl h-9 px-4 text-xs font-medium cursor-pointer"
            >
              <X className="h-3.5 w-3.5 mr-1.5" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !form.name.trim()}
              className="rounded-xl h-9 px-5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  {mode === 'create' ? 'Create Partner' : 'Save Changes'}
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
      <DialogContent className="w-[95vw] max-w-sm rounded-2xl border-border bg-card shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 py-5 border-b border-border/60 bg-muted/20">
          <div className="flex items-center space-x-3.5">
            <div className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-foreground">Delete Partner</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                This will permanently delete this partner and remove it from all sections.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="p-6 space-y-4">
          <p className="text-sm text-foreground">
            Are you sure you want to delete{' '}
            <span className="font-bold text-foreground">&ldquo;{partnerName}&rdquo;</span>? This action cannot be undone.
          </p>
          <DialogFooter className="pt-2 gap-2 flex-row justify-end items-center">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={deleting}
              className="rounded-xl h-9 px-4 text-xs font-medium cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={deleting}
              className="rounded-xl h-9 px-5 text-xs font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-xs cursor-pointer"
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
      // Search by name
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        if (!p.name.toLowerCase().includes(q)) {
          return false;
        }
      }

      // Status
      if (statusFilter !== 'ALL' && p.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [partners, searchQuery, statusFilter]);

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const paginatedPartners = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPartners.slice(start, start + pageSize);
  }, [filteredPartners, page, pageSize]);

  // ── Create Partner ─────────────────────────────────────────────────────────
  async function handleCreate(form: PartnerFormState) {
    setSaving(true);
    try {
      const slugBase = form.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const created = await fetchApi<Partner>('/partners', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          slug: slugBase || undefined,
          logoUrl: form.logoUrl.trim() || undefined,
          tier: 'TECHNOLOGY',
          status: 'PUBLISHED',
          showOnHomepage: true,
          displayOrder: partners.length > 0 ? Math.max(...partners.map((p) => p.displayOrder || 0)) + 1 : 0,
        }),
      });

      setPartners((prev) => [...prev, created].sort((a, b) => a.displayOrder - b.displayOrder));
      setCreateOpen(false);
      notify.success(SUCCESS_MESSAGES.PARTNERS.CREATED(created.name));
    } catch (err: any) {
      notify.error(normalizeErrorMessage(err, ERROR_MESSAGES.PARTNERS.CREATE_FAILED));
    } finally {
      setSaving(false);
    }
  }

  function handleCloseEdit() {
    // Delay clearing editTarget during exit transition so form fields do not flash blank while animating out
    setTimeout(() => {
      setEditTarget(null);
    }, 300);
  }

  // ── Update Partner ─────────────────────────────────────────────────────────
  async function handleUpdate(form: PartnerFormState) {
    if (!editTarget) return;
    const targetId = editTarget.id;
    const partnerName = form.name.trim();
    const newLogoUrl = form.logoUrl.trim();

    setSaving(true);

    // 1. Instantly & optimistically update local state so table reflects the new value
    setPartners((prev) =>
      prev.map((p) =>
        p.id === targetId
          ? {
              ...p,
              name: partnerName,
              logoUrl: newLogoUrl || null,
            }
          : p
      )
    );

    try {
      const raw = await fetchApi<any>(`/partners/${targetId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: partnerName,
          logoUrl: newLogoUrl,
        }),
      });

      const updated: Partner = (raw && typeof raw === 'object' && 'data' in raw) ? raw.data : (raw || {});
      const resolvedLogo = updated.logoUrl !== undefined ? updated.logoUrl : (newLogoUrl || null);
      const resolvedName = updated.name || partnerName;

      setPartners((prev) =>
        prev.map((p) =>
          p.id === targetId
            ? {
                ...p,
                ...updated,
                name: resolvedName,
                logoUrl: resolvedLogo,
              }
            : p
        )
      );

      setEditTarget(null);
      notify.success(SUCCESS_MESSAGES.PARTNERS.UPDATED(partnerName));
      loadPartners().catch(() => {});
    } catch (err: any) {
      notify.error(normalizeErrorMessage(err, ERROR_MESSAGES.PARTNERS.UPDATE_FAILED));
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
      notify.success(SUCCESS_MESSAGES.PARTNERS.DELETED(deleteTarget.name));
      setDeleteTarget(null);
    } catch (err: any) {
      notify.error(normalizeErrorMessage(err, ERROR_MESSAGES.PARTNERS.DELETE_FAILED));
    } finally {
      setDeleting(false);
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

  async function handleTogglePartnerStatus(partner: Partner) {
    const nextStatus: PartnerStatus = partner.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await fetchApi('/partners/bulk-status', {
        method: 'PUT',
        body: JSON.stringify({ ids: [partner.id], status: nextStatus }),
      });
      setPartners((prev) =>
        prev.map((p) => (p.id === partner.id ? { ...p, status: nextStatus } : p))
      );
      notify.success(`Partner status updated to ${nextStatus === 'PUBLISHED' ? 'Public' : 'Draft'}.`);
    } catch {
      notify.error('Failed to update partner status.');
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
      <AdminPageLoadingState
        title="Partners & Alliances"
        message="Loading strategic technology alliances and enterprise integrations..."
        description="Syncing state with Gypsym platform services..."
        variant="wide"
      />
    );
  }

  const homepageCount = partners.filter((p) => p.showOnHomepage && p.status === 'PUBLISHED').length;

  return (
    <AdminContentContainer variant="wide">
      {/* ── Standardized Header (Strictly No Breadcrumbs) ─────────── */}
      <AdminPageHeader
        title="Partners & Alliances"
        description="Manage strategic technology alliances, cloud providers, and enterprise integrations."
        status={
          <div className="flex items-center gap-2">
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
            <Badge variant="outline" className="text-xs font-mono">
              {partners.length} Total
            </Badge>
            <Badge
              variant="outline"
              className="text-xs font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hidden sm:inline-flex"
            >
              {homepageCount} on Homepage
            </Badge>
          </div>
        }
        actions={
          <Button
            onClick={() => setCreateOpen(true)}
            size="sm"
            className="gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Partner</span>
          </Button>
        }
      />

      {/* ── Controls & Filter Bar ────────────────────────────────────────────── */}
      <Card className="rounded-2xl border-border bg-card shadow-xs p-3.5 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search partner by name..."
              className="pl-9 h-9 text-xs rounded-xl"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setPage(1);
                }}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
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
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-xl border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published Only</option>
              <option value="DRAFT">Draft Only</option>
              <option value="ARCHIVED">Archived Only</option>
            </select>
          </div>
        </div>
      </Card>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <Card className="rounded-2xl border-border bg-card shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border/60 flex items-center justify-between bg-muted/30">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Partners Directory
          </span>
          <span className="text-[11px] text-muted-foreground font-mono">
            {loading ? 'Syncing…' : `Showing ${paginatedPartners.length} of ${filteredPartners.length} partners`}
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
                  ? 'Add your first partner with a name and logo image.'
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
          <>
            <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-b border-border/60">
                <TableHead className="w-[48px] text-center px-3">
                  <Checkbox
                    checked={allFilteredSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="w-[84px] text-xs font-bold text-muted-foreground whitespace-nowrap">Order</TableHead>
                <TableHead className="w-[80px] text-xs font-bold text-muted-foreground whitespace-nowrap">Logo</TableHead>
                <TableHead className="text-xs font-bold text-muted-foreground whitespace-nowrap">Partner Name</TableHead>
                <TableHead className="w-[110px] text-xs font-bold text-muted-foreground text-center whitespace-nowrap">Status</TableHead>
                <TableHead className="w-[100px] text-right text-xs font-bold text-muted-foreground whitespace-nowrap pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPartners.map((partner, idx) => (
                <TableRow
                  key={partner.id}
                  className={`hover:bg-muted/40 transition-colors group ${
                    selectedIds.has(partner.id) ? 'bg-primary/5' : ''
                  }`}
                >
                  {/* Select Checkbox */}
                  <TableCell className="py-3 px-3 text-center">
                    <Checkbox
                      checked={selectedIds.has(partner.id)}
                      onCheckedChange={() => handleToggleSelect(partner.id)}
                      aria-label={`Select ${partner.name}`}
                    />
                  </TableCell>

                  {/* Order with Quick Reorder Up/Down */}
                  <TableCell className="py-3 px-3">
                    <div className="flex items-center space-x-1.5 font-mono text-xs text-muted-foreground">
                      <span className="font-bold text-foreground bg-muted px-1.5 py-0.5 rounded text-[11px]">
                        {formatOrder(partner.displayOrder)}
                      </span>
                      <div className="flex flex-col opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleMoveOrder(partner, 'up')}
                          disabled={idx === 0}
                          className="hover:text-primary disabled:opacity-20 p-0.5 cursor-pointer transition-colors"
                          title="Move Up"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveOrder(partner, 'down')}
                          disabled={idx === filteredPartners.length - 1}
                          className="hover:text-primary disabled:opacity-20 p-0.5 cursor-pointer transition-colors"
                          title="Move Down"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </TableCell>

                  {/* Logo Preview */}
                  <TableCell className="py-3 px-3">
                    <div className="h-10 w-10 rounded-xl border border-border bg-card flex items-center justify-center overflow-hidden shrink-0 shadow-2xs p-1">
                      {partner.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={partner.logoUrl}
                          src={partner.logoUrl}
                          alt={partner.name}
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Handshake className="h-4 w-4 text-muted-foreground/50" />
                      )}
                    </div>
                  </TableCell>

                  {/* Partner Name */}
                  <TableCell className="py-3 px-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-xs text-foreground">{partner.name}</span>
                      {partner.slug && (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          /{partner.slug}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleTogglePartnerStatus(partner)}
                      title={
                        partner.status === 'PUBLISHED'
                          ? 'Public: Click to switch to Draft'
                          : 'Draft: Click to publish Public'
                      }
                      className="cursor-pointer transition-transform hover:scale-105 active:scale-95 inline-block"
                    >
                      {getStatusBadge(partner.status)}
                    </button>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-3 pr-4 text-right">
                    <div className="flex items-center justify-end space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditTarget(partner)}
                        className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                        title="Edit partner"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(partner)}
                        className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
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

          {filteredPartners.length > 0 && (
            <TablePagination
              currentPage={page}
              totalItems={filteredPartners.length}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              itemLabel="partners"
              className="border-t border-border"
            />
          )}
          </>
        )}
      </Card>

      {/* ── Dialogs ────────────────────────────────────────────────────────── */}
      <PartnerDialog
        key={createOpen ? 'create-partner' : 'create-closed'}
        open={createOpen}
        mode="create"
        saving={saving}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />

      <PartnerDialog
        key={editTarget?.id || 'edit-partner'}
        open={!!editTarget}
        mode="edit"
        initial={
          editTarget
            ? {
                name: editTarget.name,
                logoUrl: editTarget.logoUrl || '',
              }
            : EMPTY_FORM
        }
        saving={saving}
        onClose={handleCloseEdit}
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center space-x-2.5 rounded-2xl border border-border bg-card/95 px-5 py-2.5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="text-xs font-semibold text-foreground pr-2 border-r border-border">
            {selectedIds.size} selected
          </span>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs rounded-xl border-border hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/30 cursor-pointer"
            onClick={() => handleBulkStatus('PUBLISHED')}
          >
            <FileCheck className="h-3.5 w-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
            <span>Publish</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs rounded-xl border-border hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/30 cursor-pointer"
            onClick={() => handleBulkStatus('DRAFT')}
          >
            <FileClock className="h-3.5 w-3.5 mr-1 text-amber-600 dark:text-amber-400" />
            <span>Draft</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs rounded-xl border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            onClick={() => handleBulkStatus('ARCHIVED')}
          >
            <Archive className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
            <span>Archive</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            className="h-8 text-xs rounded-xl shadow-xs cursor-pointer"
            onClick={() => setBulkDeleteConfirm(true)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            <span>Delete</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground hover:text-foreground rounded-xl ml-1 cursor-pointer"
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
    </AdminContentContainer>
  );
}
