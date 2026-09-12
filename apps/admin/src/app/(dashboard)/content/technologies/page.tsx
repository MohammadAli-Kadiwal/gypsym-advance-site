'use client';

import * as React from 'react';
import { DataTable, ColumnDef } from '@/components/crud/data-table';
import { CrudSheet, FieldConfig } from '@/components/crud/crud-sheet';
import { useCmsCollection, BaseRecord } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface TechRecord extends BaseRecord {
  name: string;
  category: string;
  ring: 'Adopt' | 'Trial' | 'Assess' | 'Hold';
  description: string;
}

export default function TechnologiesAdminPage() {
  const { data, createItem, updateItem, deleteItem, bulkDelete, bulkUpdateStatus } =
    useCmsCollection<TechRecord>('technologies');

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<TechRecord | null>(null);

  const formFields: FieldConfig[] = [
    { name: 'name', label: 'Technology / Runtime', required: true, placeholder: 'e.g. Rust' },
    { name: 'category', label: 'Technology Domain', required: true, placeholder: 'Languages & Distributed' },
    {
      name: 'ring',
      label: 'Radar Assessment Ring',
      type: 'select',
      required: true,
      options: [
        { label: 'Adopt (Mandated in Production)', value: 'Adopt' },
        { label: 'Trial (Validated on Pilot Workloads)', value: 'Trial' },
        { label: 'Assess (Under Benchmark Evaluation)', value: 'Assess' },
        { label: 'Hold (Phasing Out)', value: 'Hold' },
      ],
    },
    { name: 'description', label: 'Architectural Rationale', type: 'textarea', required: true },
  ];

  const columns: ColumnDef<TechRecord>[] = [
    {
      key: 'name',
      header: 'Technology Name',
      sortable: true,
      render: (item) => <span className="font-mono font-bold text-foreground">{item.name}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (item) => <Badge variant="outline">{item.category}</Badge>,
    },
    {
      key: 'ring',
      header: 'Radar Ring',
      sortable: true,
      render: (item) => {
        const variant =
          item.ring === 'Adopt'
            ? 'success'
            : item.ring === 'Trial'
            ? 'warning'
            : 'muted';
        return <Badge variant={variant as any}>{item.ring}</Badge>;
      },
    },
    {
      key: 'description',
      header: 'Rationale',
      render: (item) => <span className="text-xs text-muted-foreground line-clamp-2">{item.description}</span>,
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
      <DataTable<TechRecord>
        title="Enterprise Technology Radar"
        description="Authoritative catalog of proven runtimes, frameworks, and consensus algorithms mandated at Gypsym."
        data={data}
        columns={columns}
        searchKeys={['name', 'category', 'ring', 'description']}
        requiredPermission="content:write"
        addButtonLabel="New Tech Radar Item"
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
        title={editingItem ? 'Edit Technology Radar Entry' : 'Add Tech Radar Entry'}
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
