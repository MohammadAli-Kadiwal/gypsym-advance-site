'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import {
  Search,
  Plus,
  Trash2,
  MoreHorizontal,
  ArrowUpDown,
  FileCheck,
  FileClock,
  Archive,
  Sparkles,
  ExternalLink,
  Copy,
  Edit2,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { BaseRecord, ItemStatus } from '@/lib/store';
import { ConfirmDialog } from './confirm-dialog';
import { notify } from '@/lib/notifications';
import { normalizeErrorMessage } from '@/lib/api-client';
import { AdminContentContainer, AdminPageHeader } from '@/components/layout/admin-page';
import { TablePagination } from '@/components/ui/table-pagination';

export interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T extends BaseRecord> {
  title: string;
  description?: string;
  data: T[];
  columns: ColumnDef<T>[];
  searchKeys?: (keyof T)[];
  requiredPermission?: string;
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onPreview?: (item: T) => void;
  onDuplicate?: (item: T) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
  onBulkDelete?: (ids: string[]) => Promise<void> | void;
  onBulkStatusChange?: (ids: string[], status: ItemStatus) => Promise<void> | void;
  statusFilterKey?: keyof T;
  addButtonLabel?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  entityName?: string;
  customActions?: (item: T) => React.ReactNode;
  tabs?: React.ReactNode;
}

