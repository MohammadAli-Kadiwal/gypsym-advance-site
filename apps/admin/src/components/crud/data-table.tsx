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
  ChevronLeft,
  ChevronRight,
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
}: DataTableProps<T>) {
  const { hasPermission } = useAuth();
  const canMutate = hasPermission(requiredPermission);
  const canDelete = hasPermission('content:delete') || hasPermission('*');

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
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
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
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            Published
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Draft
          </span>
        );
      case 'IN_REVIEW':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            In Review
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
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
    if (!onBulkDelete || selectedIds.size === 0) return;
    setIsBulkProcessing(true);
    const count = selectedIds.size;
    try {
      await onBulkDelete(Array.from(selectedIds));
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
    <div className="space-y-5">
      {/* ─── Standardized Header (No Breadcrumbs) ─────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#eaedf3]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          {description && (
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">{description}</p>
          )}
        </div>

        {onAdd && canMutate && (
          <Button
            onClick={onAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold rounded-xl px-4 h-10 transition-colors shrink-0"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            <span>{addButtonLabel}</span>
          </Button>
        )}
      </div>

      {/* ─── Filter & Search Bar ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#eaedf3] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder={`Search ${entityName}s...`}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 pr-8 h-9 text-xs rounded-xl border-slate-200 bg-slate-50/50 focus-visible:bg-white focus-visible:border-blue-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
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
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                  isCurrent
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {st.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Main Table Container ──────────────────────────────────── */}
      <div className="rounded-2xl border border-[#eaedf3] bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 border-b border-slate-100">
              <TableRow>
                <TableHead className="w-10 px-4">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                    aria-label="Select all"
                  />
                </TableHead>

                {columns.map((col) => (
                  <TableHead key={col.key} className={`text-slate-700 font-semibold text-xs ${col.className || ''}`}>
                    {col.sortable ? (
                      <button
                        onClick={() => handleSort(col.key)}
                        className="flex items-center space-x-1 hover:text-slate-900 transition-colors font-semibold"
                      >
                        <span>{col.header}</span>
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </button>
                    ) : (
                      <span>{col.header}</span>
                    )}
                  </TableHead>
                ))}

                <TableHead className="w-28 text-center text-slate-700 font-semibold text-xs">Status</TableHead>
                <TableHead className="w-28 text-right pr-4 text-slate-700 font-semibold text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 3}
                    className="h-56 text-center text-slate-500 py-12"
                  >
                    <div className="flex flex-col items-center justify-center space-y-3 max-w-sm mx-auto">
                      <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <div className="font-semibold text-slate-900 text-sm">{resolvedEmptyTitle}</div>
                      <p className="text-xs text-slate-500 leading-relaxed">{resolvedEmptyDesc}</p>
                      {onAdd && canMutate && (
                        <Button
                          onClick={onAdd}
                          variant="outline"
                          size="sm"
                          className="mt-2 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
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
                      className="hover:bg-slate-50/75 transition-colors border-b border-slate-100 last:border-0"
                    >
                      <TableCell className="px-4 py-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectRow(item.id, !!checked)}
                          aria-label={`Select row ${item.id}`}
                        />
                      </TableCell>

                      {columns.map((col) => (
                        <TableCell key={col.key} className={`py-3 text-xs text-slate-700 ${col.className || ''}`}>
                          {col.render ? col.render(item) : (item as any)[col.key] ?? '—'}
                        </TableCell>
                      ))}

                      <TableCell className="text-center py-3">
                        {getStatusBadge(item.status)}
                      </TableCell>

                      <TableCell className="text-right pr-4 py-3">
                        <div className="flex items-center justify-end space-x-1">
                          {/* Primary Quick Action: Edit */}
                          {onEdit && canMutate && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(item)}
                              className="h-8 px-2 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
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
                                className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-lg"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl text-xs z-50 animate-in fade-in-50 zoom-in-95"
                            >
                              {onPreview && (
                                <DropdownMenuItem
                                  onClick={() => onPreview(item)}
                                  className="flex items-center px-2.5 py-1.5 cursor-pointer rounded-lg hover:bg-slate-50 text-slate-700"
                                >
                                  <ExternalLink className="h-3.5 w-3.5 mr-2 text-slate-400" />
                                  <span>Preview</span>
                                </DropdownMenuItem>
                              )}

                              {onDuplicate && canMutate && (
                                <DropdownMenuItem
                                  onClick={() => handleDuplicate(item)}
                                  className="flex items-center px-2.5 py-1.5 cursor-pointer rounded-lg hover:bg-slate-50 text-slate-700"
                                >
                                  <Copy className="h-3.5 w-3.5 mr-2 text-slate-400" />
                                  <span>Duplicate</span>
                                </DropdownMenuItem>
                              )}

                              {customActions && customActions(item)}

                              {onDelete && canDelete && (
                                <>
                                  <DropdownMenuSeparator className="h-px bg-slate-100 my-1" />
                                  <DropdownMenuItem
                                    onClick={() => setDeleteTargetItem(item)}
                                    className="flex items-center px-2.5 py-1.5 cursor-pointer rounded-lg hover:bg-rose-50 text-rose-600"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 mr-2 text-rose-500" />
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-slate-100 text-xs text-slate-500 bg-white">
          <div className="flex items-center space-x-2">
            <span>
              Showing {filteredData.length === 0 ? 0 : (page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, filteredData.length)} of {filteredData.length} entries
            </span>
            <span className="text-slate-300">|</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-slate-200"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 font-medium text-xs text-slate-700">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-slate-200"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Floating Bulk Action Dock ─────────────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center space-x-2.5 rounded-2xl border border-slate-200 bg-white/95 px-5 py-2.5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="text-xs font-semibold text-slate-800 pr-2 border-r border-slate-200">
            {selectedIds.size} selected
          </span>

          {onBulkStatusChange && canMutate && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs rounded-xl border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                onClick={() => handleBulkStatus('PUBLISHED')}
              >
                <FileCheck className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                <span>Publish</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs rounded-xl border-slate-200 hover:bg-slate-100"
                onClick={() => handleBulkStatus('DRAFT')}
              >
                <FileClock className="h-3.5 w-3.5 mr-1 text-amber-600" />
                <span>Draft</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs rounded-xl border-slate-200 hover:bg-slate-100"
                onClick={() => handleBulkStatus('ARCHIVED')}
              >
                <Archive className="h-3.5 w-3.5 mr-1 text-slate-500" />
                <span>Archive</span>
              </Button>
            </>
          )}

          {onBulkDelete && canDelete && (
            <Button
              variant="destructive"
              size="sm"
              className="h-8 text-xs rounded-xl bg-rose-600 hover:bg-rose-700"
              onClick={() => setBulkDeleteConfirm(true)}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              <span>Delete</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-slate-400 hover:text-slate-600 rounded-xl ml-1"
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
    </div>
  );
}
