'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCmsCollection } from '@/lib/store';
import { Bell, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';

export default function NotificationsAdminPage() {
  const { data: notifications, updateItem } = useCmsCollection<any>('notifications');

  const handleMarkAllRead = () => {
    notifications.forEach((n) => {
      if (!n.isRead) updateItem(n.id, { isRead: true });
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            System Notification Center
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Operational alerts, briefing lead inquiries, and compliance scan signals.
          </p>
        </div>

        <Button onClick={handleMarkAllRead} variant="outline" size="sm">
          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
          <span>Mark All Read</span>
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((notif: any) => (
          <Card
            key={notif.id}
            className={`p-4 transition-colors flex items-start space-x-3 ${
              notif.isRead ? 'bg-card/40 border-border/40' : 'bg-card border-primary/40 shadow-sm'
            }`}
          >
            <div
              className={`rounded-full p-2 mt-0.5 shrink-0 ${
                notif.category === 'SECURITY'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : notif.category === 'LEAD'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted/40 text-muted-foreground'
              }`}
            >
              {notif.category === 'SECURITY' ? (
                <ShieldCheck className="h-4 w-4" />
              ) : notif.category === 'LEAD' ? (
                <Mail className="h-4 w-4" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-semibold text-foreground">{notif.title}</h4>
                  <Badge variant="outline" className="text-[9px] font-mono">
                    {notif.category}
                  </Badge>
                  {!notif.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {notif.timestamp}
                </span>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {notif.message}
              </p>

              {!notif.isRead && (
                <div className="pt-2">
                  <button
                    onClick={() => updateItem(notif.id, { isRead: true })}
                    className="text-[11px] text-primary hover:underline font-mono"
                  >
                    Mark as acknowledged
                  </button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
