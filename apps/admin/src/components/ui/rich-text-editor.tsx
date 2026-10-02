'use client';

import * as React from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Code,
  Link2,
  Image as ImageIcon,
  Upload,
  Eye,
  Columns,
  Edit3,
  Sparkles,
  HelpCircle,
  FileCode,
} from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './dialog';
import { notify } from '@/lib/notifications';
import { cn } from '@/lib/utils';

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your publication content in rich markdown. Drag & drop images or paste from clipboard...',
  minHeight = '360px',
  className = '',
}: RichTextEditorProps) {
  const [viewMode, setViewMode] = React.useState<'write' | 'preview' | 'split'>('write');
  const [isImageDialogOpen, setIsImageDialogOpen] = React.useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = React.useState(false);

  // Image Dialog State
  const [imageUrl, setImageUrl] = React.useState('');
  const [imageAlt, setImageAlt] = React.useState('');
  const [isUploading, setIsUploading] = React.useState(false);

  // Link Dialog State
  const [linkText, setLinkText] = React.useState('');
  const [linkUrl, setLinkUrl] = React.useState('');

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Calculate statistics
  const stats = React.useMemo(() => {
    const text = value || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    return { words, chars, readingTime };
  }, [value]);

  // Helper to insert or wrap markdown at current cursor position
  const insertMarkdown = React.useCallback(
    (before: string, after: string = '', defaultText: string = '') => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = value.substring(start, end) || defaultText;

      const replacement = `${before}${selected}${after}`;
      const newValue = value.substring(0, start) + replacement + value.substring(end);

      onChange(newValue);

      // Re-focus and set selection
      requestAnimationFrame(() => {
        textarea.focus();
        const cursorPosition = start + before.length + selected.length;
        textarea.setSelectionRange(cursorPosition, cursorPosition);
      });
    },
    [value, onChange]
  );

  // Helper to process and insert an uploaded image file
  const processImageFile = React.useCallback(
    (file: File, customAlt?: string) => {
      if (!file.type.startsWith('image/') && !file.name.endsWith('.svg')) {
        notify.error('Unsupported file format. Please select an image (PNG, JPG, WebP, SVG, GIF).');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        notify.error('File size exceeds 10MB limit. Please compress the image.');
        return;
      }

      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          const cleanName =
            customAlt?.trim() ||
            file.name
              .replace(/\.[^/.]+$/, '')
              .replace(/[-_]/g, ' ')
              .trim();

          const markdownImage = `\n\n![${cleanName}](${dataUrl})\n\n`;
          insertMarkdown(markdownImage, '', '');
          notify.success(`Inserted image: ${file.name}`);
        }
        setIsUploading(false);
        setIsImageDialogOpen(false);
        setImageUrl('');
        setImageAlt('');
      };
      reader.onerror = () => {
        notify.error('Failed to read image file.');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    },
    [insertMarkdown]
  );

  // Handle Drag & Drop of Image into Textarea
  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        e.preventDefault();
        processImageFile(file);
      }
    }
  };

  // Handle Clipboard Paste of Image (e.g. Screenshots or Copied Images)
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item && item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          processImageFile(file, 'Pasted illustration');
          return;
        }
      }
    }
  };

  // Keyboard Shortcuts (Ctrl+B, Ctrl+I, Ctrl+K)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        insertMarkdown('**', '**', 'bold text');
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        insertMarkdown('*', '*', 'italic text');
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        const textarea = textareaRef.current;
        const selected = textarea ? value.substring(textarea.selectionStart, textarea.selectionEnd) : '';
        setLinkText(selected);
        setLinkUrl('');
        setIsLinkDialogOpen(true);
      }
    }
  };

  // Insert Link from Dialog
  const handleInsertLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) {
      notify.error('Please enter a destination URL.');
      return;
    }
    const label = linkText.trim() || linkUrl.trim();
    insertMarkdown(`[${label}](`, `)`, linkUrl.trim());
    setIsLinkDialogOpen(false);
    setLinkText('');
    setLinkUrl('');
  };

  // Insert Image from Dialog (URL or File)
  const handleInsertImageFromDialog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      notify.error('Please enter an image URL or choose a file to upload.');
      return;
    }
    const alt = imageAlt.trim() || 'Illustration';
    const markdownImage = `\n\n![${alt}](${imageUrl.trim()})\n\n`;
    insertMarkdown(markdownImage, '', '');
    setIsImageDialogOpen(false);
    setImageUrl('');
    setImageAlt('');
    notify.success('Image inserted into content.');
  };

  return (
    <div className={cn('flex flex-col border border-input rounded-xl overflow-hidden bg-card shadow-xs', className)}>
      {/* ── Toolbar Header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 p-2 bg-muted/40 border-b border-border text-xs">
        {/* Formatting Actions */}
        <div className="flex flex-wrap items-center gap-1">
          {/* Headings */}
          <div className="flex items-center rounded-lg bg-background/80 border border-border/70 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => insertMarkdown('\n## ', '\n', 'Section Heading')}
              title="Heading 2 (##)"
              className="p-1.5 rounded-md hover:bg-muted text-foreground transition-colors"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('\n### ', '\n', 'Subheading')}
              title="Heading 3 (###)"
              className="p-1.5 rounded-md hover:bg-muted text-foreground transition-colors"
            >
              <Heading3 className="w-4 h-4" />
            </button>
          </div>

          <div className="h-4 w-px bg-border mx-0.5" />

          {/* Text Styling */}
          <div className="flex items-center rounded-lg bg-background/80 border border-border/70 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => insertMarkdown('**', '**', 'bold text')}
              title="Bold (Ctrl+B)"
              className="p-1.5 rounded-md hover:bg-muted text-foreground transition-colors"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('*', '*', 'italic text')}
              title="Italic (Ctrl+I)"
              className="p-1.5 rounded-md hover:bg-muted text-foreground transition-colors"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('~~', '~~', 'strikethrough text')}
              title="Strikethrough"
              className="p-1.5 rounded-md hover:bg-muted text-foreground transition-colors"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('`', '`', 'inline code')}
              title="Inline Code"
              className="p-1.5 rounded-md hover:bg-muted text-foreground transition-colors"
            >
              <Code className="w-4 h-4" />
            </button>
          </div>

          <div className="h-4 w-px bg-border mx-0.5" />

          {/* Lists & Callouts */}
          <div className="flex items-center rounded-lg bg-background/80 border border-border/70 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => insertMarkdown('\n- ', '\n', 'List item')}
              title="Bullet List (- )"
              className="p-1.5 rounded-md hover:bg-muted text-foreground transition-colors"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('\n1. ', '\n', 'First item')}
              title="Numbered List (1. )"
              className="p-1.5 rounded-md hover:bg-muted text-foreground transition-colors"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('\n- [ ] ', '\n', 'Task to complete')}
              title="Task Checklist (- [ ] )"
              className="p-1.5 rounded-md hover:bg-muted text-foreground transition-colors"
            >
              <ListTodo className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('\n> ', '\n', 'Executive quotation or architectural insight')}
              title="Blockquote (> )"
              className="p-1.5 rounded-md hover:bg-muted text-foreground transition-colors"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('\n```typescript\n', '\n```\n', '// Implementation code here')}
              title="Code Block (```)"
              className="p-1.5 rounded-md hover:bg-muted text-foreground transition-colors"
            >
              <FileCode className="w-4 h-4" />
            </button>
          </div>

          <div className="h-4 w-px bg-border mx-0.5" />

          {/* Link Insertion */}
          <button
            type="button"
            onClick={() => {
              const textarea = textareaRef.current;
              const selected = textarea ? value.substring(textarea.selectionStart, textarea.selectionEnd) : '';
              setLinkText(selected);
              setLinkUrl('');
              setIsLinkDialogOpen(true);
            }}
            title="Insert Link (Ctrl+K)"
            className="p-1.5 rounded-lg bg-background/80 border border-border/70 hover:bg-muted text-foreground transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <Link2 className="w-4 h-4" />
            <span className="hidden sm:inline text-[11px] font-medium">Link</span>
          </button>

          {/* IMAGE UPLOAD & INSERTION (PRIMARY ACTION) */}
          <button
            type="button"
            onClick={() => setIsImageDialogOpen(true)}
            title="Upload or Insert Image"
            className="px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-2xs flex items-center gap-1.5 font-medium text-[11px]"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </button>
        </div>

        {/* View Mode Switcher (Write / Split / Preview) */}
        <div className="flex items-center rounded-lg bg-background/80 border border-border/70 p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode('write')}
            className={cn(
              'px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5',
              viewMode === 'write' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Edit3 className="w-3 h-3" />
            <span>Write</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={cn(
              'hidden md:flex px-2.5 py-1 rounded-md text-[11px] font-medium transition-all items-center gap-1.5',
              viewMode === 'split' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Columns className="w-3 h-3" />
            <span>Split</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={cn(
              'px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5',
              viewMode === 'preview' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Eye className="w-3 h-3" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* ── Main Workspace ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border flex-1 min-h-[360px]">
        {/* Write Editor Area */}
        <div
          className={cn(
            'flex flex-col relative bg-background',
            viewMode === 'preview' ? 'hidden' : viewMode === 'write' ? 'md:col-span-2' : ''
          )}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onDrop={handleDrop}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={{ minHeight }}
            className="w-full flex-1 p-4 font-mono text-xs sm:text-sm text-foreground bg-transparent resize-y focus:outline-none leading-relaxed border-none scrollbar-thin"
          />

          {/* Drag & Drop Visual Hint */}
          <div className="px-4 py-2 bg-muted/20 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-primary" />
              Tip: Drag & drop images or paste from clipboard (Ctrl+V) directly
            </span>
            <span>Markdown supported</span>
          </div>
        </div>

        {/* Live Preview Area */}
        <div
          className={cn(
            'flex flex-col bg-muted/10 overflow-y-auto p-4 sm:p-6 text-foreground',
            viewMode === 'write' ? 'hidden' : viewMode === 'preview' ? 'md:col-span-2' : ''
          )}
          style={{ minHeight }}
        >
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/60">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-primary" />
              Live Publication Preview
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">
              {stats.words} words • ~{stats.readingTime} min read
            </span>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none space-y-4">
            {renderMarkdownPreview(value)}
          </div>
        </div>
      </div>

      {/* ── Footer Status Bar ──────────────────────────────────────── */}
      <div className="px-4 py-2 bg-muted/40 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <span>{stats.words} words</span>
          <span>•</span>
          <span>{stats.chars} characters</span>
          <span>•</span>
          <span>~{stats.readingTime} min read</span>
        </div>
        <div className="text-[11px] flex items-center gap-2 text-muted-foreground">
          <HelpCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Use ## for sections, &gt; for quotes, and ![]() for images</span>
        </div>
      </div>

      {/* ── Dialog: Upload / Insert Image ───────────────────────────── */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              Insert Image into Content
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Upload an image file from your device, drag & drop, or paste a public CDN / Unsplash URL.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleInsertImageFromDialog} className="space-y-4 mt-2">
            {/* Direct Upload Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-input hover:border-primary/70 bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer text-center group"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Upload className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-foreground">
                {isUploading ? 'Processing image...' : 'Click to select image file'}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                PNG, JPG, WebP, SVG, GIF (up to 10MB)
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  processImageFile(e.target.files[0], imageAlt);
                }
              }}
            />

            <div className="relative flex items-center py-1">
              <div className="grow border-t border-border" />
              <span className="shrink-0 mx-3 text-[11px] font-mono text-muted-foreground uppercase">
                Or Insert via URL
              </span>
              <div className="grow border-t border-border" />
            </div>

            {/* Image URL Input */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Image URL</label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or https://cdn..."
                className="text-xs font-mono"
              />
            </div>

            {/* Alt / Caption Text */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Alt Text / Caption (SEO & Accessibility)
              </label>
              <Input
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="e.g. Distributed Database Architecture Topology"
                className="text-xs"
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsImageDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={!imageUrl.trim() || isUploading}>
                Insert Image
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Insert Link ─────────────────────────────────────── */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Link2 className="w-5 h-5 text-primary" />
              Insert Hyperlink
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add a web link to guide readers to documentation, repositories, or external resources.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleInsertLink} className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Link Text</label>
              <Input
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="e.g. Shopify GraphQL Documentation"
                className="text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Destination URL <span className="text-destructive">*</span>
              </label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://shopify.dev/docs/api"
                required
                className="text-xs font-mono"
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsLinkDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={!linkUrl.trim()}>
                Insert Link
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Lightweight, zero-dependency Markdown Renderer for Live Preview
 * Formats headings, images, lists, blockquotes, code blocks, bold, italics, and links.
 */
function renderMarkdownPreview(markdown: string) {
  if (!markdown || !markdown.trim()) {
    return (
      <div className="py-12 text-center text-muted-foreground text-xs italic">
        Start writing in the editor or upload an image to see your publication preview here.
      </div>
    );
  }

  const lines = markdown.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = '';

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i] ?? '';
    const trimmed = rawLine.trim();

    // Code block open/close
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <div key={`code-${i}`} className="my-4 rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 text-xs font-mono">
            {codeLang && (
              <div className="px-3 py-1.5 bg-neutral-900 border-b border-neutral-800 text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                {codeLang}
              </div>
            )}
            <pre className="p-4 text-emerald-400 overflow-x-auto leading-relaxed">
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          </div>
        );
        inCodeBlock = false;
        codeBuffer = [];
        codeLang = '';
      } else {
        inCodeBlock = true;
        codeLang = trimmed.replace('```', '').trim();
        codeBuffer = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    // Empty lines
    if (!trimmed) {
      continue;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-base font-bold text-foreground mt-4 mb-2">
          {formatInline(trimmed.replace(/^###\s+/, ''))}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-xl font-bold text-foreground mt-6 mb-3 pt-3 border-t border-border/40 first:border-0 first:pt-0">
          {formatInline(trimmed.replace(/^##\s+/, ''))}
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="text-2xl font-bold text-foreground mt-6 mb-3">
          {formatInline(trimmed.replace(/^#\s+/, ''))}
        </h1>
      );
      continue;
    }

    // Markdown Image: ![Alt text](url)
    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      const [, alt, src] = imgMatch;
      elements.push(
        <figure key={i} className="my-6 rounded-xl overflow-hidden border border-border bg-muted/20 shadow-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt || 'Article image'}
            className="w-full max-h-[460px] object-cover rounded-t-xl"
            onError={(e) => {
              (e.target as any).src =
                'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80';
            }}
          />
          {alt && (
            <figcaption className="p-2.5 text-center text-xs text-muted-foreground italic bg-muted/40 border-t border-border">
              {alt}
            </figcaption>
          )}
        </figure>
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote
          key={i}
          className="my-4 pl-4 py-2 border-l-4 border-primary bg-primary/5 rounded-r-lg text-xs sm:text-sm italic text-foreground"
        >
          {formatInline(trimmed.replace(/^>\s+/, ''))}
        </blockquote>
      );
      continue;
    }

    // Divider
    if (trimmed === '---' || trimmed === '***') {
      elements.push(<hr key={i} className="my-6 border-border" />);
      continue;
    }

    // Bullet List item
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground ml-2 my-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
          <span>{formatInline(trimmed.replace(/^[-*]\s+/, ''))}</span>
        </div>
      );
      continue;
    }

    // Task item
    if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('- [x] ')) {
      const isChecked = trimmed.startsWith('- [x] ');
      elements.push(
        <div key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-foreground ml-2 my-1">
          <input type="checkbox" readOnly checked={isChecked} className="rounded border-input text-primary" />
          <span className={isChecked ? 'line-through text-muted-foreground' : ''}>
            {formatInline(trimmed.replace(/^- \[[ x]\]\s+/, ''))}
          </span>
        </div>
      );
      continue;
    }

    // Standard Paragraph
    elements.push(
      <p key={i} className="text-xs sm:text-sm text-foreground leading-relaxed">
        {formatInline(trimmed)}
      </p>
    );
  }

  return <>{elements}</>;
}

/**
 * Basic inline formatter for Bold, Italic, Code, and Links
 */
function formatInline(text: string): React.ReactNode {
  // Regex to match markdown links: [label](url)
  const linkRegex = /\[(.*?)\]\((.*?)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(formatInlineStyles(text.substring(lastIndex, match.index)));
    }
    const [, label, href] = match;
    parts.push(
      <a
        key={match.index}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline font-medium hover:text-primary/80"
      >
        {label}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(formatInlineStyles(text.substring(lastIndex)));
  }

  return parts.length > 0 ? parts : text;
}

function formatInlineStyles(text: string): React.ReactNode {
  // Bold: **text**
  // Italic: *text*
  // Code: `code`
  // We can do a lightweight tokenization
  const tokens = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|~~.*?~~)/g);
  return tokens.map((token, i) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={i} className="font-bold text-foreground">{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith('*') && token.endsWith('*')) {
      return <em key={i} className="italic">{token.slice(1, -1)}</em>;
    }
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded-md bg-muted font-mono text-[11px] text-primary">
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith('~~') && token.endsWith('~~')) {
      return <span key={i} className="line-through text-muted-foreground">{token.slice(2, -2)}</span>;
    }
    return token;
  });
}
