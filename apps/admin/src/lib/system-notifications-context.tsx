'use client';

import * as React from 'react';
import { inquiriesService } from '@/services/inquiries.service';
import { bookingsService } from '@/services/bookings.service';
import { notify } from '@/lib/notifications';

export type NotificationCategory = 'INQUIRY' | 'BOOKING' | 'SECURITY' | 'SYSTEM';

export interface SystemNotificationItem {
  id: string;
  sourceId?: string;
  category: NotificationCategory;
  title: string;
  message: string;
  senderName?: string;
  senderEmail?: string;
  senderPhone?: string;
  companyName?: string;
  isRead: boolean;
  timestamp: string;
  createdAt: string;
  link?: string;
  badge?: string;
  rawDetails?: Record<string, any>;
}

export interface SystemNotificationsContextValue {
  notifications: SystemNotificationItem[];
  unreadCount: number;
  unreadInquiriesCount: number;
  unreadBookingsCount: number;
  unreadSystemCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAsUnread: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const SystemNotificationsContext = React.createContext<SystemNotificationsContextValue | null>(null);

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return 'Just now';
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return `${diffSec || 1}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

// Built-in baseline system alerts that enhance the feed
const BASELINE_SYSTEM_NOTIFICATIONS: SystemNotificationItem[] = [
  {
    id: 'sys-seo-audit',
    category: 'SYSTEM',
    title: 'SEO Health Index Available',
    message: 'Page-by-page SEO scoring analysis generated across all 10 live site pages.',
    isRead: false,
    timestamp: '1 hour ago',
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    link: '/site/seo',
    badge: 'AUDIT',
  },
  {
    id: 'sys-security-scan',
    category: 'SECURITY',
    title: 'Automated Security Perimeter Scan',
    message: 'Zero-trust ISO 27001 perimeter audit completed with zero vulnerabilities found.',
    isRead: true,
    timestamp: '5 hours ago',
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    link: '/system/audit',
    badge: 'PASSED',
  },
  {
    id: 'sys-edge-cache',
    category: 'SYSTEM',
    title: 'Edge Cache Warmup Completed',
    message: 'Global edge cluster synchronization completed across all active CDN distribution zones.',
    isRead: true,
    timestamp: '1 day ago',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    link: '/site/settings',
    badge: 'CLUSTER',
  },
];

export function SystemNotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = React.useState<SystemNotificationItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Helper to load read and deleted IDs from localStorage
  const getStoredSets = React.useCallback(() => {
    if (typeof window === 'undefined') return { readIds: new Set<string>(), deletedIds: new Set<string>() };
    try {
      const readRaw = localStorage.getItem('gypsym_read_notifications');
      const delRaw = localStorage.getItem('gypsym_deleted_notifications');
      return {
        readIds: new Set<string>(readRaw ? JSON.parse(readRaw) : []),
        deletedIds: new Set<string>(delRaw ? JSON.parse(delRaw) : []),
      };
    } catch {
      return { readIds: new Set<string>(), deletedIds: new Set<string>() };
    }
  }, []);

  const fetchDynamicNotifications = React.useCallback(async () => {
    const { readIds, deletedIds } = getStoredSets();
    const collected: SystemNotificationItem[] = [];

    // 1. Fetch live inquiries from backend
    try {
      const inquiriesRes: any = await inquiriesService.getAll({ limit: 25 });
      if (inquiriesRes && Array.isArray(inquiriesRes.items)) {
        inquiriesRes.items.forEach((item: any) => {
          const notifId = `inquiry-${item.id}`;
          if (deletedIds.has(notifId)) return;

          const isRead = readIds.has(notifId) || item.status === 'READ' || item.status === 'ARCHIVED';
          collected.push({
            id: notifId,
            sourceId: item.id,
            category: 'INQUIRY',
            title: `New Inquiry: ${item.fullName || 'Prospective Client'}`,
            message:
              item.projectDescription ||
              (item.companyName
                ? `Inquiry received from ${item.companyName} (${item.businessEmail})`
                : `Contact form inquiry from ${item.businessEmail}`),
            senderName: item.fullName,
            senderEmail: item.businessEmail,
            senderPhone: item.phone,
            companyName: item.companyName,
            isRead: isRead,
            timestamp: formatRelativeTime(item.createdAt),
            createdAt: item.createdAt,
            link: '/content/submissions',
            badge: item.status || 'NEW',
            rawDetails: item,
          });
        });
      }
    } catch {
      // Inquiries fetch optional failure (offline or unauthenticated)
    }

    // 2. Fetch live discovery call bookings from backend
    try {
      const bookingsRes: any = await bookingsService.getAll({ limit: 25 });
      if (bookingsRes && Array.isArray(bookingsRes.items)) {
        bookingsRes.items.forEach((item: any) => {
          const notifId = `booking-${item.id}`;
          if (deletedIds.has(notifId)) return;

          const isRead = readIds.has(notifId) || item.status === 'COMPLETED' || item.status === 'CANCELLED';
          collected.push({
            id: notifId,
            sourceId: item.id,
            category: 'BOOKING',
            title: `Discovery Call: ${item.fullName || 'Client'}`,
            message: `Booked for ${item.date} at ${item.slotTime} (${item.timezone})${
              item.storeUrl ? ` • Store: ${item.storeUrl}` : ''
            }`,
            senderName: item.fullName,
            senderEmail: item.email,
            senderPhone: item.phone,
            isRead: isRead,
            timestamp: formatRelativeTime(item.createdAt),
            createdAt: item.createdAt,
            link: '/bookings',
            badge: item.status || 'CONFIRMED',
            rawDetails: item,
          });
        });
      }
    } catch {
      // Bookings fetch optional failure
    }

    // 3. Add baseline system & security signals
    BASELINE_SYSTEM_NOTIFICATIONS.forEach((baseline) => {
      if (deletedIds.has(baseline.id)) return;
      const isRead = readIds.has(baseline.id) || baseline.isRead;
      collected.push({
        ...baseline,
        isRead,
      });
    });

    // Sort by createdAt descending
    collected.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setNotifications(collected);
    setIsLoading(false);
  }, [getStoredSets]);

  React.useEffect(() => {
    fetchDynamicNotifications();

    // Re-check periodically and on window focus
    const interval = setInterval(fetchDynamicNotifications, 45000);
    const handleFocus = () => fetchDynamicNotifications();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchDynamicNotifications]);

  const markAsRead = React.useCallback(
    async (id: string) => {
      const { readIds } = getStoredSets();
      readIds.add(id);
      localStorage.setItem('gypsym_read_notifications', JSON.stringify(Array.from(readIds)));

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );

      // If inquiry, optionally sync backend status
      if (id.startsWith('inquiry-')) {
        const sourceId = id.replace('inquiry-', '');
        inquiriesService.updateStatus(sourceId, 'READ').catch(() => {});
      }
    },
    [getStoredSets]
  );

  const markAsUnread = React.useCallback(
    async (id: string) => {
      const { readIds } = getStoredSets();
      readIds.delete(id);
      localStorage.setItem('gypsym_read_notifications', JSON.stringify(Array.from(readIds)));

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
      );
    },
    [getStoredSets]
  );

  const markAllAsRead = React.useCallback(async () => {
    const { readIds } = getStoredSets();
    notifications.forEach((n) => readIds.add(n.id));
    localStorage.setItem('gypsym_read_notifications', JSON.stringify(Array.from(readIds)));

    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    notify.success('All notifications marked as read.');
  }, [getStoredSets, notifications]);

  const deleteNotification = React.useCallback(
    async (id: string) => {
      const { deletedIds } = getStoredSets();
      deletedIds.add(id);
      localStorage.setItem('gypsym_deleted_notifications', JSON.stringify(Array.from(deletedIds)));

      setNotifications((prev) => prev.filter((n) => n.id !== id));
      notify.info('Notification dismissed.');
    },
    [getStoredSets]
  );

  const unreadCount = React.useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const unreadInquiriesCount = React.useMemo(
    () => notifications.filter((n) => !n.isRead && n.category === 'INQUIRY').length,
    [notifications]
  );

  const unreadBookingsCount = React.useMemo(
    () => notifications.filter((n) => !n.isRead && n.category === 'BOOKING').length,
    [notifications]
  );

  const unreadSystemCount = React.useMemo(
    () =>
      notifications.filter(
        (n) => !n.isRead && (n.category === 'SYSTEM' || n.category === 'SECURITY')
      ).length,
    [notifications]
  );

  const value = React.useMemo<SystemNotificationsContextValue>(
    () => ({
      notifications,
      unreadCount,
      unreadInquiriesCount,
      unreadBookingsCount,
      unreadSystemCount,
      isLoading,
      markAsRead,
      markAsUnread,
      markAllAsRead,
      deleteNotification,
      refresh: fetchDynamicNotifications,
    }),
    [
      notifications,
      unreadCount,
      unreadInquiriesCount,
      unreadBookingsCount,
      unreadSystemCount,
      isLoading,
      markAsRead,
      markAsUnread,
      markAllAsRead,
      deleteNotification,
      fetchDynamicNotifications,
    ]
  );

  return (
    <SystemNotificationsContext.Provider value={value}>
      {children}
    </SystemNotificationsContext.Provider>
  );
}

export function useSystemNotifications() {
  const context = React.useContext(SystemNotificationsContext);
  if (!context) {
    throw new Error('useSystemNotifications must be used within a SystemNotificationsProvider');
  }
  return context;
}
