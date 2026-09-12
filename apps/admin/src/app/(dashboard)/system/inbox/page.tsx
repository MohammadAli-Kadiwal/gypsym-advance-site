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
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle } from 'lucide-react';

interface InboxRecord extends BaseRecord {
  fullName: string;
  workEmail: string;
  companyName: string;
  interestArea: string;
  projectScope: string;
  estimatedBudget: string;
  timeline: string;
  triageStatus: 'NEW' | 'IN_REVIEW' | 'QUALIFIED' | 'DISMISSED';
}

export default function InboxAdminPage() {
  const { data, updateItem, deleteItem, bulkDelete, bulkUpdateStatus } =
    useCmsCollection<InboxRecord>('inbox');

  const [inspectItem, setInspectItem] = React.useState<InboxRecord | null>(null);

  const columns: ColumnDef<InboxRecord>[] = [
    {
      key: 'fullName',
      header: 'Prospective Client',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-bold text-foreground">{item.fullName}</span>
          <div className="text-xs text-muted-foreground">{item.workEmail}</div>
        </div>
      ),
    },
    {
      key: 'companyName',
      header: 'Company / Institution',
      sortable: true,
      render: (item) => <span className="font-semibold text-xs text-foreground">{item.companyName}</span>,
    },
    {
      key: 'interestArea',
      header: 'Practice Focus',
      render: (item) => <Badge variant="outline">{item.interestArea}</Badge>,
    },
    {
      key: 'estimatedBudget',
      header: 'Budget Scope',
      render: (item) => <span className="font-mono text-xs text-primary font-bold">{item.estimatedBudget}</span>,
    },
    {
      key: 'triageStatus',
      header: 'Triage Stage',
      render: (item) => {
        const variant =
          item.triageStatus === 'NEW'
            ? 'default'
            : item.triageStatus === 'IN_REVIEW'
            ? 'warning'
            : item.triageStatus === 'QUALIFIED'
            ? 'success'
            : 'muted';
        return <Badge variant={variant as any}>{item.triageStatus}</Badge>;
      },
    },
    {
      key: 'createdAt',
      header: 'Submitted',
      sortable: true,
      render: (item) => <span className="font-mono text-[11px] text-muted-foreground">{formatDateTime(item.createdAt)}</span>,
    },
  ];

  return (
    <>
      <DataTable<InboxRecord>
        title="Executive Consultation Briefings (Leads)"
        description="High-intent enterprise architectural briefing inquiries and lead qualification pipeline."
        data={data}
        columns={columns}
        searchKeys={['fullName', 'workEmail', 'companyName', 'interestArea']}
        requiredPermission="content:write"
        onEdit={(item) => setInspectItem(item)}
        onDelete={deleteItem}
        onBulkDelete={bulkDelete}
        onBulkStatusChange={bulkUpdateStatus}
        customActions={(item) => (
          <button
            onClick={() => setInspectItem(item)}
            className="flex w-full items-center px-2 py-1.5 text-xs text-primary hover:bg-accent rounded"
          >
            <Mail className="h-3 w-3 mr-1.5" />
            Inspect Inquiry
          </button>
        )}
      />

      <Sheet open={!!inspectItem} onOpenChange={(open) => !open && setInspectItem(null)}>
        <SheetContent side="right">
          {inspectItem && (
            <div className="space-y-5 h-full flex flex-col">
              <SheetHeader>
                <SheetTitle>{inspectItem.fullName}</SheetTitle>
                <SheetDescription className="text-xs">
                  {inspectItem.companyName} • {inspectItem.workEmail}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 rounded-lg border border-border p-3 bg-secondary/30">
                  <div>
                    <span className="text-muted-foreground block text-[10px] font-mono uppercase">
                      Practice Interest:
                    </span>
                    <span className="font-semibold text-foreground">{inspectItem.interestArea}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] font-mono uppercase">
                      Estimated Capital:
                    </span>
                    <span className="font-mono font-bold text-primary">{inspectItem.estimatedBudget}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] font-mono uppercase">
                      Timeline:
                    </span>
                    <span className="text-foreground">{inspectItem.timeline}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] font-mono uppercase">
                      Triage Status:
                    </span>
                    <Badge variant="warning">{inspectItem.triageStatus}</Badge>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="font-semibold text-foreground">Project Scope & Challenge Description:</span>
                  <div className="rounded-lg border border-border p-3 bg-card text-foreground leading-relaxed">
                    {inspectItem.projectScope}
                  </div>
                </div>
              </div>

              <SheetFooter className="mt-auto gap-2">
                <Button
                  onClick={() => {
                    updateItem(inspectItem.id, { triageStatus: 'QUALIFIED' });
                    setInspectItem(null);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Mark Qualified & Schedule
                </Button>
              </SheetFooter>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
