'use client';

import * as React from 'react';
import {
  Briefcase,
  FolderTree,
  ExternalLink,
  Upload,
  Link2,
  ImageOff,
  Loader2,
  X,
  MessageSquare,
  Megaphone,
  SlidersHorizontal,
} from 'lucide-react';
import { DataTable, ColumnDef } from '@/components/crud/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/utils';
import { fetchApi, normalizeErrorMessage } from '@/lib/api-client';
import { notify } from '@/lib/notifications';
import { BaseRecord, ItemStatus } from '@/lib/store';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PortfolioProjectRecord extends BaseRecord {
  orderNumber?: string;
  title: string;
  slug: string;
  client?: string;
  category?: string;
  categorySlug?: string;
  categoryId?: string;
  description?: string;
  imageUrl: string;
  altText?: string;
  projectUrl?: string;
  tags?: string[];
  metrics?: string;
  displayOrder?: number;
}

export interface PortfolioCategoryRecord extends BaseRecord {
  name: string;
  slug: string;
  description?: string;
  displayOrder?: number;
  projectCount?: number;
}

interface ProjectFormState {
  orderNumber: string;
  title: string;
  slug: string;
  client: string;
  categoryId: string;
  metrics: string;
  projectUrl: string;
  imageUrl: string;
  description: string;
  tagsString: string;
  status: string;
}

const EMPTY_PROJECT_FORM: ProjectFormState = {
  orderNumber: '',
  title: '',
  slug: '',
  client: '',
  categoryId: '',
  metrics: '',
  projectUrl: '',
  imageUrl: '',
  description: '',
  tagsString: '',
  status: 'PUBLISHED',
};

interface CategoryFormState {
  name: string;
  slug: string;
  displayOrder: string;
  description: string;
  status: string;
}

const EMPTY_CATEGORY_FORM: CategoryFormState = {
  name: '',
  slug: '',
  displayOrder: '1',
  description: '',
  status: 'PUBLISHED',
};

// ─── Project Popup Modal (Client-Style Popup with Direct Image Upload) ────────

interface ProjectDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: PortfolioProjectRecord | null;
  categories: PortfolioCategoryRecord[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (form: Record<string, any>) => void;
}

