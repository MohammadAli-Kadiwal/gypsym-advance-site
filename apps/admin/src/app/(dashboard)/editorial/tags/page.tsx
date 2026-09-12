'use client';

import * as React from 'react';
import { DataTable, ColumnDef } from '@/components/crud/data-table';
import { CrudSheet, FieldConfig } from '@/components/crud/crud-sheet';
import { useCmsCollection, BaseRecord } from '@/lib/store';
import { formatDate } from '@/lib/utils';

interface TagRecord extends BaseRecord {
  name: string;
  slug: string;
  count: number;
}

export default function TagsAdminPage() {
  const { data, createItem, updateItem, deleteItem, bulkDelete, bulkUpdateStatus } =
    useCmsCollection<TagRecord>('tags');

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<TagRecord | null>(null);

  const formFields: FieldConfig[] = [
    { name: 'name', label: 'Tag Name', required: true, placeholder: 'e.g. Raft Consensus' },
    { name: 'slug', label: 'Route Slug', required: true, placeholder: 'raft-consensus' },
  ];

  const columns: ColumnDef<TagRecord>[] = [
    {
      key: 'name',
      header: 'Content Tag',
      sortable: true,
      render: (item) => (
        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs font-bold text-foreground">#{item.name}</span>
          <span className="font-mono text-[10px] text-muted-foreground">({item.slug})</span>
        </div>
      ),
    },
    {
      key: 'count',
      header: 'Linked Resources',
      sortable: true,
      render: (item) => <span className="font-mono text-xs text-primary font-semibold">{item.count || 0} references</span>,
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
      <DataTable<TagRecord>
        title="Content Tags"
        description="Faceted search keywords and technical taxonomy tags across pages, services, and whitepapers."
        data={data}
        columns={columns}
        searchKeys={['name', 'slug']}
        requiredPermission="content:write"
        addButtonLabel="New Tag"
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
        title={editingItem ? 'Edit Tag' : 'Create Tag'}
        fields={formFields}
        initialData={editingItem}
        onSubmit={(form) => {
          if (editingItem) {
            updateItem(editingItem.id, form);
          } else {
            createItem({ ...form, count: 0 } as any);
          }
        }}
      />
    </>
  );
}
