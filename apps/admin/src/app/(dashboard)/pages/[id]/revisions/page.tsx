'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatDateTime } from '@/lib/utils';

interface Revision {
  id: string;
  version: string;
  author: string;
  timestamp: string;
  changes: string;
  sectionsCount: number;
  isCurrent: boolean;
  snapshot: {
    headline: string;
    tagline: string;
    cta: string;
  };
}

const REVISIONS_DATA: Revision[] = [
  {
    id: 'rev-3',
    version: 'v1.3 (Current Active)',
    author: 'MohammadAli Kadiwal',
    timestamp: '2026-09-10T11:45:00Z',
    changes: 'Updated headline to "Engineering the Digital Infrastructure of the Global Enterprise"',
    sectionsCount: 12,
    isCurrent: true,
    snapshot: {
      headline: 'Engineering the Digital Infrastructure of the Global Enterprise',
      tagline: 'Next-Gen Planetary Scale Systems',
      cta: 'Schedule Executive Briefing',
    },
  },
  {
    id: 'rev-2',
    version: 'v1.2',
    author: 'Elena Rostova',
    timestamp: '2026-09-08T16:20:00Z',
    changes: 'Added zero-trust compliance badges and client logo cloud marquee section',
    sectionsCount: 11,
    isCurrent: false,
    snapshot: {
      headline: 'Architecting Planetary Scale Systems for Global Institutions',
      tagline: 'Enterprise Cloud & Sovereign AI',
      cta: 'Contact Architecture Team',
    },
  },
  {
    id: 'rev-1',
    version: 'v1.0 (Initial Draft)',
    author: 'Marcus Vance',
    timestamp: '2026-09-01T09:00:00Z',
    changes: 'Initial page creation from enterprise layout template',
    sectionsCount: 8,
    isCurrent: false,
    snapshot: {
      headline: 'Gypsym Technology Global Platform',
      tagline: 'Modern Enterprise Software',
      cta: 'Learn More',
    },
  },
];

export default function PageRevisionsView() {
  const params = useParams();
  const router = useRouter();
  const pageId = params.id as string;

  const revisions = REVISIONS_DATA;
  const [selectedRevId, setSelectedRevId] = React.useState('rev-2');
  const selectedRev: Revision = revisions.find((r) => r.id === selectedRevId) || revisions[0]!;
  const currentRev: Revision = revisions[0]!;

  const handleRollback = (rev: Revision) => {
    alert(`Successfully rolled back to snapshot ${rev.version}! Active draft updated.`);
    router.push(`/pages/${pageId}/builder`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <div className="flex items-center space-x-3">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/pages/${pageId}/builder`}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back to Builder</span>
            </Link>
          </Button>
          <div className="h-4 w-px bg-border" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center">
              <span>Point-in-Time Revision History</span>
              <Badge variant="outline" className="ml-2 font-mono text-[10px]">
                Auditability
              </Badge>
            </h1>
            <p className="text-xs text-muted-foreground">
              Compare historical snapshots and perform 1-click zero-downtime rollbacks.
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Revisions Outliner + Visual Diff Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Revisions Timeline (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
            Snapshot History ({revisions.length})
          </h3>

          <div className="space-y-2">
            {revisions.map((rev) => {
              const isSelected = rev.id === selectedRev.id;
              return (
                <div
                  key={rev.id}
                  onClick={() => setSelectedRevId(rev.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all space-y-1.5 ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-sm'
                      : 'border-border bg-card hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground">{rev.version}</span>
                    {rev.isCurrent && <Badge variant="success">ACTIVE</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{rev.changes}</p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-1 border-t border-border/40">
                    <span>{rev.author}</span>
                    <span>{formatDateTime(rev.timestamp)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Side-by-Side Visual Diff Inspector (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <div>
              <span className="text-xs text-muted-foreground">Comparing</span>{' '}
              <span className="font-bold text-xs text-primary">{selectedRev.version}</span>{' '}
              <span className="text-xs text-muted-foreground">with Current Production</span>{' '}
              <span className="font-bold text-xs text-emerald-400">({currentRev.version})</span>
            </div>

            {!selectedRev.isCurrent && (
              <Button
                onClick={() => handleRollback(selectedRev)}
                size="sm"
                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <RotateCcw className="h-3 w-3 mr-1.5" />
                Restore This Snapshot
              </Button>
            )}
          </div>

          {/* Visual Diff Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Historical Snapshot */}
            <Card className="p-4 space-y-3 bg-card/60">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="font-mono text-xs text-muted-foreground font-bold">
                  {selectedRev.version} (Historical)
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {selectedRev.sectionsCount} sections
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-mono">
                    Headline:
                  </span>
                  <div className="rounded bg-destructive/10 border border-destructive/20 p-2 text-destructive font-medium mt-1">
                    - {selectedRev.snapshot.headline}
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-mono">
                    Tagline:
                  </span>
                  <div className="rounded bg-destructive/10 border border-destructive/20 p-2 text-destructive font-medium mt-1">
                    - {selectedRev.snapshot.tagline}
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-mono">
                    Primary CTA:
                  </span>
                  <div className="rounded bg-destructive/10 border border-destructive/20 p-2 text-destructive font-medium mt-1">
                    - {selectedRev.snapshot.cta}
                  </div>
                </div>
              </div>
            </Card>

            {/* Current Production Snapshot */}
            <Card className="p-4 space-y-3 bg-card/60">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="font-mono text-xs text-emerald-400 font-bold">
                  {currentRev.version} (Active)
                </span>
                <span className="text-[10px] font-mono text-emerald-400">
                  {currentRev.sectionsCount} sections
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-mono">
                    Headline:
                  </span>
                  <div className="rounded bg-emerald-500/10 border border-emerald-500/20 p-2 text-emerald-400 font-medium mt-1">
                    + {currentRev.snapshot.headline}
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-mono">
                    Tagline:
                  </span>
                  <div className="rounded bg-emerald-500/10 border border-emerald-500/20 p-2 text-emerald-400 font-medium mt-1">
                    + {currentRev.snapshot.tagline}
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-mono">
                    Primary CTA:
                  </span>
                  <div className="rounded bg-emerald-500/10 border border-emerald-500/20 p-2 text-emerald-400 font-medium mt-1">
                    + {currentRev.snapshot.cta}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
