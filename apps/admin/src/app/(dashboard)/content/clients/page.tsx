'use client';

import * as React from 'react';
import { Plus, X, Building2, ImageOff, Loader2, Globe, Upload, Link2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { DataTable, ColumnDef } from '@/components/crud/data-table';
import { BaseRecord, ItemStatus } from '@/lib/store';
import { formatDate } from '@/lib/utils';
import { notify } from '@/lib/notifications';
import { fetchApi } from '@/lib/api-client';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface ClientRecord extends BaseRecord {
  name: string;
  logoUrl?: string;
  websiteUrl?: string;
  isActive: boolean;
}

interface ClientFormState {
  name: string;
  logoUrl: string;
  websiteUrl: string;
}

const EMPTY_FORM: ClientFormState = { name: '', logoUrl: '', websiteUrl: '' };

// ─── Create / Edit Dialog ─────────────────────────────────────────────────────
interface ClientDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: ClientFormState;
  saving: boolean;
  onClose: () => void;
  onSubmit: (form: ClientFormState) => void;
}

function ClientDialog({ open, mode, initial = EMPTY_FORM, saving, onClose, onSubmit }: ClientDialogProps) {
  const [form, setForm] = React.useState<ClientFormState>(initial);
  const [logoError, setLogoError] = React.useState(false);
  const [tab, setTab] = React.useState<'upload' | 'url'>('upload');
  const [fileName, setFileName] = React.useState<string>('');
  const [fileSize, setFileSize] = React.useState<string>('');
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setForm(initial);
    setLogoError(false);
    setFileName('');
    setFileSize('');
    if (initial.logoUrl?.startsWith('http')) {
      setTab('url');
    } else {
      setTab('upload');
    }
  }, [initial, open]);

  function patch(key: keyof ClientFormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === 'logoUrl') setLogoError(false);
  }

  function handleFileSelect(file: File) {
    if (!file) return;
    if (!file.type.startsWith('image/') && !file.name.endsWith('.svg')) {
      notify.error('Please select a valid image file (SVG, PNG, WebP, JPG).');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      notify.error('Image size exceeds 3MB. Please choose a smaller logo.');
      return;
    }

    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1) + ' KB');

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        patch('logoUrl', dataUrl);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }

  function clearLogo() {
    patch('logoUrl', '');
    setFileName('');
    setFileSize('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      notify.error('Client name is required.');
      return;
    }
    onSubmit(form);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[95vw] max-w-md rounded-2xl border-slate-200/90 bg-white shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-slate-900">
                {mode === 'create' ? 'Add New Client' : 'Edit Client'}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                {mode === 'create'
                  ? 'Fill in the client details. The logo will appear in the marquee strip on the website.'
                  : 'Update the client name, logo, or website URL.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Logo Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Client Logo <span className="text-slate-400 font-normal">(SVG, PNG, WebP)</span>
              </label>
              {/* Tab Switcher: Direct Upload vs URL */}
              <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setTab('upload')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                    tab === 'upload'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Upload className="h-3 w-3" />
                  Direct Upload
                </button>
                <button
                  type="button"
                  onClick={() => setTab('url')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                    tab === 'url'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Link2 className="h-3 w-3" />
                  Image URL
                </button>
              </div>
            </div>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/svg+xml,image/png,image/webp,image/jpeg,image/gif"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
              }}
            />

            {/* Direct Upload Mode */}
            {tab === 'upload' ? (
              form.logoUrl ? (
                /* Logo uploaded preview card */
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/70">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-12 w-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-1.5 overflow-hidden shrink-0 shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={form.logoUrl}
                        alt="Logo preview"
                        className="h-full w-full object-contain"
                        onError={() => setLogoError(true)}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {fileName || 'Client Logo Selected'}
                      </p>
                      <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                        Ready to save {fileSize ? `(${fileSize})` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-7 px-2.5 text-[11px] font-medium rounded-lg border-slate-200 text-slate-600 hover:bg-white"
                    >
                      Replace
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearLogo}
                      className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                /* Drag and drop upload zone */
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50/50'
                      : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/60 bg-white'
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                    <Upload className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">
                    Click to browse <span className="font-normal text-slate-500">or drag & drop logo</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Supports SVG, PNG, WebP or JPEG (max 3MB)
                  </p>
                </div>
              )
            ) : (
              /* URL Input Mode */
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                    {form.logoUrl && !logoError ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={form.logoUrl}
                        alt="Logo preview"
                        className="h-full w-full object-contain p-1"
                        onError={() => setLogoError(true)}
                      />
                    ) : (
                      <ImageOff className="h-5 w-5 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      value={form.logoUrl}
                      onChange={(e) => patch('logoUrl', e.target.value)}
                      placeholder="https://cdn.example.com/logo.svg"
                      className="text-xs font-mono rounded-xl h-10"
                    />
                  </div>
                </div>
                {logoError && (
                  <p className="text-[10px] text-rose-500">
                    Could not load image from this URL. Please verify the URL is public and accessible.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Client Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Client Name <span className="text-rose-500">*</span>
            </label>
            <Input
              value={form.name}
              onChange={(e) => patch('name', e.target.value)}
              placeholder="e.g. Apex Cloud Technologies"
              className="text-xs rounded-xl"
              autoFocus
            />
          </div>

          {/* Website URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
              <Globe className="h-3 w-3" />
              <span>
                Website URL <span className="text-slate-400 font-normal">(optional)</span>
              </span>
            </label>
            <Input
              value={form.websiteUrl}
              onChange={(e) => patch('websiteUrl', e.target.value)}
              placeholder="https://apexcloud.com"
              className="text-xs font-mono rounded-xl"
            />
          </div>

          {/* Footer Actions */}
          <DialogFooter className="pt-2 gap-2 flex-row justify-end">
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
                  {mode === 'create' ? 'Create Client' : 'Update Client'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Clients Page ────────────────────────────────────────────────────────
export default function ClientsPage() {
  const [mounted, setMounted] = React.useState(false);
  const [clients, setClients] = React.useState<ClientRecord[]>([]);
  const [saving, setSaving] = React.useState(false);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<ClientRecord | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const loadClients = React.useCallback(async () => {
    try {
      const data = await fetchApi<ClientRecord[]>('/clients');
      setClients(
        Array.isArray(data)
          ? data.map((c) => ({
              ...c,
              status: (c.status || (c.isActive ? 'PUBLISHED' : 'DRAFT')) as ItemStatus,
            }))
          : []
      );
    } catch {
      setClients([]);
    }
  }, []);

  React.useEffect(() => {
    setMounted(true);
    loadClients();
  }, [loadClients]);

  // ── Create ─────────────────────────────────────────────────────────────────
  async function handleCreate(form: ClientFormState) {
    setSaving(true);
    try {
      const created = await fetchApi<ClientRecord>('/clients', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          logoUrl: form.logoUrl.trim() || null,
          websiteUrl: form.websiteUrl.trim() || null,
          isActive: true,
        }),
      });
      setClients((prev) => [
        { ...created, status: (created.status || 'PUBLISHED') as ItemStatus },
        ...prev,
      ]);
      setCreateOpen(false);
      notify.success(`Client "${created.name}" created successfully.`);
    } catch {
      notify.error('Could not create client. Please check your input and try again.');
    } finally {
      setSaving(false);
    }
  }

  // ── Update ─────────────────────────────────────────────────────────────────
  async function handleUpdate(form: ClientFormState) {
    if (!editTarget) return;
    setSaving(true);
    try {
      const updated = await fetchApi<ClientRecord>(`/clients/${editTarget.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: form.name.trim(),
          logoUrl: form.logoUrl.trim() || null,
          websiteUrl: form.websiteUrl.trim() || null,
        }),
      });
      setClients((prev) =>
        prev.map((c) =>
          c.id === updated.id
            ? { ...updated, status: (updated.status || (updated.isActive ? 'PUBLISHED' : 'DRAFT')) as ItemStatus }
            : c
        )
      );
      setEditTarget(null);
      notify.success(`Client "${updated.name}" updated.`);
    } catch {
      notify.error('Could not update client. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    try {
      await fetchApi(`/clients/${id}`, { method: 'DELETE' });
      setClients((prev) => prev.filter((c) => c.id !== id));
      notify.success('Client deleted successfully.');
    } catch {
      notify.error('Could not delete client. Please try again.');
    }
  }

  // ── Bulk Delete ─────────────────────────────────────────────────────────────
  async function handleBulkDelete(ids: string[]) {
    try {
      await Promise.all(ids.map((id) => fetchApi(`/clients/${id}`, { method: 'DELETE' })));
      setClients((prev) => prev.filter((c) => !ids.includes(c.id)));
      notify.success(`${ids.length} clients deleted successfully.`);
    } catch {
      notify.error('Unable to delete selected clients.');
    }
  }

  // ── Bulk Status Change ──────────────────────────────────────────────────────
  async function handleBulkStatus(ids: string[], status: ItemStatus) {
    try {
      const isActive = status === 'PUBLISHED';
      await Promise.all(
        ids.map((id) =>
          fetchApi(`/clients/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ isActive }),
          })
        )
      );
      setClients((prev) =>
        prev.map((c) => (ids.includes(c.id) ? { ...c, status, isActive } : c))
      );
      const label = status === 'PUBLISHED' ? 'published' : status === 'DRAFT' ? 'moved to draft' : 'archived';
      notify.success(`${ids.length} clients ${label} successfully.`);
    } catch {
      notify.error('Unable to update status for selected clients.');
    }
  }

  const columns: ColumnDef<ClientRecord>[] = [
    {
      key: 'logo',
      header: 'Logo',
      render: (item) => (
        <div className="h-9 w-9 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
          {item.logoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={item.logoUrl}
              alt={item.name}
              className="h-full w-full object-contain p-1"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <Building2 className="h-4 w-4 text-slate-300" />
          )}
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Client Name',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-semibold text-slate-900 text-xs">{item.name}</span>
          {item.websiteUrl && (
            <a
              href={item.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="truncate max-w-[220px]">{item.websiteUrl}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>
      ),
    },
    {
      key: 'websiteUrl',
      header: 'Website',
      render: (item) =>
        item.websiteUrl ? (
          <a
            href={item.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <Globe className="h-3.5 w-3.5 text-slate-400" />
            <span className="truncate max-w-[180px]">{item.websiteUrl.replace(/^https?:\/\//, '')}</span>
          </a>
        ) : (
          <span className="text-slate-300 font-mono text-xs">—</span>
        ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-[11px] text-slate-500">
          {item.createdAt ? formatDate(item.createdAt) : '—'}
        </span>
      ),
    },
  ];

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto py-6 space-y-4">
        <div className="h-8 w-48 bg-slate-200/60 rounded-xl animate-pulse" />
        <div className="h-32 bg-white rounded-2xl border border-slate-200/80 animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <DataTable<ClientRecord>
        title="Clients"
        description="Manage client logos and names used in marquee strips and across the website."
        data={clients}
        columns={columns}
        searchKeys={['name', 'websiteUrl']}
        requiredPermission="content:write"
        addButtonLabel="Add Client"
        entityName="client"
        emptyStateTitle="No clients yet."
        emptyStateDescription="Add your first client to start populating the marquee strip."
        onAdd={() => {
          setEditTarget(null);
          setCreateOpen(true);
        }}
        onEdit={(item) => {
          setEditTarget(item);
          setCreateOpen(true);
        }}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        onBulkStatusChange={handleBulkStatus}
      />

      {/* ── Dialogs ────────────────────────────────────────────────────────── */}
      <ClientDialog
        open={createOpen && !editTarget}
        mode="create"
        saving={saving}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />

      <ClientDialog
        open={!!editTarget}
        mode="edit"
        initial={
          editTarget
            ? {
                name: editTarget.name,
                logoUrl: editTarget.logoUrl || '',
                websiteUrl: editTarget.websiteUrl || '',
              }
            : EMPTY_FORM
        }
        saving={saving}
        onClose={() => setEditTarget(null)}
        onSubmit={handleUpdate}
      />
    </>
  );
}
