'use client';

import * as React from 'react';
import {
  MessageSquareQuote,
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
    setVideoForm({ ...videos[index] });
    setVideoModalOpen(true);
  };

  const saveVideoForm = async () => {
    if (!videoForm.clientName?.trim()) {
      notify.error('Executive/Client name is required.');
      return;
    }
    const updated = [...videos];
    if (editingVideoIndex !== null && editingVideoIndex >= 0) {
      updated[editingVideoIndex] = {
        ...updated[editingVideoIndex],
        ...videoForm,
        id: updated[editingVideoIndex]?.id || `vid-${Date.now()}`,
      } as VideoTestimonial;
    } else {
      updated.push({
        id: videoForm.id || `vid-${Date.now()}`,
        clientName: videoForm.clientName || 'Client',
        role: videoForm.role || '',
        company: videoForm.company || '',
        location: videoForm.location || '',
        thumbnailUrl: videoForm.thumbnailUrl || '/images/testimonials/founder-1.jpg',
        videoUrl: videoForm.videoUrl || '',
        durationText: videoForm.durationText || '1:30',
        metricHighlight: videoForm.metricHighlight || '',
        quote: videoForm.quote || '',
        isActive: videoForm.isActive ?? true,
      } as VideoTestimonial);
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

  // ─── Review CRUD Helpers ───────────────────────────────────────────────────────
  const openCreateReview = () => {
    setEditingReviewIndex(null);
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
    setReviewForm({ ...reviews[index] });
    setReviewModalOpen(true);
  };

  const saveReviewForm = async () => {
    if (!reviewForm.clientName?.trim()) {
      notify.error('Client name is required.');
      return;
    }
    const quoteContent = reviewForm.content || reviewForm.quote || '';
    if (!quoteContent.trim()) {
      notify.error('Review quote text is required.');
      return;
    }

    const updated = [...reviews];
    if (editingReviewIndex !== null && editingReviewIndex >= 0) {
      updated[editingReviewIndex] = {
        ...updated[editingReviewIndex],
        ...reviewForm,
        content: quoteContent,
        quote: quoteContent,
        id: updated[editingReviewIndex]?.id || `text-${Date.now()}`,
      } as TextTestimonial;
    } else {
      updated.push({
        id: reviewForm.id || `text-${Date.now()}`,
        clientName: reviewForm.clientName || 'Executive',
        role: reviewForm.role || '',
        company: reviewForm.company || '',
        location: reviewForm.location || '',
        avatarUrl: reviewForm.avatarUrl || '/images/testimonials/avatar-1.jpg',
        rating: reviewForm.rating ?? 5,
        content: quoteContent,
        quote: quoteContent,
        isFeatured: reviewForm.isFeatured ?? false,
        isRepeatClient: reviewForm.isRepeatClient ?? true,
        projectType: reviewForm.projectType || 'Platform Engineering',
        isActive: reviewForm.isActive ?? true,
      } as TextTestimonial);
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

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto py-8 space-y-4">
        <div className="h-8 w-64 bg-slate-200/60 rounded-xl animate-pulse" />
        <div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-4 space-y-6 animate-in fade-in-50 duration-200">
      {/* ── Page Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/10 shrink-0">
            <MessageSquareQuote className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Client Testimonials & Endorsements
              </h1>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[11px] font-semibold">
                Live CMS
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Manage executive video testimonials, verified enterprise client reviews, rating badges, and trust signals.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <a
            href="http://localhost:3000/#testimonials"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>View on Site</span>
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </a>

          <Button
            onClick={() => handleSaveAll()}
            disabled={saving || loading}
            className="rounded-xl h-9 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── KPI Metric Stats Strip ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center space-x-3.5">
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{videos.length}</div>
            <div className="text-xs text-slate-500 font-medium">Video Testimonials</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center space-x-3.5">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Quote className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{reviews.length}</div>
            <div className="text-xs text-slate-500 font-medium">Client Reviews</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center space-x-3.5">
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Star className="h-5 w-5 fill-amber-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">
              {p.ratingSummary?.ratingValue || 4.9} ★
            </div>
            <div className="text-xs text-slate-500 font-medium">Verified Rating</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center space-x-3.5">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">85%</div>
            <div className="text-xs text-slate-500 font-medium">Repeat Client Rate</div>
          </div>
        </div>
      </div>

      {/* ── Main Tab Navigation ───────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full space-y-5">
        <TabsList className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 inline-flex gap-1 h-auto">
          <TabsTrigger
            value="videos"
            className="rounded-xl py-2 px-4 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs transition-all flex items-center gap-2"
          >
            <Video className="h-4 w-4" />
            <span>Video Testimonials</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200/70 text-slate-600 font-semibold">
              {videos.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="rounded-xl py-2 px-4 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs transition-all flex items-center gap-2"
          >
            <Quote className="h-4 w-4" />
            <span>Client Reviews</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200/70 text-slate-600 font-semibold">
              {reviews.length}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: VIDEO TESTIMONIALS ───────────────────────────────────────── */}
        <TabsContent value="videos" className="focus-visible:outline-none space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Founder Video Testimonials</h2>
              <p className="text-xs text-slate-500">
                High-converting portrait video cards with play buttons, metrics, and video modal playback.
              </p>
            </div>
            <Button
              onClick={openCreateVideo}
              className="rounded-xl h-9 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Video Testimonial
            </Button>
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
                  className="group relative bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                >
                  {/* Portrait Thumbnail Container */}
                  <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
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
                      <div className="font-bold text-sm text-slate-900 truncate">{name}</div>
                      <div className="text-xs text-slate-500 truncate">
                        {role} {company ? `· ${company}` : ''}
                      </div>
                      {vid.quote && (
                        <p className="text-xs text-slate-600 mt-2 line-clamp-2 italic">
                          &ldquo;{vid.quote}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Actions Bar */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveVideo(idx, 'up')}
                          disabled={idx === 0}
                          title="Move Left"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveVideo(idx, 'down')}
                          disabled={idx === videos.length - 1}
                          title="Move Right"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditVideo(idx)}
                          className="h-8 px-2.5 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
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
                          className="h-8 px-2.5 text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
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
              <div className="col-span-3 p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                <Video className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <div className="text-sm font-semibold text-slate-700">No video testimonials yet</div>
                <p className="text-xs text-slate-400 mt-1">
                  Click &ldquo;Add Video Testimonial&rdquo; to add founder video stories.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── TAB 2: CLIENT TEXT REVIEWS ──────────────────────────────────────── */}
        <TabsContent value="reviews" className="focus-visible:outline-none space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Client Reviews & Endorsements</h2>
              <p className="text-xs text-slate-500">
                Verified text reviews, 5-star ratings, repeat client tags, and featured endorsement cards.
              </p>
            </div>
            <Button
              onClick={openCreateReview}
              className="rounded-xl h-9 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Client Review
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-slate-50/75">
                <TableRow className="border-slate-100 hover:bg-transparent">
                  <TableHead className="w-12 text-center text-xs font-bold text-slate-600">#</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600">Client / Executive</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600">Rating</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600">Badges</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 max-w-xs">Quote Snippet</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((rev, idx) => {
                  const name = rev.clientName || rev.name || 'Client';
                  const role = rev.role || '';
                  const company = rev.company || '';
                  const avatar = rev.avatarUrl || '/images/testimonials/avatar-1.jpg';
                  const rating = rev.rating || 5;
                  const quote = rev.content || rev.quote || '';

                  return (
                    <TableRow key={rev.id || idx} className="border-slate-100 hover:bg-slate-50/50">
                      <TableCell className="text-center font-mono text-xs text-slate-400">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img
                            src={avatar}
                            alt={name}
                            className="h-9 w-9 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-xs text-slate-900">{name}</div>
                            <div className="text-[11px] text-slate-500">
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
                                i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {rev.isFeatured && (
                            <Badge className="bg-neutral-900 text-white hover:bg-neutral-800 text-[10px] font-bold">
                              Featured Dark Card
                            </Badge>
                          )}
                          {rev.isRepeatClient && (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold">
                              Repeat Client
                            </Badge>
                          )}
                          {rev.projectType && (
                            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-[10px]">
                              {rev.projectType}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-xs text-slate-600 line-clamp-2 italic">
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
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveReview(idx, 'down')}
                            disabled={idx === reviews.length - 1}
                            title="Move Down"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditReview(idx)}
                            className="h-8 px-2 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
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
                            className="h-8 px-2 text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
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
                    <TableCell colSpan={6} className="text-center py-12 text-slate-400 text-xs">
                      No client reviews added yet. Click &ldquo;Add Client Review&rdquo; above.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Video Modal Dialog ────────────────────────────────────────────────── */}
      <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
        <DialogContent className="w-[95vw] max-w-lg rounded-2xl border-slate-200/90 bg-white shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-sm font-bold text-slate-900">
                  {editingVideoIndex !== null ? 'Edit Video Testimonial' : 'Add Video Testimonial'}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Configure founder video story details, video asset URL, and thumbnail.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Executive Name *</label>
                <Input
                  value={videoForm.clientName || ''}
                  onChange={(e) => setVideoForm((v) => ({ ...v, clientName: e.target.value }))}
                  placeholder="e.g. Sarah Jenkins"
                  className="text-xs rounded-xl"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Company / Brand</label>
                <Input
                  value={videoForm.company || ''}
                  onChange={(e) => setVideoForm((v) => ({ ...v, company: e.target.value }))}
                  placeholder="e.g. Meridian Health"
                  className="text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Role / Title</label>
                <Input
                  value={videoForm.role || ''}
                  onChange={(e) => setVideoForm((v) => ({ ...v, role: e.target.value }))}
                  placeholder="e.g. CEO & Founder"
                  className="text-xs rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Metric Highlight Pill</label>
                <Input
                  value={videoForm.metricHighlight || ''}
                  onChange={(e) => setVideoForm((v) => ({ ...v, metricHighlight: e.target.value }))}
                  placeholder="e.g. +140% patient signups"
                  className="text-xs rounded-xl text-emerald-600 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Duration (e.g. 1:45)</label>
                <Input
                  value={videoForm.durationText || ''}
                  onChange={(e) => setVideoForm((v) => ({ ...v, durationText: e.target.value }))}
                  placeholder="1:45"
                  className="text-xs rounded-xl font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Thumbnail Image URL</label>
                <Input
                  value={videoForm.thumbnailUrl || ''}
                  onChange={(e) => setVideoForm((v) => ({ ...v, thumbnailUrl: e.target.value }))}
                  placeholder="/images/testimonials/founder-1.jpg"
                  className="text-xs rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Video Asset URL (MP4)</label>
              <Input
                value={videoForm.videoUrl || ''}
                onChange={(e) => setVideoForm((v) => ({ ...v, videoUrl: e.target.value }))}
                placeholder="https://assets.mixkit.co/videos/preview/..."
                className="text-xs rounded-xl font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Quote Snippet</label>
              <Textarea
                value={videoForm.quote || ''}
                onChange={(e) => setVideoForm((v) => ({ ...v, quote: e.target.value }))}
                placeholder="Working with Gypsym completely reshaped our conversion pipeline..."
                rows={3}
                className="text-xs rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setVideoModalOpen(false)}
              className="rounded-xl h-9 px-4 text-xs font-semibold border-slate-200"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={saveVideoForm}
              className="rounded-xl h-9 px-5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
            >
              {editingVideoIndex !== null ? 'Update Video' : 'Add Video'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Review Modal Dialog ───────────────────────────────────────────────── */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="w-[95vw] max-w-lg rounded-2xl border-slate-200/90 bg-white shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Quote className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-sm font-bold text-slate-900">
                  {editingReviewIndex !== null ? 'Edit Client Review' : 'Add Client Review'}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Configure verified review endorsement, rating, author info, and badges.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Client Name *</label>
                <Input
                  value={reviewForm.clientName || ''}
                  onChange={(e) => setReviewForm((r) => ({ ...r, clientName: e.target.value }))}
                  placeholder="e.g. David Chen"
                  className="text-xs rounded-xl"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Company / Brand</label>
                <Input
                  value={reviewForm.company || ''}
                  onChange={(e) => setReviewForm((r) => ({ ...r, company: e.target.value }))}
                  placeholder="e.g. Strata Cloud Systems"
                  className="text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Role & Title</label>
                <Input
                  value={reviewForm.role || ''}
                  onChange={(e) => setReviewForm((r) => ({ ...r, role: e.target.value }))}
                  placeholder="e.g. VP of Product"
                  className="text-xs rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Project Type Badge</label>
                <Input
                  value={reviewForm.projectType || ''}
                  onChange={(e) => setReviewForm((r) => ({ ...r, projectType: e.target.value }))}
                  placeholder="e.g. Full Platform Overhaul"
                  className="text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Star Rating (1-5)</label>
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
                <label className="text-xs font-semibold text-slate-700">Avatar Image URL</label>
                <Input
                  value={reviewForm.avatarUrl || ''}
                  onChange={(e) => setReviewForm((r) => ({ ...r, avatarUrl: e.target.value }))}
                  placeholder="/images/testimonials/avatar-1.jpg"
                  className="text-xs rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Review Quote *</label>
              <Textarea
                value={reviewForm.content || reviewForm.quote || ''}
                onChange={(e) => setReviewForm((r) => ({ ...r, content: e.target.value, quote: e.target.value }))}
                placeholder="Before Gypsym, our conversion rate was stalled at 1.8%..."
                rows={4}
                className="text-xs rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div>
                  <div className="text-xs font-bold text-slate-800">Repeat Client</div>
                  <div className="text-[10px] text-slate-500">Shows &lsquo;Repeat Client&rsquo; badge</div>
                </div>
                <Switch
                  checked={reviewForm.isRepeatClient ?? true}
                  onCheckedChange={(val) => setReviewForm((r) => ({ ...r, isRepeatClient: val }))}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div>
                  <div className="text-xs font-bold text-slate-800">Featured Card</div>
                  <div className="text-[10px] text-slate-500">Hero dark card on left</div>
                </div>
                <Switch
                  checked={reviewForm.isFeatured ?? false}
                  onCheckedChange={(val) => setReviewForm((r) => ({ ...r, isFeatured: val }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setReviewModalOpen(false)}
              className="rounded-xl h-9 px-4 text-xs font-semibold border-slate-200"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={saveReviewForm}
              className="rounded-xl h-9 px-5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
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
        <DialogContent className="w-[95vw] max-w-sm rounded-2xl border-slate-200/90 bg-white shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-sm font-bold text-slate-900">Confirm Deletion</DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  This item will be permanently removed.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-6 py-5 space-y-3">
            <p className="text-xs text-slate-700">
              Are you sure you want to delete <span className="font-semibold">{deleteDialog.title}</span>?
            </p>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialog((d) => ({ ...d, open: false }))}
              className="rounded-xl h-9 px-4 text-xs font-semibold border-slate-200"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (deleteDialog.type === 'video') {
                  deleteVideo(deleteDialog.index);
                } else {
                  deleteReview(deleteDialog.index);
                }
              }}
              className="rounded-xl h-9 px-4 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
