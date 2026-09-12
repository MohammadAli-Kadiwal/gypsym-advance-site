'use client';

import * as React from 'react';
import { DataTable, ColumnDef } from '@/components/crud/data-table';
import { CrudSheet, FieldConfig } from '@/components/crud/crud-sheet';
import { useCmsCollection, BaseRecord } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface RoleRecord extends BaseRecord {
  name: string;
  code: string;
  description: string;
  userCount: number;
  isSystem: boolean;
}

export default function RolesAdminPage() {
  const { data, createItem, updateItem, deleteItem, bulkDelete, bulkUpdateStatus } =
    useCmsCollection<RoleRecord>('roles');

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<RoleRecord | null>(null);

  const formFields: FieldConfig[] = [
    { name: 'name', label: 'Role Name', required: true, placeholder: 'e.g. Technical Editor' },
    { name: 'code', label: 'System Code (Uppercase)', required: true, placeholder: 'EDITOR' },
    { name: 'description', label: 'Access Policy Description', type: 'textarea', required: true },
  ];

  const columns: ColumnDef<RoleRecord>[] = [
    {
      key: 'name',
      header: 'Role Definition',
      sortable: true,
      render: (item) => (
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-primary shrink-0" />
          <div>
            <span className="font-bold text-foreground">{item.name}</span>
            <div className="font-mono text-[10px] text-muted-foreground">{item.code}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Scope Description',
      render: (item) => <span className="text-xs text-muted-foreground line-clamp-2">{item.description}</span>,
    },
    {
      key: 'userCount',
      header: 'Assigned Users',
      sortable: true,
      render: (item) => <span className="font-mono text-xs font-semibold text-foreground">{item.userCount || 0} users</span>,
    },
    {
      key: 'isSystem',
      header: 'Role Class',
      render: (item) => (
        <Badge variant={item.isSystem ? 'secondary' : 'outline'} className="text-[10px]">
          {item.isSystem ? 'SYSTEM BUILT-IN' : 'CUSTOM'}
        </Badge>
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
      <DataTable<RoleRecord>
        title="Role-Based Access Control (RBAC) Roles"
        description="System and custom roles defining boundaries across editorial, media, and platform governance."
        data={data}
        columns={columns}
        searchKeys={['name', 'code', 'description']}
        requiredPermission="users:manage"
        addButtonLabel="New Role"
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
        title={editingItem ? 'Edit Access Role' : 'Create Custom Access Role'}
        fields={formFields}
        initialData={editingItem}
        onSubmit={(form) => {
          if (editingItem) {
            updateItem(editingItem.id, form);
          } else {
            createItem({ ...form, userCount: 0, isSystem: false } as any);
          }
        }}
      />
    </>
  );
}
