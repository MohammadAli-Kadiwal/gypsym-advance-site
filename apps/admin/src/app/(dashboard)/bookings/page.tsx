'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { fetchApi } from '@/lib/api-client';
import { notify } from '@/lib/notifications';
import {
  CalendarCheck,
  Search,
  Mail,
  Store,
  Calendar,
  ExternalLink,
  Trash2,
  Eye,
  X,
  RefreshCw,
  Video,
  CheckCircle2,
  XCircle,
  Clock3,
  Sliders,
  Copy,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';

interface BookingItem {
  id: string;
  bookingNumber: string;
  fullName: string;
  email: string;
  phone?: string | null;
  storeUrl?: string | null;
  notes?: string | null;
  date: string;
  slotTime: string;
  timezone: string;
  hostTimezone: string;
  hostSlotTime?: string | null;
  utcStartTime: string;
  durationMinutes: number;
  status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'PENDING';
  meetingLink?: string | null;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string; icon: any }> = {
  CONFIRMED: {
    label: 'Confirmed',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
  PENDING: {
    label: 'Pending',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock3,
  },
  COMPLETED: {
    label: 'Completed',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Cancelled',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: XCircle,
  },
  NO_SHOW: {
    label: 'No Show',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: XCircle,
  },
};

export default function BookingsManagementPage() {
  const [items, setItems] = React.useState<BookingItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [selectedBooking, setSelectedBooking] = React.useState<BookingItem | null>(null);
  const [deleteTargetId, setDeleteTargetId] = React.useState<string | null>(null);
  const [adminNotesInput, setAdminNotesInput] = React.useState('');
  const [savingNotes, setSavingNotes] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);

  // Metrics
  const [metrics, setMetrics] = React.useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
  });

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());
      params.set('limit', '50');

      const [resList, resMetrics] = await Promise.all([
        fetchApi<any>(`/bookings?${params.toString()}`),
        fetchApi<any>('/bookings/metrics').catch(() => null),
      ]);

      if (resList) {
        setItems(resList.items || resList.data?.items || []);
      }
      if (resMetrics) {
        setMetrics(resMetrics.data || resMetrics);
      }
    } catch {
      notify.error('Failed to load discovery bookings.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadData]);

  // Handle status update
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await fetchApi(`/bookings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      notify.success(`Booking status changed to ${newStatus}`);
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking({ ...selectedBooking, status: newStatus as any });
      }
      loadData();
    } catch {
      notify.error('Failed to update status.');
    }
  };

  // Handle save internal admin notes
  const handleSaveAdminNotes = async () => {
    if (!selectedBooking) return;
    setSavingNotes(true);
    try {
      await fetchApi(`/bookings/${selectedBooking.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: selectedBooking.status,
          adminNotes: adminNotesInput,
        }),
      });
      notify.success('Internal notes saved.');
      setSelectedBooking({ ...selectedBooking, adminNotes: adminNotesInput });
      loadData();
    } catch {
      notify.error('Failed to save notes.');
    } finally {
      setSavingNotes(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await fetchApi(`/bookings/${deleteTargetId}`, {
        method: 'DELETE',
      });
      notify.success('Booking deleted.');
      if (selectedBooking?.id === deleteTargetId) {
        setSelectedBooking(null);
      }
      setDeleteTargetId(null);
      loadData();
    } catch {
      notify.error('Failed to delete booking.');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Discovery Call Bookings
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage scheduled Shopify discovery sessions, timezone conversions, and client notes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(true)}
            className="text-xs font-semibold gap-1.5 h-9 rounded-xl"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Booking Settings</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData()}
            className="text-xs font-semibold gap-1.5 h-9 rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* ── KPI Metric Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-slate-200/80 shadow-xs">
          <CardContent className="p-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Bookings
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {metrics.total}
            </div>
            <span className="text-[11px] text-slate-500">All-time reservations</span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs">
          <CardContent className="p-4">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
              Upcoming Calls
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {metrics.upcoming}
            </div>
            <span className="text-[11px] text-slate-500">Confirmed & future</span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs">
          <CardContent className="p-4">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
              Completed
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {metrics.completed}
            </div>
            <span className="text-[11px] text-slate-500">Finished strategy calls</span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs">
          <CardContent className="p-4">
            <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">
              Cancelled / No-Show
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {metrics.cancelled}
            </div>
            <span className="text-[11px] text-slate-500">Inactive bookings</span>
          </CardContent>
        </Card>
      </div>

      {/* ── Filter & Search Bar ─────────────────────────────────── */}
      <Card className="rounded-2xl border-slate-200/80 shadow-xs">
        <CardContent className="p-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by client, store, email or #..."
              className="pl-9 h-9 text-xs rounded-xl bg-slate-50 border-slate-200"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
            {['ALL', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All' : STATUS_CONFIG[st]?.label || st}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Bookings Data Table ─────────────────────────────────── */}
      <Card className="rounded-2xl border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Booking #</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Store URL</th>
                <th className="py-3 px-4">Scheduled Date</th>
                <th className="py-3 px-4">Visitor Time (Local)</th>
                <th className="py-3 px-4">Host Time (IST)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
                    <span>Loading bookings...</span>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No bookings found matching current filters.
                  </td>
                </tr>
              ) : (
                items.map((b) => {
                  const st = STATUS_CONFIG[b.status] || {
                    label: b.status || 'Confirmed',
                    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
                    icon: CheckCircle2,
                  };
                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedBooking(b);
                        setAdminNotesInput(b.adminNotes || '');
                      }}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {b.bookingNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{b.fullName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>{b.email}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {b.storeUrl ? (
                          <a
                            href={b.storeUrl.startsWith('http') ? b.storeUrl : `https://${b.storeUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-blue-600 hover:underline max-w-[160px] truncate"
                          >
                            <Store className="w-3 h-3 shrink-0" />
                            <span className="truncate">{b.storeUrl.replace(/^https?:\/\//, '')}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{b.date}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{b.slotTime}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                          {b.timezone}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-700">
                          {b.hostSlotTime || '—'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${st.badgeClass}`}
                        >
                          {st.label}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(b);
                              setAdminNotesInput(b.adminNotes || '');
                            }}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTargetId(b.id)}
                            className="h-8 w-8 p-0 text-rose-500 hover:bg-rose-50"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Booking Details Drawer / Modal ──────────────────────── */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  BOOKING DETAILS
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {selectedBooking.bookingNumber} · {selectedBooking.fullName}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedBooking(null)}
                className="h-8 w-8 p-0 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Quick Status Bar */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
              <span className="text-xs font-semibold text-slate-700">Change Status:</span>
              <div className="flex items-center gap-1.5">
                {(['CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] as const).map((st) => {
                  const cfg = STATUS_CONFIG[st];
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(selectedBooking.id, st)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        selectedBooking.status === st
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cfg?.label || st}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grid Information */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Contact Email</span>
                <div className="font-semibold text-slate-900">{selectedBooking.email}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Shopify Store</span>
                <div className="font-semibold text-slate-900 truncate">
                  {selectedBooking.storeUrl || 'Not provided'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Scheduled Time (Visitor)
                </span>
                <div className="font-semibold text-slate-900">
                  {selectedBooking.date} at {selectedBooking.slotTime}
                </div>
                <div className="text-[10px] text-slate-500">{selectedBooking.timezone}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Host Time (Gujarat/IST)
                </span>
                <div className="font-semibold text-slate-900">
                  {selectedBooking.hostSlotTime || '—'}
                </div>
                <div className="text-[10px] text-slate-500">Asia/Kolkata (IST)</div>
              </div>
            </div>

            {/* Meeting Link */}
            {selectedBooking.meetingLink && (
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-blue-900">
                  <Video className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold font-mono truncate max-w-[280px]">
                    {selectedBooking.meetingLink}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] bg-white text-blue-700 hover:bg-blue-50"
                    onClick={() => {
                      if (selectedBooking.meetingLink) {
                        navigator.clipboard.writeText(selectedBooking.meetingLink);
                        notify.success('Meeting link copied!');
                      }
                    }}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    <span>Copy</span>
                  </Button>
                  <a
                    href={selectedBooking.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Client Notes */}
            {selectedBooking.notes && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Client Discussion Topics
                </label>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                  {selectedBooking.notes}
                </div>
              </div>
            )}

            {/* Admin Internal Notes */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">
                Internal Staff Notes
              </label>
              <textarea
                rows={3}
                value={adminNotesInput}
                onChange={(e) => setAdminNotesInput(e.target.value)}
                placeholder="Add meeting notes, audit outcomes, or follow-up action items..."
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  disabled={savingNotes}
                  onClick={handleSaveAdminNotes}
                  className="text-xs h-8 bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
                >
                  {savingNotes ? 'Saving...' : 'Save Notes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Settings Modal ──────────────────────────────────────── */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Booking Engine Settings</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
                className="h-7 w-7 p-0 rounded-full text-slate-400"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Host Timezone</label>
                <Input value="Asia/Kolkata (IST: UTC +5:30)" readOnly className="bg-slate-50 text-xs" />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Working Days</label>
                <Input value="Monday – Friday" readOnly className="bg-slate-50 text-xs" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Start Time</label>
                  <Input value="10:00 AM IST" readOnly className="bg-slate-50 text-xs" />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">End Time</label>
                  <Input value="07:00 PM IST" readOnly className="bg-slate-50 text-xs" />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Slot Duration</label>
                <Input value="30 Minutes (per session)" readOnly className="bg-slate-50 text-xs" />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                size="sm"
                onClick={() => setShowSettings(false)}
                className="text-xs h-8 rounded-xl bg-blue-600 text-white"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Delete Dialog ───────────────────────────────── */}
      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
        }}
        title="Delete Booking"
        description="Are you sure you want to delete this discovery booking? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
