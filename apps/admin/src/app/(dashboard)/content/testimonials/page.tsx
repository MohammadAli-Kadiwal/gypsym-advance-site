'use client';

import * as React from 'react';
import {
  Video,
  Star,
  Plus,
  Trash2,
  Pencil,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  ShieldCheck,
  Save,
  Loader2,
  Play,
  Quote,
  Eye,
  Upload,
  Link2,
  ImageOff,
  Film,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
import { Checkbox } from '@/components/ui/checkbox';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { TablePagination } from '@/components/ui/table-pagination';
import {
  AdminContentContainer,
  AdminPageHeader,
  AdminEmptyState,
  AdminLoadingState,
} from '@/components/layout/admin-page';
import { StatusToggleField } from '@/components/crud/status-toggle-field';
import { getSiteUrl } from '@/lib/site-url';
import type {
  ClientTestimonialsSection,
  ClientTestimonialsPayload,
  VideoTestimonial,
  TextTestimonial,
} from '../../pages/_components/types';

// ─── Main Page Component ────────────────────────────────────────────────────────
export default function TestimonialsManagementPage() {
  const [mounted, setMounted] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [section, setSection] = React.useState<ClientTestimonialsSection | null>(null);

  // Active subtab
  const [activeTab, setActiveTab] = React.useState<'videos' | 'reviews'>('videos');

  // Video Dialog State
  const [videoModalOpen, setVideoModalOpen] = React.useState(false);
  const [editingVideoIndex, setEditingVideoIndex] = React.useState<number | null>(null);
  const [videoForm, setVideoForm] = React.useState<Partial<VideoTestimonial>>({});

  // Review Dialog State
  const [reviewModalOpen, setReviewModalOpen] = React.useState(false);
  const [editingReviewIndex, setEditingReviewIndex] = React.useState<number | null>(null);
  const [reviewForm, setReviewForm] = React.useState<Partial<TextTestimonial>>({});

  // Media upload & preview states
  const [videoThumbnailTab, setVideoThumbnailTab] = React.useState<'upload' | 'url'>('url');
  const [videoThumbnailError, setVideoThumbnailError] = React.useState(false);
  const videoFileInputRef = React.useRef<HTMLInputElement>(null);

  const [reviewAvatarTab, setReviewAvatarTab] = React.useState<'upload' | 'url'>('url');
  const [reviewAvatarError, setReviewAvatarError] = React.useState(false);
  const reviewFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleVideoThumbnailSelect = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      notify.error('Thumbnail file size exceeds 5MB. Please choose a smaller image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setVideoThumbnailError(false);
        setVideoForm((v) => ({ ...v, thumbnailUrl: result }));
        notify.success(`Thumbnail ready: ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReviewAvatarSelect = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      notify.error('Avatar file size exceeds 5MB. Please choose a smaller image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setReviewAvatarError(false);
        setReviewForm((r) => ({ ...r, avatarUrl: result }));
        notify.success(`Avatar ready: ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
  };

  // Delete Confirm Dialog State
  const [deleteDialog, setDeleteDialog] = React.useState<{
    open: boolean;
    type: 'video' | 'review';
    index: number;
    title: string;
  }>({
    open: false,
    type: 'video',
    index: -1,
    title: '',
  });

  // Reviews Bulk Selection State
  const [selectedReviews, setSelectedReviews] = React.useState<Set<number>>(new Set());
  const [bulkDeleteReviewConfirm, setBulkDeleteReviewConfirm] = React.useState(false);
  const [isBulkProcessingReviews, setIsBulkProcessingReviews] = React.useState(false);

  // ─── Fetch Homepage Section from API ───────────────────────────────────────────
  const loadSection = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi<any>('/pages/home');
      const pageData = res.data || res;
      const sec = pageData.sections?.find(
        (s: any) =>
          s.sectionIdentifier === 'client-testimonials' || s.componentType === 'TESTIMONIAL_SLIDER'
      );

      if (sec) {
        setSection({
          id: sec.id,
          componentType: sec.componentType,
          isActive: sec.isActive,
          contentPayload: sec.contentPayload as ClientTestimonialsPayload,
        });
      }
    } catch {
      notify.error('Failed to load testimonials section from API.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    setMounted(true);
    loadSection();
  }, [loadSection]);

  const p: ClientTestimonialsPayload = section?.contentPayload || {};
  const videos: VideoTestimonial[] = Array.isArray(p.videoTestimonials) ? p.videoTestimonials : [];
  const reviews: TextTestimonial[] = Array.isArray(p.textTestimonials) ? p.textTestimonials : [];

  const [reviewsPage, setReviewsPage] = React.useState(1);
  const [reviewsPageSize, setReviewsPageSize] = React.useState(10);

  const paginatedReviews = React.useMemo(() => {
    const start = (reviewsPage - 1) * reviewsPageSize;
    return reviews.slice(start, start + reviewsPageSize);
  }, [reviews, reviewsPage, reviewsPageSize]);

  // ─── Save Whole Section to Backend ────────────────────────────────────────────
  const handleSaveAll = async (overridePayload?: ClientTestimonialsPayload) => {
    if (!section || section.id.startsWith('local-')) return;
    setSaving(true);
    try {
      const payloadToSave = overridePayload || section.contentPayload;
      await fetchApi(`/sections/${section.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          contentPayload: payloadToSave,
          isActive: section.isActive,
        }),
      });
      notify.success('Testimonials and settings synchronized with live website.');
    } catch {
      notify.error('Unable to save changes to API.');
    } finally {
      setSaving(false);
    }
  };

  const updatePayload = (partial: Partial<ClientTestimonialsPayload>) => {
    if (!section) return;
    const nextPayload: ClientTestimonialsPayload = {
      ...p,
      ...partial,
    };
    const nextSection: ClientTestimonialsSection = {
      ...section,
      contentPayload: nextPayload,
    };
    setSection(nextSection);
    return nextPayload;
  };

  // ─── Video CRUD Helpers ────────────────────────────────────────────────────────
  const openCreateVideo = () => {
    setEditingVideoIndex(null);
    setVideoThumbnailTab('url');
    setVideoThumbnailError(false);
    setVideoForm({
      id: `vid-${Date.now()}`,
      clientName: '',
      role: '',
      company: '',
      location: '',
      thumbnailUrl: `/images/testimonials/founder-${(videos.length % 3) + 1}.jpg`,
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-41315-large.mp4',
      durationText: '1:30',
      metricHighlight: '+100% Growth',
      quote: '',
      isActive: true,
    });
    setVideoModalOpen(true);
  };

  const openEditVideo = (index: number) => {
    setEditingVideoIndex(index);
    const vid = videos[index];
    setVideoThumbnailError(false);
    if (vid?.thumbnailUrl?.startsWith('data:image')) {
      setVideoThumbnailTab('upload');
    } else {
      setVideoThumbnailTab('url');
    }
    setVideoForm({
      ...vid,
      clientName: vid?.clientName || (vid as any)?.name || '',
      durationText: vid?.durationText || (vid as any)?.duration || '',
      quote: vid?.quote || (vid as any)?.quoteSnippet || '',
    });
    setVideoModalOpen(true);
  };

  const saveVideoForm = async () => {
    const clientName = (videoForm.clientName || (videoForm as any)?.name || '').trim();
    if (!clientName) {
      notify.error('Executive/Client name is required.');
      return;
    }
    const updated = [...videos];
    const duration = videoForm.durationText || (videoForm as any)?.duration || '1:30';
    const quote = videoForm.quote || (videoForm as any)?.quoteSnippet || '';
    const videoData: VideoTestimonial = {
      ...videoForm,
      id: (editingVideoIndex !== null && updated[editingVideoIndex]?.id) || videoForm.id || `vid-${Date.now()}`,
      clientName,
      name: clientName,
      role: videoForm.role || '',
      company: videoForm.company || '',
      location: videoForm.location || '',
      thumbnailUrl: videoForm.thumbnailUrl || '/images/testimonials/founder-1.jpg',
      videoUrl: videoForm.videoUrl || '',
      durationText: duration,
      duration: duration,
      metricHighlight: videoForm.metricHighlight || '',
      quote: quote,
      quoteSnippet: quote,
      isActive: videoForm.isActive ?? true,
    };
    if (editingVideoIndex !== null && editingVideoIndex >= 0) {
      updated[editingVideoIndex] = {
        ...updated[editingVideoIndex],
        ...videoData,
      };
    } else {
      updated.push(videoData);
    }

    const nextPayload = updatePayload({ videoTestimonials: updated });
    setVideoModalOpen(false);
    if (nextPayload) await handleSaveAll(nextPayload);
  };

  const deleteVideo = async (index: number) => {
    const updated = videos.filter((_, i) => i !== index);
    const nextPayload = updatePayload({ videoTestimonials: updated });
    setDeleteDialog({ open: false, type: 'video', index: -1, title: '' });
    if (nextPayload) await handleSaveAll(nextPayload);
    notify.success('Video testimonial removed.');
  };

  const moveVideo = async (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= videos.length) return;
    const updated = [...videos];
    const temp = updated[index]!;
    updated[index] = updated[target]!;
    updated[target] = temp;
    const nextPayload = updatePayload({ videoTestimonials: updated });
    if (nextPayload) await handleSaveAll(nextPayload);
  };

  const toggleVideoStatus = async (index: number) => {
    const updated = [...videos];
    const current = updated[index];
    if (!current) return;
    const isNowActive = current.isActive === false;
    updated[index] = { ...current, isActive: isNowActive };
    const nextPayload = updatePayload({ videoTestimonials: updated });
    if (nextPayload) await handleSaveAll(nextPayload);
    notify.success(`Video testimonial set to ${isNowActive ? 'Public' : 'Draft'}.`);
  };

  // ─── Review CRUD Helpers ───────────────────────────────────────────────────────
  const openCreateReview = () => {
    setEditingReviewIndex(null);
    setReviewAvatarTab('url');
    setReviewAvatarError(false);
    setReviewForm({
      id: `text-${Date.now()}`,
      clientName: '',
      role: '',
      company: '',
      location: '',
      avatarUrl: `/images/testimonials/avatar-${(reviews.length % 4) + 1}.jpg`,
      rating: 5,
      content: '',
      quote: '',
      isFeatured: false,
      isRepeatClient: true,
      projectType: 'Web Development',
      isActive: true,
    });
    setReviewModalOpen(true);
  };

  const openEditReview = (index: number) => {
    setEditingReviewIndex(index);
    const rev = reviews[index];
    setReviewAvatarError(false);
    if (rev?.avatarUrl?.startsWith('data:image')) {
      setReviewAvatarTab('upload');
    } else {
      setReviewAvatarTab('url');
    }
    setReviewForm({
      ...rev,
      clientName: rev?.clientName || (rev as any)?.name || '',
      content: rev?.content || rev?.quote || '',
      quote: rev?.content || rev?.quote || '',
    });
    setReviewModalOpen(true);
  };

  const saveReviewForm = async () => {
    const clientName = (reviewForm.clientName || (reviewForm as any)?.name || '').trim();
    if (!clientName) {
      notify.error('Client name is required.');
      return;
    }
    const quoteContent = (reviewForm.content || reviewForm.quote || '').trim();
    if (!quoteContent) {
      notify.error('Review quote text is required.');
      return;
    }

    const updated = [...reviews];
    const reviewData: TextTestimonial = {
      ...reviewForm,
      id: (editingReviewIndex !== null && updated[editingReviewIndex]?.id) || reviewForm.id || `text-${Date.now()}`,
      clientName,
      name: clientName,
      role: reviewForm.role || '',
      company: reviewForm.company || '',
      location: reviewForm.location || '',
      avatarUrl: reviewForm.avatarUrl || '/images/testimonials/avatar-1.jpg',
      rating: reviewForm.rating ?? 5,
      content: quoteContent,
      quote: quoteContent,
      isFeatured: reviewForm.isFeatured ?? false,
      isRepeatClient: reviewForm.isRepeatClient ?? true,
      projectType: reviewForm.projectType || 'Web Development',
      isActive: reviewForm.isActive ?? true,
    };
    if (editingReviewIndex !== null && editingReviewIndex >= 0) {
      updated[editingReviewIndex] = {
        ...updated[editingReviewIndex],
        ...reviewData,
      };
    } else {
      updated.push(reviewData);
    }

    // If marked featured, remove featured from others
    if (reviewForm.isFeatured) {
      const idx = editingReviewIndex !== null && editingReviewIndex >= 0 ? editingReviewIndex : updated.length - 1;
      updated.forEach((r, i) => {
        if (i !== idx) r.isFeatured = false;
      });
    }

    const nextPayload = updatePayload({ textTestimonials: updated });
    setReviewModalOpen(false);
    if (nextPayload) await handleSaveAll(nextPayload);
  };

  const toggleReviewStatus = async (index: number) => {
    const updated = [...reviews];
    const current = updated[index];
    if (!current) return;
    const isNowActive = current.isActive === false;
    updated[index] = { ...current, isActive: isNowActive };
    const nextPayload = updatePayload({ textTestimonials: updated });
    if (nextPayload) await handleSaveAll(nextPayload);
    notify.success(`Review set to ${isNowActive ? 'Public' : 'Draft'}.`);
  };

  const deleteReview = async (index: number) => {
    const updated = reviews.filter((_, i) => i !== index);
    const nextPayload = updatePayload({ textTestimonials: updated });
    setDeleteDialog({ open: false, type: 'review', index: -1, title: '' });
    if (nextPayload) await handleSaveAll(nextPayload);
    notify.success('Review testimonial removed.');
  };

  const moveReview = async (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= reviews.length) return;
    const updated = [...reviews];
    const temp = updated[index]!;
    updated[index] = updated[target]!;
    updated[target] = temp;
    const nextPayload = updatePayload({ textTestimonials: updated });
    if (nextPayload) await handleSaveAll(nextPayload);
  };

  // ─── Bulk Review Handlers ──────────────────────────────────────────────────
  const isAllReviewsSelected =
    reviews.length > 0 && reviews.every((_, idx) => selectedReviews.has(idx));

  const handleSelectAllReviews = (checked: boolean) => {
    if (checked) {
      setSelectedReviews(new Set(reviews.map((_, idx) => idx)));
    } else {
      setSelectedReviews(new Set());
    }
  };

  const handleToggleSelectReview = (idx: number, checked: boolean) => {
    const next = new Set(selectedReviews);
    if (checked) {
      next.add(idx);
    } else {
      next.delete(idx);
    }
    setSelectedReviews(next);
  };

  const handleBulkDeleteReviews = async () => {
    if (selectedReviews.size === 0) return;
    setIsBulkProcessingReviews(true);
    try {
      const count = selectedReviews.size;
      const updated = reviews.filter((_, idx) => !selectedReviews.has(idx));
      const nextPayload = updatePayload({ textTestimonials: updated });
      if (nextPayload) await handleSaveAll(nextPayload);
      setSelectedReviews(new Set());
      setBulkDeleteReviewConfirm(false);
      notify.success(`${count} client reviews deleted successfully.`);
    } catch {
      notify.error('Failed to delete selected reviews.');
    } finally {
      setIsBulkProcessingReviews(false);
    }
  };

  const handleBulkFeatureReviews = async (featured: boolean) => {
    if (selectedReviews.size === 0) return;
    setIsBulkProcessingReviews(true);
    try {
      const count = selectedReviews.size;
      const updated = reviews.map((rev, idx) =>
        selectedReviews.has(idx) ? { ...rev, isFeatured: featured } : rev
      );
      const nextPayload = updatePayload({ textTestimonials: updated });
      if (nextPayload) await handleSaveAll(nextPayload);
      setSelectedReviews(new Set());
      notify.success(`${count} client reviews updated.`);
    } catch {
      notify.error('Failed to update review features.');
    } finally {
      setIsBulkProcessingReviews(false);
    }
  };

  const handleBulkRepeatReviews = async (isRepeat: boolean) => {
    if (selectedReviews.size === 0) return;
    setIsBulkProcessingReviews(true);
    try {
      const count = selectedReviews.size;
      const updated = reviews.map((rev, idx) =>
        selectedReviews.has(idx) ? { ...rev, isRepeatClient: isRepeat } : rev
      );
      const nextPayload = updatePayload({ textTestimonials: updated });
      if (nextPayload) await handleSaveAll(nextPayload);
      setSelectedReviews(new Set());
      notify.success(`${count} client reviews updated.`);
    } catch {
      notify.error('Failed to update repeat client status.');
    } finally {
      setIsBulkProcessingReviews(false);
    }
  };

  if (!mounted) {
    return (
      <AdminContentContainer variant="wide">
        <div className="h-10 w-72 bg-muted/60 rounded-xl animate-pulse" />
        <div className="h-64 bg-card rounded-2xl border border-border animate-pulse" />
      </AdminContentContainer>
    );
  }

  return (
    <AdminContentContainer variant="wide">
      {/* ── Standardized Page Header ───────────────────────────────────────────── */}
      <AdminPageHeader
        title="Client Testimonials & Endorsements"
        description="Manage executive video testimonials, verified enterprise client reviews, rating badges, and trust signals."
        status={
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[11px] font-semibold">
            Live CMS
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <a
              href={`${getSiteUrl()}/#testimonials`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>View on Site</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>

            <Button
              onClick={() => handleSaveAll()}
              disabled={saving || loading}
              size="sm"
              className="gap-1.5 shadow-xs cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        }
      />

      {/* ── KPI Metric Stats Strip ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 shadow-2xs flex items-center space-x-3.5">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-foreground">{videos.length}</div>
            <div className="text-xs text-muted-foreground font-medium">Video Testimonials</div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 shadow-2xs flex items-center space-x-3.5">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Quote className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-foreground">{reviews.length}</div>
            <div className="text-xs text-muted-foreground font-medium">Client Reviews</div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 shadow-2xs flex items-center space-x-3.5">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Star className="h-5 w-5 fill-amber-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-foreground">
              {p.ratingSummary?.ratingValue || 4.9} ★
            </div>
            <div className="text-xs text-muted-foreground font-medium">Verified Rating</div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 shadow-2xs flex items-center space-x-3.5">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-foreground">85%</div>
            <div className="text-xs text-muted-foreground font-medium">Repeat Client Rate</div>
          </div>
        </div>
      </div>

      {/* ── Loading State ─────────────────────────────────────────────────────── */}
      {loading && <AdminLoadingState message="Loading testimonials section..." />}

      {/* ── Main Tab Navigation ───────────────────────────────────────────────── */}
      {!loading && (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full space-y-5">
          <TabsList className="bg-muted/60 p-1.5 rounded-xl border border-border/60 inline-flex gap-1 h-auto">
            <TabsTrigger
              value="videos"
              className="rounded-lg py-2 px-4 text-xs font-bold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xs transition-all flex items-center gap-2"
            >
              <Video className="h-4 w-4" />
              <span>Video Testimonials</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
                {videos.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-lg py-2 px-4 text-xs font-bold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xs transition-all flex items-center gap-2"
            >
              <Quote className="h-4 w-4" />
              <span>Client Reviews</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
                {reviews.length}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* ── TAB 1: VIDEO TESTIMONIALS ───────────────────────────────────────── */}
          <TabsContent value="videos" className="focus-visible:outline-none space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-card border border-border shadow-2xs">
              <div>
                <h2 className="text-sm font-bold text-foreground">Founder Video Testimonials</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  High-converting portrait video cards with play buttons, metrics, and video modal playback.
                </p>
              </div>
              <Button
                onClick={openCreateVideo}
                size="sm"
                className="gap-1.5 shadow-xs cursor-pointer shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Video Testimonial
              </Button>
            </div>

            {/* ── Video Playback & Interaction Settings ── */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Film className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Video Playback & Interaction Settings</h3>
                    <p className="text-xs text-muted-foreground">Configure hover behavior, looping, and autoplay for video cards on the website</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Play on Hover */}
                <div className="flex items-start justify-between p-3.5 rounded-xl border border-border bg-muted/30">
                  <div className="space-y-0.5 pr-3">
                    <div className="text-xs font-bold text-foreground">Play on Hover Preview</div>
                    <div className="text-[11px] text-muted-foreground leading-normal">
                      Stream muted video automatically when desktop visitors hover over a video card.
                    </div>
                  </div>
                  <Switch
                    checked={p.playOnHover ?? false}
                    onCheckedChange={(val) => {
                      const next = updatePayload({ playOnHover: val });
                      if (next) handleSaveAll(next);
                    }}
                  />
                </div>

                {/* 2. Loop on Finish */}
                <div className="flex items-start justify-between p-3.5 rounded-xl border border-border bg-muted/30">
                  <div className="space-y-0.5 pr-3">
                    <div className="text-xs font-bold text-foreground">Loop Video on Finish</div>
                    <div className="text-[11px] text-muted-foreground leading-normal">
                      Automatically replay the video when it reaches the end instead of stopping at the final frame.
                    </div>
                  </div>
                  <Switch
                    checked={p.loopVideos ?? false}
                    onCheckedChange={(val) => {
                      const next = updatePayload({ loopVideos: val });
                      if (next) handleSaveAll(next);
                    }}
                  />
                </div>

                {/* 3. Single-Active Playback */}
                <div className="flex items-start justify-between p-3.5 rounded-xl border border-border bg-muted/30">
                  <div className="space-y-0.5 pr-3">
                    <div className="text-xs font-bold text-foreground">Single-Active Video Mode</div>
                    <div className="text-[11px] text-muted-foreground leading-normal">
                      Starting a new video automatically pauses any other video and returns the old card to its photo.
                    </div>
                  </div>
                  <Switch
                    checked={p.autoplayVideos ?? true}
                    onCheckedChange={(val) => {
                      const next = updatePayload({ autoplayVideos: val });
                      if (next) handleSaveAll(next);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {videos.map((vid, idx) => {
                const name = vid.clientName || vid.name || 'Client';
                const role = vid.role || '';
                const company = vid.company || '';
                const thumb = vid.thumbnailUrl || '/images/testimonials/founder-1.jpg';

                return (
                  <div
                    key={vid.id || idx}
                    className="group relative bg-card rounded-xl border border-border overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col"
                  >
                    {/* Portrait Thumbnail Container */}
                    <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                      <img
                        src={thumb}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Centered Play Pill */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-10 w-10 rounded-full bg-white/30 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-lg">
                          <Play className="h-4 w-4 fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="font-bold text-sm text-foreground truncate">{name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {role} {company ? `· ${company}` : ''}
                        </div>
                        {vid.quote && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2 italic">
                            &ldquo;{vid.quote}&rdquo;
                          </p>
                        )}
                      </div>

                      {/* Actions Bar */}
                      <div className="flex items-center justify-between pt-3 border-t border-border/60">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveVideo(idx, 'up')}
                            disabled={idx === 0}
                            title="Move Left"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveVideo(idx, 'down')}
                            disabled={idx === videos.length - 1}
                            title="Move Right"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleVideoStatus(idx)}
                            className="cursor-pointer transition-transform hover:scale-105 active:scale-95 ml-1"
                            title={vid.isActive !== false ? 'Public: Click to switch to Draft' : 'Draft: Click to publish Public'}
                          >
                            <Badge
                              variant="outline"
                              className={
                                vid.isActive !== false
                                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-semibold'
                                  : 'bg-muted text-muted-foreground border-border text-[10px] font-semibold'
                              }
                            >
                              {vid.isActive !== false ? 'Public' : 'Draft'}
                            </Badge>
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditVideo(idx)}
                            className="h-8 px-2.5 text-xs hover:text-primary hover:bg-primary/10 rounded-lg cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setDeleteDialog({
                                open: true,
                                type: 'video',
                                index: idx,
                                title: `Video Testimonial for "${name}"`,
                              })
                            }
                            className="h-8 px-2.5 text-xs hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {videos.length === 0 && (
                <div className="col-span-3">
                  <AdminEmptyState
                    icon={Video}
                    title="No video testimonials yet"
                    description='Click &quot;Add Video Testimonial&quot; to add founder video stories.'
                    action={{ label: 'Add Video Testimonial', onClick: openCreateVideo, icon: Plus }}
                  />
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── TAB 2: CLIENT TEXT REVIEWS ──────────────────────────────────────── */}
          <TabsContent value="reviews" className="focus-visible:outline-none space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-card border border-border shadow-2xs">
              <div>
                <h2 className="text-sm font-bold text-foreground">Client Reviews & Endorsements</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Verified text reviews, 5-star ratings, repeat client tags, and featured endorsement cards.
                </p>
              </div>
              <Button
                onClick={openCreateReview}
                size="sm"
                className="gap-1.5 shadow-xs cursor-pointer shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Client Review
              </Button>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-2xs">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="w-10 text-center">
                      <Checkbox
                        checked={isAllReviewsSelected}
                        onCheckedChange={(c) => handleSelectAllReviews(!!c)}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead className="w-12 text-center text-xs font-bold text-muted-foreground">#</TableHead>
                    <TableHead className="text-xs font-bold text-muted-foreground">Client / Executive</TableHead>
                    <TableHead className="text-xs font-bold text-muted-foreground">Rating</TableHead>
                    <TableHead className="text-xs font-bold text-muted-foreground">Badges</TableHead>
                    <TableHead className="w-24 text-center text-xs font-bold text-muted-foreground">Status</TableHead>
                    <TableHead className="text-xs font-bold text-muted-foreground max-w-xs">Quote Snippet</TableHead>
                    <TableHead className="text-xs font-bold text-muted-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedReviews.map((rev, localIdx) => {
                    const idx = (reviewsPage - 1) * reviewsPageSize + localIdx;
                    const name = rev.clientName || rev.name || 'Client';
                    const role = rev.role || '';
                    const company = rev.company || '';
                    const avatar = rev.avatarUrl || '/images/testimonials/avatar-1.jpg';
                    const rating = rev.rating || 5;
                    const quote = rev.content || rev.quote || '';

                    return (
                      <TableRow
                        key={rev.id || idx}
                        className={`border-border hover:bg-muted/30 transition-colors ${
                          selectedReviews.has(idx) ? 'bg-primary/5' : ''
                        }`}
                      >
                        <TableCell className="w-10 text-center" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedReviews.has(idx)}
                            onCheckedChange={(c) => handleToggleSelectReview(idx, !!c)}
                            aria-label={`Select review ${idx + 1}`}
                          />
                        </TableCell>
                        <TableCell className="text-center font-mono text-xs text-muted-foreground">
                          {idx + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <img
                              src={avatar}
                              alt={name}
                              className="h-9 w-9 rounded-full object-cover border border-border shrink-0"
                            />
                            <div>
                              <div className="font-bold text-xs text-foreground">{name}</div>
                              <div className="text-[11px] text-muted-foreground">
                                {role} {company ? `· ${company}` : ''}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-amber-400 text-xs">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                                }`}
                              />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5">
                            {rev.isFeatured && (
                              <Badge className="bg-foreground text-background hover:bg-foreground/90 text-[10px] font-bold">
                                Featured Dark Card
                              </Badge>
                            )}
                            {rev.isRepeatClient && (
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold">
                                Repeat Client
                              </Badge>
                            )}
                            {rev.projectType && (
                              <Badge variant="outline" className="text-[10px]">
                                {rev.projectType}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <button
                            type="button"
                            onClick={() => toggleReviewStatus(idx)}
                            className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
                            title={rev.isActive !== false ? 'Public: Click to switch to Draft' : 'Draft: Click to publish Public'}
                          >
                            <Badge
                              variant="outline"
                              className={
                                rev.isActive !== false
                                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-semibold'
                                  : 'bg-muted text-muted-foreground border-border text-[10px] font-semibold'
                              }
                            >
                              {rev.isActive !== false ? 'Public' : 'Draft'}
                            </Badge>
                          </button>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-xs text-muted-foreground line-clamp-2 italic">
                            &ldquo;{quote}&rdquo;
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveReview(idx, 'up')}
                              disabled={idx === 0}
                              title="Move Up"
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveReview(idx, 'down')}
                              disabled={idx === reviews.length - 1}
                              title="Move Down"
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditReview(idx)}
                              className="h-8 px-2 text-xs hover:text-primary hover:bg-primary/10 rounded-lg cursor-pointer"
                            >
                              <Pencil className="h-3.5 w-3.5 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setDeleteDialog({
                                  open: true,
                                  type: 'review',
                                  index: idx,
                                  title: `Review from "${name}"`,
                                })
                              }
                              className="h-8 px-2 text-xs hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {reviews.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-xs">
                        No client reviews added yet. Click &ldquo;Add Client Review&rdquo; above.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {reviews.length > 0 && (
                <TablePagination
                  currentPage={reviewsPage}
                  totalItems={reviews.length}
                  pageSize={reviewsPageSize}
                  onPageChange={setReviewsPage}
                  onPageSizeChange={setReviewsPageSize}
                  itemLabel="reviews"
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* ── Floating Bulk Action Dock for Reviews ───────────────────────── */}
      {activeTab === 'reviews' && selectedReviews.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center space-x-2.5 rounded-xl border border-border bg-card/95 px-5 py-2.5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="text-xs font-semibold text-foreground pr-2 border-r border-border">
            {selectedReviews.size} selected
          </span>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs rounded-lg border-border hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/20 cursor-pointer"
            onClick={() => handleBulkFeatureReviews(true)}
          >
            <Star className="h-3.5 w-3.5 mr-1 text-emerald-600 fill-emerald-500" />
            <span>Feature</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs rounded-lg border-border hover:bg-muted cursor-pointer"
            onClick={() => handleBulkFeatureReviews(false)}
          >
            <Star className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
            <span>Unfeature</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs rounded-lg border-border hover:bg-muted cursor-pointer"
            onClick={() => handleBulkRepeatReviews(true)}
          >
            <ShieldCheck className="h-3.5 w-3.5 mr-1 text-primary" />
            <span>Repeat Client</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            className="h-8 text-xs rounded-lg cursor-pointer"
            onClick={() => setBulkDeleteReviewConfirm(true)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            <span>Delete</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground hover:text-foreground rounded-lg ml-1 cursor-pointer"
            onClick={() => setSelectedReviews(new Set())}
          >
            Clear
          </Button>
        </div>
      )}

      {/* ── Bulk Delete Reviews Dialog ────────────────────────────────────── */}
      <ConfirmDialog
        open={bulkDeleteReviewConfirm}
        onOpenChange={(open) => !open && setBulkDeleteReviewConfirm(false)}
        title={`Delete ${selectedReviews.size} Client Reviews?`}
        description={`Are you sure you want to delete ${selectedReviews.size} selected reviews? This will permanently remove them from the live homepage testimonial slider.`}
        confirmLabel={isBulkProcessingReviews ? 'Deleting...' : `Delete ${selectedReviews.size} Reviews`}
        variant="destructive"
        onConfirm={handleBulkDeleteReviews}
      />

      {/* ── Video Modal Dialog ────────────────────────────────────────────────── */}
      <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[92vh] rounded-2xl border-border bg-card shadow-2xl p-0 flex flex-col overflow-hidden">
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-border shrink-0">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  {editingVideoIndex !== null ? 'Edit Video Testimonial' : 'Add Video Testimonial'}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Configure founder video story details, video asset URL, and thumbnail.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Row 1: Executive Name & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Executive Name <span className="text-destructive">*</span>
                </label>
                <Input
                  value={videoForm.clientName || ''}
                  onChange={(e) => setVideoForm((v) => ({ ...v, clientName: e.target.value }))}
                  placeholder="e.g. Sarah Jenkins"
                  className="text-xs rounded-xl"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Company / Brand</label>
                <Input
                  value={videoForm.company || ''}
                  onChange={(e) => setVideoForm((v) => ({ ...v, company: e.target.value }))}
                  placeholder="e.g. Meridian Health"
                  className="text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Row 2: Role / Title & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Role / Title</label>
                <Input
                  value={videoForm.role || ''}
                  onChange={(e) => setVideoForm((v) => ({ ...v, role: e.target.value }))}
                  placeholder="e.g. CEO & Founder"
                  className="text-xs rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Location</label>
                <Input
                  value={videoForm.location || ''}
                  onChange={(e) => setVideoForm((v) => ({ ...v, location: e.target.value }))}
                  placeholder="e.g. San Francisco, CA"
                  className="text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Row 3: Metric Pill & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Metric Highlight Pill</label>
                <Input
                  value={videoForm.metricHighlight || ''}
                  onChange={(e) => setVideoForm((v) => ({ ...v, metricHighlight: e.target.value }))}
                  placeholder="e.g. +140% patient signups"
                  className="text-xs rounded-xl text-emerald-600 font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Duration (e.g. 1:45)</label>
                <Input
                  value={videoForm.durationText || ''}
                  onChange={(e) => setVideoForm((v) => ({ ...v, durationText: e.target.value }))}
                  placeholder="1:45"
                  className="text-xs rounded-xl font-mono"
                />
              </div>
            </div>

            {/* Row 4: Thumbnail Image (Direct Upload / URL) */}
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <span>Thumbnail Image</span>
                  <span className="text-muted-foreground font-normal text-[11px]">(Portrait 3:4 recommended)</span>
                </label>
                <div className="inline-flex rounded-lg p-0.5 bg-muted border border-border">
                  <button
                    type="button"
                    onClick={() => setVideoThumbnailTab('upload')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      videoThumbnailTab === 'upload'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Upload className="h-3 w-3" />
                    Direct Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoThumbnailTab('url')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      videoThumbnailTab === 'url'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Link2 className="h-3 w-3" />
                    Image URL
                  </button>
                </div>
              </div>

              <input
                ref={videoFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleVideoThumbnailSelect(e.target.files[0]);
                }}
              />

              {videoThumbnailTab === 'upload' ? (
                videoForm.thumbnailUrl ? (
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/40">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-14 w-12 rounded-lg bg-neutral-900 border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                        {!videoThumbnailError ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={videoForm.thumbnailUrl}
                            alt="Thumbnail Preview"
                            className="h-full w-full object-cover"
                            onError={() => setVideoThumbnailError(true)}
                          />
                        ) : (
                          <ImageOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          Founder Thumbnail Image
                        </p>
                        <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                          Thumbnail ready
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => videoFileInputRef.current?.click()}
                        className="text-xs h-8 cursor-pointer"
                      >
                        Change
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setVideoForm((v) => ({ ...v, thumbnailUrl: '' }))}
                        className="text-xs h-8 text-destructive hover:bg-destructive/10 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => videoFileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border hover:border-primary/60 rounded-xl cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors text-center"
                  >
                    <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                    <p className="text-xs font-medium text-foreground">Click to upload executive thumbnail</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">PNG, JPG, WebP up to 5MB</p>
                  </div>
                )
              ) : (
                <div className="space-y-2">
                  <Input
                    value={videoForm.thumbnailUrl || ''}
                    onChange={(e) => {
                      setVideoThumbnailError(false);
                      setVideoForm((v) => ({ ...v, thumbnailUrl: e.target.value }));
                    }}
                    placeholder="https://... or /images/testimonials/founder-1.jpg"
                    className="text-xs font-mono rounded-xl"
                  />
                  {videoForm.thumbnailUrl && (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-muted/40">
                      <div className="h-14 w-12 rounded-lg bg-neutral-900 border border-border overflow-hidden shrink-0 flex items-center justify-center">
                        {!videoThumbnailError ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={videoForm.thumbnailUrl}
                            alt="Thumbnail Preview"
                            className="h-full w-full object-cover"
                            onError={() => setVideoThumbnailError(true)}
                          />
                        ) : (
                          <ImageOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground truncate">
                          {videoThumbnailError ? 'Invalid image URL or failed to load' : 'Thumbnail loaded successfully'}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">{videoForm.thumbnailUrl}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Row 5: Video Asset URL & Live Video Preview */}
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-primary" />
                  <span>Video Asset URL</span>
                  <span className="text-muted-foreground font-normal text-[11px]">(Direct MP4, WebM, or CDN link)</span>
                </label>
                {videoForm.videoUrl && (
                  <a
                    href={videoForm.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-primary hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open Asset
                  </a>
                )}
              </div>
              <Input
                value={videoForm.videoUrl || ''}
                onChange={(e) => setVideoForm((v) => ({ ...v, videoUrl: e.target.value }))}
                placeholder="https://assets.mixkit.co/videos/preview/..."
                className="text-xs font-mono rounded-xl"
              />

              {/* In-Modal Live Video Preview Player */}
              {videoForm.videoUrl ? (
                <div className="rounded-xl border border-border overflow-hidden bg-black/90 p-2.5">
                  <div className="text-[11px] text-muted-foreground mb-2 flex items-center justify-between px-1">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <Play className="w-3 h-3" /> Live Video Preview
                    </span>
                    <span className="text-[10px]">Verify stream playback inside dialog</span>
                  </div>
                  <video
                    key={videoForm.videoUrl}
                    src={videoForm.videoUrl}
                    controls
                    preload="metadata"
                    playsInline
                    className="w-full max-h-52 rounded-lg bg-black object-contain shadow-inner"
                  />
                </div>
              ) : (
                <div className="p-3 rounded-xl border border-dashed border-border bg-muted/20 text-center">
                  <p className="text-[11px] text-muted-foreground">
                    Enter a video asset link above to preview video playback inside this dialog.
                  </p>
                </div>
              )}
            </div>

            {/* Row 6: Quote Snippet */}
            <div className="space-y-1.5 pt-2 border-t border-border">
              <label className="text-xs font-semibold text-foreground">Quote Snippet</label>
              <Textarea
                value={videoForm.quote || ''}
                onChange={(e) => setVideoForm((v) => ({ ...v, quote: e.target.value }))}
                placeholder="Working with Gypsym completely reshaped our conversion pipeline..."
                rows={3}
                className="text-xs rounded-xl"
              />
            </div>

            {/* Row 7: Publication Status Toggle */}
            <StatusToggleField
              value={videoForm.isActive === false ? 'DRAFT' : 'PUBLISHED'}
              onChange={(_status, isActive) => setVideoForm((v) => ({ ...v, isActive }))}
            />
          </div>

          <DialogFooter className="px-6 py-4 border-t border-border shrink-0 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setVideoModalOpen(false)}
              className="rounded-xl h-9 px-4 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={saveVideoForm}
              className="rounded-xl h-9 px-5 text-xs font-semibold cursor-pointer"
            >
              {editingVideoIndex !== null ? 'Update Video' : 'Add Video'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Review Modal Dialog ───────────────────────────────────────────────── */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[92vh] rounded-2xl border-border bg-card shadow-2xl p-0 flex flex-col overflow-hidden">
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-border shrink-0">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Quote className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  {editingReviewIndex !== null ? 'Edit Client Review' : 'Add Client Review'}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Configure verified review endorsement, rating, author info, and badges.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Row 1: Client Name & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Client Name <span className="text-destructive">*</span>
                </label>
                <Input
                  value={reviewForm.clientName || ''}
                  onChange={(e) => setReviewForm((r) => ({ ...r, clientName: e.target.value }))}
                  placeholder="e.g. David Chen"
                  className="text-xs rounded-xl"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Company / Brand</label>
                <Input
                  value={reviewForm.company || ''}
                  onChange={(e) => setReviewForm((r) => ({ ...r, company: e.target.value }))}
                  placeholder="e.g. Strata Cloud Systems"
                  className="text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Row 2: Role & Title & Project Type Badge */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Role & Title</label>
                <Input
                  value={reviewForm.role || ''}
                  onChange={(e) => setReviewForm((r) => ({ ...r, role: e.target.value }))}
                  placeholder="e.g. VP of Product"
                  className="text-xs rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Project Type Badge</label>
                <Input
                  value={reviewForm.projectType || ''}
                  onChange={(e) => setReviewForm((r) => ({ ...r, projectType: e.target.value }))}
                  placeholder="e.g. Full Platform Overhaul"
                  className="text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Row 3: Rating & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Star Rating</span>
                  <span className="text-amber-500 font-bold flex items-center gap-1">
                    {'★'.repeat(reviewForm.rating ?? 5)} ({reviewForm.rating ?? 5}/5)
                  </span>
                </label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={reviewForm.rating ?? 5}
                  onChange={(e) => setReviewForm((r) => ({ ...r, rating: parseInt(e.target.value) || 5 }))}
                  className="text-xs rounded-xl font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Location</label>
                <Input
                  value={reviewForm.location || ''}
                  onChange={(e) => setReviewForm((r) => ({ ...r, location: e.target.value }))}
                  placeholder="e.g. Toronto, Canada"
                  className="text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Row 4: Avatar Image (Direct Upload / URL) */}
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <span>Client Avatar</span>
                  <span className="text-muted-foreground font-normal text-[11px]">(Square 1:1 recommended)</span>
                </label>
                <div className="inline-flex rounded-lg p-0.5 bg-muted border border-border">
                  <button
                    type="button"
                    onClick={() => setReviewAvatarTab('upload')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      reviewAvatarTab === 'upload'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Upload className="h-3 w-3" />
                    Direct Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewAvatarTab('url')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      reviewAvatarTab === 'url'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Link2 className="h-3 w-3" />
                    Image URL
                  </button>
                </div>
              </div>

              <input
                ref={reviewFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleReviewAvatarSelect(e.target.files[0]);
                }}
              />

              {reviewAvatarTab === 'upload' ? (
                reviewForm.avatarUrl ? (
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/40">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-12 w-12 rounded-full bg-neutral-900 border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                        {!reviewAvatarError ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={reviewForm.avatarUrl}
                            alt="Avatar Preview"
                            className="h-full w-full object-cover"
                            onError={() => setReviewAvatarError(true)}
                          />
                        ) : (
                          <ImageOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          Client Avatar Photo
                        </p>
                        <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                          Avatar ready
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => reviewFileInputRef.current?.click()}
                        className="text-xs h-8 cursor-pointer"
                      >
                        Change
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setReviewForm((r) => ({ ...r, avatarUrl: '' }))}
                        className="text-xs h-8 text-destructive hover:bg-destructive/10 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => reviewFileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border hover:border-primary/60 rounded-xl cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors text-center"
                  >
                    <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                    <p className="text-xs font-medium text-foreground">Click to upload avatar photo</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">PNG, JPG, WebP up to 5MB</p>
                  </div>
                )
              ) : (
                <div className="space-y-2">
                  <Input
                    value={reviewForm.avatarUrl || ''}
                    onChange={(e) => {
                      setReviewAvatarError(false);
                      setReviewForm((r) => ({ ...r, avatarUrl: e.target.value }));
                    }}
                    placeholder="https://... or /images/testimonials/avatar-1.jpg"
                    className="text-xs font-mono rounded-xl"
                  />
                  {reviewForm.avatarUrl && (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-muted/40">
                      <div className="h-12 w-12 rounded-full bg-neutral-900 border border-border overflow-hidden shrink-0 flex items-center justify-center">
                        {!reviewAvatarError ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={reviewForm.avatarUrl}
                            alt="Avatar Preview"
                            className="h-full w-full object-cover"
                            onError={() => setReviewAvatarError(true)}
                          />
                        ) : (
                          <ImageOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground truncate">
                          {reviewAvatarError ? 'Invalid image URL or failed to load' : 'Avatar loaded successfully'}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">{reviewForm.avatarUrl}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Row 5: Review Quote */}
            <div className="space-y-1.5 pt-2 border-t border-border">
              <label className="text-xs font-semibold text-foreground">
                Review Quote <span className="text-destructive">*</span>
              </label>
              <Textarea
                value={reviewForm.content || reviewForm.quote || ''}
                onChange={(e) => setReviewForm((r) => ({ ...r, content: e.target.value, quote: e.target.value }))}
                placeholder="Before Gypsym, our conversion rate was stalled at 1.8%..."
                rows={4}
                className="text-xs rounded-xl"
              />
            </div>

            {/* Row 6: Badges & Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
                <div>
                  <div className="text-xs font-bold text-foreground">Repeat Client</div>
                  <div className="text-[10px] text-muted-foreground">Shows &lsquo;Repeat Client&rsquo; badge</div>
                </div>
                <Switch
                  checked={reviewForm.isRepeatClient ?? true}
                  onCheckedChange={(val) => setReviewForm((r) => ({ ...r, isRepeatClient: val }))}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
                <div>
                  <div className="text-xs font-bold text-foreground">Featured Card</div>
                  <div className="text-[10px] text-muted-foreground">Hero dark card on left</div>
                </div>
                <Switch
                  checked={reviewForm.isFeatured ?? false}
                  onCheckedChange={(val) => setReviewForm((r) => ({ ...r, isFeatured: val }))}
                />
              </div>
            </div>

            {/* Row 7: Publication Status */}
            <StatusToggleField
              value={reviewForm.isActive === false ? 'DRAFT' : 'PUBLISHED'}
              onChange={(_status, isActive) => setReviewForm((r) => ({ ...r, isActive }))}
            />
          </div>

          <DialogFooter className="px-6 py-4 border-t border-border shrink-0 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setReviewModalOpen(false)}
              className="rounded-xl h-9 px-4 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={saveReviewForm}
              className="rounded-xl h-9 px-5 text-xs font-semibold cursor-pointer"
            >
              {editingReviewIndex !== null ? 'Update Review' : 'Add Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ────────────────────────────────────────── */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(v) => !v && setDeleteDialog((d) => ({ ...d, open: false }))}
      >
        <DialogContent className="w-[95vw] max-w-sm rounded-2xl border-border/90 bg-card shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-sm font-bold text-foreground">Confirm Deletion</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  This item will be permanently removed.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-6 py-5 space-y-3">
            <p className="text-xs text-muted-foreground">
              Are you sure you want to delete <span className="font-semibold text-foreground">{deleteDialog.title}</span>?
            </p>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-border flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialog((d) => ({ ...d, open: false }))}
              className="rounded-xl h-9 px-4 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (deleteDialog.type === 'video') {
                  deleteVideo(deleteDialog.index);
                } else {
                  deleteReview(deleteDialog.index);
                }
              }}
              className="rounded-xl h-9 px-4 text-xs font-semibold cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminContentContainer>
  );
}
