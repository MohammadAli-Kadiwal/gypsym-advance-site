'use client';

import * as React from 'react';
import { Search, X, ArrowRight, FileText } from 'lucide-react';
import Link from 'next/link';

interface SearchResult {
  title: string;
  type: string;
  href: string;
}

export function SearchModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
        const res = await fetch(`${apiUrl}/pages/${encodeURIComponent(query.trim().toLowerCase())}`);
        if (res.ok) {
          const json = await res.json();
          if (json?.data) {
            setResults([
              {
                title: json.data.title,
                type: 'Page',
                href: `/${json.data.slug === 'home' ? '' : json.data.slug}`,
              },
            ]);
          } else {
            setResults([]);
          }
        } else {
          setResults([]);
        }
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-background/80 p-4 pt-20 backdrop-blur-sm sm:p-6 sm:pt-24">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95">
        <div className="flex items-center border-b border-border px-4 py-3">
          <Search className="mr-3 h-5 w-5 text-muted-foreground" />
          <input
            autoFocus
            type="text"
            placeholder="Search pages and resources..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-base"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {isSearching ? (
            <div className="py-12 text-center text-xs font-mono text-muted-foreground">
              Searching...
            </div>
          ) : query && results.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No matching pages found for &ldquo;{query}&rdquo;.
            </div>
          ) : !query ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              Type to search published pages...
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent hover:text-foreground group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="rounded-md border border-border bg-secondary/50 p-1.5 text-muted-foreground group-hover:text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.type}</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground flex justify-between items-center">
          <span>Navigate with mouse or keyboard</span>
          <span className="font-mono">ESC to close</span>
        </div>
      </div>
    </div>
  );
}
