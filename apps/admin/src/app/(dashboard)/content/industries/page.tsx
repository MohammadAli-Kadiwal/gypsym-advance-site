'use client';

import * as React from 'react';
import { DataTable, ColumnDef } from '@/components/crud/data-table';
import { CrudSheet, FieldConfig } from '@/components/crud/crud-sheet';
import { useCmsCollection, BaseRecord } from '@/lib/store';
import { formatDate } from '@/lib/utils';

interface IndustryRecord extends BaseRecord {
  name: string;
  slug: string;
  summary: string;
  activeClientsCount: number;
}

export default function IndustriesAdminPage() {
  const { data, createItem, updateItem, deleteItem, bulkDelete, bulkUpdateStatus } =
    useCmsCollection<IndustryRecord>('industries');

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<IndustryRecord | null>(null);

  const formFields: FieldConfig[] = [
    { name: 'name', label: 'Industry Practice Name', required: true, placeholder: 'e.g. Financial Services & Capital Markets' },
    { name: 'slug', label: 'Route Slug', required: true, placeholder: 'financial-services' },
    { name: 'summary', label: 'Domain Practice Summary', type: 'textarea', required: true },
    { name: 'activeClientsCount', label: 'Active Institutional Accounts', type: 'number' },
  ];

  const columns: ColumnDef<IndustryRecord>[] = [
    {
      key: 'name',
      header: 'Practice Group',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-bold text-foreground">{item.name}</span>
          <div className="font-mono text-[10px] text-muted-foreground">{item.slug}</div>
        </div>
      ),
    },
    {
      key: 'summary',
      header: 'Summary',
      render: (item) => <span className="text-xs text-muted-foreground line-clamp-2">{item.summary}</span>,
    },
    {
      key: 'activeClientsCount',
      header: 'Client Accounts',
      sortable: true,
      render: (item) => <span className="font-mono text-xs text-foreground font-semibold">{item.activeClientsCount || 0} tier-1 clients</span>,
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
      <DataTable<IndustryRecord>
        title="Vertical Industry Practices"
        description="Dedicated industry practice groups offering vertical data standards and regulatory depth."
        data={data}
        columns={columns}
        searchKeys={['name', 'slug', 'summary']}
        requiredPermission="content:write"
        addButtonLabel="New Practice Group"
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
        title={editingItem ? 'Edit Industry Practice' : 'Add Industry Practice'}
        fields={formFields}
        initialData={editingItem}
        onSubmit={(form) => {
          if (editingItem) {
            updateItem(editingItem.id, form);
          } else {
            createItem(form as any);
          }
        }}
      />
    </>
  );
}
