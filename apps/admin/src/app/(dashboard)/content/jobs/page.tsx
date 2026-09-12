'use client';

import * as React from 'react';
import { DataTable, ColumnDef } from '@/components/crud/data-table';
import { CrudSheet, FieldConfig } from '@/components/crud/crud-sheet';
import { useCmsCollection, BaseRecord } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface JobRecord extends BaseRecord {
  title: string;
  requisitionCode: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  applicantsCount?: number;
}

export default function JobsAdminPage() {
  const { data, createItem, updateItem, deleteItem, bulkDelete, bulkUpdateStatus } =
    useCmsCollection<JobRecord>('jobs');

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<JobRecord | null>(null);

  const formFields: FieldConfig[] = [
    { name: 'title', label: 'Requisition Title', required: true, placeholder: 'e.g. Principal Distributed Systems Engineer' },
    { name: 'requisitionCode', label: 'Requisition Code', required: true, placeholder: 'GYP-ENG-2026-03' },
    { name: 'department', label: 'Practice / Department', required: true, placeholder: 'Distributed Systems' },
    { name: 'location', label: 'Location & Work Policy', required: true, placeholder: 'London, UK / Remote' },
    { name: 'experience', label: 'Seniority Level', placeholder: 'Principal (8+ Years)' },
    { name: 'type', label: 'Employment Type', placeholder: 'Full-Time' },
  ];

  const columns: ColumnDef<JobRecord>[] = [
    {
      key: 'title',
      header: 'Job Title & Requisition',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-bold text-foreground">{item.title}</span>
          <div className="font-mono text-[10px] text-primary">{item.requisitionCode}</div>
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
      key: 'location',
      header: 'Location',
      render: (item) => <span className="text-xs text-muted-foreground">{item.location}</span>,
    },
    {
      key: 'applicantsCount',
      header: 'Candidate ATS',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-xs font-semibold text-emerald-400">
          {item.applicantsCount || 0} active candidates
        </span>
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
      <DataTable<JobRecord>
        title="Open Engineering Requisitions & ATS"
        description="Manage high-stakes talent openings, requisition codes, and candidate triage workflows."
        data={data}
        columns={columns}
        searchKeys={['title', 'requisitionCode', 'department', 'location']}
        requiredPermission="content:write"
        addButtonLabel="New Requisition"
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
        title={editingItem ? 'Edit Requisition' : 'Open New Requisition'}
        fields={formFields}
        initialData={editingItem}
        onSubmit={(form) => {
          if (editingItem) {
            updateItem(editingItem.id, form);
          } else {
            createItem({
              ...form,
              applicantsCount: 0,
            } as any);
          }
        }}
      />
    </>
  );
}
