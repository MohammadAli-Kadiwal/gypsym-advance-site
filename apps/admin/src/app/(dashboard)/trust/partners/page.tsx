'use client';

import * as React from 'react';
import { DataTable, ColumnDef } from '@/components/crud/data-table';
import { CrudSheet, FieldConfig } from '@/components/crud/crud-sheet';
import { useCmsCollection, BaseRecord } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface PartnerRecord extends BaseRecord {
  name: string;
  tier: string;
  competencies: string;
}

export default function PartnersAdminPage() {
  const { data, createItem, updateItem, deleteItem, bulkDelete, bulkUpdateStatus } =
    useCmsCollection<PartnerRecord>('partners');

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<PartnerRecord | null>(null);

  const formFields: FieldConfig[] = [
    { name: 'name', label: 'Partner Organization', required: true, placeholder: 'e.g. Amazon Web Services' },
    { name: 'tier', label: 'Partnership Tier', required: true, placeholder: 'Premier Tier Services Partner' },
    { name: 'competencies', label: 'Validated Competencies', type: 'textarea', required: true, placeholder: 'Financial Services, Migration, Security' },
  ];

  const columns: ColumnDef<PartnerRecord>[] = [
    {
      key: 'name',
      header: 'Strategic Partner',
      sortable: true,
      render: (item) => (
        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4 text-primary shrink-0" />
          <span className="font-bold text-foreground">{item.name}</span>
        </div>
      ),
    },
    {
      key: 'tier',
      header: 'Partnership Tier',
      sortable: true,
      render: (item) => <Badge variant="outline">{item.tier}</Badge>,
    },
    {
      key: 'competencies',
      header: 'Competencies & Alliances',
      render: (item) => <span className="text-xs text-muted-foreground line-clamp-2">{item.competencies}</span>,
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
      <DataTable<PartnerRecord>
        title="Hyperscaler Alliances & Technology Partners"
        description="Strategic alliances with hyperscalers, silicon manufacturers, and cloud consortiums."
        data={data}
        columns={columns}
        searchKeys={['name', 'tier', 'competencies']}
        requiredPermission="content:write"
        addButtonLabel="New Partner"
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
        title={editingItem ? 'Edit Partner' : 'Add Strategic Partner'}
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
