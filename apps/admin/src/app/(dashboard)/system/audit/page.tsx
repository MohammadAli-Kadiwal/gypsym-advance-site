'use client';

import * as React from 'react';
import { DataTable, ColumnDef } from '@/components/crud/data-table';
import { useCmsCollection, BaseRecord } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { History, Eye } from 'lucide-react';

interface AuditRecord extends BaseRecord {
  actor: string;
  actorRole: string;
  action: string;
  resource: string;
  ipAddress: string;
  timestamp: string;
  diff?: {
    before: Record<string, any> | null;
    after: Record<string, any> | null;
  };
}

export default function AuditLedgerPage() {
  const { data } = useCmsCollection<AuditRecord>('audit');
  const [selectedEntry, setSelectedEntry] = React.useState<AuditRecord | null>(null);

  const columns: ColumnDef<AuditRecord>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp (UTC)',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-[11px] text-foreground font-semibold">
          {formatDateTime(item.timestamp)}
        </span>
      ),
    },
    {
      key: 'actor',
      header: 'Actor & Role',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-bold text-foreground text-xs">{item.actor}</span>
          <div className="font-mono text-[10px] text-primary">{item.actorRole}</div>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Event Action',
      sortable: true,
      render: (item) => (
        <Badge variant="outline" className="font-mono text-[10px]">
          {item.action}
        </Badge>
      ),
    },
    {
      key: 'resource',
      header: 'Target Resource',
      render: (item) => <span className="font-mono text-xs text-muted-foreground">{item.resource}</span>,
    },
    {
      key: 'ipAddress',
      header: 'Origin IP',
      render: (item) => <span className="font-mono text-[11px] text-muted-foreground">{item.ipAddress}</span>,
    },
  ];

  return (
    <>
      <DataTable<AuditRecord>
        title="Immutable Compliance Audit Ledger"
        description="Cryptographically recorded mutations capturing actor identity, action type, IP origin, and JSON payload diffs."
        data={data}
        columns={columns}
        searchKeys={['actor', 'action', 'resource', 'ipAddress']}
        requiredPermission="audit:read"
        customActions={(item) => (
          <button
            onClick={() => setSelectedEntry(item)}
            className="flex w-full items-center px-2 py-1.5 text-xs text-primary hover:bg-accent rounded"
          >
            <Eye className="h-3 w-3 mr-1.5" />
            Inspect JSON Diff
          </button>
        )}
      />

      {/* JSON Diff Inspector Drawer */}
      <Sheet open={!!selectedEntry} onOpenChange={(open) => !open && setSelectedEntry(null)}>
        <SheetContent side="right">
          {selectedEntry && (
            <div className="space-y-5 h-full flex flex-col">
              <SheetHeader>
                <SheetTitle className="font-mono text-sm flex items-center space-x-2">
                  <History className="h-4 w-4 text-primary" />
                  <span>Audit Mutation Diff</span>
                </SheetTitle>
                <SheetDescription className="font-mono text-[11px]">
                  {selectedEntry.action} • {selectedEntry.resource}
                </SheetDescription>
              </SheetHeader>

              <div className="grid grid-cols-2 gap-2 text-xs rounded-lg border border-border p-3 bg-secondary/30">
                <div>
                  <span className="text-muted-foreground block text-[10px] font-mono uppercase">
                    Operator:
                  </span>
                  <span className="font-semibold text-foreground">{selectedEntry.actor}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] font-mono uppercase">
                    Origin IP:
                  </span>
                  <span className="font-mono text-foreground">{selectedEntry.ipAddress}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] font-mono uppercase">
                    Execution Time:
                  </span>
                  <span className="font-mono text-foreground">
                    {formatDateTime(selectedEntry.timestamp)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] font-mono uppercase">
                    Cluster Status:
                  </span>
                  <Badge variant="success">COMMITTED</Badge>
                </div>
              </div>

              {/* JSON Diff Viewer */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                <div>
                  <span className="text-xs font-mono font-semibold text-destructive block mb-1">
                    State Before Mutation (Snapshot)
                  </span>
                  <pre className="rounded-lg border border-border bg-card p-3 font-mono text-[11px] text-muted-foreground overflow-x-auto">
                    {JSON.stringify(selectedEntry.diff?.before || { status: 'NONE' }, null, 2)}
                  </pre>
                </div>

                <div>
                  <span className="text-xs font-mono font-semibold text-emerald-400 block mb-1">
                    State After Mutation (Committed)
                  </span>
                  <pre className="rounded-lg border border-border bg-card p-3 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                    {JSON.stringify(selectedEntry.diff?.after || { status: 'MODIFIED' }, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
