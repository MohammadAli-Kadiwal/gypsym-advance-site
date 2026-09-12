'use client';

import * as React from 'react';
import { DataTable, ColumnDef } from '@/components/crud/data-table';
import { CrudSheet, FieldConfig } from '@/components/crud/crud-sheet';
import { useCmsCollection, BaseRecord } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface CareerPillarRecord extends BaseRecord {
  title: string;
  category: string;
  description: string;
}

export default function CareersAdminPage() {
  const { data, createItem, updateItem, deleteItem, bulkDelete, bulkUpdateStatus } =
    useCmsCollection<CareerPillarRecord>('careers');

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<CareerPillarRecord | null>(null);

  const formFields: FieldConfig[] = [
    { name: 'title', label: 'Culture / Benefit Title', required: true, placeholder: 'e.g. Global Remote First' },
    { name: 'category', label: 'Category', required: true, placeholder: 'Culture, Benefits, or Growth' },
    { name: 'description', label: 'Narrative Detail', type: 'textarea', required: true },
  ];

  const columns: ColumnDef<CareerPillarRecord>[] = [
    {
      key: 'title',
      header: 'Value / Benefit Proposition',
      sortable: true,
      render: (item) => <span className="font-bold text-foreground">{item.title}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (item) => <Badge variant="outline">{item.category}</Badge>,
    },
    {
      key: 'description',
      header: 'Detail',
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
      <DataTable<CareerPillarRecord>
        title="Careers Manifesto & Engineering Culture"
        description="Core value propositions, compensation philosophy, and research allocation benefits."
        data={data}
        columns={columns}
        searchKeys={['title', 'category', 'description']}
        requiredPermission="content:write"
        addButtonLabel="New Career Value"
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
        title={editingItem ? 'Edit Career Pillar' : 'Add Career Pillar'}
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