export function DataTable<T extends BaseRecord>({
  title,
  description,
  data,
  columns,
  searchKeys = ['title', 'name', 'slug'] as (keyof T)[],
  requiredPermission = 'content:write',
  onAdd,
  onEdit,
  onPreview,
  onDuplicate,
  onDelete,
  onBulkDelete,
  onBulkStatusChange,
  statusFilterKey = 'status',
  addButtonLabel = 'Create Record',
  emptyStateTitle,
  emptyStateDescription,
  entityName = 'item',
  customActions,
  tabs,
}: DataTableProps<T>) {
  const { hasPermission, user } = useAuth();
  const isSuperOrAdmin = !user || user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';
  const canMutate = isSuperOrAdmin || hasPermission(requiredPermission);
  const canDelete = isSuperOrAdmin || hasPermission('content:delete') || hasPermission('*');

  // Search & Filter State
  const [search, setSearch] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('ALL');
  const [sortKey, setSortKey] = React.useState<string>('updatedAt');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');

  // Selection state
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  // Pagination state
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Confirm delete modal states
  const [deleteTargetItem, setDeleteTargetItem] = React.useState<T | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = React.useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = React.useState(false);

  // Filtered & Sorted Data
  const filteredData = React.useMemo(() => {
    let result = [...data];

    // Status filter
    if (selectedStatus !== 'ALL') {
      result = result.filter((item) => (item as any)[statusFilterKey] === selectedStatus);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((item) => {
        return searchKeys.some((k) => {
          const val = item[k];
          if (typeof val === 'string') return val.toLowerCase().includes(q);
          if (typeof val === 'number') return val.toString().includes(q);
          return false;
        });
      });
    }

    // Sort
    result.sort((a, b) => {
      const valA = (a as any)[sortKey] ?? '';
      const valB = (b as any)[sortKey] ?? '';
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [data, selectedStatus, search, searchKeys, statusFilterKey, sortKey, sortOrder]);

  // Paginated Slice
  const paginatedData = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginatedData.map((item) => item.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    setSelectedIds(next);
  };

  const isAllSelected =
    paginatedData.length > 0 && paginatedData.every((item) => selectedIds.has(item.id));

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // Status Badge styling
  const getStatusBadge = (status: ItemStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            Published
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border">
            Draft
          </span>
        );
      case 'IN_REVIEW':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            In Review
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            Archived
          </span>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!deleteTargetItem || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteTargetItem.id);
      notify.success(`${entityName.charAt(0).toUpperCase() + entityName.slice(1)} deleted successfully.`);
      setDeleteTargetItem(null);
    } catch (err) {
      notify.error(normalizeErrorMessage(err, `Unable to delete this ${entityName}.`));
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk Delete Action
  const handleConfirmBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkProcessing(true);
    const count = selectedIds.size;
    const ids = Array.from(selectedIds);
    try {
      if (onBulkDelete) {
        await onBulkDelete(ids);
      } else if (onDelete) {
        for (const id of ids) {
          await onDelete(id);
        }
      }
      notify.success(`${count} ${count === 1 ? entityName : entityName + 's'} deleted successfully.`);
      setSelectedIds(new Set());
      setBulkDeleteConfirm(false);
    } catch (err) {
      notify.error(normalizeErrorMessage(err, `Unable to complete bulk deletion.`));
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Bulk Status Change
  const handleBulkStatus = async (status: ItemStatus) => {
    if (!onBulkStatusChange || selectedIds.size === 0) return;
    const count = selectedIds.size;
    try {
      await onBulkStatusChange(Array.from(selectedIds), status);
      const statusLabel = status === 'PUBLISHED' ? 'published' : status === 'DRAFT' ? 'moved to draft' : 'archived';
      notify.success(`${count} ${count === 1 ? entityName : entityName + 's'} ${statusLabel} successfully.`);
      setSelectedIds(new Set());
    } catch (err) {
      notify.error(normalizeErrorMessage(err, `Unable to update status for selected items.`));
    }
  };

  // Duplicate Action
  const handleDuplicate = async (item: T) => {
    if (!onDuplicate) return;
    try {
      await onDuplicate(item);
      notify.success(`${entityName.charAt(0).toUpperCase() + entityName.slice(1)} duplicated successfully.`);
    } catch (err) {
      notify.error(normalizeErrorMessage(err, `Unable to duplicate this ${entityName}.`));
    }
  };

  const resolvedEmptyTitle = emptyStateTitle || `No ${entityName}s yet`;
  const resolvedEmptyDesc = emptyStateDescription || `Create your first ${entityName} to populate this section.`;

  return (
    <AdminContentContainer variant="wide">
      {/* ─── Standardized Header (Strictly No Breadcrumbs) ─────────── */}
      <AdminPageHeader
        title={title}
        description={description}
        tabs={tabs}
        actions={
          onAdd && canMutate ? (
            <Button
              onClick={onAdd}
              size="sm"
              className="gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{addButtonLabel}</span>
            </Button>
          ) : undefined
        }
      />

      {/* ─── Filter & Search Bar ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border shadow-xs">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${entityName}s...`}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 pr-8 h-9 text-xs rounded-xl border-input bg-background focus-visible:ring-primary"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { key: 'ALL', label: 'All' },
            { key: 'PUBLISHED', label: 'Published' },
            { key: 'DRAFT', label: 'Drafts' },
            { key: 'IN_REVIEW', label: 'In Review' },
            { key: 'ARCHIVED', label: 'Archived' },
          ].map((st) => {
            const isCurrent = selectedStatus === st.key;
            return (
              <button
                key={st.key}
                onClick={() => {
                  setSelectedStatus(st.key);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {st.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Main Table Container ──────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40 border-b border-border">
              <TableRow>
                <TableHead className="w-10 px-4">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                    aria-label="Select all"
                  />
                </TableHead>

                {columns.map((col) => (
                  <TableHead key={col.key} className={`text-muted-foreground font-semibold text-xs ${col.className || ''}`}>
                    {col.sortable ? (
                      <button
                        onClick={() => handleSort(col.key)}
                        className="flex items-center space-x-1 hover:text-foreground transition-colors font-semibold cursor-pointer"
                      >
                        <span>{col.header}</span>
                        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                      </button>
                    ) : (
                      <span>{col.header}</span>
                    )}
                  </TableHead>
                ))}

                <TableHead className="w-28 text-center text-muted-foreground font-semibold text-xs">Status</TableHead>
                <TableHead className="w-28 text-right pr-4 text-muted-foreground font-semibold text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 3}
                    className="h-56 text-center text-muted-foreground py-12"
                  >
                    <div className="flex flex-col items-center justify-center space-y-3 max-w-sm mx-auto">
                      <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <div className="font-semibold text-foreground text-sm">{resolvedEmptyTitle}</div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{resolvedEmptyDesc}</p>
                      {onAdd && canMutate && (
                        <Button
                          onClick={onAdd}
                          variant="outline"
                          size="sm"
                          className="mt-2 rounded-xl border-border hover:bg-muted cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          <span>{addButtonLabel}</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item) => {
                  const isSelected = selectedIds.has(item.id);
                  return (
                    <TableRow
                      key={item.id}
                      data-state={isSelected ? 'selected' : undefined}
                      className="hover:bg-muted/50 transition-colors border-b border-border last:border-0"
                    >
                      <TableCell className="px-4 py-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectRow(item.id, !!checked)}
                          aria-label={`Select row ${item.id}`}
                        />
                      </TableCell>

                      {columns.map((col) => (
                        <TableCell key={col.key} className={`py-3 text-xs text-foreground ${col.className || ''}`}>
                          {col.render ? col.render(item) : (item as any)[col.key] ?? '—'}
                        </TableCell>
                      ))}

                      <TableCell className="text-center py-3">
                        {onBulkStatusChange && canMutate ? (
                          <button
                            type="button"
                            onClick={() =>
                              onBulkStatusChange([item.id], item.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED')
                            }
                            title={
                              item.status === 'PUBLISHED'
                                ? 'Public: Click to switch to Draft'
                                : 'Draft: Click to publish Public'
                            }
                            className="cursor-pointer transition-transform hover:scale-105 active:scale-95 inline-block"
                          >
                            {getStatusBadge(item.status)}
                          </button>
                        ) : (
                          getStatusBadge(item.status)
                        )}
                      </TableCell>

                      <TableCell className="text-right pr-4 py-3">
                        <div className="flex items-center justify-end space-x-1">
                          {/* Primary Quick Action: Edit */}
                          {onEdit && canMutate && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(item)}
                              className="h-8 px-2 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg cursor-pointer"
                              title="Edit item"
                            >
                              <Edit2 className="h-3.5 w-3.5 mr-1" />
                              <span className="hidden md:inline">Edit</span>
                            </Button>
                          )}

                          {/* Secondary Menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-44 rounded-xl border border-border bg-popover p-1.5 shadow-xl text-xs z-50 animate-in fade-in-50 zoom-in-95 text-popover-foreground"
                            >
                              {onBulkStatusChange && canMutate && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    onBulkStatusChange([item.id], item.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED')
                                  }
                                  className="flex items-center px-2.5 py-1.5 cursor-pointer rounded-lg hover:bg-muted text-foreground"
                                >
                                  {item.status === 'PUBLISHED' ? (
                                    <>
                                      <FileClock className="h-3.5 w-3.5 mr-2 text-amber-500" />
                                      <span>Switch to Draft</span>
                                    </>
                                  ) : (
                                    <>
                                      <FileCheck className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                                      <span>Publish to Public</span>
                                    </>
                                  )}
                                </DropdownMenuItem>
                              )}

                              {onPreview && (
                                <DropdownMenuItem
                                  onClick={() => onPreview(item)}
                                  className="flex items-center px-2.5 py-1.5 cursor-pointer rounded-lg hover:bg-muted text-foreground"
                                >
                                  <ExternalLink className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                  <span>Preview</span>
                                </DropdownMenuItem>
                              )}

                              {onDuplicate && canMutate && (
                                <DropdownMenuItem
                                  onClick={() => handleDuplicate(item)}
                                  className="flex items-center px-2.5 py-1.5 cursor-pointer rounded-lg hover:bg-muted text-foreground"
                                >
                                  <Copy className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                  <span>Duplicate</span>
                                </DropdownMenuItem>
                              )}

                              {customActions && customActions(item)}

                              {onDelete && canDelete && (
                                <>
                                  <DropdownMenuSeparator className="h-px bg-border my-1" />
                                  <DropdownMenuItem
                                    onClick={() => setDeleteTargetItem(item)}
                                    className="flex items-center px-2.5 py-1.5 cursor-pointer rounded-lg hover:bg-destructive/10 text-destructive"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 mr-2 text-destructive" />
                                    <span>Delete</span>
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* ─── Table Footer: Pagination & Counts ─────────────────────── */}
        <TablePagination
          currentPage={page}
          totalItems={filteredData.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemLabel={`${entityName}s`}
        />
      </div>

      {/* ─── Floating Bulk Action Dock ─────────────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center space-x-2.5 rounded-2xl border border-border bg-card/95 px-5 py-2.5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200 text-card-foreground">
          <span className="text-xs font-semibold text-foreground pr-2 border-r border-border">
            {selectedIds.size} selected
          </span>

          {onBulkStatusChange && canMutate && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs rounded-xl border-border hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                onClick={() => handleBulkStatus('PUBLISHED')}
              >
                <FileCheck className="h-3.5 w-3.5 mr-1" />
                <span>Publish</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs rounded-xl border-border hover:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                onClick={() => handleBulkStatus('DRAFT')}
              >
                <FileClock className="h-3.5 w-3.5 mr-1" />
                <span>Draft</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs rounded-xl border-border hover:bg-muted text-muted-foreground"
                onClick={() => handleBulkStatus('ARCHIVED')}
              >
                <Archive className="h-3.5 w-3.5 mr-1" />
                <span>Archive</span>
              </Button>
            </>
          )}

          {(onBulkDelete || onDelete) && canDelete && (
            <Button
              variant="destructive"
              size="sm"
              className="h-8 text-xs rounded-xl shadow-xs"
              onClick={() => setBulkDeleteConfirm(true)}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              <span>Delete</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground hover:text-foreground rounded-xl ml-1"
            onClick={() => setSelectedIds(new Set())}
          >
            Clear
          </Button>
        </div>
      )}

      {/* ─── Single Item Delete Confirmation Dialog ────────────────── */}
      <ConfirmDialog
        open={!!deleteTargetItem}
        onOpenChange={(open) => !open && setDeleteTargetItem(null)}
        title={`Delete ${entityName.charAt(0).toUpperCase() + entityName.slice(1)}?`}
        description={`Are you sure you want to delete "${(deleteTargetItem as any)?.title || (deleteTargetItem as any)?.name || 'this item'}"? This action will remove it from the live website.`}
        confirmLabel={isDeleting ? 'Deleting...' : `Delete ${entityName}`}
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />

      {/* ─── Bulk Delete Confirmation Dialog ───────────────────────── */}
      <ConfirmDialog
        open={bulkDeleteConfirm}
        onOpenChange={setBulkDeleteConfirm}
        title={`Delete ${selectedIds.size} ${selectedIds.size === 1 ? entityName : entityName + 's'}?`}
        description={`This action cannot be undone. Are you sure you want to permanently delete these ${selectedIds.size} selected items?`}
        confirmLabel={isBulkProcessing ? 'Deleting...' : `Delete ${selectedIds.size} ${selectedIds.size === 1 ? entityName : entityName + 's'}`}
        variant="destructive"
        onConfirm={handleConfirmBulkDelete}
      />
    </AdminContentContainer>
  );
}
