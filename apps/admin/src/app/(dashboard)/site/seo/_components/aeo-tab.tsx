'use client';

import * as React from 'react';
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit2,
  Search,
  Sparkles,
  Bot,
  Filter,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { seoService, AeoItemData } from '@/services/seo.service';
import { TablePagination } from '@/components/ui/table-pagination';

export function AeoTab() {
  const [items, setItems] = React.useState<AeoItemData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [topicFilter, setTopicFilter] = React.useState('all');

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<AeoItemData | null>(null);
  const [previewItem, setPreviewItem] = React.useState<AeoItemData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  // Form State
  const [question, setQuestion] = React.useState('');
  const [shortAnswer, setShortAnswer] = React.useState('');
  const [detailedAnswer, setDetailedAnswer] = React.useState('');
  const [relatedPageSlug, setRelatedPageSlug] = React.useState('');
  const [relatedServiceSlug, setRelatedServiceSlug] = React.useState('');
  const [topic, setTopic] = React.useState('');
  const [entity, setEntity] = React.useState('');
  const [priority, setPriority] = React.useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [status, setStatus] = React.useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');

  const loadAeo = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await seoService.getAeo();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      notify.error({ title: 'Failed to load AEO items', description: normalizeErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadAeo();
  }, [loadAeo]);

  const uniqueTopics = React.useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.topic) set.add(i.topic);
    });
    return Array.from(set);
  }, [items]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setQuestion('');
    setShortAnswer('');
    setDetailedAnswer('');
    setRelatedPageSlug('');
    setRelatedServiceSlug('');
    setTopic('');
    setEntity('');
    setPriority('HIGH');
    setStatus('PUBLISHED');
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: AeoItemData) => {
    setEditingItem(item);
    setQuestion(item.question);
    setShortAnswer(item.shortAnswer);
    setDetailedAnswer(item.detailedAnswer || '');
    setRelatedPageSlug(item.relatedPageSlug || '');
    setRelatedServiceSlug(item.relatedServiceSlug || '');
    setTopic(item.topic || '');
    setEntity(item.entity || '');
    setPriority(item.priority || 'HIGH');
    setStatus(item.status || 'PUBLISHED');
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !shortAnswer.trim()) {
      notify.error({ title: 'Validation error', description: 'Question and direct short answer are required.' });
      return;
    }

    try {
      setSaving(true);
      const payload: Omit<AeoItemData, 'id'> = {
        question: question.trim(),
        shortAnswer: shortAnswer.trim(),
        detailedAnswer: detailedAnswer.trim() || undefined,
        relatedPageSlug: relatedPageSlug.trim() || undefined,
        relatedServiceSlug: relatedServiceSlug.trim() || undefined,
        topic: topic.trim() || undefined,
        entity: entity.trim() || undefined,
        priority,
        status,
      };

      if (editingItem) {
        await seoService.updateAeo(editingItem.id, payload);
        notify.success({ title: 'AEO entry updated', description: 'The question and direct answer were updated.' });
      } else {
        await seoService.createAeo(payload);
        notify.success({ title: 'AEO entry created', description: 'New AEO question added to the knowledge graph.' });
      }
      setIsDialogOpen(false);
      loadAeo();
    } catch (err) {
      notify.error({ title: 'Failed to save AEO entry', description: normalizeErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      setSaving(true);
      await seoService.deleteAeo(deletingId);
      notify.success({ title: 'AEO entry deleted', description: 'The item was removed from AEO knowledge graph.' });
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
      loadAeo();
    } catch (err) {
      notify.error({ title: 'Failed to delete AEO entry', description: normalizeErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.question.toLowerCase().includes(search.toLowerCase()) ||
        item.shortAnswer.toLowerCase().includes(search.toLowerCase()) ||
        (item.topic && item.topic.toLowerCase().includes(search.toLowerCase())) ||
        (item.entity && item.entity.toLowerCase().includes(search.toLowerCase()));

      const matchTopic = topicFilter === 'all' || item.topic === topicFilter;
      return matchSearch && matchTopic;
    });
  }, [items, search, topicFilter]);

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const paginatedItems = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page, pageSize]);

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Answer Engine Optimization (AEO)
              </CardTitle>
              <CardDescription>
                Structure authoritative Q&A blocks, entities, and direct answer summaries for AI engines (Perplexity, ChatGPT, Google Search Generative Experience).
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadAeo} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button size="sm" onClick={handleOpenAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search & Topic Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions, answers, topics or entities..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            {uniqueTopics.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={topicFilter}
                  onChange={(e) => { setTopicFilter(e.target.value); setPage(1); }}
                  className="h-9 px-3 rounded-md border bg-background text-sm"
                >
                  <option value="all">All Topics ({items.length})</option>
                  {uniqueTopics.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Table / List */}
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground animate-pulse">
              Loading AEO knowledge entries...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-12 text-center border rounded-lg bg-muted/20">
              <HelpCircle className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <h3 className="font-semibold text-sm">No AEO entries found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {search ? 'Try clearing your search query.' : 'Create direct factual answers to position Gypsym Technology in AI response snippets.'}
              </p>
              {!search && (
                <Button size="sm" variant="outline" className="mt-4" onClick={handleOpenAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Question
                </Button>
              )}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b text-xs font-semibold text-muted-foreground text-left">
                  <tr>
                    <th className="p-3">Question & Direct Answer</th>
                    <th className="p-3">Topic / Entity</th>
                    <th className="p-3">Linked Page</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 max-w-[360px]">
                        <div className="font-semibold text-foreground text-sm flex items-start gap-1.5">
                          <HelpCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>{item.question}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2 pl-5">
                          {item.shortAnswer}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-1 items-start">
                          {item.topic && (
                            <Badge variant="outline" className="text-[11px] font-medium bg-muted/50">
                              {item.topic}
                            </Badge>
                          )}
                          {item.entity && (
                            <span className="text-[11px] text-muted-foreground">Entity: {item.entity}</span>
                          )}
                          {!item.topic && !item.entity && <span className="text-xs text-muted-foreground">—</span>}
                        </div>
                      </td>
                      <td className="p-3 text-xs font-mono text-muted-foreground">
                        {item.relatedPageSlug ? `/${item.relatedPageSlug}` : item.relatedServiceSlug ? `/services/${item.relatedServiceSlug}` : 'Global'}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant="outline"
                          className={
                            item.priority === 'HIGH'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                              : item.priority === 'MEDIUM'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                              : 'bg-muted text-muted-foreground'
                          }
                        >
                          {item.priority || 'NORMAL'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant="secondary"
                          className={
                            item.status === 'PUBLISHED'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-muted text-muted-foreground'
                          }
                        >
                          {item.status || 'PUBLISHED'}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setPreviewItem(item)} title="Preview Answer Block">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
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

          {filteredItems.length > 0 && (
            <TablePagination
              currentPage={page}
              totalItems={filteredItems.length}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              itemLabel="entries"
            />
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit AEO Question' : 'Add Direct AEO Question'}</DialogTitle>
              <DialogDescription>
                Define concise answers that generative models can quote verbatim in answer boxes.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="question">Primary Question *</Label>
                <Input
                  id="question"
                  placeholder="e.g. What enterprise cloud platforms does Gypsym Technology build?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="shortAnswer">Direct / Short Answer (Answer Engine Target) *</Label>
                  <span className="text-[11px] text-muted-foreground">{shortAnswer.length} chars (aim 120-250)</span>
                </div>
                <Textarea
                  id="shortAnswer"
                  placeholder="Concise factual statement summarizing the answer directly in 1-3 sentences without marketing fluff..."
                  value={shortAnswer}
                  onChange={(e) => setShortAnswer(e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="detailedAnswer">Detailed Answer / Explanation (Optional)</Label>
                <Textarea
                  id="detailedAnswer"
                  placeholder="In-depth technical supporting context, architectural guarantees, or methodology details..."
                  value={detailedAnswer}
                  onChange={(e) => setDetailedAnswer(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="topic">Topic Cluster</Label>
                  <Input
                    id="topic"
                    placeholder="e.g. Enterprise Cloud, FinTech"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="entity">Primary Entity</Label>
                  <Input
                    id="entity"
                    placeholder="e.g. Next.js, Kubernetes"
                    value={entity}
                    onChange={(e) => setEntity(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="relatedPageSlug">Related Page Slug</Label>
                  <Input
                    id="relatedPageSlug"
                    placeholder="e.g. services or about"
                    value={relatedPageSlug}
                    onChange={(e) => setRelatedPageSlug(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="relatedServiceSlug">Related Service Slug</Label>
                  <Input
                    id="relatedServiceSlug"
                    placeholder="e.g. enterprise-cloud"
                    value={relatedServiceSlug}
                    onChange={(e) => setRelatedServiceSlug(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full h-9 px-3 rounded-md border bg-background text-sm"
                  >
                    <option value="HIGH">High (Primary featured snippet)</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="status">Publish Status</Label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full h-9 px-3 rounded-md border bg-background text-sm"
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingItem ? 'Update Q&A' : 'Save Q&A'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Answer Engine Snippet Preview Dialog */}
      <Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Answer Engine Direct Preview
            </DialogTitle>
            <DialogDescription>
              Simulation of how AI search models and search answer cards retrieve this content.
            </DialogDescription>
          </DialogHeader>

          {previewItem && (
            <div className="space-y-4 py-3">
              {/* Simulated Perplexity / Google SGE card */}
              <div className="p-4 rounded-xl border bg-card/60 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <Bot className="h-4 w-4 text-primary" />
                  Direct Answer Synthesis
                </div>
                <h4 className="text-base font-bold text-foreground">{previewItem.question}</h4>
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm text-foreground font-medium leading-relaxed">
                  {previewItem.shortAnswer}
                </div>
                {previewItem.detailedAnswer && (
                  <div className="text-xs text-muted-foreground leading-relaxed pt-1">
                    {previewItem.detailedAnswer}
                  </div>
                )}
                <div className="pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <span>Topic: {previewItem.topic || 'General'}</span>
                  <span>Entity: {previewItem.entity || 'Gypsym'}</span>
                </div>
              </div>

              {/* JSON-LD representation */}
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-muted-foreground">Structured Schema (FAQPage snippet):</div>
                <pre className="p-3 rounded-md bg-muted/60 font-mono text-[11px] overflow-x-auto">
{JSON.stringify({
  "@type": "Question",
  "name": previewItem.question,
  "acceptedAnswer": {
    "@type": "Answer",
    "text": previewItem.shortAnswer
  }
}, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewItem(null)}>
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete AEO Item?</DialogTitle>
            <DialogDescription>
              This will remove the question and direct answer from the public answer engine semantic block.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? 'Deleting...' : 'Delete Entry'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
