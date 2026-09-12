'use client';

import * as React from 'react';
import { DataTable, ColumnDef } from '@/components/crud/data-table';
import { CrudSheet, FieldConfig } from '@/components/crud/crud-sheet';
import { useCmsCollection, BaseRecord } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

interface UserRecord extends BaseRecord {
  name: string;
  email: string;
  role: string;
  isTwoFactorEnabled: boolean;
  lastLoginAt?: string;
}

export default function UsersAdminPage() {
  const { data, createItem, updateItem, deleteItem, bulkDelete, bulkUpdateStatus } =
    useCmsCollection<UserRecord>('users');

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<UserRecord | null>(null);

  const formFields: FieldConfig[] = [
    { name: 'name', label: 'Full Legal Name', required: true, placeholder: 'e.g. David Sterling' },
    { name: 'email', label: 'Enterprise Email', required: true, placeholder: 'david@gypsym.com' },
    {
      name: 'role',
      label: 'Assigned Role',
      type: 'select',
      required: true,
      options: [
        { label: 'Super Administrator', value: 'SUPER_ADMIN' },
        { label: 'Operations Administrator', value: 'ADMIN' },
        { label: 'Technical Editor', value: 'EDITOR' },
        { label: 'Contributing Author', value: 'AUTHOR' },
        { label: 'Compliance Auditor (Viewer)', value: 'VIEWER' },
      ],
    },
    { name: 'isTwoFactorEnabled', label: 'Enforce Hardware 2FA', type: 'switch' },
  ];

  const columns: ColumnDef<UserRecord>[] = [
    {
      key: 'name',
      header: 'User Account',
      sortable: true,
      render: (item) => (
        <div className="flex items-center space-x-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary font-mono text-xs font-bold">
            {item.name.charAt(0)}
          </div>
          <div>
            <span className="font-bold text-foreground">{item.name}</span>
            <div className="text-xs text-muted-foreground">{item.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Assigned Role',
      sortable: true,
      render: (item) => {
        const variant =
          item.role === 'SUPER_ADMIN'
            ? 'default'
            : item.role === 'ADMIN'
            ? 'secondary'
            : item.role === 'EDITOR'
            ? 'warning'
            : 'muted';
        return <Badge variant={variant as any}>{item.role}</Badge>;
      },
    },
    {
      key: 'isTwoFactorEnabled',
      header: '2FA Security',
      render: (item) => (
        <div className="flex items-center space-x-1 text-xs">
          {item.isTwoFactorEnabled ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-mono text-[11px]">ENFORCED</span>
            </>
          ) : (
            <>
              <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-amber-400 font-mono text-[11px]">DISABLED</span>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'lastLoginAt',
      header: 'Last Authentication',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-[11px] text-muted-foreground">
          {formatDateTime(item.lastLoginAt)}
        </span>
      ),
    },
  ];

  return (
    <>
      <DataTable<UserRecord>
        title="Identity & Access Management (IAM) Users"
        description="Provision, manage, and revoke enterprise user accounts and multi-factor authentication policies."
        data={data}
        columns={columns}
        searchKeys={['name', 'email', 'role']}
        requiredPermission="users:manage"
        addButtonLabel="Invite User"
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
        title={editingItem ? 'Edit IAM Account' : 'Invite New Enterprise User'}
        fields={formFields}
        initialData={editingItem}
        onSubmit={(form) => {
          if (editingItem) {
            updateItem(editingItem.id, form);
          } else {
            createItem({
              ...form,
              lastLoginAt: new Date().toISOString(),
            } as any);
          }
        }}
      />
    </>
  );
}
