'use client';

import * as React from 'react';
import { DataTable, ColumnDef } from '@/components/crud/data-table';
import { CrudSheet, FieldConfig } from '@/components/crud/crud-sheet';
import { useCmsCollection, BaseRecord } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface ProjectRecord extends BaseRecord {
  title: string;
  language: string;
  category: string;
  stars: string;
  license: string;
}

export default function ProjectsAdminPage() {
  const { data, createItem, updateItem, deleteItem, bulkDelete, bulkUpdateStatus } =
    useCmsCollection<ProjectRecord>('projects');

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<ProjectRecord | null>(null);

  const formFields: FieldConfig[] = [
    { name: 'title', label: 'Repository / Toolkit Name', required: true, placeholder: 'e.g. gypsym-consensus-rs' },
    { name: 'language', label: 'Primary Language', required: true, placeholder: 'Rust' },
    { name: 'category', label: 'Domain Category', required: true, placeholder: 'Raft Consensus' },
    { name: 'stars', label: 'GitHub Stars', placeholder: '1.2k' },
    { name: 'license', label: 'Open Source License', placeholder: 'Apache-2.0' },
  ];

  const columns: ColumnDef<ProjectRecord>[] = [
    {
      key: 'title',
      header: 'Repository Name',
      sortable: true,
      render: (item) => <span className="font-mono font-bold text-foreground">{item.title}</span>,
    },
    {
      key: 'language',
      header: 'Language',
      sortable: true,
      render: (item) => <Badge variant="outline">{item.language}</Badge>,
    },
    {
      key: 'category',
      header: 'Domain Focus',
      render: (item) => <span className="text-xs text-muted-foreground">{item.category}</span>,
    },
    {
      key: 'stars',
      header: 'GitHub Stars',
      sortable: true,
      render: (item) => <span className="font-mono text-xs text-primary font-bold">★ {item.stars}</span>,
    },
    {
      key: 'license',
      header: 'License',
      render: (item) => <span className="font-mono text-[10px] text-muted-foreground">{item.license}</span>,
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
      <DataTable<ProjectRecord>
        title="R&D Labs & Open Source Projects"
        description="Foundational open source primitives and experimental toolkits authored by Gypsym."
        data={data}
        columns={columns}
        searchKeys={['title', 'language', 'category']}
        requiredPermission="content:write"
        addButtonLabel="New Open Source Project"
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
        title={editingItem ? 'Edit Project Toolkit' : 'Add Open Source Toolkit'}
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
