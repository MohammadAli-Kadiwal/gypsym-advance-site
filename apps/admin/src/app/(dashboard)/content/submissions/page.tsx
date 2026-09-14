'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { fetchApi } from '@/lib/api-client';
import { notify } from '@/lib/notifications';
import {
  Inbox,
  Search,
  Mail,
  Building2,
  Calendar,
  ExternalLink,
  Trash2,
  Eye,
  X,
  RefreshCw,
  Archive,
  UserCheck,
} from 'lucide-react';

interface SubmissionItem {
  id: string;
  fullName: string;
  businessEmail: string;
  phone?: string | null;
  companyName?: string | null;
  projectDescription?: string | null;
  formId?: string | null;
  source?: string | null;
  submittedData?: Record<string, any>;
  status: 'NEW' | 'QUALIFIED' | 'ASSIGNED' | 'CONTACTED' | 'OPPORTUNITY' | 'DISQUALIFIED' | 'READ' | 'ARCHIVED';
  ipAddress?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  NEW: { label: 'New', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  READ: { label: 'Read', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  CONTACTED: { label: 'Contacted', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  QUALIFIED: { label: 'Qualified', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' },
  ASSIGNED: { label: 'Assigned', badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  OPPORTUNITY: { label: 'Opportunity', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  DISQUALIFIED: { label: 'Disqualified', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
  ARCHIVED: { label: 'Archived', badgeClass: 'bg-slate-100 text-slate-500 border-slate-200' },
};

export default function ContactSubmissionsPage() {
  const [items, setItems] = React.useState<SubmissionItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [selectedSubmission, setSelectedSubmission] = React.useState<SubmissionItem | null>(null);
  const [totalCount, setTotalCount] = React.useState(0);

  const loadSubmissions = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      params.set('limit', '50');

      const res = await fetchApi<{ items: SubmissionItem[]; total: number }>(`/inquiries?${params.toString()}`);
      if (res && Array.isArray(res.items)) {
        setItems(res.items);
        setTotalCount(res.total);
      }
    } catch {
      notify.error('Unable to load contact submissions.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  React.useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  // Status transition
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const updated = await fetchApi<SubmissionItem>(`/inquiries/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });

      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: updated.status } : item)));
      if (selectedSubmission?.id === id) {
        setSelectedSubmission((prev) => (prev ? { ...prev, status: updated.status } : null));
      }
      notify.success(`Status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}.`);
    } catch {
      notify.error('Unable to update submission status.');
    }
  };

  // Delete submission
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this submission record?')) return;
    try {
      await fetchApi(`/inquiries/${id}`, { method: 'DELETE' });
      setItems((prev) => prev.filter((item) => item.id !== id));
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(null);
      }
      notify.success('Submission record deleted.');
    } catch {
      notify.error('Unable to delete submission.');
    }
  };

  // Open detail and auto-mark NEW as READ
  const handleOpenDetail = (sub: SubmissionItem) => {
    setSelectedSubmission(sub);
    if (sub.status === 'NEW') {
      handleUpdateStatus(sub.id, 'READ');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Contact Submissions
            </h1>
            <Badge variant="outline" className="text-xs font-mono bg-blue-50 text-blue-700 border-blue-200">
              {totalCount} Total Inquiries
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Enterprise leads, inquiries, and inbound messages captured via homepage contact forms.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={loadSubmissions}
          className="rounded-xl h-9 px-3 text-xs font-semibold border-slate-200 hover:bg-slate-50 gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* ── Filter Bar ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by full name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl border-slate-200 bg-white"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'NEW', 'READ', 'CONTACTED', 'ARCHIVED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st === 'ALL' ? 'All' : STATUS_CONFIG[st]?.label || st}
            </button>
          ))}
        </div>
      </div>

      {/* ── Submissions Table ─────────────────────────────────────────────── */}
      <Card className="rounded-2xl border-slate-200/90 shadow-xs bg-white overflow-hidden">
        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Inbox className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-800">No contact submissions found</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {search ? 'Try adjusting your search keywords or status filter.' : 'Inbound inquiries from the homepage contact form will appear here.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4">Received</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((sub) => {
                    const stConf = STATUS_CONFIG[sub.status] ?? {
                      label: sub.status,
                      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
                    };
                    return (
                      <tr
                        key={sub.id}
                        onClick={() => handleOpenDetail(sub)}
                        className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                          sub.status === 'NEW' ? 'bg-blue-50/30 font-medium' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              {sub.fullName}
                              {sub.status === 'NEW' && (
                                <span className="inline-block w-2 h-2 rounded-full bg-blue-600" />
                              )}
                            </div>
                            <div className="text-slate-500 flex items-center gap-1 text-[11px]">
                              <Mail className="w-3 h-3" />
                              <span>{sub.businessEmail}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-700">
                          {sub.companyName ? (
                            <div className="flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              <span>{sub.companyName}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">—</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <Badge variant="outline" className={`text-[10px] font-semibold ${stConf.badgeClass}`}>
                            {stConf.label}
                          </Badge>
                        </td>

                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {sub.source || 'Homepage'}
                        </td>

                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {new Date(sub.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>

                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDetail(sub)}
                              className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(sub.id)}
                              className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              title="Delete Submission"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Slide-over Detail Drawer ──────────────────────────────────────── */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{selectedSubmission.fullName}</h3>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold ${
                      STATUS_CONFIG[selectedSubmission.status]?.badgeClass || ''
                    }`}
                  >
                    {STATUS_CONFIG[selectedSubmission.status]?.label || selectedSubmission.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Submitted on {new Date(selectedSubmission.createdAt).toLocaleString('en-GB')}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="h-8 w-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Quick Status Bar */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-600">Update Status:</span>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant={selectedSubmission.status === 'CONTACTED' ? 'default' : 'outline'}
                    onClick={() => handleUpdateStatus(selectedSubmission.id, 'CONTACTED')}
                    className="h-7 px-2.5 text-[11px] rounded-lg gap-1 font-semibold"
                  >
                    <UserCheck className="w-3 h-3" />
                    Contacted
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={selectedSubmission.status === 'ARCHIVED' ? 'default' : 'outline'}
                    onClick={() => handleUpdateStatus(selectedSubmission.id, 'ARCHIVED')}
                    className="h-7 px-2.5 text-[11px] rounded-lg gap-1 font-semibold"
                  >
                    <Archive className="w-3 h-3" />
                    Archive
                  </Button>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                  Contact Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Email Address</span>
                    <a
                      href={`mailto:${selectedSubmission.businessEmail}`}
                      className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1 mt-0.5"
                    >
                      {selectedSubmission.businessEmail}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Phone Number</span>
                    <span className="text-slate-800 font-medium block mt-0.5">
                      {selectedSubmission.phone || '—'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Company Organization</span>
                    <span className="text-slate-800 font-medium block mt-0.5">
                      {selectedSubmission.companyName || '—'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Form Identifier</span>
                    <span className="text-slate-800 font-mono text-[11px] block mt-0.5">
                      {selectedSubmission.formId || 'homepage-contact'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Submitted Form Fields */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                  Submitted Form Data
                </h4>
                {selectedSubmission.submittedData && Object.keys(selectedSubmission.submittedData).length > 0 ? (
                  <div className="space-y-2 border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100">
                    {Object.entries(selectedSubmission.submittedData).map(([key, val]) => (
                      <div key={key} className="p-3 bg-white flex flex-col sm:flex-row sm:items-start justify-between gap-2 text-xs">
                        <span className="font-semibold text-slate-600 capitalize sm:w-1/3 shrink-0">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="text-slate-900 sm:w-2/3 whitespace-pre-wrap break-words">
                          {typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No additional dynamic fields provided.</p>
                )}
              </div>

              {/* Project Description / Message if specified */}
              {selectedSubmission.projectDescription && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                    Message / Project Scope
                  </h4>
                  <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                    {selectedSubmission.projectDescription}
                  </div>
                </div>
              )}

              {/* Technical Tracking Context */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                  Technical Metadata
                </h4>
                <div className="p-3 bg-slate-50/40 rounded-xl border border-slate-100 font-mono text-[11px] text-slate-500 space-y-1">
                  <div><strong>IP Address:</strong> {selectedSubmission.ipAddress || 'unknown'}</div>
                  {selectedSubmission.utmSource && <div><strong>UTM Source:</strong> {selectedSubmission.utmSource}</div>}
                  {selectedSubmission.utmMedium && <div><strong>UTM Medium:</strong> {selectedSubmission.utmMedium}</div>}
                  {selectedSubmission.utmCampaign && <div><strong>UTM Campaign:</strong> {selectedSubmission.utmCampaign}</div>}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDelete(selectedSubmission.id)}
                className="rounded-xl h-9 text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50 gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Submission
              </Button>

              <a
                href={`mailto:${selectedSubmission.businessEmail}?subject=Re: Enterprise Inquiry - Gypsym Technology`}
                className="inline-flex items-center gap-1.5 px-4 h-9 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
              >
                <Mail className="w-3.5 h-3.5" />
                Reply via Email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
