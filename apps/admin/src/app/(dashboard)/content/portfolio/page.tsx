'use client';

import * as React from 'react';
import { DataTable, ColumnDef } from '@/components/crud/data-table';
import { CrudSheet, FieldConfig } from '@/components/crud/crud-sheet';
import { useCmsCollection, BaseRecord } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface PortfolioRecord extends BaseRecord {
  orderNumber?: string;
  title: string;
  client: string;
  category: string;
  metrics?: string;
  projectUrl?: string;
  imageUrl: string;
}

export default function PortfolioAdminPage() {
  const { data, createItem, updateItem, deleteItem, bulkDelete, bulkUpdateStatus } =
    useCmsCollection<PortfolioRecord>('portfolio');

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<PortfolioRecord | null>(null);

  const formFields: FieldConfig[] = [
    {
      name: 'orderNumber',
      label: 'Numeric Ordering (e.g. 01, 02)',
      required: true,
      placeholder: '01',
      section: 'Identity & Ordering',
    },
    {
      name: 'title',
      label: 'Showcase Project Title',
      required: true,
      placeholder: 'Apex Capital Derivatives Exchange',
      section: 'Identity & Ordering',
    },
    {
      name: 'client',
      label: 'Client Organization',
      required: true,
      placeholder: 'Apex Capital Management',
      section: 'Classification',
    },
    {
      name: 'category',
      label: 'Domain Category',
      required: true,
      placeholder: 'Financial Infrastructure',
      section: 'Classification',
    },
    {
      name: 'metrics',
      label: 'Key Metric / Impact Result',
      placeholder: '$40B+ Daily Volume · 99.999% SLA',
      section: 'Metrics & Results',
    },
    {
      name: 'projectUrl',
      label: 'Destination Project URL',
      placeholder: '/portfolio/apex-capital-derivatives',
      section: 'Navigation',
    },
    {
      name: 'imageUrl',
      label: 'Showcase Cover Image URL',
      placeholder: 'https://images.unsplash.com/...',
      required: true,
      section: 'Media Assets',
    },
  ];

  const columns: ColumnDef<PortfolioRecord>[] = [
    {
      key: 'orderNumber',
      header: '# Order',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-xs font-bold text-[#d9127b] bg-[#d9127b]/10 px-2 py-0.5 rounded">
          {item.orderNumber || '--'}
        </span>
      ),
    },
    {
      key: 'title',
      header: 'Project Title',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-semibold text-slate-900">{item.title}</span>
          {item.projectUrl && (
            <div className="font-mono text-[11px] text-slate-400">{item.projectUrl}</div>
          )}
        </div>
      ),
    },
    {
      key: 'client',
      header: 'Client',
      sortable: true,
      render: (item) => <span className="font-medium text-slate-800 text-xs">{item.client}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      render: (item) => (
        <Badge variant="outline" className="text-[11px]">
          {item.category}
        </Badge>
      ),
    },
    {
      key: 'metrics',
      header: 'Impact Metric',
      render: (item) => (
        <span className="font-mono text-xs text-emerald-600 font-semibold">
          {item.metrics || '—'}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-[11px] text-muted-foreground">
          {formatDate(item.updatedAt)}
        </span>
      ),
    },
  ];

  return (
    <>
      <DataTable<PortfolioRecord>
        title="Portfolio / Our Work Showcase"
        description="Manage the enterprise production case studies and showcase projects displayed in the 2 → 1 → 2 interactive grid."
        data={data}
        columns={columns}
        searchKeys={['title', 'client', 'category', 'metrics']}
        requiredPermission="content:write"
        addButtonLabel="New Showcase Project"
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
        title={editingItem ? 'Edit Showcase Project' : 'Create Showcase Project'}
        fields={formFields}
        initialData={editingItem}
        onSubmit={(form) => {
          if (editingItem) {
            updateItem(editingItem.id, form);
          } else {
            createItem(form as Omit<PortfolioRecord, 'id' | 'createdAt' | 'updatedAt'>);
          }
          setSheetOpen(false);
        }}
      />
    </>
  );
}
