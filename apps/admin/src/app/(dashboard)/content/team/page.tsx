'use client';

import * as React from 'react';
import {
  Users,
  Upload,
  Link2,
  ImageOff,
  Loader2,
  X,
  UserCircle2,
} from 'lucide-react';
import { DataTable, ColumnDef } from '@/components/crud/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { BaseRecord, ItemStatus } from '@/lib/store';
import { formatDate } from '@/lib/utils';
import { notify } from '@/lib/notifications';
import { fetchApi, normalizeErrorMessage } from '@/lib/api-client';
import { Linkedin, Twitter, Github } from 'lucide-react';
import { StatusToggleField } from '@/components/crud/status-toggle-field';

interface TeamRecord extends BaseRecord {
  avatar?: string;
  name: string;
  role: string;
  department: string;
  bio: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
  isLeadership: boolean;
}

interface TeamFormState {
  avatar: string;
  name: string;
  role: string;
  department: string;
  bio: string;
  linkedinUrl: string;
  twitterUrl: string;
  githubUrl: string;
  isLeadership: boolean;
  status: ItemStatus;
}

const EMPTY_FORM: TeamFormState = {
  avatar: '',
  name: '',
  role: '',
  department: '',
  bio: '',
  linkedinUrl: '',
  twitterUrl: '',
  githubUrl: '',
  isLeadership: false,
  status: 'PUBLISHED',
};

function getInitialForm(
  initial?: (TeamRecord & { firstName?: string; lastName?: string; roleTitle?: string }) | null
): TeamFormState {
  if (!initial) return EMPTY_FORM;
  const fullName = initial.name || [initial.firstName, initial.lastName].filter(Boolean).join(' ');
  return {
    avatar: initial.avatar || '',
    name: fullName || '',
    role: initial.role || initial.roleTitle || '',
    department: initial.department || (initial as any).department?.name || '',
    bio: initial.bio || '',
    linkedinUrl: initial.linkedinUrl || (initial as any).socialLinks?.linkedin || '',
    twitterUrl: initial.twitterUrl || (initial as any).socialLinks?.twitter || '',
    githubUrl: initial.githubUrl || (initial as any).socialLinks?.github || '',
    isLeadership: initial.isLeadership ?? false,
    status: (initial.status || (initial.isActive !== false ? 'PUBLISHED' : 'DRAFT')) as ItemStatus,
  };
}

// ─── Team Member Dialog ───────────────────────────────────────────────────────

interface TeamDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: TeamRecord | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (form: TeamFormState) => void;
}

