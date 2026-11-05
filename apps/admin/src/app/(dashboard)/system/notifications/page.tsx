'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  useSystemNotifications,
  SystemNotificationItem,
} from '@/lib/system-notifications-context';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  ShieldCheck,
  Mail,
  CalendarCheck,
  Search,
  RefreshCw,
  ExternalLink,
  Trash2,
  Eye,
  X,
  Phone,
  Building2,
  Send,
  AlertTriangle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { AdminContentContainer, AdminPageHeader } from '@/components/layout/admin-page';

export default function NotificationsAdminPage() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    unreadInquiriesCount,
    unreadBookingsCount,
    unreadSystemCount,
    isLoading,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    markMultipleAsRead,
    deleteNotification,
    deleteMultipleNotifications,
    refresh,
  } = useSystemNotifications();

  const [activeTab, setActiveTab] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [inspectItem, setInspectItem] = React.useState<SystemNotificationItem | null>(null);

  // Bulk selection & deletion states
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [confirmBulkDeleteOpen, setConfirmBulkDeleteOpen] = React.useState<boolean>(false);
  const [confirmFilterDeleteOpen, setConfirmFilterDeleteOpen] = React.useState<boolean>(false);
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Filtered notifications
  const filteredNotifications = React.useMemo(() => {
    return notifications.filter((notif) => {
      // Tab filter
      if (activeTab === 'unread' && notif.isRead) return false;
      if (activeTab === 'inquiries' && notif.category !== 'INQUIRY') return false;
      if (activeTab === 'bookings' && notif.category !== 'BOOKING') return false;
      if (
        activeTab === 'system' &&
        notif.category !== 'SYSTEM' &&
        notif.category !== 'SECURITY'
      )
        return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = notif.title.toLowerCase().includes(query);
        const matchMessage = notif.message.toLowerCase().includes(query);
        const matchSender = notif.senderName?.toLowerCase().includes(query) ?? false;
        const matchEmail = notif.senderEmail?.toLowerCase().includes(query) ?? false;
        const matchCompany = notif.companyName?.toLowerCase().includes(query) ?? false;
        return matchTitle || matchMessage || matchSender || matchEmail || matchCompany;
      }

      return true;
    });
  }, [notifications, activeTab, searchQuery]);

  const inquiriesCount = React.useMemo(
    () => notifications.filter((n) => n.category === 'INQUIRY').length,
    [notifications]
  );

  const bookingsCount = React.useMemo(
    () => notifications.filter((n) => n.category === 'BOOKING').length,
    [notifications]
  );

  const systemCount = React.useMemo(
    () =>
      notifications.filter(
        (n) => n.category === 'SYSTEM' || n.category === 'SECURITY'
      ).length,
    [notifications]
  );

  // Filtered IDs in current view
  const filteredIds = React.useMemo(
    () => filteredNotifications.map((n) => n.id),
    [filteredNotifications]
  );

  const isAllSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selectedIds.has(id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredIds));
    }
  };

  const toggleSelect = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      const ids = Array.from(selectedIds);
      await deleteMultipleNotifications(ids);
      setSelectedIds(new Set());
      setConfirmBulkDeleteOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkMarkAsRead = async () => {
    const ids = Array.from(selectedIds);
    await markMultipleAsRead(ids);
  };

  const handleFilterDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMultipleNotifications(filteredIds);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredIds.forEach((id) => next.delete(id));
        return next;
      });
      setConfirmFilterDeleteOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const currentFilterLabel = React.useMemo(() => {
    if (searchQuery.trim()) {
      return `search results for "${searchQuery}"`;
    }
    switch (activeTab) {
      case 'unread':
        return 'all unread notifications';
      case 'inquiries':
        return 'all inquiries';
      case 'bookings':
        return 'all discovery call bookings';
      case 'system':
        return 'all system & security alerts';
      default:
        return 'all notifications';
    }
  }, [activeTab, searchQuery]);

  return (
    <AdminContentContainer variant="wide" className="space-y-6 pb-24">
      {/* ── Top Header (Strictly No Breadcrumbs) ── */}
      <AdminPageHeader
        title="System Notification Center"
        description="Real-time inbound inquiries, discovery bookings, and operational security signals."
        status={
          unreadCount > 0 ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-primary-foreground animate-pulse">
              {unreadCount} unread
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              All caught up
            </span>
          )
        }
        actions={
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isRefreshing}
              className="h-9 px-3 text-xs shadow-2xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>

            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                size="sm"
                className="h-9 px-3.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs font-semibold"
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                <span>Mark All Read</span>
              </Button>
            )}
          </div>
        }
      />

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Unread */}
        <Card
          onClick={() => setActiveTab('unread')}
          className={`cursor-pointer transition-all border p-4 ${
            activeTab === 'unread'
              ? 'border-primary bg-primary/10 ring-1 ring-primary'
              : 'border-border bg-card hover:border-primary/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Unread Signals</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Bell className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{unreadCount}</span>
            <span className="text-[11px] text-muted-foreground">awaiting review</span>
          </div>
        </Card>

        {/* Inbound Inquiries */}
        <Card
          onClick={() => setActiveTab('inquiries')}
          className={`cursor-pointer transition-all border p-4 ${
            activeTab === 'inquiries'
              ? 'border-primary bg-primary/10 ring-1 ring-primary'
              : 'border-border bg-card hover:border-primary/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Client Inquiries</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Mail className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{inquiriesCount}</span>
            {unreadInquiriesCount > 0 && (
              <span className="text-[11px] font-bold text-primary">
                {unreadInquiriesCount} new
              </span>
            )}
          </div>
        </Card>

        {/* Discovery Bookings */}
        <Card
          onClick={() => setActiveTab('bookings')}
          className={`cursor-pointer transition-all border p-4 ${
            activeTab === 'bookings'
              ? 'border-primary bg-primary/10 ring-1 ring-primary'
              : 'border-border bg-card hover:border-primary/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Discovery Calls</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{bookingsCount}</span>
            {unreadBookingsCount > 0 && (
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                {unreadBookingsCount} new
              </span>
            )}
          </div>
        </Card>

        {/* System & Security */}
        <Card
          onClick={() => setActiveTab('system')}
          className={`cursor-pointer transition-all border p-4 ${
            activeTab === 'system'
              ? 'border-primary bg-primary/10 ring-1 ring-primary'
              : 'border-border bg-card hover:border-primary/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Security & SEO</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{systemCount}</span>
            {unreadSystemCount > 0 && (
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                {unreadSystemCount} new
              </span>
            )}
          </div>
        </Card>
      </div>

      {/* Tabs and Search Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-card p-2 rounded-2xl border border-border shadow-2xs">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All', count: notifications.length },
            { id: 'unread', label: 'Unread', count: unreadCount, highlight: unreadCount > 0 },
            { id: 'inquiries', label: 'Inquiries', count: inquiriesCount },
            { id: 'bookings', label: 'Bookings', count: bookingsCount },
            { id: 'system', label: 'System', count: systemCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-foreground text-background shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === tab.id
                    ? 'bg-background/20 text-background'
                    : tab.highlight
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Live Search & Filter-wise Delete Option */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages, names..."
              className="pl-8 h-9 text-xs rounded-xl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {filteredNotifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmFilterDeleteOpen(true)}
              className="h-9 px-3 text-xs text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive/40 font-semibold gap-1.5 transition-colors shrink-0 cursor-pointer"
              title={`Delete all notifications matching ${currentFilterLabel}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Delete Filtered</span>
              <span className="sm:hidden">Delete</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-destructive/15 text-destructive font-bold">
                {filteredNotifications.length}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Floating / Sticky Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-4 z-20 flex flex-wrap items-center justify-between gap-3 p-3 px-4 bg-card/95 backdrop-blur border-2 border-primary/40 rounded-2xl shadow-lg transition-all animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={toggleSelectAll}
              id="bulk-bar-select-all"
              aria-label="Toggle select all in current view"
            />
            <label
              htmlFor="bulk-bar-select-all"
              className="text-xs font-bold text-foreground cursor-pointer select-none"
            >
              {selectedIds.size} {selectedIds.size === 1 ? 'item' : 'items'} selected
            </label>
            <button
              onClick={clearSelection}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 ml-1 cursor-pointer"
            >
              Deselect all
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkMarkAsRead}
              className="h-8 px-3 text-xs bg-card hover:bg-muted font-medium cursor-pointer"
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1.5 text-primary" />
              Mark as Read
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmBulkDeleteOpen(true)}
              className="h-8 px-3 text-xs shadow-2xs font-semibold gap-1.5 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Selected ({selectedIds.size})</span>
            </Button>
          </div>
        </div>
      )}

      {/* Select All in View Toolbar (when no bulk selection active) */}
      {filteredNotifications.length > 0 && selectedIds.size === 0 && (
        <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={toggleSelectAll}
              id="select-all-filtered-checkbox"
              aria-label="Select all notifications in current view"
            />
            <label
              htmlFor="select-all-filtered-checkbox"
              className="cursor-pointer select-none font-medium hover:text-foreground text-xs"
            >
              Select all {filteredNotifications.length} in this view
            </label>
          </div>
          <span className="font-mono text-[11px]">
            Showing {filteredNotifications.length} of {notifications.length}
          </span>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground bg-card rounded-2xl border border-border">
            <RefreshCw className="h-6 w-6 mx-auto animate-spin text-primary mb-2" />
            <p className="text-xs font-semibold text-foreground">Syncing live messages & notifications...</p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => {
            const isUnread = !notif.isRead;
            const isSelected = selectedIds.has(notif.id);
            return (
              <Card
                key={notif.id}
                onClick={() => toggleSelect(notif.id)}
                className={`p-4 transition-all rounded-2xl border relative overflow-hidden cursor-pointer select-none ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/30 bg-primary/[0.06] shadow-sm'
                    : isUnread
                    ? 'bg-primary/5 border-primary/30 shadow-2xs hover:border-primary/50'
                    : 'bg-card border-border hover:border-primary/40'
                }`}
              >
                {isUnread && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-2xl" />
                )}

                <div className="flex items-start gap-3 pl-1">
                  {/* Item Selection Checkbox */}
                  <div
                    className="flex items-center pt-2.5 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(notif.id)}
                      aria-label={`Select ${notif.title}`}
                    />
                  </div>

                  {/* Category Icon */}
                  <div
                    className={`rounded-2xl p-2.5 shrink-0 ${
                      notif.category === 'SECURITY'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        : notif.category === 'INQUIRY'
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : notif.category === 'BOOKING'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20'
                    }`}
                  >
                    {notif.category === 'SECURITY' ? (
                      <ShieldCheck className="h-4 w-4" />
                    ) : notif.category === 'INQUIRY' ? (
                      <Mail className="h-4 w-4" />
                    ) : notif.category === 'BOOKING' ? (
                      <CalendarCheck className="h-4 w-4" />
                    ) : (
                      <Bell className="h-4 w-4" />
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectItem(notif);
                          }}
                          className={`text-sm cursor-pointer hover:underline ${
                            isUnread ? 'font-bold text-foreground' : 'font-semibold text-foreground/80'
                          }`}
                        >
                          {notif.title}
                        </h4>

                        <span
                          className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                            notif.category === 'SECURITY'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                              : notif.category === 'INQUIRY'
                              ? 'bg-primary/10 text-primary border-primary/20'
                              : notif.category === 'BOOKING'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20'
                          }`}
                        >
                          {notif.category}
                        </span>

                        {isUnread && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            New
                          </span>
                        )}
                      </div>

                      <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                        {notif.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed font-normal">
                      {notif.message}
                    </p>

                    {/* Sender Details Pills */}
                    {(notif.senderName || notif.senderEmail || notif.companyName) && (
                      <div className="flex items-center gap-2 pt-1 flex-wrap text-[11px] text-muted-foreground">
                        {notif.senderEmail && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground font-mono text-[10px]">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {notif.senderEmail}
                          </span>
                        )}
                        {notif.companyName && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground text-[10px]">
                            <Building2 className="h-3 w-3 text-muted-foreground" />
                            {notif.companyName}
                          </span>
                        )}
                        {notif.senderPhone && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground font-mono text-[10px]">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {notif.senderPhone}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-border/50 mt-2">
                      <div className="flex items-center gap-2">
                        {isUnread ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notif.id);
                            }}
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Mark as read</span>
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsUnread(notif.id);
                            }}
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
                          >
                            <span>Mark as unread</span>
                          </button>
                        )}

                        <span className="text-border">•</span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectItem(notif);
                          }}
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Details</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {notif.link && (
                          <Link
                            href={notif.link}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary font-medium transition-colors"
                          >
                            <span>Open in Studio</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                          title="Dismiss notification"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="p-16 text-center bg-card rounded-3xl border border-border space-y-3">
            <div className="h-12 w-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center mx-auto">
              <Bell className="h-6 w-6 stroke-[1.5]" />
            </div>
            <h3 className="text-sm font-bold text-foreground">No notifications found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {searchQuery
                ? `No notifications match your search "${searchQuery}".`
                : activeTab === 'unread'
                ? 'All messages and system notifications have been acknowledged.'
                : 'No notifications in this category.'}
            </p>
            {(searchQuery || activeTab !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setActiveTab('all');
                }}
                className="text-xs mt-2"
              >
                Reset filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Inspect Detail Modal */}
      {inspectItem && (
        <Dialog open={!!inspectItem} onOpenChange={(open) => !open && setInspectItem(null)}>
          <DialogContent className="sm:max-w-lg rounded-2xl bg-card border border-border p-6 shadow-2xl">
            <DialogHeader className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                    inspectItem.category === 'SECURITY'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      : inspectItem.category === 'INQUIRY'
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : inspectItem.category === 'BOOKING'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20'
                  }`}
                >
                  {inspectItem.category}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {inspectItem.timestamp}
                </span>
              </div>
              <DialogTitle className="text-base font-bold text-foreground">
                {inspectItem.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              {/* Message Payload */}
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border text-foreground leading-relaxed font-normal">
                {inspectItem.message}
              </div>

              {/* Client Information */}
              {(inspectItem.senderName || inspectItem.senderEmail) && (
                <div className="space-y-2 border-t border-border/50 pt-3">
                  <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Contact Details
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {inspectItem.senderName && (
                      <div className="p-2 rounded-lg bg-muted/40 border border-border/60">
                        <span className="text-[10px] text-muted-foreground block">Full Name</span>
                        <span className="font-semibold text-foreground">{inspectItem.senderName}</span>
                      </div>
                    )}
                    {inspectItem.senderEmail && (
                      <div className="p-2 rounded-lg bg-muted/40 border border-border/60">
                        <span className="text-[10px] text-muted-foreground block">Email</span>
                        <span className="font-mono text-foreground break-all">{inspectItem.senderEmail}</span>
                      </div>
                    )}
                    {inspectItem.companyName && (
                      <div className="p-2 rounded-lg bg-muted/40 border border-border/60">
                        <span className="text-[10px] text-muted-foreground block">Company</span>
                        <span className="font-semibold text-foreground">{inspectItem.companyName}</span>
                      </div>
                    )}
                    {inspectItem.senderPhone && (
                      <div className="p-2 rounded-lg bg-muted/40 border border-border/60">
                        <span className="text-[10px] text-muted-foreground block">Phone</span>
                        <span className="font-mono text-foreground">{inspectItem.senderPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Extra Metadata if present */}
              {inspectItem.rawDetails && (
                <div className="space-y-1.5 border-t border-border/50 pt-3">
                  <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Operational Metadata
                  </h4>
                  <div className="flex flex-wrap gap-1.5 text-[10px] font-mono text-muted-foreground">
                    {inspectItem.rawDetails.budgetRange && (
                      <span className="px-2 py-0.5 rounded bg-muted">
                        Budget: {inspectItem.rawDetails.budgetRange}
                      </span>
                    )}
                    {inspectItem.rawDetails.timeline && (
                      <span className="px-2 py-0.5 rounded bg-muted">
                        Timeline: {inspectItem.rawDetails.timeline}
                      </span>
                    )}
                    {inspectItem.rawDetails.storeUrl && (
                      <span className="px-2 py-0.5 rounded bg-muted">
                        Store: {inspectItem.rawDetails.storeUrl}
                      </span>
                    )}
                    {inspectItem.rawDetails.slotTime && (
                      <span className="px-2 py-0.5 rounded bg-muted">
                        Time: {inspectItem.rawDetails.date} @ {inspectItem.rawDetails.slotTime} ({inspectItem.rawDetails.timezone})
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex items-center justify-between sm:justify-between border-t border-border/50 pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInspectItem(null)}
                className="text-xs text-muted-foreground"
              >
                Close
              </Button>

              <div className="flex items-center gap-2">
                {inspectItem.senderEmail && (
                  <Button
                    size="sm"
                    onClick={() => {
                      window.location.href = `mailto:${inspectItem.senderEmail}?subject=Regarding your Gypsym inquiry`;
                    }}
                    className="text-xs bg-foreground text-background hover:bg-foreground/90 gap-1.5"
                  >
                    <Send className="h-3 w-3" />
                    <span>Email Client</span>
                  </Button>
                )}

                {inspectItem.link && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setInspectItem(null);
                      router.push(inspectItem.link!);
                    }}
                    className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
                  >
                    <span>Open in Studio</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirmation Dialog: Bulk Delete Selected */}
      <Dialog open={confirmBulkDeleteOpen} onOpenChange={setConfirmBulkDeleteOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl">
          <DialogHeader className="space-y-2">
            <div className="h-10 w-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-base font-bold text-foreground">
              Delete {selectedIds.size} Selected Notification{selectedIds.size > 1 ? 's' : ''}?
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Are you sure you want to dismiss and delete the <strong className="text-foreground">{selectedIds.size}</strong> selected notification{selectedIds.size > 1 ? 's' : ''}? They will be removed from your notification feed.
          </p>

          <DialogFooter className="flex items-center justify-end gap-2 pt-4 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              disabled={isDeleting}
              onClick={() => setConfirmBulkDeleteOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={handleBulkDelete}
              className="text-xs font-semibold gap-1.5 shadow-2xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{isDeleting ? 'Deleting...' : `Delete Selected (${selectedIds.size})`}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog: Filter-wise Delete */}
      <Dialog open={confirmFilterDeleteOpen} onOpenChange={setConfirmFilterDeleteOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl">
          <DialogHeader className="space-y-2">
            <div className="h-10 w-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-base font-bold text-foreground">
              Delete All Notifications in Current View?
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Are you sure you want to delete all <strong className="text-foreground">{filteredNotifications.length}</strong> notification{filteredNotifications.length > 1 ? 's' : ''} currently displayed under <strong className="text-foreground">{currentFilterLabel}</strong>?
          </p>

          <DialogFooter className="flex items-center justify-end gap-2 pt-4 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              disabled={isDeleting}
              onClick={() => setConfirmFilterDeleteOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={handleFilterDelete}
              className="text-xs font-semibold gap-1.5 shadow-2xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{isDeleting ? 'Deleting...' : `Delete All Filtered (${filteredNotifications.length})`}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminContentContainer>
  );
}
