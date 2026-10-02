'use client';

import * as React from 'react';
import {
  Folder,
  Upload,
  Image as ImageIcon,
  Grid,
  List,
  Copy,
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

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
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
          <div className="flex items-center space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-10 px-4 text-xs font-semibold shadow-xs transition-colors"
            >
              <Upload className="h-4 w-4 mr-2" />
              <span>Upload Image</span>
            </Button>
          </div>
        }
      />

      {/* ── Main DAM Layout: Folders Tree + Assets Browser ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Folders Sidebar */}
        <div className="md:col-span-3 space-y-3 bg-card p-4 rounded-2xl border border-border shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Folders
            </span>
          </div>

          <div className="space-y-1">
            {folders.map((f) => (
              <button
                key={f}
                onClick={() => {
                  setSelectedFolder(f);
                  setPage(1);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                  selectedFolder === f
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Folder className="h-4 w-4 text-muted-foreground" />
                  <span>{f}</span>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {f === 'ALL'
                    ? media.length
                    : media.filter((m) => m.folder === f).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Assets Canvas */}
        <div className="md:col-span-9 space-y-4">
          {/* Controls Bar: Search & View Toggle */}
          <div className="flex items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border shadow-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets by filename..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-9 text-xs rounded-xl"
              />
            </div>

            <div className="flex items-center space-x-1 rounded-xl border border-border bg-muted/50 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-card text-primary shadow-xs font-semibold' : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Grid view"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-card text-primary shadow-xs font-semibold' : 'text-muted-foreground hover:text-foreground'
                }`}
                title="List view"
              >
                <List className="h-4 w-4" />
              </button>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {paginatedMedia.map((item) => (
                  <Card
                    key={item.id}
                    onClick={() => setInspectItem(item)}
                    className="group cursor-pointer overflow-hidden border-border bg-card hover:border-primary/50 hover:shadow-md transition-all space-y-2 p-2.5 rounded-2xl"
                  >
                    {/* Thumbnail Box */}
                    <div className="relative aspect-video rounded-xl bg-muted/50 flex items-center justify-center overflow-hidden border border-border/50">
                      {item.url && item.url.startsWith('http') || item.url?.startsWith('data:') ? (
                        <img
                          src={item.url}
                          alt={item.altText || item.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-muted-foreground/40 group-hover:scale-110 transition-transform" />
                      )}
                      <div className="absolute top-1.5 right-1.5">
                        <Badge variant="outline" className="text-[9px] font-mono bg-background/90 text-foreground">
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
            )
          ) : (
            /* List View */
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
              <table className="w-full text-xs">
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
                          {item.url && (item.url.startsWith('http') || item.url.startsWith('data:')) ? (
                            <img src={item.url} alt="" className="h-full w-full object-cover" />
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTargetId(item.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

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
      </div>

      {/* ─── Slide-Out Inspector Drawer ───────────────────────── */}
      <Sheet open={!!inspectItem} onOpenChange={(open) => !open && setInspectItem(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-card border-l border-border p-6 shadow-2xl">
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
                {inspectItem.url && (inspectItem.url.startsWith('http') || inspectItem.url.startsWith('data:')) ? (
                  <img src={inspectItem.url} alt={inspectItem.altText} className="h-full w-full object-contain" />
                ) : (
                  <ImageIcon className="h-16 w-16 text-muted-foreground/40" />
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