function TeamDialog({ open, mode, initial, saving, onClose, onSubmit }: TeamDialogProps) {
  const [form, setForm] = React.useState<TeamFormState>(() => getInitialForm(initial));
  const [avatarTab, setAvatarTab] = React.useState<'upload' | 'url'>(() => {
    return initial?.avatar?.startsWith('http') ? 'url' : 'upload';
  });
  const [fileName, setFileName] = React.useState('');
  const [fileSize, setFileSize] = React.useState('');
  const [dragActive, setDragActive] = React.useState(false);
  const [avatarError, setAvatarError] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      if (initial) {
        setForm(getInitialForm(initial));
        if (initial.avatar?.startsWith('http')) {
          setAvatarTab('url');
        } else {
          setAvatarTab('upload');
        }
      } else {
        setForm(EMPTY_FORM);
        setAvatarTab('upload');
      }
      setFileName('');
      setFileSize('');
      setAvatarError(false);
    }
  }, [open, initial]);

  const patch = <K extends keyof TeamFormState>(key: K, value: TeamFormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === 'avatar') setAvatarError(false);
  };

  const handleFileSelect = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify.error('Please select an image file (PNG, JPG, WebP, SVG).');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      notify.error('File size exceeds 3MB. Please choose a smaller image.');
      return;
    }
    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1) + ' KB');
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) patch('avatar', result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  };

  const clearAvatar = () => {
    patch('avatar', '');
    setFileName('');
    setFileSize('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      notify.error('Full name is required.');
      return;
    }
    if (!form.role.trim()) {
      notify.error('Title / role is required.');
      return;
    }
    if (!form.department.trim()) {
      notify.error('Department is required.');
      return;
    }
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] rounded-2xl border-slate-200 bg-white shadow-2xl p-0 flex flex-col overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                {mode === 'create' ? 'Add Team Member' : 'Edit Team Profile'}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                {mode === 'create'
                  ? 'Upload an avatar portrait and configure bio and social media links.'
                  : 'Update member profile, title, bio, and social media links.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Avatar Section */}
          <div className="space-y-2 pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Profile Photo / Avatar{' '}
                <span className="text-slate-400 font-normal">(PNG, JPG, WebP, SVG)</span>
              </label>
              {/* Tab Switcher */}
              <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setAvatarTab('upload')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                    avatarTab === 'upload'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Upload className="h-3 w-3" />
                  Direct Upload
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarTab('url')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                    avatarTab === 'url'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Link2 className="h-3 w-3" />
                  Image URL
                </button>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/svg+xml,image/png,image/webp,image/jpeg,image/gif"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
              }}
            />

            {avatarTab === 'upload' ? (
              form.avatar ? (
                /* Preview card */
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/70">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-14 w-14 rounded-full bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={form.avatar}
                        alt="Avatar preview"
                        className="h-full w-full object-cover"
                        onError={() => setAvatarError(true)}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {fileName || 'Profile Photo Selected'}
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
                      onClick={clearAvatar}
                      className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                /* Drag and drop zone */
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
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
                    Click to browse <span className="font-normal text-slate-500">or drag & drop avatar</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Square portrait recommended (PNG, JPG, WebP — max 3MB)
                  </p>
                </div>
              )
            ) : (
              /* URL Mode */
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                    {form.avatar && !avatarError ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={form.avatar}
                        alt="Avatar preview"
                        className="h-full w-full object-cover"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <ImageOff className="h-5 w-5 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      value={form.avatar}
                      onChange={(e) => patch('avatar', e.target.value)}
                      placeholder="https://cdn.example.com/avatar.jpg"
                      className="text-xs font-mono rounded-xl h-10"
                    />
                  </div>
                </div>
                {avatarError && (
                  <p className="text-[10px] text-rose-500">
                    Could not load image from this URL. Please verify the URL is public and accessible.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Name & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={form.name}
                onChange={(e) => patch('name', e.target.value)}
                placeholder="e.g. MohammadAli Kadiwal"
                required
                autoFocus
                className="text-sm font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Executive / Technical Title <span className="text-rose-500">*</span>
              </label>
              <Input
                value={form.role}
                onChange={(e) => patch('role', e.target.value)}
                placeholder="e.g. Founder & Principal Architect"
                required
                className="text-sm"
              />
            </div>
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Department / Practice <span className="text-rose-500">*</span>
            </label>
            <Input
              value={form.department}
              onChange={(e) => patch('department', e.target.value)}
              placeholder="e.g. Architecture & Engineering"
              required
              className="text-sm"
            />
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Biography / Background <span className="text-rose-500">*</span>
            </label>
            <Textarea
              value={form.bio}
              onChange={(e) => patch('bio', e.target.value)}
              placeholder="Brief summary of expertise, background, and specialization..."
              rows={3}
              required
              className="text-xs leading-relaxed"
            />
          </div>

          {/* Social Links */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-700">Social / Professional Links</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                  <Linkedin className="h-3 w-3" /> LinkedIn
                </label>
                <Input
                  value={form.linkedinUrl}
                  onChange={(e) => patch('linkedinUrl', e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="text-xs font-mono h-8"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                  <Twitter className="h-3 w-3" /> Twitter / X
                </label>
                <Input
                  value={form.twitterUrl}
                  onChange={(e) => patch('twitterUrl', e.target.value)}
                  placeholder="https://x.com/..."
                  className="text-xs font-mono h-8"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                  <Github className="h-3 w-3" /> GitHub
                </label>
                <Input
                  value={form.githubUrl}
                  onChange={(e) => patch('githubUrl', e.target.value)}
                  placeholder="https://github.com/..."
                  className="text-xs font-mono h-8"
                />
              </div>
            </div>
          </div>

          {/* Leadership Toggle */}
          <div className="flex items-center justify-between pt-1 pb-2 border-t border-slate-100">
            <div>
              <span className="text-xs font-semibold text-slate-900">Executive Leadership Member</span>
              <p className="text-[11px] text-slate-400">Highlight prominently as a core leadership member on the About page.</p>
            </div>
            <Switch
              checked={form.isLeadership}
              onCheckedChange={(checked) => patch('isLeadership', checked)}
            />
          </div>

          {/* Publication Status: Draft vs Public */}
          <StatusToggleField
            value={form.status}
            onChange={(status) => patch('status', status)}
          />

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="text-xs rounded-xl h-9 px-4"
            >
              <X className="h-3.5 w-3.5 mr-1.5" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="text-xs rounded-xl h-9 px-5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : mode === 'create' ? (
                <>
                  <UserCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  Add Team Member
                </>
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

// ─── Main Team Admin Page ─────────────────────────────────────────────────────

export default function TeamAdminPage() {
  const [data, setData] = React.useState<TeamRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<TeamRecord | null>(null);
  const [saving, setSaving] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi<TeamRecord[]>('/team/admin/all');
      setData(Array.isArray(res) ? res : []);
    } catch (err: any) {
      notify.error(normalizeErrorMessage(err) || 'Could not load team members.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  function handleCloseEdit() {
    setEditOpen(false);
    setTimeout(() => {
      setEditingItem(null);
    }, 300);
  }

  async function handleCreate(form: TeamFormState) {
    setSaving(true);
    try {
      const created = await fetchApi<TeamRecord>('/team', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          role: form.role,
          department: form.department,
          bio: form.bio,
          avatar: form.avatar || undefined,
          linkedinUrl: form.linkedinUrl || undefined,
          twitterUrl: form.twitterUrl || undefined,
          githubUrl: form.githubUrl || undefined,
          isLeadership: form.isLeadership,
          isActive: form.status === 'PUBLISHED',
        }),
      });
      setData((prev) => [created, ...prev]);
      setCreateOpen(false);
      notify.success(`Team member "${form.name}" created successfully.`);
    } catch (err: any) {
      notify.error(normalizeErrorMessage(err) || 'Could not create team member.');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(form: TeamFormState) {
    if (!editingItem) return;
    setSaving(true);
    try {
      const updated = await fetchApi<TeamRecord>(`/team/${editingItem.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: form.name,
          role: form.role,
          department: form.department,
          bio: form.bio,
          avatar: form.avatar || undefined,
          linkedinUrl: form.linkedinUrl || undefined,
          twitterUrl: form.twitterUrl || undefined,
          githubUrl: form.githubUrl || undefined,
          isLeadership: form.isLeadership,
          isActive: form.status === 'PUBLISHED',
        }),
      });
      setData((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      handleCloseEdit();
      notify.success(`Team member "${form.name}" updated successfully.`);
    } catch (err: any) {
      notify.error(normalizeErrorMessage(err) || 'Could not update team member.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetchApi(`/team/${id}`, { method: 'DELETE' });
      setData((prev) => prev.filter((item) => item.id !== id));
      notify.success('Team member deleted.');
    } catch (err: any) {
      notify.error(normalizeErrorMessage(err) || 'Could not delete team member.');
    }
  }

  async function handleBulkDelete(ids: string[]) {
    try {
      await fetchApi('/team/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      });
      setData((prev) => prev.filter((item) => !ids.includes(item.id)));
      notify.success(`${ids.length} team member(s) deleted.`);
    } catch (err: any) {
      notify.error(normalizeErrorMessage(err) || 'Could not delete team members.');
    }
  }

  async function handleBulkStatusChange(ids: string[], status: ItemStatus) {
    try {
      const isActive = status === 'PUBLISHED';
      await fetchApi('/team/bulk-status', {
        method: 'PUT',
        body: JSON.stringify({ ids, isActive }),
      });
      setData((prev) =>
        prev.map((item) =>
          ids.includes(item.id)
            ? { ...item, status, isActive }
            : item
        )
      );
      notify.success(`${ids.length} team member(s) updated.`);
    } catch (err: any) {
      notify.error(normalizeErrorMessage(err) || 'Could not update team member statuses.');
    }
  }

  const columns: ColumnDef<TeamRecord>[] = [
    {
      key: 'name',
      header: 'Team Member',
      sortable: true,
      render: (item) => {
        const initials = (item.name || 'TM')
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();

        return (
          <div className="flex items-center gap-3">
            {item.avatar ? (
              <img
                src={item.avatar}
                alt={item.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-200/80 shadow-xs shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                {initials}
              </div>
            )}
            <div>
              <span className="font-semibold text-slate-900 text-sm block">{item.name}</span>
              <div className="text-xs text-blue-600 font-medium">{item.role}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      render: (item) => (
        <Badge variant="outline" className="text-[11px] font-medium border-slate-200 text-slate-600">
          {item.department || 'General'}
        </Badge>
      ),
    },
    {
      key: 'isLeadership',
      header: 'Tier',
      sortable: true,
      render: (item) => (
        <span className="text-xs font-mono">
          {item.isLeadership ? (
            <Badge variant="success" className="text-[10px] font-semibold">LEADERSHIP</Badge>
          ) : (
            <Badge variant="muted" className="text-[10px] font-medium">SPECIALIST</Badge>
          )}
        </span>
      ),
    },
    {
      key: 'socials' as any,
      header: 'Socials',
      render: (item) => {
        return (
          <div className="flex items-center gap-2 text-slate-400">
            {item.linkedinUrl && (
              <a
                href={item.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-blue-600 transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
            )}
            {item.twitterUrl && (
              <a
                href={item.twitterUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-900 transition-colors"
                title="Twitter / X"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
            )}
            {item.githubUrl && (
              <a
                href={item.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-900 transition-colors"
                title="GitHub"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
            )}
            {!item.linkedinUrl && !item.twitterUrl && !item.githubUrl && (
              <span className="text-xs text-slate-300">—</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'bio',
      header: 'Bio Narrative',
      render: (item) => (
        <span className="text-xs text-slate-500 line-clamp-2 max-w-xs">{item.bio}</span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-[11px] text-slate-400">{formatDate(item.updatedAt)}</span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-8 w-48 bg-slate-100 rounded-xl animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <DataTable<TeamRecord>
        title="Team & Leadership Profiles"
        description="Public executive roster, principal architects, and senior engineering specialists."
        data={data}
        columns={columns}
        searchKeys={['name', 'role', 'department', 'bio']}
        requiredPermission="content:write"
        addButtonLabel="New Team Member"
        entityName="team member"
        emptyStateTitle="No team members yet."
        emptyStateDescription="Add your first team member to populate the About page."
        onAdd={() => setCreateOpen(true)}
        onEdit={(item) => {
          setEditingItem(item);
          setEditOpen(true);
        }}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        onBulkStatusChange={handleBulkStatusChange}
      />

      {/* Create Dialog */}
      <TeamDialog
        key={createOpen ? 'create-team' : 'create-closed'}
        open={createOpen}
        mode="create"
        saving={saving}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />

      {/* Edit Dialog */}
      <TeamDialog
        key={editingItem?.id || 'edit-team'}
        open={editOpen}
        mode="edit"
        initial={editingItem}
        saving={saving}
        onClose={handleCloseEdit}
        onSubmit={handleUpdate}
      />
    </>
  );
}
