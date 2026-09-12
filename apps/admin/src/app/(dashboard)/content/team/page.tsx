'use client';

import * as React from 'react';
import { DataTable, ColumnDef } from '@/components/crud/data-table';
import { CrudSheet, FieldConfig } from '@/components/crud/crud-sheet';
import { useCmsCollection, BaseRecord } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface TeamRecord extends BaseRecord {
  name: string;
  role: string;
  department: string;
  bio: string;
  isLeadership: boolean;
}

export default function TeamAdminPage() {
  const { data, createItem, updateItem, deleteItem, bulkDelete, bulkUpdateStatus } =
    useCmsCollection<TeamRecord>('team');

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<TeamRecord | null>(null);

  const formFields: FieldConfig[] = [
    { name: 'name', label: 'Full Name', required: true, placeholder: 'e.g. MohammadAli Kadiwal' },
    { name: 'role', label: 'Executive / Technical Title', required: true, placeholder: 'CEO & Chief Architect' },
    { name: 'department', label: 'Department / Practice', required: true, placeholder: 'Executive Leadership' },
    { name: 'bio', label: 'Biography', type: 'textarea', required: true },
    { name: 'isLeadership', label: 'Executive Board Member', type: 'switch' },
  ];

  const columns: ColumnDef<TeamRecord>[] = [
    {
      key: 'name',
      header: 'Leader Name & Role',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-bold text-foreground">{item.name}</span>
          <div className="text-xs text-primary font-medium">{item.role}</div>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      render: (item) => <Badge variant="outline">{item.department}</Badge>,
    },
    {
      key: 'isLeadership',
      header: 'Board Member',
      render: (item) => (
        <span className="text-xs font-mono">
          {item.isLeadership ? (
            <Badge variant="success">LEADERSHIP</Badge>
          ) : (
            <Badge variant="muted">FELLOW</Badge>
          )}
        </span>
      ),
    },
    {
      key: 'bio',
      header: 'Bio Narrative',
      render: (item) => <span className="text-xs text-muted-foreground line-clamp-2">{item.bio}</span>,
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
      <DataTable<TeamRecord>
        title="Executive Leadership & Engineering Fellows"
        description="Public executive roster, architecture fellows, and practice directors."
        data={data}
        columns={columns}
        searchKeys={['name', 'role', 'department', 'bio']}
        requiredPermission="content:write"
        addButtonLabel="New Team Member"
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
        title={editingItem ? 'Edit Profile' : 'Add Team Member'}
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
