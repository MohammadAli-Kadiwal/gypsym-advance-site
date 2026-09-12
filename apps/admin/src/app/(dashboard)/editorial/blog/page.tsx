'use client';

import * as React from 'react';
import { DataTable, ColumnDef } from '@/components/crud/data-table';
import { CrudSheet, FieldConfig } from '@/components/crud/crud-sheet';
import { useCmsCollection, BaseRecord } from '@/lib/store';
import { formatDate } from '@/lib/utils';

interface BlogRecord extends BaseRecord {
  title: string;
  slug: string;
  category: string;
  author: string;
  readTime: string;
  publishedAt?: string;
  viewsCount?: number;
}

export default function BlogAdminPage() {
  const { data, createItem, updateItem, deleteItem, bulkDelete, bulkUpdateStatus } =
    useCmsCollection<BlogRecord>('blogs');

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<BlogRecord | null>(null);

  const formFields: FieldConfig[] = [
    {
      name: 'title',
      label: 'Article Title',
      required: true,
      placeholder: 'e.g. Scaling Distributed Workloads with Zero Drift',
      section: 'Basic Information',
    },
    {
      name: 'slug',
      label: 'URL Slug',
      required: true,
      placeholder: 'scaling-distributed-workloads',
      section: 'Basic Information',
    },
    {
      name: 'category',
      label: 'Category',
      required: true,
      placeholder: 'Architecture',
      section: 'Basic Information',
    },
    {
      name: 'author',
      label: 'Author',
      required: true,
      placeholder: 'e.g. MohammadAli Kadiwal',
      section: 'Author & Metadata',
    },
    {
      name: 'readTime',
      label: 'Estimated Read Time',
      placeholder: 'e.g. 5 min',
      section: 'Author & Metadata',
    },
  ];

  const columns: ColumnDef<BlogRecord>[] = [
    {
      key: 'title',
      header: 'Article Title & Slug',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-semibold text-slate-900">{item.title}</span>
          <div className="font-mono text-[11px] text-slate-400">{item.slug}</div>
        </div>
      ),
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
      key: 'author',
      header: 'Author',
      render: (item) => <span className="text-xs text-slate-600">{item.author}</span>,
    },
    {
      key: 'viewsCount',
      header: 'Read Count',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-xs font-semibold text-blue-600">
          {item.viewsCount ? `${(item.viewsCount / 1000).toFixed(1)}k reads` : '0 reads'}
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
      <DataTable<BlogRecord>
        title="Blog Posts"
        description="Create, review, and publish technical articles and company announcements."
        data={data}
        columns={columns}
        searchKeys={['title', 'slug', 'category', 'author']}
        requiredPermission="content:write"
        addButtonLabel="Create Blog Post"
        entityName="blog post"
        emptyStateTitle="No blog posts yet."
        emptyStateDescription="Write your first article to share news and technical insights."
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
        title={editingItem ? 'Edit Blog Post' : 'Create Blog Post'}
        description={
          editingItem
            ? 'Update article headline, URL route, and author attribution.'
            : 'Enter initial details to draft a new blog post.'
        }
        fields={formFields}
        initialData={editingItem}
        submitLabel={editingItem ? 'Save Changes' : 'Create Blog Post'}
        successMessage={editingItem ? 'Blog post updated successfully.' : 'Blog post created successfully.'}
        onSubmit={async (form) => {
          if (editingItem) {
            await updateItem(editingItem.id, form);
          } else {
            await createItem({
              ...form,
              viewsCount: 0,
            } as any);
          }
        }}
      />
    </>
  );
}
