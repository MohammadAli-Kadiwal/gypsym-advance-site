'use client';

import * as React from 'react';
import {
  Tags,
  Plus,
  Search,
  ExternalLink,
  Edit3,
  Trash2,
  BookOpen,
  Folder,
  RefreshCw,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { fetchApi, normalizeErrorMessage } from '@/lib/api-client';
import { notify } from '@/lib/notifications';
import { AdminContentContainer, AdminPageHeader } from '@/components/layout/admin-page';
import { TablePagination } from '@/components/ui/table-pagination';
import { Checkbox } from '@/components/ui/checkbox';

export interface BlogCategoryRecord {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  postCount: number;
}

export default function EditorialCategoriesAdminPage() {
  const [categories, setCategories] = React.useState<BlogCategoryRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = React.useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = React.useState(false);

  // Pagination State
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<BlogCategoryRecord | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  // Delete State
  const [categoryToDelete, setCategoryToDelete] = React.useState<BlogCategoryRecord | null>(null);

  // Form State
  const [formData, setFormData] = React.useState({
    name: '',
    slug: '',
    description: '',
  });
  const [autoSlug, setAutoSlug] = React.useState(true);

  // Fetch Categories
  const loadCategories = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchApi<BlogCategoryRecord[]>('/cms/blog/categories');
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (err: any) {
      notify.error(err?.message || 'Failed to load blog categories.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Handle Create Open
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
    });
    setAutoSlug(true);
    setIsDialogOpen(true);
  };

  // Handle Edit Open
  const handleOpenEdit = (category: BlogCategoryRecord) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
    });
    setAutoSlug(false);
    setIsDialogOpen(true);
  };

  // Auto generate slug
  const handleNameChange = (name: string) => {
    setFormData((prev) => {
      const updated = { ...prev, name };
      if (autoSlug) {
        updated.slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      return updated;
    });
  };

  // Save Category (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      notify.error('Category name is required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim().toLowerCase(),
        description: formData.description.trim() || undefined,
      };

      if (editingCategory) {
        await fetchApi(`/cms/blog/categories/${editingCategory.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        notify.success(`Category "${payload.name}" updated successfully.`);
      } else {
        await fetchApi('/cms/blog/categories', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        notify.success(`Category "${payload.name}" created successfully.`);
      }

      setIsDialogOpen(false);
      loadCategories();
    } catch (err: any) {
      notify.error(err?.message || 'Failed to save blog category.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Category
  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    if (categoryToDelete.postCount > 0) {
      notify.error(
        `Cannot delete "${categoryToDelete.name}" because it has ${categoryToDelete.postCount} assigned article(s). Please reassign them first.`
      );
      setCategoryToDelete(null);
      return;
    }

    try {
      await fetchApi(`/cms/blog/categories/${categoryToDelete.id}`, {
        method: 'DELETE',
      });
      notify.success(`Category "${categoryToDelete.name}" deleted.`);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(categoryToDelete.id);
        return next;
      });
      loadCategories();
    } catch (err: any) {
      notify.error(normalizeErrorMessage(err, 'Failed to delete category.'));
      loadCategories();
    } finally {
      setCategoryToDelete(null);
    }
  };

  // Bulk Delete Categories
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    const selectedList = categories.filter((c) => selectedIds.has(c.id));
    const withPosts = selectedList.filter((c) => c.postCount > 0);
    if (withPosts.length > 0) {
      notify.error(
        `Cannot delete: ${withPosts.map((c) => `"${c.name}" (${c.postCount} articles)`).join(', ')} have assigned articles. Please reassign articles first.`
      );
      setBulkDeleteConfirm(false);
      return;
    }

    setIsBulkProcessing(true);
    try {
      const ids = Array.from(selectedIds);
      await fetchApi('/cms/blog/categories/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      });
      notify.success(`Successfully deleted ${ids.length} ${ids.length === 1 ? 'category' : 'categories'}.`);
      setSelectedIds(new Set());
      setBulkDeleteConfirm(false);
      loadCategories();
    } catch (err: any) {
      notify.error(normalizeErrorMessage(err, 'Failed to bulk delete categories.'));
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Filter Categories
  const filteredCategories = React.useMemo(() => {
    let result = [...categories];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
      );
    }
    return result;
  }, [categories, searchQuery]);

  // Paginated Categories
  const paginatedCategories = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCategories.slice(start, start + pageSize);
  }, [filteredCategories, page, pageSize]);

  // Metrics
  const metrics = React.useMemo(() => {
    const totalCategories = categories.length;
    const activeWithPosts = categories.filter((c) => c.postCount > 0).length;
    const totalClassifiedPosts = categories.reduce((sum, c) => sum + (c.postCount || 0), 0);
    const avgPosts = totalCategories > 0 ? (totalClassifiedPosts / totalCategories).toFixed(1) : '0';

    return { totalCategories, activeWithPosts, totalClassifiedPosts, avgPosts };
  }, [categories]);

  return (
    <AdminContentContainer>
      {/* Header */}
      <AdminPageHeader
        title="Blog Categories Taxonomy"
        description="Dynamically manage publication topics, engineering domains, and route slugs classifying technical publications."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadCategories}
              disabled={isLoading}
              className="gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button size="sm" onClick={handleOpenCreate} className="gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Create Category</span>
            </Button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Total Categories</span>
            <Tags className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">{metrics.totalCategories}</div>
          <p className="text-[11px] text-muted-foreground mt-1">Active taxonomy nodes</p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Active with Posts</span>
            <Folder className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">{metrics.activeWithPosts}</div>
          <p className="text-[11px] text-muted-foreground mt-1">Domains with content</p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Total Articles</span>
            <BookOpen className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">{metrics.totalClassifiedPosts}</div>
          <p className="text-[11px] text-muted-foreground mt-1">Across all categories</p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Articles / Domain</span>
            <Layers className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">{metrics.avgPosts}</div>
          <p className="text-[11px] text-muted-foreground mt-1">Classification density</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search categories by name, slug, or description..."
            className="pl-9 text-xs"
          />
        </div>
        <div className="text-xs text-muted-foreground ml-auto">
          Showing <span className="font-semibold text-foreground">{filteredCategories.length}</span> categories
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-10 text-center">
                  <Checkbox
                    checked={
                      filteredCategories.length > 0 &&
                      filteredCategories.every((c) => selectedIds.has(c.id))
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedIds(new Set(filteredCategories.map((c) => c.id)));
                      } else {
                        setSelectedIds(new Set());
                      }
                    }}
                    aria-label="Select all categories"
                  />
                </th>
                <th className="py-3 px-4">Category Taxonomy</th>
                <th className="py-3 px-4">Route Slug & Hub URL</th>
                <th className="py-3 px-4">Assigned Articles</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                      <span>Loading editorial categories...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <Tags className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">No categories found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {searchQuery ? 'Try adjusting your search criteria' : 'Create your first blog category to organize publications'}
                    </p>
                    {!searchQuery && (
                      <Button size="sm" onClick={handleOpenCreate} className="mt-4 gap-1.5">
                        <Plus className="w-4 h-4" />
                        Create Category
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((category) => (
                  <tr
                    key={category.id}
                    className={`hover:bg-muted/30 transition-colors ${
                      selectedIds.has(category.id) ? 'bg-primary/5' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-4 text-center">
                      <Checkbox
                        checked={selectedIds.has(category.id)}
                        onCheckedChange={(checked) => {
                          const next = new Set(selectedIds);
                          if (checked) next.add(category.id);
                          else next.delete(category.id);
                          setSelectedIds(next);
                        }}
                        aria-label={`Select category ${category.name}`}
                      />
                    </td>

                    {/* Category Details */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-sm text-foreground flex items-center gap-2">
                        <span>{category.name}</span>
                      </div>
                      {category.description ? (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-md">
                          {category.description}
                        </p>
                      ) : (
                        <p className="text-[11px] text-muted-foreground/60 italic mt-0.5">
                          No description provided
                        </p>
                      )}
                    </td>

                    {/* Slug & Link */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-0.5 rounded bg-muted font-mono text-[11px] text-foreground">
                          {category.slug}
                        </code>
                        <Link
                          href={`/blog?category=${encodeURIComponent(category.slug)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors p-1"
                          title="View category publications on public site"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>

                    {/* Assigned Articles */}
                    <td className="py-3.5 px-4">
                      {category.postCount > 0 ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-mono text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {category.postCount} {category.postCount === 1 ? 'Article' : 'Articles'}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-xs">
                          0 Articles (Empty)
                        </Badge>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(category)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          title="Edit Category"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCategoryToDelete(category)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          title={
                            category.postCount > 0
                              ? `Cannot delete: ${category.postCount} assigned article(s)`
                              : 'Delete Category'
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        {filteredCategories.length > 0 && (
          <TablePagination
            currentPage={page}
            totalItems={filteredCategories.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
            itemLabel="categories"
          />
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Tags className="w-5 h-5 text-primary" />
              {editingCategory ? 'Edit Category' : 'Create Blog Category'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define the classification topic, URL slug, and metadata for publications.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 mt-2">
            {/* Category Name */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Category Name <span className="text-destructive">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Distributed Architecture"
                required
                className="text-xs"
              />
            </div>

            {/* Route Slug */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                  Route Slug <span className="text-destructive">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">Auto-generate</span>
                  <Switch
                    checked={autoSlug}
                    onCheckedChange={(checked) => setAutoSlug(checked)}
                  />
                </div>
              </div>
              <Input
                value={formData.slug}
                onChange={(e) => {
                  setAutoSlug(false);
                  setFormData((prev) => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }));
                }}
                placeholder="distributed-architecture"
                required
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Filter URL: <span className="font-mono text-primary">/blog?category={formData.slug || 'slug'}</span>
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Description / Editorial Scope
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
                placeholder="Brief summary of the engineering domains and architectural patterns covered in this category..."
                className="w-full text-xs text-foreground bg-background border border-input rounded-md p-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="gap-1.5">
                {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {editingCategory ? 'Update Category' : 'Create Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(categoryToDelete)}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
        title={categoryToDelete?.postCount ? 'Cannot Delete Category' : 'Delete Category'}
        description={
          categoryToDelete?.postCount
            ? `Cannot delete "${categoryToDelete.name}" because it contains ${categoryToDelete.postCount} published article(s). Please reassign or archive those publications before deleting this category.`
            : `Are you sure you want to permanently delete category "${categoryToDelete?.name}"? This action cannot be undone.`
        }
        confirmLabel={categoryToDelete?.postCount ? 'Acknowledge' : 'Delete Category'}
        variant={categoryToDelete?.postCount ? 'default' : 'destructive'}
        onConfirm={() => {
          if (categoryToDelete?.postCount) {
            setCategoryToDelete(null);
          } else {
            handleDeleteConfirm();
          }
        }}
      />

      {/* Floating Bulk Action Dock */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center space-x-2.5 rounded-2xl border border-border bg-card/95 text-foreground px-5 py-2.5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="text-xs font-semibold text-foreground pr-2 border-r border-border">
            {selectedIds.size} {selectedIds.size === 1 ? 'category' : 'categories'} selected
          </span>

          <Button
            variant="destructive"
            size="sm"
            disabled={isBulkProcessing}
            className="h-8 text-xs rounded-xl"
            onClick={() => setBulkDeleteConfirm(true)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            <span>Delete</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            disabled={isBulkProcessing}
            className="h-8 text-xs text-muted-foreground hover:text-foreground rounded-xl ml-1"
            onClick={() => setSelectedIds(new Set())}
          >
            Clear
          </Button>
        </div>
      )}

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        open={bulkDeleteConfirm}
        onOpenChange={(open) => !open && setBulkDeleteConfirm(false)}
        title={`Delete ${selectedIds.size} ${selectedIds.size === 1 ? 'Category' : 'Categories'}?`}
        description={
          categories.some((c) => selectedIds.has(c.id) && c.postCount > 0)
            ? `Warning: Some selected categories contain assigned articles and cannot be deleted until their articles are reassigned.`
            : `Are you sure you want to delete ${selectedIds.size} selected categories? This action cannot be undone.`
        }
        confirmLabel={isBulkProcessing ? 'Deleting...' : `Delete ${selectedIds.size} Categories`}
        variant="destructive"
        onConfirm={handleBulkDelete}
      />
    </AdminContentContainer>
  );
}
