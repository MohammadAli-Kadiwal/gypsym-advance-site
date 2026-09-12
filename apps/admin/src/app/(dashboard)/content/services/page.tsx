'use client';

import * as React from 'react';
import { DataTable, ColumnDef } from '@/components/crud/data-table';
import { CrudSheet, FieldConfig } from '@/components/crud/crud-sheet';
import { useCmsCollection, BaseRecord } from '@/lib/store';
import { formatDate } from '@/lib/utils';

interface ServiceRecord extends BaseRecord {
  title: string;
  slug: string;
  tagline: string;
  shortDescription: string;
  category: string;
  technologies?: string[];
}

export default function ServicesAdminPage() {
  const { data, createItem, updateItem, deleteItem, bulkDelete, bulkUpdateStatus } =
    useCmsCollection<ServiceRecord>('services');

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<ServiceRecord | null>(null);

  const formFields: FieldConfig[] = [
    {
      name: 'title',
      label: 'Service Name',
      required: true,
      placeholder: 'e.g. Enterprise Cloud Modernization',
      section: 'Basic Information',
    },
    {
      name: 'slug',
      label: 'URL Slug',
      required: true,
      placeholder: 'cloud-modernization',
      section: 'Basic Information',
    },
    {
      name: 'category',
      label: 'Category',
      required: true,
      placeholder: 'Cloud Infrastructure',
      section: 'Basic Information',
    },
    {
      name: 'tagline',
      label: 'Tagline',
      required: true,
      placeholder: 'Zero-Downtime Planetary Migration',
      section: 'Content',
    },
    {
      name: 'shortDescription',
      label: 'Service Description',
      type: 'textarea',
      required: true,
      placeholder: 'Describe the deliverables and business value...',
      section: 'Content',
    },
  ];

  const columns: ColumnDef<ServiceRecord>[] = [
    {
      key: 'title',
      header: 'Service Name & Slug',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-semibold text-slate-900">{item.title}</span>
          <div className="font-mono text-[11px] text-slate-400">{item.slug}</div>
        </div>
      ),
    },
    {
      key: 'tagline',
      header: 'Tagline',
      render: (item) => <span className="text-xs text-slate-600">{item.tagline}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (item) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-100 text-slate-700">
          {item.category}
        </span>
      ),
    },
    {
      key: 'technologies',
      header: 'Tech Stack',
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.technologies?.slice(0, 3).map((t, idx) => (
            <span
              key={idx}
              className="rounded-md bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[10px] font-mono text-slate-600"
            >
              {t}
            </span>
          ))}
        </div>
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
      <DataTable<ServiceRecord>
        title="Services"
        description="Create and manage practice areas, deliverables, and capability offerings."
        data={data}
        columns={columns}
        searchKeys={['title', 'slug', 'category', 'tagline']}
        requiredPermission="content:write"
        addButtonLabel="Add Service"
        entityName="service"
        emptyStateTitle="No services yet."
        emptyStateDescription="Add your first service offering to display it on the website."
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
        title={editingItem ? 'Edit Service' : 'Add Service'}
        description={
          editingItem
            ? 'Update service specifications, category, and deliverables.'
            : 'Enter the details to add a new service offering.'
        }
        fields={formFields}
        initialData={editingItem}
        submitLabel={editingItem ? 'Save Changes' : 'Add Service'}
        successMessage={editingItem ? 'Service updated successfully.' : 'Service created successfully.'}
        onSubmit={async (form) => {
          if (editingItem) {
            await updateItem(editingItem.id, form);
          } else {
            await createItem({
              ...form,
              technologies: ['React', 'Next.js', 'TypeScript', 'Node.js'],
            } as any);
          }
        }}
      />
    </>
  );
}
