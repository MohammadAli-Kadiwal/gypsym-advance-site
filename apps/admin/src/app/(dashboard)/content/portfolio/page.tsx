'use client';

import * as React from 'react';
import { Briefcase, FolderTree, ExternalLink } from 'lucide-react';
import { DataTable, ColumnDef } from '@/components/crud/data-table';
import { CrudSheet, FieldConfig } from '@/components/crud/crud-sheet';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { fetchApi, normalizeErrorMessage } from '@/lib/api-client';
import { notify } from '@/lib/notifications';
import { BaseRecord } from '@/lib/store';

interface PortfolioProjectRecord extends BaseRecord {
  orderNumber?: string;
  title: string;
  slug: string;
  client?: string;
  category?: string;
  categorySlug?: string;
  categoryId?: string;
  description?: string;
  imageUrl: string;
  altText?: string;
  projectUrl?: string;
  tags?: string[];
  metrics?: string;
  displayOrder?: number;
}

interface PortfolioCategoryRecord extends BaseRecord {
  name: string;
  slug: string;
  description?: string;
  displayOrder?: number;
  projectCount?: number;
}

export default function PortfolioAdminPage() {
  const [activeTab, setActiveTab] = React.useState<'projects' | 'categories'>('projects');

  // Data states
  const [projects, setProjects] = React.useState<PortfolioProjectRecord[]>([]);
  const [categories, setCategories] = React.useState<PortfolioCategoryRecord[]>([]);

  // Modal / Sheet states
  const [projectSheetOpen, setProjectSheetOpen] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<PortfolioProjectRecord | null>(null);

  const [categorySheetOpen, setCategorySheetOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<PortfolioCategoryRecord | null>(null);

  // Fetch data
  const loadData = React.useCallback(async () => {
    try {
      const [projData, catData] = await Promise.all([
        fetchApi<PortfolioProjectRecord[]>('/portfolio/admin/projects'),
        fetchApi<PortfolioCategoryRecord[]>('/portfolio/admin/categories'),
      ]);
      setProjects(Array.isArray(projData) ? projData : []);
      setCategories(Array.isArray(catData) ? catData : []);
    } catch (err) {
      notify.error(normalizeErrorMessage(err, 'Unable to load portfolio data.'));
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Project Operations ──────────────────────────────────────────────────────

  const handleCreateProject = async (form: Record<string, any>) => {
    try {
      await fetchApi('/portfolio', {
        method: 'POST',
        body: JSON.stringify({
          orderNumber: form.orderNumber,
          title: form.title,
          slug: form.slug,
          client: form.client,
          categoryId: form.categoryId || null,
          metrics: form.metrics,
          projectUrl: form.projectUrl,
          imageUrl: form.imageUrl,
          description: form.description,
          status: form.status || 'PUBLISHED',
        }),
      });
      notify.success('Portfolio project created successfully.');
      setProjectSheetOpen(false);
      loadData();
    } catch (err) {
      notify.error(normalizeErrorMessage(err, 'Unable to create portfolio project.'));
    }
  };

  const handleUpdateProject = async (id: string, form: Record<string, any>) => {
    try {
      await fetchApi(`/portfolio/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          orderNumber: form.orderNumber,
          title: form.title,
          slug: form.slug,
          client: form.client,
          categoryId: form.categoryId || null,
          metrics: form.metrics,
          projectUrl: form.projectUrl,
          imageUrl: form.imageUrl,
          description: form.description,
          status: form.status,
        }),
      });
      notify.success('Portfolio project updated successfully.');
      setProjectSheetOpen(false);
      loadData();
    } catch (err) {
      notify.error(normalizeErrorMessage(err, 'Unable to update portfolio project.'));
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await fetchApi(`/portfolio/${id}`, {
        method: 'DELETE',
      });
      notify.success('Portfolio project deleted successfully.');
      loadData();
    } catch (err) {
      notify.error(normalizeErrorMessage(err, 'Unable to delete portfolio project.'));
    }
  };

  // ─── Category Operations ─────────────────────────────────────────────────────

  const handleCreateCategory = async (form: Record<string, any>) => {
    try {
      await fetchApi('/portfolio/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          description: form.description,
          displayOrder: form.displayOrder ? Number(form.displayOrder) : undefined,
          status: form.status || 'PUBLISHED',
        }),
      });
      notify.success('Category created successfully.');
      setCategorySheetOpen(false);
      loadData();
    } catch (err) {
      notify.error(normalizeErrorMessage(err, 'Unable to create category.'));
    }
  };

  const handleUpdateCategory = async (id: string, form: Record<string, any>) => {
    try {
      await fetchApi(`/portfolio/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          description: form.description,
          displayOrder: form.displayOrder ? Number(form.displayOrder) : undefined,
          status: form.status,
        }),
      });
      notify.success('Category updated successfully.');
      setCategorySheetOpen(false);
      loadData();
    } catch (err) {
      notify.error(normalizeErrorMessage(err, 'Unable to update category.'));
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await fetchApi(`/portfolio/categories/${id}`, {
        method: 'DELETE',
      });
      notify.success('Category deleted successfully.');
      loadData();
    } catch (err) {
      // Rule 51: Delete protection - error toast if projects are associated
      notify.error(normalizeErrorMessage(err, 'Unable to delete category.'));
    }
  };

  // ─── Form Fields Configurations ──────────────────────────────────────────────

  const projectFormFields: FieldConfig[] = [
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
      name: 'slug',
      label: 'Project URL Slug (optional, auto-generated)',
      placeholder: 'apex-capital-derivatives',
      section: 'Identity & Ordering',
    },
    {
      name: 'client',
      label: 'Client Organization',
      placeholder: 'Apex Capital Management',
      section: 'Classification',
    },
    {
      name: 'categoryId',
      label: 'Category',
      type: 'select',
      required: false,
      options: [
        { label: 'Uncategorized', value: '' },
        ...categories.map((c) => ({
          label: c.name,
          value: c.id,
        })),
      ],
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
    {
      name: 'description',
      label: 'Project Summary',
      type: 'textarea',
      placeholder: 'High-throughput clearing architecture processing...',
      section: 'Overview',
    },
    {
      name: 'status',
      label: 'Publishing Status',
      type: 'select',
      options: [
        { label: 'Published', value: 'PUBLISHED' },
        { label: 'Draft', value: 'DRAFT' },
        { label: 'Archived', value: 'ARCHIVED' },
      ],
      section: 'Publishing',
    },
  ];

  const categoryFormFields: FieldConfig[] = [
    {
      name: 'name',
      label: 'Category Name',
      required: true,
      placeholder: 'Financial Infrastructure',
      section: 'General',
    },
    {
      name: 'slug',
      label: 'Category Slug (URL Identifier)',
      placeholder: 'financial-infrastructure',
      section: 'General',
    },
    {
      name: 'displayOrder',
      label: 'Numeric Display Order',
      type: 'number',
      placeholder: '1',
      section: 'General',
    },
    {
      name: 'description',
      label: 'Category Description',
      type: 'textarea',
      placeholder: 'Ultra-low-latency distributed clearing architectures and ledger networks...',
      section: 'Overview',
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Active / Published', value: 'PUBLISHED' },
        { label: 'Draft', value: 'DRAFT' },
      ],
      section: 'Publishing',
    },
  ];

  // ─── Table Columns ───────────────────────────────────────────────────────────

  const projectColumns: ColumnDef<PortfolioProjectRecord>[] = [
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
            <div className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
              <span>{item.projectUrl}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'client',
      header: 'Client',
      sortable: true,
      render: (item) => <span className="font-medium text-slate-800 text-xs">{item.client || '—'}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      render: (item) => (
        <Badge variant="outline" className="text-[11px] font-medium">
          {item.category || 'Uncategorized'}
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

  const categoryColumns: ColumnDef<PortfolioCategoryRecord>[] = [
    {
      key: 'displayOrder',
      header: '# Order',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-xs font-bold text-[#d9127b] bg-[#d9127b]/10 px-2 py-0.5 rounded">
          {String(item.displayOrder ?? 0).padStart(2, '0')}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Category Name',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-semibold text-slate-900">{item.name}</span>
          <div className="font-mono text-[11px] text-slate-400">/{item.slug}</div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (item) => (
        <span className="text-xs text-slate-600 line-clamp-1 max-w-sm">
          {item.description || '—'}
        </span>
      ),
    },
    {
      key: 'projectCount',
      header: 'Projects',
      sortable: true,
      render: (item) => (
        <Badge variant="secondary" className="font-mono text-[11px]">
          {item.projectCount ?? 0} {item.projectCount === 1 ? 'project' : 'projects'}
        </Badge>
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
    <div className="space-y-6">
      {/* Tab Switcher (Rules 7 & 48) - Strictly NO breadcrumbs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('projects')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === 'projects'
              ? 'bg-[#d9127b] text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Projects</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-mono ${
              activeTab === 'projects' ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
            }`}
          >
            {projects.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === 'categories'
              ? 'bg-[#d9127b] text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Categories</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-mono ${
              activeTab === 'categories' ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
            }`}
          >
            {categories.length}
          </span>
        </button>
      </div>

      {/* ── Tab 1: Projects Table ──────────────────────────────────────────────── */}
      {activeTab === 'projects' && (
        <>
          <DataTable<PortfolioProjectRecord>
            title="Portfolio / Showcase Projects"
            description="Manage the enterprise production case studies and showcase projects displayed in the 2 → 1 → 2 interactive grid."
            data={projects}
            columns={projectColumns}
            searchKeys={['title', 'client', 'category', 'metrics']}
            requiredPermission="content:write"
            addButtonLabel="New Showcase Project"
            onAdd={() => {
              setEditingProject(null);
              setProjectSheetOpen(true);
            }}
            onEdit={(item) => {
              setEditingProject(item);
              setProjectSheetOpen(true);
            }}
            onDelete={(id) => handleDeleteProject(id)}
          />

          <CrudSheet
            open={projectSheetOpen}
            onOpenChange={setProjectSheetOpen}
            title={editingProject ? 'Edit Showcase Project' : 'Create Showcase Project'}
            description="Configure project identity, category classification, metrics, and media asset."
            fields={projectFormFields}
            initialData={editingProject}
            onSubmit={(form) => {
              if (editingProject) {
                handleUpdateProject(editingProject.id, form);
              } else {
                handleCreateProject(form);
              }
            }}
          />
        </>
      )}

      {/* ── Tab 2: Categories Table ────────────────────────────────────────────── */}
      {activeTab === 'categories' && (
        <>
          <DataTable<PortfolioCategoryRecord>
            title="Portfolio Categories"
            description="Manage domain categories for organizing portfolio projects. Categories appear in display order in the category filter on /our-work."
            data={categories}
            columns={categoryColumns}
            searchKeys={['name', 'slug', 'description']}
            requiredPermission="content:write"
            addButtonLabel="New Category"
            onAdd={() => {
              setEditingCategory(null);
              setCategorySheetOpen(true);
            }}
            onEdit={(item) => {
              setEditingCategory(item);
              setCategorySheetOpen(true);
            }}
            onDelete={(id) => handleDeleteCategory(id)}
          />

          <CrudSheet
            open={categorySheetOpen}
            onOpenChange={setCategorySheetOpen}
            title={editingCategory ? 'Edit Category' : 'Create Category'}
            description="Configure category name, URL slug, display order, and status."
            fields={categoryFormFields}
            initialData={editingCategory}
            onSubmit={(form) => {
              if (editingCategory) {
                handleUpdateCategory(editingCategory.id, form);
              } else {
                handleCreateCategory(form);
              }
            }}
          />
        </>
      )}
    </div>
  );
}
