'use client';

import * as React from 'react';
import { DataTable, ColumnDef } from '@/components/crud/data-table';
import { CrudSheet, FieldConfig } from '@/components/crud/crud-sheet';
import { useCmsCollection, BaseRecord } from '@/lib/store';
import { formatDate } from '@/lib/utils';

interface CaseStudyRecord extends BaseRecord {
  title: string;
  slug: string;
  client: string;
  industry: string;
  dailyVolume?: string;
  settlementLatency?: string;
  uptime?: string;
}

export default function CaseStudiesAdminPage() {
  const { data, createItem, updateItem, deleteItem, bulkDelete, bulkUpdateStatus } =
    useCmsCollection<CaseStudyRecord>('caseStudies');

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<CaseStudyRecord | null>(null);

  const formFields: FieldConfig[] = [
    {
      name: 'title',
      label: 'Case Study Title',
      required: true,
      placeholder: 'e.g. Transforming Global Derivatives Clearing',
      section: 'Basic Information',
    },
    {
      name: 'slug',
      label: 'URL Route Slug',
      required: true,
      placeholder: 'apex-capital-transformation',
      section: 'Basic Information',
    },
    {
      name: 'client',
      label: 'Client Organization',
      required: true,
      placeholder: 'Apex Capital Management',
      section: 'Client & Industry',
    },
    {
      name: 'industry',
      label: 'Industry Vertical',
      required: true,
      placeholder: 'Financial Services',
      section: 'Client & Industry',
    },
    {
      name: 'dailyVolume',
      label: 'Key Throughput Metric',
      placeholder: '$40B+ Daily Volume',
      section: 'Metrics & Results',
    },
    {
      name: 'settlementLatency',
      label: 'Latency / Speed Metric',
      placeholder: '10ms Finality',
      section: 'Metrics & Results',
    },
    {
      name: 'uptime',
      label: 'Operational SLA / Uptime',
      placeholder: '99.999% SLA',
      section: 'Metrics & Results',
    },
  ];

  const columns: ColumnDef<CaseStudyRecord>[] = [
    {
      key: 'title',
      header: 'Story Title & Route',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-semibold text-slate-900">{item.title}</span>
          <div className="font-mono text-[11px] text-slate-400">{item.slug}</div>
        </div>
      ),
    },
    {
      key: 'client',
      header: 'Client Partner',
      sortable: true,
      render: (item) => <span className="font-medium text-slate-800 text-xs">{item.client}</span>,
    },
    {
      key: 'industry',
      header: 'Industry',
      sortable: true,
      render: (item) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-100 text-slate-700">
          {item.industry}
        </span>
      ),
    },
    {
      key: 'dailyVolume',
      header: 'Key Metric',
      render: (item) => (
        <span className="font-mono text-xs font-semibold text-blue-600">
          {item.dailyVolume || item.uptime || 'Verified'}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Last Modified',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-[11px] text-slate-500">{formatDate(item.updatedAt)}</span>
      ),
    },
  ];

  return (
    <>
      <DataTable<CaseStudyRecord>
        title="Case Studies"
        description="Create and publish transformation stories, customer results, and verified metric achievements."
        data={data}
        columns={columns}
        searchKeys={['title', 'slug', 'client', 'industry']}
        requiredPermission="content:write"
        addButtonLabel="Create Case Study"
        entityName="case study"
        emptyStateTitle="No case studies yet."
        emptyStateDescription="Create your first customer case study to showcase measurable business outcomes."
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
        title={editingItem ? 'Edit Case Study' : 'Create Case Study'}
        description={
          editingItem
            ? 'Update customer metrics, testimonial highlights, and industry vertical.'
            : 'Enter the details to create a new customer case study.'
        }
        fields={formFields}
        initialData={editingItem}
        submitLabel={editingItem ? 'Save Changes' : 'Create Case Study'}
        successMessage={editingItem ? 'Case study updated successfully.' : 'Case study created successfully.'}
        onSubmit={async (form) => {
          if (editingItem) {
            await updateItem(editingItem.id, form);
          } else {
            await createItem(form as any);
          }
        }}
      />
    </>
  );
}
