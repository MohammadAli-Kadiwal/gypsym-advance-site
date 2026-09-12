'use client';

import * as React from 'react';
import { DataTable, ColumnDef } from '@/components/crud/data-table';
import { CrudSheet, FieldConfig } from '@/components/crud/crud-sheet';
import { useCmsCollection, BaseRecord } from '@/lib/store';
import { ShieldCheck } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface CertRecord extends BaseRecord {
  name: string;
  issuer: string;
  validUntil: string;
  scope: string;
}

export default function CertificationsAdminPage() {
  const { data, createItem, updateItem, deleteItem, bulkDelete, bulkUpdateStatus } =
    useCmsCollection<CertRecord>('certifications');

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<CertRecord | null>(null);

  const formFields: FieldConfig[] = [
    { name: 'name', label: 'Certification Title', required: true, placeholder: 'e.g. ISO/IEC 27001:2022' },
    { name: 'issuer', label: 'Accredited Auditor / Issuer', required: true, placeholder: 'BSI Global' },
    { name: 'validUntil', label: 'Valid Through Date', required: true, placeholder: '2028-12-31' },
    { name: 'scope', label: 'Certified Operational Scope', type: 'textarea', required: true },
  ];

  const columns: ColumnDef<CertRecord>[] = [
    {
      key: 'name',
      header: 'Certification Standard',
      sortable: true,
      render: (item) => (
        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="font-bold text-foreground">{item.name}</span>
        </div>
      ),
    },
    {
      key: 'issuer',
      header: 'Auditing Body',
      sortable: true,
      render: (item) => <span className="text-xs text-muted-foreground">{item.issuer}</span>,
    },
    {
      key: 'validUntil',
      header: 'Expiration',
      render: (item) => <span className="font-mono text-xs text-foreground font-semibold">{item.validUntil}</span>,
    },
    {
      key: 'scope',
      header: 'Audit Scope',
      render: (item) => <span className="text-xs text-muted-foreground line-clamp-2">{item.scope}</span>,
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
      <DataTable<CertRecord>
        title="Compliance & Security Certifications"
        description="Authoritative regulatory accreditations including ISO 27001, SOC 2 Type II, and PCI-DSS Level 1."
        data={data}
        columns={columns}
        searchKeys={['name', 'issuer', 'scope']}
        requiredPermission="content:write"
        addButtonLabel="New Certification"
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
        title={editingItem ? 'Edit Certification' : 'Add Compliance Certification'}
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
