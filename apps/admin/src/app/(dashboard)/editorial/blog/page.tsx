'use client';

import * as React from 'react';
import {
  BookOpen,
  Plus,
  Search,
  ExternalLink,
  Edit3,
  Trash2,
  Eye,
  Clock,
  CheckCircle2,
  Folder,
  TrendingUp,
  RefreshCw,
  FileText,
  X,
  Sparkles,
  FileCheck,
  FileClock,
  Archive,
  User,
  Upload,
  Tags,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { fetchApi, normalizeErrorMessage } from '@/lib/api-client';
import { notify } from '@/lib/notifications';
import { AdminContentContainer, AdminPageHeader } from '@/components/layout/admin-page';
import { TablePagination } from '@/components/ui/table-pagination';
import { StatusToggleField } from '@/components/crud/status-toggle-field';
import { getSiteUrl } from '@/lib/site-url';

interface BlogPostRecord {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  category: {
    id: string;
    name: string;
    slug: string;
  };
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  coverImage?: string;
  readTimeMinutes: number;
  readTime: string;
  publishedAt?: string;
  publishedDate?: string;
  viewCount: number;
  tags: string[];
  bodyContent?: any;
}

interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  postCount?: number;
}

export default function EditorialBlogAdminPage() {
  const [posts, setPosts] = React.useState<BlogPostRecord[]>([]);
  const [categories, setCategories] = React.useState<CategoryRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingPost, setEditingPost] = React.useState<BlogPostRecord | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = React.useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = React.useState(false);

  // Form State
  const [formData, setFormData] = React.useState({
    title: '',
    slug: '',
    excerpt: '',
    categoryId: '',
    coverImage: '',
    readTimeMinutes: 8,
    status: 'PUBLISHED' as 'PUBLISHED' | 'DRAFT',
    content: '',
    tags: '',
  });

  const [autoSlug, setAutoSlug] = React.useState(true);
  const coverFileInputRef = React.useRef<HTMLInputElement>(null);

  // Quick Category Creation State
  const [isQuickCategoryOpen, setIsQuickCategoryOpen] = React.useState(false);
  const [quickCategoryName, setQuickCategoryName] = React.useState('');
  const [isCreatingCategory, setIsCreatingCategory] = React.useState(false);

  // Load posts & categories
  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [postsRes, catRes] = await Promise.all([
        fetchApi<any>('/cms/blog'),
        fetchApi<any>('/blog/categories'),
      ]);

      const postList = postsRes?.data ?? postsRes;
      if (Array.isArray(postList)) {
        setPosts(postList);
      }
      const catList = catRes?.data ?? catRes;
      if (Array.isArray(catList)) {
        setCategories(catList);
      }
    } catch (err: any) {
      notify.error(err.message || 'Failed to load editorial data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Quick Category Creation
  const handleQuickCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCategoryName.trim()) return;
    setIsCreatingCategory(true);
    try {
      const res = await fetchApi<any>('/cms/blog/categories', {
        method: 'POST',
        body: JSON.stringify({ name: quickCategoryName.trim() }),
      });
      notify.success(`Category "${res.name}" created!`);
      const updatedCatRes = await fetchApi<any>('/blog/categories');
      const catList = updatedCatRes?.data ?? updatedCatRes;
      if (Array.isArray(catList)) {
        setCategories(catList);
      }
      setFormData((prev) => ({ ...prev, categoryId: res.id }));
      setQuickCategoryName('');
      setIsQuickCategoryOpen(false);
    } catch (err: any) {
      notify.error(normalizeErrorMessage(err, 'Failed to create category.'));
    } finally {
      setIsCreatingCategory(false);
    }
  };

  // Open Create modal
  const handleOpenCreate = () => {
    setEditingPost(null);
    setAutoSlug(true);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      categoryId: categories[0]?.id || '',
      coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80',
      readTimeMinutes: 8,
      status: 'PUBLISHED',
      content: '',
      tags: 'Distributed Systems, Cloud Architecture',
    });
    setIsDialogOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (post: BlogPostRecord) => {
    setEditingPost(post);
    setAutoSlug(false);

    // Extract text content if bodyContent exists
    let contentText = '';
    if (post.bodyContent?.sections) {
      contentText = post.bodyContent.sections
        .map((s: any) => `${s.heading ? `## ${s.heading}\n\n` : ''}${s.paragraphs?.join('\n\n') || ''}`)
        .join('\n\n');
    } else if (typeof post.bodyContent === 'string') {
      contentText = post.bodyContent;
    }

    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      categoryId: post.category?.id || categories[0]?.id || '',
      coverImage: post.coverImage || '',
      readTimeMinutes: post.readTimeMinutes || 8,
      status: (post.status as any) || 'PUBLISHED',
      content: contentText || post.excerpt,
      tags: post.tags?.join(', ') || '',
    });
    setIsDialogOpen(true);
  };

  // Handle Title change with Auto-Slug
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: autoSlug
        ? title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        : prev.slug,
    }));
  };

  // Save Blog Post
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      notify.error('Article title is required.');
      return;
    }
    if (!formData.slug.trim()) {
      notify.error('URL route slug is required.');
      return;
    }

    setIsSaving(true);
    try {
      // Parse markdown content into structured sections preserving headings and images
      const sections: { heading?: string; paragraphs: string[] }[] = [];
      const lines = formData.content.split('\n');
      let currentHeading = 'Overview';
      let currentParagraphs: string[] = [];

      const flushParagraphs = (rawBlock: string) => {
        const p = rawBlock.trim();
        if (p) currentParagraphs.push(p);
      };

      let buffer: string[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';
        const trimmed = line.trim();

        if (trimmed.startsWith('## ')) {
          if (buffer.length > 0) {
            flushParagraphs(buffer.join('\n'));
            buffer = [];
          }
          if (currentParagraphs.length > 0) {
            sections.push({
              heading: currentHeading,
              paragraphs: currentParagraphs,
            });
            currentParagraphs = [];
          }
          currentHeading = trimmed.replace(/^##\s+/, '').trim();
        } else if (trimmed === '') {
          if (buffer.length > 0) {
            flushParagraphs(buffer.join('\n'));
            buffer = [];
          }
        } else {
          buffer.push(line);
        }
      }

      if (buffer.length > 0) {
        flushParagraphs(buffer.join('\n'));
      }
      if (currentParagraphs.length > 0) {
        sections.push({
          heading: currentHeading,
          paragraphs: currentParagraphs,
        });
      }

      const bodyPayload = {
        sections:
          sections.length > 0
            ? sections
            : [
                {
                  heading: 'Overview',
                  paragraphs: [formData.excerpt],
                },
              ],
      };

      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim().toLowerCase(),
        excerpt: formData.excerpt.trim(),
        categoryId: formData.categoryId,
        coverImage: formData.coverImage.trim(),
        readTimeMinutes: Number(formData.readTimeMinutes) || 8,
        status: formData.status,
        bodyContent: bodyPayload,
      };

      if (editingPost) {
        await fetchApi(`/cms/blog/${editingPost.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        notify.success(`"${formData.title}" has been saved.`);
      } else {
        await fetchApi('/cms/blog', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        notify.success(`"${formData.title}" is now live on the editorial hub.`);
      }

      setIsDialogOpen(false);
      await loadData();
    } catch (err: any) {
      notify.error(err.message || 'Save Failed');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle status directly from table
  const handleToggleStatus = async (post: BlogPostRecord) => {
    const newStatus = post.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await fetchApi(`/cms/blog/${post.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, status: newStatus } : p))
      );
      notify.success(`Article set to ${newStatus}.`);
    } catch (err: any) {
      notify.error(err.message || 'Status update failed');
    }
  };

  // Delete article
  const handleDelete = async (post: BlogPostRecord) => {
    if (!confirm(`Are you sure you want to delete "${post.title}"?`)) return;

    try {
      await fetchApi(`/cms/blog/${post.id}`, {
        method: 'DELETE',
      });
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(post.id);
        return next;
      });
      notify.success('The article was moved to archive/deleted.');
    } catch (err: any) {
      notify.error(err.message || 'Delete failed');
    }
  };

  // Bulk status update
  const handleBulkStatus = async (status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED') => {
    if (selectedIds.size === 0) return;
    setIsBulkProcessing(true);
    const ids = Array.from(selectedIds);
    try {
      await fetchApi('/cms/blog/bulk-status', {
        method: 'PUT',
        body: JSON.stringify({ ids, status }),
      });
      setPosts((prev) =>
        prev.map((p) => (selectedIds.has(p.id) ? { ...p, status } : p))
      );
      const label = status === 'PUBLISHED' ? 'published' : status === 'DRAFT' ? 'moved to draft' : 'archived';
      notify.success(`${ids.length} ${ids.length === 1 ? 'article' : 'articles'} ${label} successfully.`);
      setSelectedIds(new Set());
    } catch (err: any) {
      notify.error(err.message || 'Bulk status update failed');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkProcessing(true);
    const ids = Array.from(selectedIds);
    try {
      await fetchApi('/cms/blog/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      });
      setPosts((prev) => prev.filter((p) => !selectedIds.has(p.id)));
      notify.success(`${ids.length} ${ids.length === 1 ? 'article' : 'articles'} deleted.`);
      setSelectedIds(new Set());
      setBulkDeleteConfirm(false);
    } catch (err: any) {
      notify.error(err.message || 'Bulk delete failed');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Filtered posts
  const filteredPosts = React.useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || post.category?.id === selectedCategory || post.category?.slug === selectedCategory;

      const matchesStatus =
        selectedStatus === 'all' || post.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [posts, searchQuery, selectedCategory, selectedStatus]);

  const paginatedPosts = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPosts.slice(start, start + pageSize);
  }, [filteredPosts, page, pageSize]);

  // Quick stats
  const stats = React.useMemo(() => {
    const total = posts.length;
    const published = posts.filter((p) => p.status === 'PUBLISHED').length;
    const drafts = total - published;
    const totalViews = posts.reduce((acc, p) => acc + (p.viewCount || 0), 0);
    return { total, published, drafts, totalViews };
  }, [posts]);

  return (
    <AdminContentContainer variant="wide">
      <AdminPageHeader
        title="Technical Blog & Articles"
        description="Manage high-impact engineering publications, cloud architecture deep-dives, and technical leadership content."
        status={
          <div className="flex items-center gap-1.5 text-xs font-mono tracking-wider text-primary uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Editorial Engine</span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={isLoading}
              className="gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </Button>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-2 cursor-pointer"
            >
              <Link href="/editorial/author">
                <User className="w-3.5 h-3.5 text-primary" />
                <span>Author Profile</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-2 cursor-pointer"
            >
              <Link href="/editorial/categories">
                <Tags className="w-3.5 h-3.5 text-primary" />
                <span>Categories</span>
              </Link>
            </Button>

            <Button
              onClick={handleOpenCreate}
              size="sm"
              className="gap-2 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Article</span>
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Articles</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-foreground">{stats.total}</div>
          <div className="mt-1 text-xs text-muted-foreground">Published across all categories</div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Live on Site</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.published}</div>
          <div className="mt-1 text-xs text-muted-foreground">Directly accessible on /blog</div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Drafts & Scheduled</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.drafts}</div>
          <div className="mt-1 text-xs text-muted-foreground">In review / editorial staging</div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Engagement</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-primary">
            {(stats.totalViews / 1000).toFixed(1)}k
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Total verified reads</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card rounded-xl border border-border p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by article title, slug, or keywords..."
            className="pl-9 bg-background border-input focus-visible:ring-1 focus-visible:ring-primary"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              aria-label="Filter articles by category"
              className="text-xs font-medium bg-background border border-input rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Categories ({posts.length})</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              aria-label="Filter articles by publication status"
              className="text-xs font-medium bg-background border border-input rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Statuses</option>
              <option value="PUBLISHED">Published Only</option>
              <option value="DRAFT">Drafts Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-8 h-8 text-primary animate-spin mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Loading publications from database...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No publications found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your search filters or clearing the query.'
                : 'Get started by creating your first technical publication.'}
            </p>
            <Button
              onClick={handleOpenCreate}
              size="sm"
              className="mt-4 gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1" />
              Create Article
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                  <th className="py-3.5 px-4 w-10 text-center">
                    <Checkbox
                      checked={
                        filteredPosts.length > 0 &&
                        filteredPosts.every((p) => selectedIds.has(p.id))
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedIds(new Set(filteredPosts.map((p) => p.id)));
                        } else {
                          setSelectedIds(new Set());
                        }
                      }}
                      aria-label="Select all articles"
                    />
                  </th>
                  <th className="py-3.5 px-2 w-10 text-center">#</th>
                  <th className="py-3.5 px-4 min-w-[320px]">Publication</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Category</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Author</th>
                  <th className="py-3.5 px-4 text-center">Engagement</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 min-w-[120px]">Published</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {paginatedPosts.map((post, index) => (
                  <tr
                    key={post.id}
                    className={`hover:bg-slate-50/80 transition-colors group ${
                      selectedIds.has(post.id) ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <td className="py-4 px-4 text-center">
                      <Checkbox
                        checked={selectedIds.has(post.id)}
                        onCheckedChange={(checked) => {
                          const next = new Set(selectedIds);
                          if (checked) next.add(post.id);
                          else next.delete(post.id);
                          setSelectedIds(next);
                        }}
                        aria-label={`Select article ${post.title}`}
                      />
                    </td>
                    <td className="py-4 px-2 text-xs font-mono text-slate-400 text-center">
                      {(page - 1) * pageSize + index + 1}
                    </td>

                    {/* Title & Cover Thumbnail */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-md overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                          {post.coverImage ? (
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <BookOpen className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {post.title}
                          </div>
                          <div className="font-mono text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span>/blog/{post.slug}</span>
                            <span>•</span>
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4">
                      <Badge
                        variant="secondary"
                        className="bg-slate-100 text-slate-700 border-slate-200 font-normal text-xs hover:bg-slate-200/70"
                      >
                        {post.category?.name || 'General'}
                      </Badge>
                    </td>

                    {/* Author */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {post.author?.avatar && (
                          <img
                            src={post.author.avatar}
                            alt={post.author.name}
                            className="w-6 h-6 rounded-full object-cover border border-slate-200"
                          />
                        )}
                        <span className="text-xs font-medium text-slate-700 line-clamp-1">
                          {post.author?.name || 'MohammadAli Kadiwal'}
                        </span>
                      </div>
                    </td>

                    {/* Engagement / Views */}
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-blue-600 bg-blue-50/70 px-2.5 py-1 rounded-md">
                        <Eye className="w-3 h-3" />
                        {post.viewCount ? `${(post.viewCount / 1000).toFixed(1)}k` : '0'}
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(post)}
                        title="Click to toggle status"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                      >
                        {post.status === 'PUBLISHED' ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1 hover:bg-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            PUBLISHED
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1 hover:bg-amber-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            DRAFT
                          </span>
                        )}
                      </button>
                    </td>

                    {/* Published Date */}
                    <td className="py-4 px-4 font-mono text-xs text-slate-500">
                      {post.publishedDate || (post.publishedAt ? post.publishedAt.split('T')[0] : '—')}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* View on live site */}
                        <a
                          href={`${getSiteUrl()}/blog/${post.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Open live post"
                          className="p-1.5 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEdit(post)}
                          title="Edit article"
                          className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(post)}
                          title="Delete article"
                          className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && filteredPosts.length > 0 && (
          <TablePagination
            currentPage={page}
            totalItems={filteredPosts.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            itemLabel="articles"
          />
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl lg:max-w-5xl max-h-[92vh] overflow-y-auto p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {editingPost ? 'Edit Publication' : 'Draft New Engineering Article'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Configure publication metadata, content hierarchy, SEO route, and cover media.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-6 mt-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Article Title <span className="text-destructive">*</span>
              </label>
              <Input
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="e.g. Architecting High-Frequency Distributed Systems with Zero Drift"
                required
                className="font-medium text-foreground focus-visible:ring-primary"
              />
            </div>

            {/* Slug & Auto-slug */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                  URL Route Slug <span className="text-destructive">*</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSlug}
                    onChange={(e) => setAutoSlug(e.target.checked)}
                    className="rounded border-input text-primary focus:ring-primary"
                  />
                  <span>Auto-generate from title</span>
                </label>
              </div>
              <div className="flex items-center rounded-md border border-input bg-muted/40 px-3 py-1.5 focus-within:ring-1 focus-within:ring-primary">
                <span className="text-xs font-mono text-muted-foreground select-none">/blog/</span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => {
                    setAutoSlug(false);
                    setFormData((prev) => ({ ...prev, slug: e.target.value }));
                  }}
                  required
                  placeholder="architecting-high-frequency-distributed-systems"
                  className="w-full bg-transparent text-xs font-mono text-foreground border-none outline-none focus:ring-0 ml-1"
                />
              </div>
            </div>

            {/* Two-Column Grid: Category & Read Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                    Category <span className="text-destructive">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsQuickCategoryOpen((prev) => !prev)}
                    className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{isQuickCategoryOpen ? 'Cancel' : 'New Category'}</span>
                  </button>
                </div>

                {isQuickCategoryOpen && (
                  <div className="mb-2 p-2 rounded-lg bg-muted/60 border border-border flex items-center gap-2">
                    <Input
                      value={quickCategoryName}
                      onChange={(e) => setQuickCategoryName(e.target.value)}
                      placeholder="New category name..."
                      className="text-xs h-8 bg-background"
                      autoFocus
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleQuickCreateCategory}
                      disabled={isCreatingCategory || !quickCategoryName.trim()}
                      className="h-8 text-xs shrink-0 cursor-pointer"
                    >
                      {isCreatingCategory ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Save'}
                    </Button>
                  </div>
                )}

                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
                  required
                  aria-label="Select article category"
                  className="w-full text-xs bg-background border border-input rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Estimated Read Time (Minutes)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="60"
                  value={formData.readTimeMinutes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, readTimeMinutes: parseInt(e.target.value) || 8 }))
                  }
                  className="text-xs font-mono"
                />
              </div>
            </div>

            {/* Cover Image URL & Live Preview */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                  Cover Image (Upload or CDN URL)
                </label>
                <button
                  type="button"
                  onClick={() => coverFileInputRef.current?.click()}
                  className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload from Device
                </button>
              </div>
              <input
                ref={coverFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 10 * 1024 * 1024) {
                    notify.error('File size exceeds 10MB limit.');
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    const dataUrl = ev.target?.result as string;
                    if (dataUrl) {
                      setFormData((prev) => ({ ...prev, coverImage: dataUrl }));
                      notify.success('Cover image uploaded.');
                    }
                  };
                  reader.readAsDataURL(file);
                }}
              />
              <div className="flex gap-3 items-start">
                <div className="grow">
                  <Input
                    value={formData.coverImage}
                    onChange={(e) => setFormData((prev) => ({ ...prev, coverImage: e.target.value }))}
                    placeholder="https://images.unsplash.com/photo-... or upload file"
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Paste high-res Unsplash/CDN URL or click &quot;Upload from Device&quot;. Recommended aspect ratio 16:9.
                  </p>
                </div>

                {formData.coverImage && (
                  <div className="w-24 h-14 rounded-md overflow-hidden border border-border shrink-0 bg-muted relative group">
                    <img
                      src={formData.coverImage}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as any).src =
                          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, coverImage: '' }))}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove cover"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Executive Excerpt / Summary <span className="text-destructive">*</span>
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                rows={3}
                required
                placeholder="A concise, high-level summary of the architectural insights presented in this publication..."
                className="w-full text-xs text-foreground bg-background border border-input rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Article Content with Rich Text & Image Upload */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                  Article Body & Media Content <span className="text-destructive">*</span>
                </label>
                <span className="text-[11px] text-muted-foreground hidden sm:inline">
                  Upload images, drag & drop files, or paste screenshots (Ctrl+V) directly
                </span>
              </div>
              <RichTextEditor
                value={formData.content}
                onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
                placeholder="Write your publication content in rich markdown. Upload images, use ## for sections, > for insights, and **bold** for emphasis..."
                minHeight="380px"
              />
            </div>

            {/* Status Toggle Field */}
            <StatusToggleField
              value={formData.status}
              onChange={(status) => setFormData((prev) => ({ ...prev, status: status as any }))}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="gap-2 shadow-xs cursor-pointer"
              >
                {isSaving && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>{editingPost ? 'Save Changes' : 'Publish Article'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Floating Bulk Action Dock */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-2.5 rounded-2xl border border-slate-200 bg-white/95 px-5 py-2.5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="text-xs font-semibold text-slate-800 pr-2 border-r border-slate-200">
            {selectedIds.size} {selectedIds.size === 1 ? 'article' : 'articles'} selected
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={isBulkProcessing}
            className="h-8 text-xs rounded-xl border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
            onClick={() => handleBulkStatus('PUBLISHED')}
          >
            <FileCheck className="h-3.5 w-3.5 mr-1 text-emerald-600" />
            <span>Publish</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={isBulkProcessing}
            className="h-8 text-xs rounded-xl border-slate-200 hover:bg-slate-100"
            onClick={() => handleBulkStatus('DRAFT')}
          >
            <FileClock className="h-3.5 w-3.5 mr-1 text-amber-600" />
            <span>Draft</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={isBulkProcessing}
            className="h-8 text-xs rounded-xl border-slate-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200"
            onClick={() => handleBulkStatus('ARCHIVED')}
          >
            <Archive className="h-3.5 w-3.5 mr-1 text-purple-600" />
            <span>Archive</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={isBulkProcessing}
            className="h-8 text-xs rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
            onClick={() => setBulkDeleteConfirm(true)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            <span>Delete</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 rounded-xl"
            onClick={() => setSelectedIds(new Set())}
            title="Clear selection"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Bulk Delete Confirm Dialog */}
      <ConfirmDialog
        open={bulkDeleteConfirm}
        onOpenChange={setBulkDeleteConfirm}
        title={`Delete ${selectedIds.size} ${selectedIds.size === 1 ? 'Article' : 'Articles'}`}
        description="Are you sure you want to permanently delete these selected articles from the editorial system? This action cannot be undone."
        confirmLabel={isBulkProcessing ? 'Deleting...' : 'Delete Selected Articles'}
        variant="destructive"
        onConfirm={handleBulkDelete}
      />
    </AdminContentContainer>
  );
}
