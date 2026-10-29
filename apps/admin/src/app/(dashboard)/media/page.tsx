'use client';

import * as React from 'react';
import {
  Folder,
  Upload,
  Image as ImageIcon,
  Grid,
  List,
  Copy,
  Check,
  Trash2,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { useCmsCollection, BaseRecord } from '@/lib/store';
import { formatBytes } from '@/lib/utils';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { notify } from '@/lib/notifications';
import { AdminContentContainer, AdminPageHeader } from '@/components/layout/admin-page';
import { TablePagination } from '@/components/ui/table-pagination';

interface MediaRecord extends BaseRecord {
  filename: string;
  title: string;
  folder: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
  altText: string;
  usageCount: number;
  url: string;
}

export default function MediaLibraryPage() {
  const { data: media, createItem, updateItem, deleteItem } =
    useCmsCollection<MediaRecord>('media');

  const [selectedFolder, setSelectedFolder] = React.useState<string>('ALL');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(12);
  const [inspectItem, setInspectItem] = React.useState<MediaRecord | null>(null);
  const [deleteTargetId, setDeleteTargetId] = React.useState<string | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [failedImages, setFailedImages] = React.useState<Record<string, boolean>>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const folders = ['ALL', '/Logos', '/Case-Studies', '/Team', '/Blog', '/Banners'];

  const filteredMedia = React.useMemo(() => {
    return media.filter((item) => {
      const matchFolder = selectedFolder === 'ALL' || item.folder === selectedFolder;
      const matchSearch =
        !search.trim() ||
        item.filename.toLowerCase().includes(search.toLowerCase()) ||
        item.title.toLowerCase().includes(search.toLowerCase());
      return matchFolder && matchSearch;
    });
  }, [media, selectedFolder, search]);

  const paginatedMedia = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredMedia.slice(start, start + pageSize);
  }, [filteredMedia, page, pageSize]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notify.error('The selected file type is not supported. Please upload an image.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      notify.error('The file is too large. Maximum file size is 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-');
      createItem({
        filename: file.name,
        title: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
        folder: selectedFolder === 'ALL' ? '/Logos' : selectedFolder,
        mimeType: file.type,
        sizeBytes: file.size,
        width: 1200,
        height: 800,
        altText: cleanName,
        usageCount: 0,
        url: dataUrl,
      } as any);
      notify.success('Image uploaded successfully.');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCopyUrl = (url: string, id?: string) => {
    navigator.clipboard.writeText(url);
    if (id) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    }
    notify.info('Media URL copied to clipboard.');
  };

  const handleSaveAltText = (item: MediaRecord, newAlt: string) => {
    updateItem(item.id, { altText: newAlt });
    notify.success('Media details updated successfully.');
  };

  return (
    <AdminContentContainer variant="wide" className="space-y-6 pb-24">
      {/* ── Standard Header (Strictly No Breadcrumbs) ── */}
      <AdminPageHeader
        title="Media Library"
        description="Upload, organize, and manage website imagery, brand logos, and digital documents."
        actions={
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-10 px-4 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Upload className="h-4 w-4 mr-2" />
              <span>Upload Image</span>
            </Button>
          </div>
        }
      />

      {/* ── Top Folders Section (Responsive Horizontal Bar) ── */}
      <div className="bg-card p-3.5 sm:p-4 rounded-2xl border border-border shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-primary" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Folders
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            Showing <span className="font-semibold text-foreground">{filteredMedia.length}</span> {filteredMedia.length === 1 ? 'asset' : 'assets'} in <span className="font-semibold text-primary">{selectedFolder}</span>
          </span>
        </div>

        {/* Horizontal scrollable pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {folders.map((f) => {
            const isSelected = selectedFolder === f;
            const count = f === 'ALL' ? media.length : media.filter((m) => m.folder === f).length;
            return (
              <button
                key={f}
                onClick={() => {
                  setSelectedFolder(f);
                  setPage(1);
                }}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50'
                }`}
              >
                <span>{f}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-primary-foreground/20 text-primary-foreground font-bold'
                      : 'bg-background text-muted-foreground border border-border/60'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Full Width Assets Canvas ── */}
      <div className="space-y-4 w-full">
        {/* Controls Bar: Search & View Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border shadow-xs">
          <div className="relative flex-1 max-w-full sm:max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets by filename..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9 text-xs rounded-xl w-full"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            <span className="text-xs text-muted-foreground sm:hidden font-mono">
              {filteredMedia.length} {filteredMedia.length === 1 ? 'asset' : 'assets'}
            </span>
            <div className="flex items-center space-x-1 rounded-xl border border-border bg-muted/50 p-1 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-card text-primary shadow-xs font-semibold' : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Grid view"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-card text-primary shadow-xs font-semibold' : 'text-muted-foreground hover:text-foreground'
                }`}
                title="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' ? (
          filteredMedia.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center space-y-3">
              <ImageIcon className="h-10 w-10 text-muted-foreground/40 mx-auto" />
              <div className="font-semibold text-sm text-foreground">No media assets found</div>
              <p className="text-xs text-muted-foreground">Upload your first image to populate this directory.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
                {paginatedMedia.map((item) => (
                  <Card
                    key={item.id}
                    onClick={() => setInspectItem(item)}
                    className="group cursor-pointer overflow-hidden border-border bg-card hover:border-primary/50 hover:shadow-md transition-all space-y-2 p-2.5 rounded-2xl relative"
                  >
                    {/* Thumbnail Box */}
                    <div className="relative aspect-video rounded-xl bg-muted/40 flex items-center justify-center overflow-hidden border border-border/50">
                      {item.url && !failedImages[item.id] && (item.url.startsWith('http') || item.url.startsWith('data:')) ? (
                        <img
                          src={item.url}
                          alt={item.altText || item.title}
                          onError={() => setFailedImages((prev) => ({ ...prev, [item.id]: true }))}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground/40 gap-1.5 p-3 text-center">
                          <ImageIcon className="h-7 w-7 group-hover:scale-110 transition-transform text-muted-foreground/40" />
                          <span className="text-[10px] text-muted-foreground/60 font-mono truncate max-w-[120px]">
                            {item.filename}
                          </span>
                        </div>
                      )}

                      {/* Top-Left Corner: Copy URL Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyUrl(item.url, item.id);
                        }}
                        className="absolute top-2 left-2 z-10 h-7 w-7 rounded-lg bg-background/90 hover:bg-background text-foreground shadow-xs border border-border/60 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-xs"
                        title="Copy image URL"
                        aria-label="Copy image URL"
                      >
                        {copiedId === item.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500 animate-in zoom-in-50 duration-150" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                        )}
                      </button>

                      {/* Top-Right Corner: Dimensions Badge */}
                      <div className="absolute top-2 right-2 z-10">
                        <Badge variant="outline" className="text-[9px] font-mono bg-background/90 text-foreground backdrop-blur-xs">
                          {item.width}x{item.height}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-1 px-1">
                      <div className="font-semibold text-xs text-foreground truncate">{item.title}</div>
                      <div className="font-mono text-[10px] text-muted-foreground truncate">
                        {item.filename}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40 font-mono">
                        <span>{formatBytes(item.sizeBytes)}</span>
                        <span>{item.usageCount} uses</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Standard Pagination Card (Same as other pages) */}
              {filteredMedia.length > 0 && (
                <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
                  <TablePagination
                    currentPage={page}
                    totalItems={filteredMedia.length}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                    pageSizeOptions={[12, 24, 48, 96]}
                    itemLabel="assets"
                    className="border-t-0"
                  />
                </div>
              )}
            </div>
          )
        ) : (
          /* List View */
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-xs min-w-[640px]">
                <thead className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                  <tr>
                    <th className="text-left p-3.5 pl-4">Filename</th>
                    <th className="text-left p-3.5">Folder</th>
                    <th className="text-left p-3.5">Dimensions</th>
                    <th className="text-left p-3.5">Size</th>
                    <th className="text-left p-3.5">Usage</th>
                    <th className="text-right p-3.5 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {paginatedMedia.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setInspectItem(item)}
                      className="cursor-pointer hover:bg-muted/40 transition-colors"
                    >
                      <td className="p-3.5 pl-4 font-medium text-foreground flex items-center space-x-2.5">
                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                          {item.url && !failedImages[item.id] && (item.url.startsWith('http') || item.url.startsWith('data:')) ? (
                            <img
                              src={item.url}
                              alt=""
                              onError={() => setFailedImages((prev) => ({ ...prev, [item.id]: true }))}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <span className="truncate">{item.filename}</span>
                      </td>
                      <td className="p-3.5 font-mono text-muted-foreground">{item.folder}</td>
                      <td className="p-3.5 font-mono text-muted-foreground">
                        {item.width} x {item.height}
                      </td>
                      <td className="p-3.5 font-mono text-muted-foreground">
                        {formatBytes(item.sizeBytes)}
                      </td>
                      <td className="p-3.5 font-mono text-foreground">{item.usageCount} refs</td>
                      <td className="p-3.5 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
                            onClick={() => handleCopyUrl(item.url, item.id)}
                            title="Copy image URL"
                          >
                            {copiedId === item.id ? (
                              <Check className="h-4 w-4 text-emerald-500 animate-in zoom-in-50 duration-150" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg cursor-pointer"
                            onClick={() => setDeleteTargetId(item.id)}
                            title="Delete media"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Standard Pagination in Table Footer (Same as other pages) */}
            {filteredMedia.length > 0 && (
              <TablePagination
                currentPage={page}
                totalItems={filteredMedia.length}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                pageSizeOptions={[12, 24, 48, 96]}
                itemLabel="assets"
              />
            )}
          </div>
        )}
      </div>

      {/* ─── Slide-Out Inspector Drawer ───────────────────────── */}
      <Sheet open={!!inspectItem} onOpenChange={(open) => !open && setInspectItem(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md max-w-[90vw] bg-card border-l border-border p-5 sm:p-6 shadow-2xl overflow-y-auto">
          {inspectItem && (
            <div className="space-y-5 h-full flex flex-col">
              <SheetHeader className="text-left">
                <SheetTitle className="truncate text-base font-bold text-foreground">
                  {inspectItem.title}
                </SheetTitle>
                <SheetDescription className="font-mono text-[11px] text-muted-foreground">
                  {inspectItem.filename}
                </SheetDescription>
              </SheetHeader>

              {/* Preview Display */}
              <div className="aspect-video rounded-xl bg-muted/40 border border-border flex items-center justify-center overflow-hidden">
                {inspectItem.url && !failedImages[inspectItem.id] && (inspectItem.url.startsWith('http') || inspectItem.url.startsWith('data:')) ? (
                  <img
                    src={inspectItem.url}
                    alt={inspectItem.altText}
                    onError={() => setFailedImages((prev) => ({ ...prev, [inspectItem.id]: true }))}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground/40 gap-2 p-4 text-center">
                    <ImageIcon className="h-14 w-14 text-muted-foreground/40" />
                    <span className="text-xs text-muted-foreground/60 font-mono">{inspectItem.filename}</span>
                  </div>
                )}
              </div>

              {/* Metadata Details */}
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-2.5 rounded-xl border border-border p-3 bg-muted/30">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                      Dimensions:
                    </span>
                    <span className="font-mono font-medium text-foreground">
                      {inspectItem.width} x {inspectItem.height} px
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                      File Size:
                    </span>
                    <span className="font-mono font-medium text-foreground">
                      {formatBytes(inspectItem.sizeBytes)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                      MIME Type:
                    </span>
                    <span className="font-mono text-foreground">{inspectItem.mimeType}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                      Folder:
                    </span>
                    <span className="font-mono text-foreground">{inspectItem.folder}</span>
                  </div>
                </div>

                {/* Alt Text Input */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Alt Text (Accessibility & SEO)</label>
                  <Input
                    value={inspectItem.altText}
                    onChange={(e) => {
                      const updated = { ...inspectItem, altText: e.target.value };
                      setInspectItem(updated);
                    }}
                    onBlur={(e) => handleSaveAltText(inspectItem, e.target.value)}
                    placeholder="Describe image for search engines and screen readers..."
                    className="rounded-xl text-xs"
                  />
                </div>

                {/* Usage Traceability */}
                <div className="space-y-2 border-t border-border/50 pt-3">
                  <div className="flex items-center space-x-1.5 text-primary font-semibold text-xs">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Usage References ({inspectItem.usageCount})</span>
                  </div>
                  <ul className="text-[11px] text-muted-foreground space-y-1 pl-4 list-disc">
                    <li>Global Homepage (/)</li>
                    <li>Case Studies Index (/case-studies)</li>
                  </ul>
                </div>
              </div>

              <SheetFooter className="mt-auto flex flex-col gap-2 pt-4 border-t border-border/50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyUrl(inspectItem.url)}
                  className="w-full rounded-xl"
                >
                  <Copy className="h-3.5 w-3.5 mr-2" />
                  <span>Copy Image URL</span>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setDeleteTargetId(inspectItem.id);
                    setInspectItem(null);
                  }}
                  className="w-full rounded-xl"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  <span>Delete Media</span>
                </Button>
              </SheetFooter>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ─── Delete Confirmation ───────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTargetId}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        title="Delete Media Asset?"
        description="Are you sure you want to delete this media asset? Any pages or components currently displaying this image will no longer show it."
        confirmLabel="Delete Asset"
        variant="destructive"
        onConfirm={async () => {
          if (deleteTargetId) {
            await deleteItem(deleteTargetId);
            notify.success('Media deleted successfully.');
            setDeleteTargetId(null);
          }
        }}
      />
    </AdminContentContainer>
  );
}
