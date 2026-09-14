'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  Search,
  FileText,
  Layers,
  Cpu,
  ShieldCheck,
  Users,
  BookOpen,
  Building2,
  Handshake,
  MessageSquareQuote,
  Palette,
  Compass,
  Shield,
  History,
  Bell,
  Mail,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const { toggleTheme, theme } = useAuth();
  const [query, setQuery] = React.useState('');

  const commands = [
    { title: 'Executive Dashboard', path: '/', category: 'Telemetry', icon: FileText },
    { title: 'Dynamic Pages', path: '/pages', category: 'Content', icon: FileText },
    { title: 'Services & Capabilities', path: '/content/services', category: 'Content', icon: Layers },
    { title: 'Industry Solutions', path: '/content/solutions', category: 'Content', icon: Compass },
    { title: 'Technology Radar', path: '/content/technologies', category: 'Content', icon: Cpu },
    { title: 'Case Studies', path: '/content/case-studies', category: 'Content', icon: ShieldCheck },
    { title: 'Blog Articles', path: '/editorial/blog', category: 'Editorial', icon: BookOpen },
    { title: 'Client Roster & Logos', path: '/content/clients', category: 'Content', icon: Building2 },
    { title: 'Global Partners & Alliances', path: '/content/partners', category: 'Content', icon: Handshake },
    { title: 'Client Testimonials & Reviews', path: '/content/testimonials', category: 'Content', icon: MessageSquareQuote },
    { title: 'Site Branding & Tokens', path: '/site/branding', category: 'Site', icon: Palette },
    { title: 'Site Navigation Menus', path: '/site/navigation', category: 'Site', icon: Compass },
    { title: 'SEO & SERP Preview', path: '/site/seo', category: 'Site', icon: Search },
    { title: 'IAM Users Directory', path: '/system/users', category: 'System', icon: Users },
    { title: 'RBAC Permission Matrix', path: '/system/permissions', category: 'System', icon: Shield },
    { title: 'Compliance Audit Ledger', path: '/system/audit', category: 'System', icon: History },
    { title: 'Notification Center', path: '/system/notifications', category: 'System', icon: Bell },
    { title: 'Contact Submissions & Inquiries', path: '/content/submissions', category: 'Content', icon: Mail },
    { title: 'Email & SMTP Infrastructure', path: '/site/settings/email', category: 'Site', icon: Mail },
  ];

  const filteredCommands = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    router.push(path);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-xl overflow-hidden shadow-2xl border-border bg-card">
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-border px-3.5 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground mr-2.5 shrink-0" />
          <input
            placeholder="Type a command or search workspace..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No matching commands or pages found.
            </div>
          ) : (
            filteredCommands.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(item.path)}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-xs text-foreground hover:bg-accent transition-colors text-left group"
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span>{item.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}

          {/* Quick Action: Toggle Theme */}
          <button
            onClick={() => {
              toggleTheme();
              onOpenChange(false);
            }}
            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-xs text-foreground hover:bg-accent transition-colors text-left border-t border-border/40 mt-2"
          >
            <div className="flex items-center space-x-2.5">
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-primary" />
              )}
              <span>Switch to {theme === 'dark' ? 'Daylight Light Mode' : 'Cosmic Obsidian Dark Mode'}</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">ACTION</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
