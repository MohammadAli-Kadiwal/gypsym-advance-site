'use client';

import * as React from 'react';
import { DataTable, ColumnDef } from '@/components/crud/data-table';
import { CrudSheet, FieldConfig } from '@/components/crud/crud-sheet';
import { useCmsCollection, BaseRecord } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Award } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface AwardRecord extends BaseRecord {
  title: string;
  organization: string;
  year: number;
  category: string;
}

export default function AwardsAdminPage() {
  const { data, createItem, updateItem, deleteItem, bulkDelete, bulkUpdateStatus } =
    useCmsCollection<AwardRecord>('awards');

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<AwardRecord | null>(null);

  const formFields: FieldConfig[] = [
    { name: 'title', label: 'Award / Accolade Title', required: true, placeholder: 'e.g. Global Banking Infrastructure Leader' },
    { name: 'organization', label: 'Conferring Organization', required: true, placeholder: 'FinTech Futures' },
    { name: 'year', label: 'Conferred Year', type: 'number', required: true },
    { name: 'category', label: 'Category', required: true, placeholder: 'Core Modernization' },
  ];

  const columns: ColumnDef<AwardRecord>[] = [
    {
      key: 'title',
      header: 'Accolade Title',
      sortable: true,
      render: (item) => (
        <div className="flex items-center space-x-2">
          <Award className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="font-bold text-foreground">{item.title}</span>
        </div>
      ),
    },
    {
      key: 'organization',
      header: 'Organization',
      sortable: true,
      render: (item) => <span className="text-xs text-muted-foreground">{item.organization}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      render: (item) => <Badge variant="outline">{item.category}</Badge>,
    },
    {
      key: 'year',
      header: 'Year',
      sortable: true,
      render: (item) => <span className="font-mono text-xs font-bold text-foreground">{item.year}</span>,
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
      <DataTable<AwardRecord>
        title="Industry Awards & Analyst Recognition"
        description="Global awards and analyst distinctions validating Gypsym's architectural leadership."
        data={data}
        columns={columns}
        searchKeys={['title', 'organization', 'category']}
        requiredPermission="content:write"
        addButtonLabel="New Award"
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
        title={editingItem ? 'Edit Award' : 'Add Industry Award'}
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
