'use client';

import * as React from 'react';
import { DataTable, ColumnDef } from '@/components/crud/data-table';
import { CrudSheet, FieldConfig } from '@/components/crud/crud-sheet';
import { useCmsCollection, BaseRecord } from '@/lib/store';
import { formatDate } from '@/lib/utils';

interface CategoryRecord extends BaseRecord {
  name: string;
  slug: string;
  count: number;
}

export default function CategoriesAdminPage() {
  const { data, createItem, updateItem, deleteItem, bulkDelete, bulkUpdateStatus } =
    useCmsCollection<CategoryRecord>('categories');

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<CategoryRecord | null>(null);

  const formFields: FieldConfig[] = [
    { name: 'name', label: 'Category Name', required: true, placeholder: 'e.g. Architecture & Distributed Systems' },
    { name: 'slug', label: 'Route Slug', required: true, placeholder: 'architecture' },
  ];

  const columns: ColumnDef<CategoryRecord>[] = [
    {
      key: 'name',
      header: 'Category Taxonomy',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-bold text-foreground">{item.name}</span>
          <div className="font-mono text-[10px] text-muted-foreground">{item.slug}</div>
        </div>
      ),
    },
    {
      key: 'count',
      header: 'Assigned Articles',
      sortable: true,
      render: (item) => <span className="font-mono text-xs text-foreground font-semibold">{item.count || 0} posts</span>,
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
      <DataTable<CategoryRecord>
        title="Editorial Categories Taxonomy"
        description="Taxonomy taxonomy clusters classifying whitepapers, architecture deep dives, and security advisories."
        data={data}
        columns={columns}
        searchKeys={['name', 'slug']}
        requiredPermission="content:write"
        addButtonLabel="New Category"
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
        title={editingItem ? 'Edit Category' : 'Create Category'}
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