function ProjectDialog({
  open,
  mode,
  initial,
  categories,
  saving,
  onClose,
  onSubmit,
}: ProjectDialogProps) {
  const [form, setForm] = React.useState<ProjectFormState>(EMPTY_PROJECT_FORM);
  const [imageTab, setImageTab] = React.useState<'upload' | 'url'>('upload');
  const [fileName, setFileName] = React.useState<string>('');
  const [fileSize, setFileSize] = React.useState<string>('');
  const [dragActive, setDragActive] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (initial) {
      setForm({
        orderNumber: initial.orderNumber || '',
        title: initial.title || '',
        slug: initial.slug || '',
        client: initial.client || '',
        categoryId: initial.categoryId || '',
        metrics: initial.metrics || '',
        projectUrl: initial.projectUrl || '',
        imageUrl: initial.imageUrl || '',
        description: initial.description || '',
        tagsString: Array.isArray(initial.tags) ? initial.tags.join(', ') : '',
        status: (initial.status as string) || 'PUBLISHED',
      });
      if (initial.imageUrl?.startsWith('http')) {
        setImageTab('url');
      } else {
        setImageTab('upload');
      }
    } else {
      setForm(EMPTY_PROJECT_FORM);
      setImageTab('upload');
    }
    setFileName('');
    setFileSize('');
    setImageError(false);
  }, [initial, open]);

  const patch = (key: keyof ProjectFormState, value: string) => {
    setForm((f) => {
      const updated = { ...f, [key]: value };
      // Auto-generate slug and projectUrl if title is updated in create mode
      if (key === 'title' && mode === 'create' && !f.slug) {
        const slugified = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        updated.slug = slugified;
        if (!f.projectUrl && slugified) {
          updated.projectUrl = `https://${slugified}.com`;
        }
      }
      return updated;
    });
    if (key === 'imageUrl') setImageError(false);
  };

  const handleFileSelect = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify.error('Please select an image file (PNG, JPG, WebP, SVG).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      notify.error('File size exceeds 5MB. Please choose a smaller image.');
      return;
    }

    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1) + ' KB');

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        patch('imageUrl', result);
        notify.success(`Image uploaded: ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const clearImage = () => {
    patch('imageUrl', '');
    setFileName('');
    setFileSize('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      notify.error('Project title is required.');
      return;
    }
    if (!form.imageUrl.trim()) {
      notify.error('Cover image is required. Please upload an image or provide a URL.');
      return;
    }

    const tags = form.tagsString
      ? form.tagsString
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    onSubmit({
      orderNumber: form.orderNumber || undefined,
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      client: form.client.trim() || undefined,
      categoryId: form.categoryId || null,
      metrics: form.metrics.trim() || undefined,
      projectUrl: form.projectUrl.trim() || undefined,
      imageUrl: form.imageUrl.trim(),
      description: form.description.trim() || undefined,
      tags,
      status: form.status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] rounded-2xl border-slate-200 bg-white shadow-2xl p-0 flex flex-col overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-[#d9127b]/10 text-[#d9127b] flex items-center justify-center shrink-0">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                {mode === 'create' ? 'Add Portfolio Showcase Project' : 'Edit Showcase Project'}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                {mode === 'create'
                  ? 'Configure the production case study for the interactive portfolio showcase.'
                  : 'Update project classification, media asset, metrics, and details.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Section 1: Title & Order */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-1 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Order # <span className="text-slate-400 font-normal">(e.g. 01)</span>
              </label>
              <Input
                value={form.orderNumber}
                onChange={(e) => patch('orderNumber', e.target.value)}
                placeholder="01"
                className="font-mono text-sm"
              />
            </div>

            <div className="sm:col-span-3 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Project Title <span className="text-rose-500">*</span>
              </label>
              <Input
                value={form.title}
                onChange={(e) => patch('title', e.target.value)}
                placeholder="Apex Capital Derivatives Exchange"
                required
                className="text-sm font-medium"
              />
            </div>
          </div>

          {/* Section 2: Slug & Client */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Project Slug <span className="text-slate-400 font-normal">(URL Key)</span>
              </label>
              <Input
                value={form.slug}
                onChange={(e) => patch('slug', e.target.value)}
                placeholder="apex-capital-derivatives"
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Client Organization
              </label>
              <Input
                value={form.client}
                onChange={(e) => patch('client', e.target.value)}
                placeholder="Apex Capital Management"
                className="text-sm"
              />
            </div>
          </div>

          {/* Section 3: Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Category</label>
              <select
                value={form.categoryId}
                onChange={(e) => patch('categoryId', e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Publishing Status</label>
              <select
                value={form.status}
                onChange={(e) => patch('status', e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          {/* Section 4: Direct Image Upload / URL Tabbed Media Asset */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <span>Cover Image</span>
                <span className="text-rose-500">*</span>
                <span className="text-slate-400 font-normal text-[11px]">(PNG, JPG, WebP, SVG)</span>
              </label>

              {/* Tab Switcher: Direct Upload vs URL */}
              <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setImageTab('upload')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                    imageTab === 'upload'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Upload className="h-3 w-3" />
                  Direct Upload
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab('url')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                    imageTab === 'url'
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
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
              }}
            />

            {/* Direct Upload Tab */}
            {imageTab === 'upload' ? (
              form.imageUrl ? (
                /* Uploaded preview card */
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/70">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-14 w-20 rounded-lg bg-neutral-900 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={form.imageUrl}
                        alt="Project Cover Preview"
                        className="h-full w-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {fileName || 'Project Cover Image'}
                      </p>
                      <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                        Image ready {fileSize ? `(${fileSize})` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs h-8"
                    >
                      Change
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearImage}
                      className="text-xs h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                /* Drag and drop target */
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                    dragActive
                      ? 'border-[#d9127b] bg-[#d9127b]/5'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="h-9 w-9 rounded-full bg-[#d9127b]/10 text-[#d9127b] flex items-center justify-center mx-auto mb-2">
                    <Upload className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">
                    Click to upload or drag & drop cover image
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    PNG, JPG, WebP up to 5MB (1200×800 recommended)
                  </p>
                </div>
              )
            ) : (
              /* URL Mode */
              <div className="space-y-2">
                <Input
                  value={form.imageUrl}
                  onChange={(e) => patch('imageUrl', e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="text-xs font-mono"
                />
                {form.imageUrl && (
                  <div className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 bg-slate-50/70">
                    <div className="h-12 w-16 rounded bg-neutral-900 overflow-hidden shrink-0 flex items-center justify-center">
                      {!imageError ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={form.imageUrl}
                          alt="URL Preview"
                          className="h-full w-full object-cover"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <ImageOff className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-700 truncate">
                        {imageError ? 'Invalid image URL or failed to load' : 'Image loaded successfully'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 5: Key Metrics & Project URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Key Metric / Impact Result
              </label>
              <Input
                value={form.metrics}
                onChange={(e) => patch('metrics', e.target.value)}
                placeholder="$40B+ Daily Volume · 99.999% SLA"
                className="text-xs font-mono text-emerald-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Client Store / Website URL <span className="text-slate-400 font-normal">(Redirect Link)</span>
              </label>
              <Input
                value={form.projectUrl}
                onChange={(e) => patch('projectUrl', e.target.value)}
                placeholder="https://clientstore.com"
                className="text-xs font-mono"
              />
            </div>
          </div>

          {/* Section 6: Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Technology Tags <span className="text-slate-400 font-normal">(comma-separated)</span>
            </label>
            <Input
              value={form.tagsString}
              onChange={(e) => patch('tagsString', e.target.value)}
              placeholder="Next.js, TypeScript, pgvector, Kubernetes"
              className="text-xs"
            />
          </div>

          {/* Section 7: Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Project Summary</label>
            <Textarea
              value={form.description}
              onChange={(e) => patch('description', e.target.value)}
              placeholder="Ultra-low-latency distributed clearing architectures, ledger networks, and transaction engines..."
              rows={3}
              className="text-xs leading-relaxed"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="text-xs bg-[#d9127b] hover:bg-[#c00e6b] text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : mode === 'create' ? (
                'Create Project'
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Category Popup Modal ────────────────────────────────────────────────────

interface CategoryDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: PortfolioCategoryRecord | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (form: Record<string, any>) => void;
}

function CategoryDialog({
  open,
  mode,
  initial,
  saving,
  onClose,
  onSubmit,
}: CategoryDialogProps) {
  const [form, setForm] = React.useState<CategoryFormState>(EMPTY_CATEGORY_FORM);

  React.useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '',
        slug: initial.slug || '',
        displayOrder: String(initial.displayOrder ?? 1),
        description: initial.description || '',
        status: (initial.status as string) || 'PUBLISHED',
      });
    } else {
      setForm(EMPTY_CATEGORY_FORM);
    }
  }, [initial, open]);

  const patch = (key: keyof CategoryFormState, value: string) => {
    setForm((f) => {
      const updated = { ...f, [key]: value };
      if (key === 'name' && mode === 'create' && !f.slug) {
        updated.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
      }
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      notify.error('Category name is required.');
      return;
    }

    onSubmit({
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      displayOrder: form.displayOrder ? Number(form.displayOrder) : undefined,
      description: form.description.trim() || undefined,
      status: form.status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[95vw] max-w-lg rounded-2xl border-slate-200 bg-white shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-[#d9127b]/10 text-[#d9127b] flex items-center justify-center shrink-0">
              <FolderTree className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                {mode === 'create' ? 'Add Portfolio Category' : 'Edit Category'}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                {mode === 'create'
                  ? 'Define a domain category for filtering showcase works on /portfolio.'
                  : 'Update category name, URL slug, ordering, or description.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Category Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={form.name}
                onChange={(e) => patch('name', e.target.value)}
                placeholder="Financial Infrastructure"
                required
                className="text-sm font-medium"
              />
            </div>

            <div className="sm:col-span-1 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Display Order</label>
              <Input
                type="number"
                value={form.displayOrder}
                onChange={(e) => patch('displayOrder', e.target.value)}
                placeholder="1"
                className="font-mono text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">URL Slug</label>
              <Input
                value={form.slug}
                onChange={(e) => patch('slug', e.target.value)}
                placeholder="financial-infrastructure"
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Status</label>
              <select
                value={form.status}
                onChange={(e) => patch('status', e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="PUBLISHED">Active / Published</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Description</label>
            <Textarea
              value={form.description}
              onChange={(e) => patch('description', e.target.value)}
              placeholder="Ultra-low-latency distributed clearing architectures, ledger networks..."
              rows={3}
              className="text-xs leading-relaxed"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="text-xs bg-[#d9127b] hover:bg-[#c00e6b] text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : mode === 'create' ? (
                'Create Category'
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Admin Page Component ───────────────────────────────────────────────

export default function PortfolioAdminPage() {
  const [activeTab, setActiveTab] = React.useState<'projects' | 'categories' | 'settings'>('projects');

  // Data states
  const [projects, setProjects] = React.useState<PortfolioProjectRecord[]>([]);
  const [categories, setCategories] = React.useState<PortfolioCategoryRecord[]>([]);
  const [portfolioSection, setPortfolioSection] = React.useState<{ id: string; contentPayload: Record<string, any> } | null>(null);
  const [settingsSaving, setSettingsSaving] = React.useState(false);

  // Dialog states
  const [projectDialogOpen, setProjectDialogOpen] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<PortfolioProjectRecord | null>(null);
  const [projectSaving, setProjectSaving] = React.useState(false);

  const [categoryDialogOpen, setCategoryDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<PortfolioCategoryRecord | null>(null);
  const [categorySaving, setCategorySaving] = React.useState(false);

  // Fetch data
  const loadData = React.useCallback(async () => {
    try {
      const [projData, catData, pageRes] = await Promise.all([
        fetchApi<PortfolioProjectRecord[]>('/portfolio/admin/projects'),
        fetchApi<PortfolioCategoryRecord[]>('/portfolio/admin/categories'),
        fetchApi<any>('/pages/our-work').catch(() => null),
      ]);
      setProjects(Array.isArray(projData) ? projData : []);
      setCategories(Array.isArray(catData) ? catData : []);

      const pageData = pageRes?.data || pageRes;
      if (pageData?.sections) {
        const sec = pageData.sections.find(
          (s: any) =>
            s.sectionIdentifier === 'our-work-portfolio' ||
            s.sectionIdentifier === 'portfolio-showcase' ||
            s.componentType === 'PORTFOLIO' ||
            s.componentType === 'FEATURE_GRID',
        );
        if (sec) {
          setPortfolioSection({ id: sec.id, contentPayload: sec.contentPayload || {} });
        }
      }
    } catch (err) {
      notify.error(normalizeErrorMessage(err, 'Unable to load portfolio data.'));
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Update setting toggle
  const handleUpdateSettingToggle = async (key: string, value: boolean) => {
    if (!portfolioSection) return;
    const nextPayload = {
      ...portfolioSection.contentPayload,
      [key]: value,
    };
    setPortfolioSection({ ...portfolioSection, contentPayload: nextPayload });
    setSettingsSaving(true);
    try {
      await fetchApi(`/sections/${portfolioSection.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          contentPayload: nextPayload,
        }),
      });
      notify.success('Portfolio page settings saved.');
    } catch {
      notify.error('Failed to save portfolio page settings.');
    } finally {
      setSettingsSaving(false);
    }
  };

  // ─── Project Operations ──────────────────────────────────────────────────────

  const handleCreateProject = async (form: Record<string, any>) => {
    setProjectSaving(true);
    try {
      await fetchApi('/portfolio', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      notify.success('Portfolio project created successfully.');
      setProjectDialogOpen(false);
      loadData();
    } catch (err) {
      notify.error(normalizeErrorMessage(err, 'Unable to create portfolio project.'));
    } finally {
      setProjectSaving(false);
    }
  };

  const handleUpdateProject = async (id: string, form: Record<string, any>) => {
    setProjectSaving(true);
    try {
      await fetchApi(`/portfolio/${id}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      notify.success('Portfolio project updated successfully.');
      setProjectDialogOpen(false);
      loadData();
    } catch (err) {
      notify.error(normalizeErrorMessage(err, 'Unable to update portfolio project.'));
    } finally {
      setProjectSaving(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await fetchApi(`/portfolio/${id}`, {
        method: 'DELETE',
      });
      notify.success('Portfolio project deleted successfully.');
      loadData();
    } catch (err) {
      notify.error(normalizeErrorMessage(err, 'Unable to delete portfolio project.'));
    }
  };

  const handleBulkDeleteProjects = async (ids: string[]) => {
    try {
      await Promise.all(ids.map((id) => fetchApi(`/portfolio/${id}`, { method: 'DELETE' })));
      notify.success(`${ids.length} projects deleted successfully.`);
      loadData();
    } catch (err) {
      notify.error(normalizeErrorMessage(err, 'Unable to delete selected projects.'));
    }
  };

  const handleBulkStatusChangeProjects = async (ids: string[], status: ItemStatus) => {
    try {
      await Promise.all(
        ids.map((id) =>
          fetchApi(`/portfolio/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
          })
        )
      );
      notify.success(`${ids.length} projects status updated.`);
      loadData();
    } catch (err) {
      notify.error(normalizeErrorMessage(err, 'Unable to update status for selected projects.'));
    }
  };

  // ─── Category Operations ─────────────────────────────────────────────────────

  const handleCreateCategory = async (form: Record<string, any>) => {
    setCategorySaving(true);
    try {
      await fetchApi('/portfolio/categories', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      notify.success('Category created successfully.');
      setCategoryDialogOpen(false);
      loadData();
    } catch (err) {
      notify.error(normalizeErrorMessage(err, 'Unable to create category.'));
    } finally {
      setCategorySaving(false);
    }
  };

  const handleUpdateCategory = async (id: string, form: Record<string, any>) => {
    setCategorySaving(true);
    try {
      await fetchApi(`/portfolio/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      notify.success('Category updated successfully.');
      setCategoryDialogOpen(false);
      loadData();
    } catch (err) {
      notify.error(normalizeErrorMessage(err, 'Unable to update category.'));
    } finally {
      setCategorySaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await fetchApi(`/portfolio/categories/${id}`, {
        method: 'DELETE',
      });
      notify.success('Category deleted successfully.');
      loadData();
    } catch (err) {
      notify.error(normalizeErrorMessage(err, 'Unable to delete category.'));
    }
  };

  const handleBulkDeleteCategories = async (ids: string[]) => {
    try {
      await Promise.all(ids.map((id) => fetchApi(`/portfolio/categories/${id}`, { method: 'DELETE' })));
      notify.success(`${ids.length} categories deleted successfully.`);
      loadData();
    } catch (err) {
      notify.error(normalizeErrorMessage(err, 'Unable to delete selected categories.'));
    }
  };

  const handleBulkStatusChangeCategories = async (ids: string[], status: ItemStatus) => {
    try {
      await Promise.all(
        ids.map((id) =>
          fetchApi(`/portfolio/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
          })
        )
      );
      notify.success(`${ids.length} categories status updated.`);
      loadData();
    } catch (err) {
      notify.error(normalizeErrorMessage(err, 'Unable to update status for selected categories.'));
    }
  };

  // ─── Table Columns ───────────────────────────────────────────────────────────

  const projectColumns: ColumnDef<PortfolioProjectRecord>[] = [
    {
      key: 'orderNumber',
      header: '# Order',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-xs font-bold text-[#d9127b] bg-[#d9127b]/10 px-2 py-0.5 rounded">
          {item.orderNumber || '--'}
        </span>
      ),
    },
    {
      key: 'title',
      header: 'Project Title',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.imageUrl && (
            <div className="h-10 w-14 rounded bg-neutral-900 overflow-hidden shrink-0 border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div>
            <span className="font-semibold text-slate-900">{item.title}</span>
            {item.projectUrl && (
              <a
                href={item.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[11px] text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 w-fit mt-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="truncate max-w-[240px]">{item.projectUrl}</span>
                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
              </a>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'client',
      header: 'Client',
      sortable: true,
      render: (item) => <span className="font-medium text-slate-800 text-xs">{item.client || '—'}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      render: (item) => (
        <Badge variant="outline" className="text-[11px] font-medium">
          {item.category || 'Uncategorized'}
        </Badge>
      ),
    },
    {
      key: 'metrics',
      header: 'Impact Metric',
      render: (item) => (
        <span className="font-mono text-xs text-emerald-600 font-semibold">
          {item.metrics || '—'}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-[11px] text-muted-foreground">
          {formatDate(item.updatedAt)}
        </span>
      ),
    },
  ];

  const categoryColumns: ColumnDef<PortfolioCategoryRecord>[] = [
    {
      key: 'displayOrder',
      header: '# Order',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-xs font-bold text-[#d9127b] bg-[#d9127b]/10 px-2 py-0.5 rounded">
          {String(item.displayOrder ?? 0).padStart(2, '0')}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Category Name',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-semibold text-slate-900">{item.name}</span>
          <div className="font-mono text-[11px] text-slate-400">/{item.slug}</div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (item) => (
        <span className="text-xs text-slate-600 line-clamp-1 max-w-sm">
          {item.description || '—'}
        </span>
      ),
    },
    {
      key: 'projectCount',
      header: 'Projects',
      sortable: true,
      render: (item) => (
        <Badge variant="secondary" className="font-mono text-[11px]">
          {item.projectCount ?? 0} {item.projectCount === 1 ? 'project' : 'projects'}
        </Badge>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-[11px] text-muted-foreground">
          {formatDate(item.updatedAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('projects')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === 'projects'
              ? 'bg-[#d9127b] text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Projects</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-mono ${
              activeTab === 'projects' ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
            }`}
          >
            {projects.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === 'categories'
              ? 'bg-[#d9127b] text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Categories</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-mono ${
              activeTab === 'categories' ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
            }`}
          >
            {categories.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === 'settings'
              ? 'bg-[#d9127b] text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Page Settings</span>
        </button>
      </div>

      {/* ── Tab 1: Projects Table ──────────────────────────────────────────────── */}
      {activeTab === 'projects' && (
        <>
          <DataTable<PortfolioProjectRecord>
            title="Portfolio / Showcase Projects"
            description="Manage the enterprise production case studies and showcase projects displayed on the /portfolio page."
            data={projects}
            columns={projectColumns}
            searchKeys={['title', 'client', 'category', 'metrics']}
            requiredPermission="content:write"
            addButtonLabel="New Showcase Project"
            onAdd={() => {
              setEditingProject(null);
              setProjectDialogOpen(true);
            }}
            onEdit={(item) => {
              setEditingProject(item);
              setProjectDialogOpen(true);
            }}
            onDelete={(id) => handleDeleteProject(id)}
            onBulkDelete={handleBulkDeleteProjects}
            onBulkStatusChange={handleBulkStatusChangeProjects}
          />

          <ProjectDialog
            open={projectDialogOpen}
            mode={editingProject ? 'edit' : 'create'}
            initial={editingProject}
            categories={categories}
            saving={projectSaving}
            onClose={() => setProjectDialogOpen(false)}
            onSubmit={(form) => {
              if (editingProject) {
                handleUpdateProject(editingProject.id, form);
              } else {
                handleCreateProject(form);
              }
            }}
          />
        </>
      )}

      {/* ── Tab 2: Categories Table ────────────────────────────────────────────── */}
      {activeTab === 'categories' && (
        <>
          <DataTable<PortfolioCategoryRecord>
            title="Portfolio Categories"
            description="Manage domain categories for organizing portfolio projects. Categories appear in display order in the filter on /portfolio."
            data={categories}
            columns={categoryColumns}
            searchKeys={['name', 'slug', 'description']}
            requiredPermission="content:write"
            addButtonLabel="New Category"
            onAdd={() => {
              setEditingCategory(null);
              setCategoryDialogOpen(true);
            }}
            onEdit={(item) => {
              setEditingCategory(item);
              setCategoryDialogOpen(true);
            }}
            onDelete={(id) => handleDeleteCategory(id)}
            onBulkDelete={handleBulkDeleteCategories}
            onBulkStatusChange={handleBulkStatusChangeCategories}
          />

          <CategoryDialog
            open={categoryDialogOpen}
            mode={editingCategory ? 'edit' : 'create'}
            initial={editingCategory}
            saving={categorySaving}
            onClose={() => setCategoryDialogOpen(false)}
            onSubmit={(form) => {
              if (editingCategory) {
                handleUpdateCategory(editingCategory.id, form);
              } else {
                handleCreateCategory(form);
              }
            }}
          />
        </>
      )}

      {/* ── Tab 3: Page Settings (Homepage Integrations) ────────────────────────── */}
      {activeTab === 'settings' && (
        <Card className="border-border">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">Portfolio Page Settings & Integrations</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Enable or disable shared global sections brought directly from the Home page.
                  </CardDescription>
                </div>
              </div>
              {settingsSaving && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-pink-600" />
                  Saving...
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                    <label htmlFor="toggle-contact" className="font-semibold text-sm cursor-pointer">
                      DIRECT ENGAGEMENT Section (Contact / Inquiry)
                    </label>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                      Home Page Component
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Renders the interactive consultation form, contact details, and direct engagement channels immediately below the portfolio showcase grid. All content, copy, and form settings are inherited directly from the Home Page.
                  </p>
                </div>
                <Switch
                  id="toggle-contact"
                  checked={portfolioSection?.contentPayload?.showContactSection !== false}
                  onCheckedChange={(checked) => handleUpdateSettingToggle('showContactSection', checked)}
                  disabled={!portfolioSection || settingsSaving}
                />
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-pink-500 shrink-0" />
                    <label htmlFor="toggle-cta" className="font-semibold text-sm cursor-pointer">
                      CTA Banner Section
                    </label>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-pink-500/10 text-pink-600 dark:text-pink-400 font-bold">
                      Home Page Component
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Renders the high-impact conversion call-to-action banner right before the footer. Copy, buttons, and design styling are synchronized automatically from the Home Page CTA section.
                  </p>
                </div>
                <Switch
                  id="toggle-cta"
                  checked={portfolioSection?.contentPayload?.showCtaSection !== false}
                  onCheckedChange={(checked) => handleUpdateSettingToggle('showCtaSection', checked)}
                  disabled={!portfolioSection || settingsSaving}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/40 text-xs text-muted-foreground">
              <span>To customize the copy, input fields, or button texts, edit the sections in the Pages Studio:</span>
              <a
                href="/pages"
                className="inline-flex items-center gap-1.5 text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 font-medium transition-colors"
              >
                Go to Pages Studio <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
