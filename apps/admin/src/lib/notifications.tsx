'use client';

import * as React from 'react';
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
    label: 'Success',
    border: 'border-l-emerald-500',
    iconColor: 'text-emerald-500',
    labelColor: 'text-emerald-700',
    bg: 'bg-white',
  },
  error: {
    icon: XCircle,
    label: 'Error',
    border: 'border-l-rose-500',
    iconColor: 'text-rose-500',
    labelColor: 'text-rose-700',
    bg: 'bg-white',
  },
  warning: {
    icon: AlertTriangle,
    label: 'Warning',
    border: 'border-l-amber-500',
    iconColor: 'text-amber-500',
    labelColor: 'text-amber-700',
    bg: 'bg-white',
  },
  info: {
    icon: Info,
    label: 'Info',
    border: 'border-l-blue-500',
    iconColor: 'text-blue-500',
    labelColor: 'text-blue-700',
    bg: 'bg-white',
  },
} as const;

// ─── Single Toast Item ─────────────────────────────────────────────────────────
interface ToastItemProps {
  toast: NotificationItem;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [visible, setVisible] = React.useState(false);
  const [leaving, setLeaving] = React.useState(false);

  React.useEffect(() => {
    // Slight delay so the animation triggers after mount
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  function dismiss() {
    setLeaving(true);
    setTimeout(() => onDismiss(toast.id), 220);
  }

  const cfg = TOAST_CONFIG[toast.type];
  const Icon = cfg.icon;

  return (
    <div
      role={toast.type === 'error' || toast.type === 'warning' ? 'alert' : 'status'}
      className={`
        pointer-events-auto
        flex items-start
        w-[300px] min-w-[260px] max-w-[300px]
        border border-slate-200 border-l-4 ${cfg.border} ${cfg.bg}
        rounded-xl shadow-lg
        px-3.5 py-3
        transition-all duration-200 ease-out
        ${visible && !leaving ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
      `}
    >
      {/* Icon */}
      <div className={`shrink-0 mt-0.5 mr-2.5 ${cfg.iconColor}`}>
        <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-[12px] font-bold leading-none mb-0.5 ${cfg.labelColor}`}>
          {cfg.label}
        </p>
        <p className="text-[11.5px] text-slate-600 leading-snug">
          {toast.message}
        </p>
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action?.onClick();
              dismiss();
            }}
            className="mt-1.5 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Dismiss */}
      <button
        type="button"
        aria-label="Dismiss"
        onClick={dismiss}
        className="shrink-0 ml-2 mt-0.5 text-slate-300 hover:text-slate-500 rounded transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Toast Container ───────────────────────────────────────────────────────────
export function ToastContainer() {
  const [toasts, setToasts] = React.useState<NotificationItem[]>([]);

  React.useEffect(() => {
    const unsubscribe = notify.subscribe(setToasts);
    return () => unsubscribe();
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed top-5 right-5 z-[200] flex flex-col gap-2.5 pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={(id) => notify.dismiss(id)}
        />
      ))}
    </div>
  );
}
