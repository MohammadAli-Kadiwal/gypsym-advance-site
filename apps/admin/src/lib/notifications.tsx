'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationAction {
  label: string;
  onClick: () => void;
}

export interface NotificationOptions {
  duration?: number;
  action?: NotificationAction;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  message: string;
  action?: NotificationAction;
  duration?: number;
}

type Listener = (toasts: NotificationItem[]) => void;

// ─── Notification Manager (singleton) ─────────────────────────────────────────
class NotificationManager {
  private toasts: NotificationItem[] = [];
  private listeners: Set<Listener> = new Set();

  private emit() {
    this.listeners.forEach((l) => l([...this.toasts]));
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener([...this.toasts]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  show(type: NotificationType, message: string, options?: NotificationOptions): string {
    const id = Math.random().toString(36).slice(2, 9);
    const duration =
      options?.duration ?? (type === 'error' ? 8000 : type === 'warning' ? 6000 : 4000);

    // Max 4 toasts at a time
    if (this.toasts.length >= 4) {
      this.toasts = this.toasts.slice(-3);
    }

    this.toasts = [
      ...this.toasts,
      { id, type, message, action: options?.action, duration },
    ];
    this.emit();

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }

    return id;
  }

  dismiss(id: string) {
    const prev = this.toasts.length;
    this.toasts = this.toasts.filter((t) => t.id !== id);
    if (this.toasts.length !== prev) this.emit();
  }

  clear() {
    this.toasts = [];
    this.emit();
  }

  success(message: string, options?: NotificationOptions) {
    return this.show('success', message, options);
  }
  error(message: string, options?: NotificationOptions) {
    return this.show('error', message, options);
  }
  warning(message: string, options?: NotificationOptions) {
    return this.show('warning', message, options);
  }
  info(message: string, options?: NotificationOptions) {
    return this.show('info', message, options);
  }
}

export const notify = new NotificationManager();

export const NotificationContext = React.createContext<{ notify: NotificationManager }>({ notify });

export function useNotification() {
  return React.useContext(NotificationContext);
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
    </NotificationContext.Provider>
  );
}

// ─── Config per type ───────────────────────────────────────────────────────────
const TOAST_CONFIG = {
  success: {
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-50 text-emerald-600',
    badgeBorder: 'border-emerald-200/80',
  },
  error: {
    icon: XCircle,
    iconColor: 'text-rose-500',
    iconBg: 'bg-rose-50 text-rose-600',
    badgeBorder: 'border-rose-200/80',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-50 text-amber-600',
    badgeBorder: 'border-amber-200/80',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-50 text-blue-600',
    badgeBorder: 'border-blue-200/80',
  },
} as const;

// ─── Single Compact Toast Item ─────────────────────────────────────────────────
interface ToastItemProps {
  toast: NotificationItem;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [visible, setVisible] = React.useState(false);
  const [leaving, setLeaving] = React.useState(false);

  React.useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  function dismiss() {
    setLeaving(true);
    setTimeout(() => onDismiss(toast.id), 180);
  }

  const cfg = TOAST_CONFIG[toast.type];
  const Icon = cfg.icon;

  return (
    <div
      role={toast.type === 'error' || toast.type === 'warning' ? 'alert' : 'status'}
      className={`
        pointer-events-auto
        flex items-center gap-2.5
        w-auto max-w-[340px]
        bg-white/95 backdrop-blur-md dark:bg-slate-900/95
        border border-slate-200/90 dark:border-slate-800
        rounded-xl shadow-lg shadow-slate-900/8
        px-3 py-2
        transition-all duration-200 ease-out
        ${visible && !leaving ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'}
      `}
    >
      {/* Mini Icon */}
      <div className={`shrink-0 p-1 rounded-lg ${cfg.iconBg} border ${cfg.badgeBorder}`}>
        <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
      </div>

      {/* Message & Action */}
      <div className="flex-1 min-w-0 pr-0.5">
        <p className="text-[12px] font-medium text-slate-800 dark:text-slate-200 leading-snug break-words">
          {toast.message}
        </p>
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action?.onClick();
              dismiss();
            }}
            className="mt-0.5 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline block"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Close button */}
      <button
        type="button"
        aria-label="Dismiss"
        onClick={dismiss}
        className="shrink-0 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-md transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Compact Toast Container ───────────────────────────────────────────────────
export function ToastContainer() {
  const [toasts, setToasts] = React.useState<NotificationItem[]>([]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const unsubscribe = notify.subscribe(setToasts);
    return () => unsubscribe();
  }, []);

  if (!mounted || toasts.length === 0) return null;

  return createPortal(
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed top-5 right-5 z-[999999] flex flex-col items-end gap-2 pointer-events-none w-auto max-w-[360px]"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={(id) => notify.dismiss(id)}
        />
      ))}
    </div>,
    document.body
  );
}
