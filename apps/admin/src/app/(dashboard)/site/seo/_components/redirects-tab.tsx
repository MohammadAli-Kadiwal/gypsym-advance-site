'use client';

import * as React from 'react';
import {
  ArrowRight,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { notify } from '@/lib/notifications';
import { normalizeErrorMessage } from '@/lib/api';
import { seoService, RedirectData } from '@/services/seo.service';
import { TablePagination } from '@/components/ui/table-pagination';

export function RedirectsTab() {
  const [redirects, setRedirects] = React.useState<RedirectData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<RedirectData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  // Form State
  const [sourceUrl, setSourceUrl] = React.useState('');
  const [targetUrl, setTargetUrl] = React.useState('');
  const [statusCode, setStatusCode] = React.useState<number>(301);
  const [isActive, setIsActive] = React.useState(true);
  const [notes, setNotes] = React.useState('');

  const loadRedirects = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await seoService.getRedirects();
      setRedirects(Array.isArray(data) ? data : []);
    } catch (err) {
      notify.error({ title: 'Failed to load redirects', description: normalizeErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadRedirects();
  }, [loadRedirects]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setSourceUrl('');
    setTargetUrl('');
    setStatusCode(301);
    setIsActive(true);
    setNotes('');
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: RedirectData) => {
    setEditingItem(item);
    setSourceUrl(item.sourceUrl);
    setTargetUrl(item.targetUrl);
    setStatusCode(item.statusCode);
    setIsActive(item.isActive);
    setNotes(item.notes || '');
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSource = sourceUrl.trim();
    const cleanTarget = targetUrl.trim();

    if (!cleanSource || !cleanTarget) {
      notify.error({ title: 'Validation error', description: 'Both source and target URLs are required' });
      return;
    }

    if (cleanSource === cleanTarget) {
      notify.error({ title: 'Invalid redirect loop', description: 'Source URL cannot be identical to target URL' });
      return;
    }

    // Check for leading slash if relative
    const formattedSource = cleanSource.startsWith('http') || cleanSource.startsWith('/') ? cleanSource : `/${cleanSource}`;
    const formattedTarget = cleanTarget.startsWith('http') || cleanTarget.startsWith('/') ? cleanTarget : `/${cleanTarget}`;

    try {
      setSaving(true);
      if (editingItem) {
        await seoService.updateRedirect(editingItem.id, {
          sourceUrl: formattedSource,
          targetUrl: formattedTarget,
          statusCode,
          isActive,
          notes,
        });
        notify.success({ title: 'Redirect updated', description: `Redirect rule ${formattedSource} saved.` });
      } else {
        await seoService.createRedirect({
          sourceUrl: formattedSource,
          targetUrl: formattedTarget,
          statusCode,
          isActive,
          notes,
        });
        notify.success({ title: 'Redirect created', description: `New redirect rule from ${formattedSource} created.` });
      }
      setIsDialogOpen(false);
      loadRedirects();
    } catch (err) {
      notify.error({ title: 'Failed to save redirect', description: normalizeErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      setSaving(true);
      await seoService.deleteRedirect(deletingId);
      notify.success({ title: 'Redirect deleted', description: 'The redirect rule was removed.' });
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
      loadRedirects();
    } catch (err) {
      notify.error({ title: 'Failed to delete redirect', description: normalizeErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const filteredRedirects = React.useMemo(() => {
    return redirects.filter((r) => {
      const matchSearch =
        r.sourceUrl.toLowerCase().includes(search.toLowerCase()) ||
        r.targetUrl.toLowerCase().includes(search.toLowerCase()) ||
        (r.notes && r.notes.toLowerCase().includes(search.toLowerCase()));

      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? r.isActive
          : statusFilter === 'inactive'
          ? !r.isActive
          : String(r.statusCode) === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [redirects, search, statusFilter]);

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const paginatedRedirects = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRedirects.slice(start, start + pageSize);
  }, [filteredRedirects, page, pageSize]);

  const loopWarning = React.useMemo(() => {
    // Basic loop check: if any target matches another's source
    for (const r1 of redirects) {
      for (const r2 of redirects) {
        if (r1.isActive && r2.isActive && r1.sourceUrl === r2.targetUrl && r1.targetUrl === r2.sourceUrl) {
          return `Warning: Infinite loop detected between ${r1.sourceUrl} and ${r2.sourceUrl}`;
        }
      }
    }
    return null;
  }, [redirects]);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-primary" />
                URL Redirect Management
              </CardTitle>
              <CardDescription>
                Configure HTTP 301, 302, 307, and 308 redirects to preserve SEO link equity and prevent 404 broken links.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadRedirects} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button size="sm" onClick={handleOpenAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add Redirect
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loopWarning && (
            <div className="mb-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <div className="text-sm font-medium">{loopWarning}</div>
            </div>
          )}

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search redirects by source, target, or notes..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="h-9 px-3 rounded-md border bg-background text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
                <option value="301">301 (Permanent)</option>
                <option value="302">302 (Found)</option>
                <option value="307">307 (Temporary)</option>
                <option value="308">308 (Permanent Cache)</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground animate-pulse">
              Loading redirects configuration...
            </div>
          ) : filteredRedirects.length === 0 ? (
            <div className="py-12 text-center border rounded-lg bg-muted/20">
              <ArrowRight className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <h3 className="font-semibold text-sm">No redirects found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {search ? 'Try adjusting your search criteria.' : 'Create your first dynamic redirect rule to handle changed URLs smoothly.'}
              </p>
              {!search && (
                <Button size="sm" variant="outline" className="mt-4" onClick={handleOpenAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Redirect
                </Button>
              )}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b text-xs font-semibold text-muted-foreground text-left">
                  <tr>
                    <th className="p-3">Source URL</th>
                    <th className="p-3">Target URL</th>
                    <th className="p-3">HTTP Code</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Notes</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedRedirects.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-mono text-xs max-w-[200px] truncate" title={item.sourceUrl}>
                        {item.sourceUrl}
                      </td>
                      <td className="p-3 font-mono text-xs max-w-[200px] truncate text-primary" title={item.targetUrl}>
                        <div className="flex items-center gap-1.5">
                          <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                          <span>{item.targetUrl}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant="outline"
                          className={
                            item.statusCode === 301 || item.statusCode === 308
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-mono text-xs'
                              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 font-mono text-xs'
                          }
                        >
                          {item.statusCode}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant="secondary"
                          className={
                            item.isActive
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-muted text-muted-foreground'
                          }
                        >
                          {item.isActive ? 'Active' : 'Disabled'}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground max-w-[150px] truncate" title={item.notes}>
                        {item.notes || '—'}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(item)}>
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setDeletingId(item.id);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredRedirects.length > 0 && (
            <TablePagination
              currentPage={page}
              totalItems={filteredRedirects.length}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              itemLabel="redirects"
            />
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Redirect Rule' : 'Create New Redirect Rule'}</DialogTitle>
              <DialogDescription>
                Define the origin URL, target destination, and canonical HTTP status code.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="sourceUrl">Source URL (Path to catch)</Label>
                <Input
                  id="sourceUrl"
                  placeholder="/old-service-page or https://..."
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">Relative paths should start with a forward slash (e.g. /old-services).</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="targetUrl">Target Destination URL</Label>
                <Input
                  id="targetUrl"
                  placeholder="/services/enterprise-cloud or https://..."
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">The new destination users and search bots will be redirected to.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="statusCode">HTTP Status Code</Label>
                  <select
                    id="statusCode"
                    value={statusCode}
                    onChange={(e) => setStatusCode(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-md border bg-background text-sm"
                  >
                    <option value={301}>301 (Permanent)</option>
                    <option value={302}>302 (Found / Temp)</option>
                    <option value={307}>307 (Temporary)</option>
                    <option value={308}>308 (Permanent)</option>
                  </select>
                </div>

                <div className="space-y-1.5 flex flex-col justify-end pb-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isActive" className="cursor-pointer">Rule Enabled</Label>
                    <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">Internal Notes (Optional)</Label>
                <Input
                  id="notes"
                  placeholder="e.g. Migrated from old WordPress site"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingItem ? 'Update Redirect' : 'Create Redirect'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Redirect Rule?</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this redirect? Visitors requesting the old URL will no longer be forwarded.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? 'Deleting...' : 'Delete Rule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
