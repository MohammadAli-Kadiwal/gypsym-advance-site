'use client';

import * as React from 'react';
import { DataTable, ColumnDef } from '@/components/crud/data-table';
import { CrudSheet, FieldConfig } from '@/components/crud/crud-sheet';
import { useCmsCollection, BaseRecord } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Linkedin, Twitter, Github } from 'lucide-react';

interface TeamRecord extends BaseRecord {
  avatar?: string;
  name: string;
  role: string;
  department: string;
  bio: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
  isLeadership: boolean;
}

export default function TeamAdminPage() {
  const { data, createItem, updateItem, deleteItem, bulkDelete, bulkUpdateStatus } =
    useCmsCollection<TeamRecord>('team');

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<TeamRecord | null>(null);

  const formFields: FieldConfig[] = [
    {
      name: 'avatar',
      label: 'Profile Photo / Avatar',
      type: 'image',
      description: 'Upload a square portrait or avatar image (PNG, JPG, WebP, SVG).',
    },
    {
      name: 'name',
      label: 'Full Name',
      required: true,
      placeholder: 'e.g. MohammadAli Kadiwal',
    },
    {
      name: 'role',
      label: 'Executive / Technical Title',
      required: true,
      placeholder: 'e.g. Founder & Principal Architect',
    },
    {
      name: 'department',
      label: 'Department / Practice',
      required: true,
      placeholder: 'e.g. Architecture & Engineering',
    },
    {
      name: 'bio',
      label: 'Biography / Background',
      type: 'textarea',
      required: true,
      placeholder: 'Brief summary of expertise, background, and specialization...',
    },
    {
      name: 'linkedinUrl',
      label: 'LinkedIn Profile URL',
      placeholder: 'https://linkedin.com/in/...',
    },
    {
      name: 'twitterUrl',
      label: 'X (Twitter) Profile URL',
      placeholder: 'https://x.com/...',
    },
    {
      name: 'githubUrl',
      label: 'GitHub Profile URL',
      placeholder: 'https://github.com/...',
    },
    {
      name: 'isLeadership',
      label: 'Executive Leadership Member',
      type: 'switch',
      description: 'Highlight prominently as a core leadership member.',
    },
  ];

  const columns: ColumnDef<TeamRecord>[] = [
    {
      key: 'name',
      header: 'Team Member',
      sortable: true,
      render: (item) => {
        const initials = (item.name || 'TM')
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();

        return (
          <div className="flex items-center gap-3">
            {item.avatar ? (
              <img
                src={item.avatar}
                alt={item.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-200/80 shadow-xs shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                {initials}
              </div>
            )}
            <div>
              <span className="font-semibold text-slate-900 text-sm block">{item.name}</span>
              <div className="text-xs text-blue-600 font-medium">{item.role}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      render: (item) => (
        <Badge variant="outline" className="text-[11px] font-medium border-slate-200 text-slate-600">
          {item.department || 'General'}
        </Badge>
      ),
    },
    {
      key: 'isLeadership',
      header: 'Tier',
      sortable: true,
      render: (item) => (
        <span className="text-xs font-mono">
          {item.isLeadership ? (
            <Badge variant="success" className="text-[10px] font-semibold">LEADERSHIP</Badge>
          ) : (
            <Badge variant="muted" className="text-[10px] font-medium">SPECIALIST</Badge>
          )}
        </span>
      ),
    },
    {
      key: 'socials' as any,
      header: 'Socials',
      render: (item) => {
        return (
          <div className="flex items-center gap-2 text-slate-400">
            {item.linkedinUrl && (
              <a
                href={item.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-blue-600 transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
            )}
            {item.twitterUrl && (
              <a
                href={item.twitterUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-900 transition-colors"
                title="Twitter / X"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
            )}
            {item.githubUrl && (
              <a
                href={item.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-900 transition-colors"
                title="GitHub"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
            )}
            {!item.linkedinUrl && !item.twitterUrl && !item.githubUrl && (
              <span className="text-xs text-slate-300">—</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'bio',
      header: 'Bio Narrative',
      render: (item) => (
        <span className="text-xs text-slate-500 line-clamp-2 max-w-xs">{item.bio}</span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-[11px] text-slate-400">{formatDate(item.updatedAt)}</span>
      ),
    },
  ];

  return (
    <>
      <DataTable<TeamRecord>
        title="Team & Leadership Profiles"
        description="Public executive roster, principal architects, and senior engineering specialists."
        data={data}
        columns={columns}
        searchKeys={['name', 'role', 'department', 'bio']}
        requiredPermission="content:write"
        addButtonLabel="New Team Member"
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
        title={editingItem ? 'Edit Team Profile' : 'Add Team Member'}
        description="Upload avatar portrait and configure bio and social media links."
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
