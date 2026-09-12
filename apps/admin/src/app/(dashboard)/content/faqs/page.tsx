'use client';

import * as React from 'react';
import { DataTable, ColumnDef } from '@/components/crud/data-table';
import { CrudSheet, FieldConfig } from '@/components/crud/crud-sheet';
import { useCmsCollection, BaseRecord } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface FaqRecord extends BaseRecord {
  question: string;
  answer: string;
  category: string;
  sortOrder?: number;
}

export default function FaqsAdminPage() {
  const { data, createItem, updateItem, deleteItem, bulkDelete, bulkUpdateStatus } =
    useCmsCollection<FaqRecord>('faqs');

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<FaqRecord | null>(null);

  const formFields: FieldConfig[] = [
    { name: 'question', label: 'Technical Question', required: true, placeholder: 'e.g. How does Gypsym guarantee zero downtime?' },
    { name: 'category', label: 'Category', required: true, placeholder: 'Engineering & Migration' },
    { name: 'answer', label: 'Detailed Answer', type: 'textarea', required: true },
    { name: 'sortOrder', label: 'Sort Priority Order', type: 'number' },
  ];

  const columns: ColumnDef<FaqRecord>[] = [
    {
      key: 'question',
      header: 'Question',
      sortable: true,
      render: (item) => <span className="font-bold text-foreground text-xs">{item.question}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (item) => <Badge variant="outline">{item.category}</Badge>,
    },
    {
      key: 'answer',
      header: 'Answer Excerpt',
      render: (item) => <span className="text-xs text-muted-foreground line-clamp-2">{item.answer}</span>,
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
      <DataTable<FaqRecord>
        title="Technical FAQs & Knowledge Base"
        description="Categorized technical questions addressing architectural validation, sovereignty, and migration SLAs."
        data={data}
        columns={columns}
        searchKeys={['question', 'answer', 'category']}
        requiredPermission="content:write"
        addButtonLabel="New FAQ"
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
        title={editingItem ? 'Edit FAQ' : 'Add New FAQ'}
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
