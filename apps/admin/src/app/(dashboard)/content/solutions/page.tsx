'use client';

import * as React from 'react';
import { DataTable, ColumnDef } from '@/components/crud/data-table';
import { CrudSheet, FieldConfig } from '@/components/crud/crud-sheet';
import { useCmsCollection, BaseRecord } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface SolutionRecord extends BaseRecord {
  title: string;
  slug: string;
  industry: string;
  roi: string;
  compliance?: string[];
}

export default function SolutionsAdminPage() {
  const { data, createItem, updateItem, deleteItem, bulkDelete, bulkUpdateStatus } =
    useCmsCollection<SolutionRecord>('solutions');

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<SolutionRecord | null>(null);

  const formFields: FieldConfig[] = [
    { name: 'title', label: 'Solution Title', required: true, placeholder: 'e.g. Next-Gen Core Banking & Real-Time Settlement' },
    { name: 'slug', label: 'Route Slug', required: true, placeholder: 'core-banking-modernization' },
    { name: 'industry', label: 'Target Industry', required: true, placeholder: 'Financial Services' },
    { name: 'roi', label: 'Quantifiable ROI Impact', type: 'textarea', required: true, placeholder: 'Reduced transaction processing costs by 64%...' },
  ];

  const columns: ColumnDef<SolutionRecord>[] = [
    {
      key: 'title',
      header: 'Solution Architecture',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-bold text-foreground">{item.title}</span>
          <div className="font-mono text-[10px] text-muted-foreground">{item.slug}</div>
        </div>
      ),
    },
    {
      key: 'industry',
      header: 'Industry',
      sortable: true,
      render: (item) => <Badge variant="outline">{item.industry}</Badge>,
    },
    {
      key: 'roi',
      header: 'Measured Outcome / ROI',
      render: (item) => <span className="text-xs text-muted-foreground line-clamp-2">{item.roi}</span>,
    },
    {
      key: 'compliance',
      header: 'Compliance Standards',
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.compliance?.slice(0, 2).map((c, idx) => (
            <span key={idx} className="rounded border border-border bg-secondary/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              {c}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      sortable: true,
      render: (item) => <span className="font-mono text-[11px] text-muted-foreground">{formatDate(item.updatedAt)}</span>,
    },
  ];

  return (
    <>
      <DataTable<SolutionRecord>
        title="Industry Solutions & Architectures"
        description="Packaged enterprise solutions solving complex vertical challenges with validated ROI."
        data={data}
        columns={columns}
        searchKeys={['title', 'slug', 'industry', 'roi']}
        requiredPermission="content:write"
        addButtonLabel="New Solution"
        onAdd={() => {
          setEditingItem(null);
          setSheetOpen(true);
        }}
        onEdit={(item) => {
          setEditingItem(item);
          setSheetOpen(true);
        }}
        onDelete={deleteItem}
        onBulkDelete={bulkDelete}
        onBulkStatusChange={bulkUpdateStatus}
      />

      <CrudSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={editingItem ? 'Edit Solution Blueprint' : 'Add New Solution Blueprint'}
        description="Define business challenge, technical architecture, and regulatory compliance standards."
        fields={formFields}
        initialData={editingItem}
        onSubmit={(form) => {
          if (editingItem) {
            updateItem(editingItem.id, form);
          } else {
            createItem({
              ...form,
              compliance: ['SOC 2 Type II', 'ISO 27001', 'PCI-DSS'],
            } as any);
          }
        }}
      />
    </>
  );
}
