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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { fetchApi } from '@/lib/api-client';
import { notify } from '@/lib/notifications';

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

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingPost, setEditingPost] = React.useState<BlogPostRecord | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

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
      // Build bodyContent structured JSON
      const paragraphs = formData.content
        .split('\n\n')
        .map((p) => p.trim())
        .filter(Boolean);

      const bodyPayload = {
        sections: [
          {
            heading: 'Overview',
            paragraphs: paragraphs.length > 0 ? paragraphs : [formData.excerpt],
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
      notify.success('The article was moved to archive/deleted.');
    } catch (err: any) {
      notify.error(err.message || 'Delete failed');
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

  // Quick stats
  const stats = React.useMemo(() => {
    const total = posts.length;
    const published = posts.filter((p) => p.status === 'PUBLISHED').length;
    const drafts = total - published;
    const totalViews = posts.reduce((acc, p) => acc + (p.viewCount || 0), 0);
    return { total, published, drafts, totalViews };
  }, [posts]);

  return (
    <div className="space-y-8 p-6 lg:p-10 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#98c22a] uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Editorial Engine
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
            Technical Blog & Articles
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage high-impact engineering publications, cloud architecture deep-dives, and technical leadership content.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Sync
          </Button>

          <Button
            onClick={handleOpenCreate}
            className="bg-[#98c22a] hover:bg-[#86ad23] text-slate-950 font-semibold gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Article
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Articles</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="mt-1 text-xs text-slate-400">Published across all categories</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Live on Site</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-emerald-600">{stats.published}</div>
          <div className="mt-1 text-xs text-slate-400">Directly accessible on /blog</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Drafts & Scheduled</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-amber-600">{stats.drafts}</div>
          <div className="mt-1 text-xs text-slate-400">In review / editorial staging</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Engagement</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-purple-600">
            {(stats.totalViews / 1000).toFixed(1)}k
          </div>
          <div className="mt-1 text-xs text-slate-400">Total verified reads</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by article title, slug, or keywords..."
            className="pl-9 bg-slate-50/50 border-slate-200 focus-visible:ring-1 focus-visible:ring-[#98c22a]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter articles by category"
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#98c22a]"
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
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter articles by publication status"
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#98c22a]"
            >
              <option value="all">All Statuses</option>
              <option value="PUBLISHED">Published Only</option>
              <option value="DRAFT">Drafts Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-8 h-8 text-[#98c22a] animate-spin mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading publications from database...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">No publications found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your search filters or clearing the query.'
                : 'Get started by creating your first technical publication.'}
            </p>
            <Button
              onClick={handleOpenCreate}
              className="mt-4 bg-[#98c22a] hover:bg-[#86ad23] text-slate-950 font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Article
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
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
                {filteredPosts.map((post, index) => (
                  <tr key={post.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 px-4 text-xs font-mono text-slate-400 text-center">
                      {index + 1}
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
                          href={`http://localhost:3000/blog/${post.slug}`}
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
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#98c22a]" />
              {editingPost ? 'Edit Publication' : 'Draft New Engineering Article'}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Configure publication metadata, content hierarchy, SEO route, and cover media.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-6 mt-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Article Title <span className="text-rose-500">*</span>
              </label>
              <Input
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="e.g. Architecting High-Frequency Distributed Systems with Zero Drift"
                required
                className="font-medium text-slate-900 focus-visible:ring-[#98c22a]"
              />
            </div>

            {/* Slug & Auto-slug */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  URL Route Slug <span className="text-rose-500">*</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSlug}
                    onChange={(e) => setAutoSlug(e.target.checked)}
                    className="rounded border-slate-300 text-[#98c22a] focus:ring-[#98c22a]"
                  />
                  <span>Auto-generate from title</span>
                </label>
              </div>
              <div className="flex items-center rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 focus-within:ring-1 focus-within:ring-[#98c22a]">
                <span className="text-xs font-mono text-slate-400 select-none">/blog/</span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => {
                    setAutoSlug(false);
                    setFormData((prev) => ({ ...prev, slug: e.target.value }));
                  }}
                  required
                  placeholder="architecting-high-frequency-distributed-systems"
                  className="w-full bg-transparent text-xs font-mono text-slate-800 border-none outline-none focus:ring-0 ml-1"
                />
              </div>
            </div>

            {/* Two-Column Grid: Category & Read Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
                  required
                  aria-label="Select article category"
                  className="w-full text-xs bg-white border border-slate-200 rounded-md px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#98c22a]"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
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
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Cover Image URL (Unsplash or CDN)
              </label>
              <div className="flex gap-3 items-start">
                <div className="grow">
                  <Input
                    value={formData.coverImage}
                    onChange={(e) => setFormData((prev) => ({ ...prev, coverImage: e.target.value }))}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Paste high-res Unsplash or uploaded asset URL. Recommended aspect ratio 16:9.
                  </p>
                </div>

                {formData.coverImage && (
                  <div className="w-24 h-14 rounded-md overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                    <img
                      src={formData.coverImage}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as any).src =
                          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Executive Excerpt / Summary <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                rows={3}
                required
                placeholder="A concise, high-level summary of the architectural insights presented in this publication..."
                className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-[#98c22a]"
              />
            </div>

            {/* Main Content */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Article Body Content (Markdown Paragraphs)
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                rows={8}
                placeholder="Write or paste your article markdown content here. Separate paragraphs with double line breaks..."
                className="w-full font-mono text-xs text-slate-800 bg-slate-50/50 border border-slate-200 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-[#98c22a]"
              />
            </div>

            {/* Status Switch */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Publish Immediately
                </div>
                <div className="text-xs text-slate-500">
                  {formData.status === 'PUBLISHED'
                    ? 'Article will be publicly visible on /blog'
                    : 'Article will be saved as draft and hidden from public'}
                </div>
              </div>
              <Switch
                checked={formData.status === 'PUBLISHED'}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, status: checked ? 'PUBLISHED' : 'DRAFT' }))
                }
              />
            </div>

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
                className="bg-[#98c22a] hover:bg-[#86ad23] text-slate-950 font-semibold gap-2"
              >
                {isSaving && <RefreshCw className="w-4 h-4 animate-spin" />}
                {editingPost ? 'Save Changes' : 'Publish Article'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
