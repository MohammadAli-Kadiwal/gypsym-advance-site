'use client';

import * as React from 'react';
import { Upload, Link2, X, ImageOff, Check } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { notify } from '@/lib/notifications';

export interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  description?: string;
  placeholder?: string;
  accept?: string;
  maxSizeMb?: number;
  previewDark?: boolean;
  className?: string;
}

export function ImageUploadField({
  value,
  onChange,
  label,
  description,
  placeholder = 'https://cdn.example.com/image.svg',
  accept = 'image/svg+xml,image/png,image/webp,image/jpeg,image/gif,image/x-icon,image/vnd.microsoft.icon',
  maxSizeMb = 3,
  previewDark = false,
  className = '',
}: ImageUploadFieldProps) {
  const [tab, setTab] = React.useState<'upload' | 'url'>(() => {
    return value && value.startsWith('http') ? 'url' : 'upload';
  });
  const [dragActive, setDragActive] = React.useState(false);
  const [loadError, setLoadError] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setLoadError(false);
    if (value && value.startsWith('http')) {
      setTab('url');
    } else if (value && value.startsWith('data:')) {
      setTab('upload');
    }
  }, [value]);

  const handleFile = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.name.endsWith('.svg') && !file.name.endsWith('.ico')) {
      notify.error('Please select an image file (SVG, PNG, WebP, JPG, ICO).');
      return;
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      notify.error(`File size exceeds ${maxSizeMb}MB. Please select a smaller file.`);
      return;
    }

    // For SVGs or ICOs, keep as-is
    if (file.type === 'image/svg+xml' || file.name.endsWith('.svg') || file.name.endsWith('.ico')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          onChange(result);
          notify.success(`Uploaded: ${file.name}`);
        }
      };
      reader.readAsDataURL(file);
      return;
    }

    // For standard raster images (PNG, JPEG, WEBP): compress & downscale to prevent huge base64 strings
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) return;

      const img = new window.Image();
      img.onload = () => {
        const MAX_DIM = 1600;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          onChange(rawDataUrl);
          notify.success(`Uploaded: ${file.name}`);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        try {
          const optimizedUrl = canvas.toDataURL('image/webp', 0.85);
          onChange(optimizedUrl && optimizedUrl.length < rawDataUrl.length ? optimizedUrl : rawDataUrl);
        } catch {
          onChange(rawDataUrl);
        }
        notify.success(`Uploaded: ${file.name}`);
      };
      img.onerror = () => {
        onChange(rawDataUrl);
        notify.success(`Uploaded: ${file.name}`);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isDataUrl = value && value.startsWith('data:');
  const hasValue = Boolean(value && value.trim().length > 0);

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Header with Label and Tab Switcher */}
      {label || description ? (
        <div className="flex items-center justify-between gap-2">
          <div>
            {label && <label className="text-xs font-semibold text-foreground block">{label}</label>}
            {description && <p className="text-[11px] text-muted-foreground">{description}</p>}
          </div>

          <div className="inline-flex rounded-lg p-0.5 bg-muted border border-border shrink-0">
            <button
              type="button"
              onClick={() => setTab('upload')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                tab === 'upload'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Upload className="h-3 w-3" />
              Direct Upload
            </button>
            <button
              type="button"
              onClick={() => setTab('url')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                tab === 'url'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Link2 className="h-3 w-3" />
              Image URL
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <div className="inline-flex rounded-lg p-0.5 bg-muted border border-border shrink-0">
            <button
              type="button"
              onClick={() => setTab('upload')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                tab === 'upload'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Upload className="h-3 w-3" />
              Direct Upload
            </button>
            <button
              type="button"
              onClick={() => setTab('url')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                tab === 'url'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Link2 className="h-3 w-3" />
              Image URL
            </button>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
        }}
      />

      {/* Tab: Direct Upload */}
      {tab === 'upload' ? (
        hasValue ? (
          /* Preview Card */
          <div
            className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border ${
              previewDark
                ? 'border-slate-800 bg-[#090d16] text-white'
                : 'border-border bg-muted/30 text-foreground'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`h-12 w-12 rounded-lg border flex items-center justify-center p-1.5 overflow-hidden shrink-0 shadow-xs ${
                  previewDark ? 'border-slate-800 bg-[#030712]' : 'border-border bg-card'
                }`}
              >
                {!loadError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={value}
                    alt="Preview"
                    className="h-full w-full object-contain"
                    onError={() => setLoadError(true)}
                  />
                ) : (
                  <ImageOff className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate text-foreground">
                  {isDataUrl ? 'Direct Uploaded Image' : value.split('/').pop() || 'Selected Image'}
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                  <Check className="h-3 w-3 stroke-[2.5]" />
                  Active &amp; ready
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-7 px-2.5 text-[11px] font-medium rounded-lg cursor-pointer"
              >
                Replace
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          /* Dropzone */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center py-5 px-4 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/40 bg-card'
            }`}
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-1.5 shadow-2xs">
              <Upload className="h-4 w-4" />
            </div>
            <p className="text-xs font-semibold text-foreground">
              Click to browse <span className="font-normal text-muted-foreground">or drag &amp; drop</span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              SVG, PNG, WebP, JPG (max {maxSizeMb}MB)
            </p>
          </div>
        )
      ) : (
        /* Tab: URL Input */
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`h-10 w-10 rounded-xl border flex items-center justify-center overflow-hidden shrink-0 ${
                previewDark ? 'border-slate-800 bg-[#030712]' : 'border-border bg-card'
              }`}
            >
              {hasValue && !loadError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={value}
                  alt="Preview"
                  className="h-full w-full object-contain p-1"
                  onError={() => setLoadError(true)}
                />
              ) : (
                <ImageOff className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={
                  placeholder && placeholder.startsWith('data:')
                    ? `${placeholder.slice(0, 28)}...`
                    : placeholder
                }
                className="text-xs font-mono rounded-xl h-10 bg-background border-input"
              />
            </div>
          </div>
          {loadError && hasValue && (
            <p className="text-[10px] text-destructive">
              Could not load image from this URL. Please verify the URL is public and accessible.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
