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
  Type,
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
  placeholder = 'Write your publication content. Use formatting toolbar to apply headings, bold, lists, and images directly...',
  minHeight = '360px',
  className = '',
}: RichTextEditorProps) {
  // Default to visual mode so headings are rendered directly without '#'
  const [viewMode, setViewMode] = React.useState<'visual' | 'split' | 'write' | 'preview'>('visual');
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
  const visualEditorRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Calculate statistics
  const stats = React.useMemo(() => {
    const text = value || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    return { words, chars, readingTime };
  }, [value]);

  // Sync value into visual editor whenever viewMode switches to visual or value changes externally
  React.useEffect(() => {
    if (viewMode === 'visual' && visualEditorRef.current) {
      const currentHtml = visualEditorRef.current.innerHTML;
      const convertedHtml = markdownToHtml(value || '');
      // Only set if content actually differs to avoid resetting cursor while typing
      if (currentHtml !== convertedHtml && !visualEditorRef.current.contains(document.activeElement)) {
        visualEditorRef.current.innerHTML = convertedHtml;
      }
    }
  }, [value, viewMode]);

  // Handler for visual editor inputs
  const handleVisualInput = React.useCallback(() => {
    if (!visualEditorRef.current) return;
    const html = visualEditorRef.current.innerHTML;
    const md = htmlToMarkdown(html);
    onChange(md);
  }, [onChange]);

  // Helper to insert or wrap markdown at current cursor position (for Write / Split modes)
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

      requestAnimationFrame(() => {
        textarea.focus();
        const cursorPosition = start + before.length + selected.length;
        textarea.setSelectionRange(cursorPosition, cursorPosition);
      });
    },
    [value, onChange]
  );

  // Apply formatting command (works for Visual mode or Markdown mode)
  const applyFormat = (command: string, arg?: string, beforeMd = '', afterMd = '', defaultText = '') => {
    if (viewMode === 'visual') {
      if (visualEditorRef.current) {
        visualEditorRef.current.focus();
      }
      document.execCommand(command, false, arg);
      handleVisualInput();
    } else {
      insertMarkdown(beforeMd, afterMd, defaultText);
    }
  };

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

          if (viewMode === 'visual') {
            applyFormat('insertHTML', `<p><img src="${dataUrl}" alt="${cleanName}" class="max-h-[480px] rounded-xl my-4 object-cover" /></p>`);
          } else {
            const markdownImage = `\n\n![${cleanName}](${dataUrl})\n\n`;
            insertMarkdown(markdownImage, '', '');
          }
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
    [viewMode, insertMarkdown]
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

  // Handle Drag & Drop for Visual Editor
  const handleVisualDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        e.preventDefault();
        processImageFile(file);
      }
    }
  };

  // Handle Clipboard Paste for Visual Editor
  const handleVisualPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
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
    if (viewMode === 'visual') {
      applyFormat('insertHTML', `<a href="${linkUrl.trim()}" target="_blank" rel="noopener">${label}</a>`);
    } else {
      insertMarkdown(`[${label}](`, `)`, linkUrl.trim());
    }
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
    if (viewMode === 'visual') {
      applyFormat('insertHTML', `<p><img src="${imageUrl.trim()}" alt="${alt}" class="max-h-[480px] rounded-xl my-4 object-cover" /></p>`);
    } else {
      const markdownImage = `\n\n![${alt}](${imageUrl.trim()})\n\n`;
      insertMarkdown(markdownImage, '', '');
    }
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
          {/* Headings: Directly formats as Heading without showing '#' in Visual Mode */}
          <div className="flex items-center rounded-lg bg-background/80 border border-border/70 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => applyFormat('formatBlock', '<h2>', '\n## ', '\n', 'Section Heading')}
              title="Heading 2 (Direct Heading)"
              className="px-2 py-1.5 rounded-md hover:bg-muted text-foreground transition-colors font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <Heading2 className="w-4 h-4 text-primary" />
              <span className="text-[11px]">H2</span>
            </button>
            <button
              type="button"
              onClick={() => applyFormat('formatBlock', '<h3>', '\n### ', '\n', 'Subheading')}
              title="Heading 3 (Direct Subheading)"
              className="px-2 py-1.5 rounded-md hover:bg-muted text-foreground transition-colors font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <Heading3 className="w-4 h-4 text-primary" />
              <span className="text-[11px]">H3</span>
            </button>
          </div>

          <div className="h-4 w-px bg-border mx-0.5" />

          {/* Text Styling */}
          <div className="flex items-center rounded-lg bg-background/80 border border-border/70 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => applyFormat('bold', undefined, '**', '**', 'bold text')}
              title="Bold (Ctrl+B)"
              className="p-1.5 rounded-md hover:bg-muted text-foreground transition-colors cursor-pointer"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('italic', undefined, '*', '*', 'italic text')}
              title="Italic (Ctrl+I)"
              className="p-1.5 rounded-md hover:bg-muted text-foreground transition-colors cursor-pointer"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('strikeThrough', undefined, '~~', '~~', 'strikethrough text')}
              title="Strikethrough"
              className="p-1.5 rounded-md hover:bg-muted text-foreground transition-colors cursor-pointer"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('code', undefined, '`', '`', 'inline code')}
              title="Inline Code"
              className="p-1.5 rounded-md hover:bg-muted text-foreground transition-colors cursor-pointer"
            >
              <Code className="w-4 h-4" />
            </button>
          </div>

          <div className="h-4 w-px bg-border mx-0.5" />

          {/* Lists & Callouts */}
          <div className="flex items-center rounded-lg bg-background/80 border border-border/70 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => applyFormat('insertUnorderedList', undefined, '\n- ', '\n', 'List item')}
              title="Bullet List"
              className="p-1.5 rounded-md hover:bg-muted text-foreground transition-colors cursor-pointer"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('insertOrderedList', undefined, '\n1. ', '\n', 'First item')}
              title="Numbered List"
              className="p-1.5 rounded-md hover:bg-muted text-foreground transition-colors cursor-pointer"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('formatBlock', '<blockquote>', '\n> ', '\n', 'Quotation or insight')}
              title="Blockquote"
              className="p-1.5 rounded-md hover:bg-muted text-foreground transition-colors cursor-pointer"
            >
              <Quote className="w-4 h-4" />
            </button>
          </div>

          <div className="h-4 w-px bg-border mx-0.5" />

          {/* Link Insertion */}
          <button
            type="button"
            onClick={() => {
              const selected = window.getSelection()?.toString() || '';
              setLinkText(selected);
              setLinkUrl('');
              setIsLinkDialogOpen(true);
            }}
            title="Insert Link (Ctrl+K)"
            className="p-1.5 rounded-lg bg-background/80 border border-border/70 hover:bg-muted text-foreground transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Link2 className="w-4 h-4" />
            <span className="hidden sm:inline text-[11px] font-medium">Link</span>
          </button>

          {/* IMAGE UPLOAD & INSERTION */}
          <button
            type="button"
            onClick={() => setIsImageDialogOpen(true)}
            title="Upload or Insert Image"
            className="px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-2xs flex items-center gap-1.5 font-medium text-[11px] cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </button>
        </div>

        {/* View Mode Switcher: Visual (Direct Headings) | Split | Markdown | Preview */}
        <div className="flex items-center rounded-lg bg-background/80 border border-border/70 p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => {
              setViewMode('visual');
            }}
            className={cn(
              'px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5 cursor-pointer',
              viewMode === 'visual' ? 'bg-primary text-primary-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
            )}
            title="Visual Mode: Direct headings and formatting without #"
          >
            <Type className="w-3.5 h-3.5" />
            <span>Visual</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={cn(
              'hidden md:flex px-2.5 py-1 rounded-md text-[11px] font-medium transition-all items-center gap-1.5 cursor-pointer',
              viewMode === 'split' ? 'bg-primary text-primary-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
            )}
            title="Side-by-side Markdown & Live Preview"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('write')}
            className={cn(
              'px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5 cursor-pointer',
              viewMode === 'write' ? 'bg-primary text-primary-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
            )}
            title="Raw Markdown Editor"
          >
            <Edit3 className="w-3 h-3" />
            <span>Markdown</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={cn(
              'px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5 cursor-pointer',
              viewMode === 'preview' ? 'bg-primary text-primary-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
            )}
            title="Full Clean Reader Preview"
          >
            <Eye className="w-3 h-3" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* ── Main Workspace ─────────────────────────────────────────── */}
      <div className="flex-1 min-h-[360px] flex flex-col relative">
        {/* 1. VISUAL WYSIWYG EDITOR MODE (Direct headings without '#') */}
        {viewMode === 'visual' && (
          <div className="flex flex-col flex-1 relative bg-background">
            <div
              ref={visualEditorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleVisualInput}
              onDrop={handleVisualDrop}
              onPaste={handleVisualPaste}
              style={{ minHeight }}
              className="w-full flex-1 p-5 sm:p-6 text-sm text-foreground bg-transparent focus:outline-none leading-relaxed prose prose-neutral dark:prose-invert max-w-none scrollbar-thin overflow-y-auto [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-foreground [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-foreground [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:text-foreground"
            />
            {/* Visual Mode Hint */}
            <div className="px-4 py-2 bg-muted/20 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5 text-primary font-medium">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Visual Mode: Headings, bold, and media display directly without # symbols.
              </span>
              <span>Rich Text Mode</span>
            </div>
          </div>
        )}

        {/* 2. SPLIT & WRITE (MARKDOWN) MODES */}
        {(viewMode === 'write' || viewMode === 'split') && (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border flex-1 min-h-[360px]">
            {/* Write / Markdown Editor */}
            <div className={cn('flex flex-col relative bg-background', viewMode === 'write' ? 'md:col-span-2' : '')}>
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
              <div className="px-4 py-2 bg-muted/20 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-primary" />
                  Tip: Drag & drop images or paste from clipboard (Ctrl+V) directly
                </span>
                <span>Markdown supported</span>
              </div>
            </div>

            {/* Live Preview Column (for Split View) */}
            {viewMode === 'split' && (
              <div className="flex flex-col bg-muted/10 overflow-y-auto p-4 sm:p-6 text-foreground" style={{ minHeight }}>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/60">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-primary" />
                    Live Heading & Publication Preview
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {stats.words} words • ~{stats.readingTime} min read
                  </span>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none space-y-4">
                  {renderMarkdownPreview(value)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. FULL PREVIEW MODE */}
        {viewMode === 'preview' && (
          <div className="flex flex-col bg-muted/10 overflow-y-auto p-6 sm:p-10 text-foreground" style={{ minHeight }}>
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-border/60">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-primary" />
                Live Publication Preview
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                {stats.words} words • ~{stats.readingTime} min read
              </span>
            </div>
            <div className="prose prose-base dark:prose-invert max-w-none space-y-5">
              {renderMarkdownPreview(value)}
            </div>
          </div>
        )}
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
          <span className="hidden sm:inline">Use Visual mode for instant headings or Split mode for side-by-side editing</span>
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
 * Formats headings, images, lists, blockquotes, code blocks, bold, italics, and links without showing '#'.
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

    // Headings (Direct styled headings, strictly no '#' characters)
    if (trimmed.startsWith('#### ') || /^####[^#]/.test(trimmed)) {
      elements.push(
        <h4 key={i} className="text-sm font-bold text-foreground mt-4 mb-1.5">
          {formatInline(trimmed.replace(/^####\s*/, ''))}
        </h4>
      );
      continue;
    }
    if (trimmed.startsWith('### ') || /^###[^#]/.test(trimmed)) {
      elements.push(
        <h3 key={i} className="text-base font-bold text-foreground mt-5 mb-2">
          {formatInline(trimmed.replace(/^###\s*/, ''))}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith('## ') || /^##[^#]/.test(trimmed)) {
      elements.push(
        <h2 key={i} className="text-xl font-bold text-foreground mt-6 mb-3 pt-3 border-t border-border/40 first:border-0 first:pt-0">
          {formatInline(trimmed.replace(/^##\s*/, ''))}
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith('# ') || /^#[^#]/.test(trimmed)) {
      elements.push(
        <h1 key={i} className="text-2xl font-bold text-foreground mt-6 mb-3">
          {formatInline(trimmed.replace(/^#\s*/, ''))}
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
          {alt && alt !== 'Article image' && (
            <figcaption className="p-2.5 text-center text-[11px] text-muted-foreground italic bg-muted/30 border-t border-border/50">
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
          className="my-4 pl-4 py-2 border-l-3 border-primary bg-primary/5 rounded-r-lg italic text-foreground text-xs sm:text-sm font-serif"
        >
          {formatInline(trimmed.replace(/^>\s+/, ''))}
        </blockquote>
      );
      continue;
    }

    // Bullet lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-foreground my-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
          <span>{formatInline(trimmed.replace(/^[-*]\s+/, ''))}</span>
        </div>
      );
      continue;
    }

    // Numbered lists
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      elements.push(
        <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-foreground my-1">
          <span className="font-mono text-xs font-bold text-primary shrink-0">{numMatch[1]}.</span>
          <span>{formatInline(numMatch[2] || '')}</span>
        </div>
      );
      continue;
    }

    // Standard paragraph
    elements.push(
      <p key={i} className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
        {formatInline(trimmed)}
      </p>
    );
  }

  return elements;
}

/**
 * Format inline markdown tokens: **bold**, *italic*, ~~strikethrough~~, `code`, and [links](url)
 */
function formatInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const linkRegex = /\[(.*?)\]\((.*?)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(renderStyles(text.substring(lastIndex, match.index)));
    }
    const [, label, href] = match;
    parts.push(
      <a
        key={match.index}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline font-medium hover:opacity-80"
      >
        {label}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(renderStyles(text.substring(lastIndex)));
  }

  return parts;
}

function renderStyles(text: string): React.ReactNode {
  const boldRegex = /\*\*(.*?)\*\*/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(renderItalicAndCode(text.substring(lastIndex, match.index)));
    }
    parts.push(
      <strong key={match.index} className="font-bold text-foreground">
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(renderItalicAndCode(text.substring(lastIndex)));
  }

  return parts;
}

function renderItalicAndCode(text: string): React.ReactNode {
  const tokens = text.split(/(`[^`]+`|\*[^*]+\*|~~[^~]+~~)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code key={idx} className="px-1.5 py-0.5 rounded bg-muted font-mono text-[11px] text-foreground border border-border">
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith('*') && token.endsWith('*')) {
      return (
        <em key={idx} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    }
    if (token.startsWith('~~') && token.endsWith('~~')) {
      return (
        <del key={idx} className="line-through text-muted-foreground">
          {token.slice(2, -2)}
        </del>
      );
    }
    return token;
  });
}

/**
 * Bidirectional conversion: Markdown to HTML for Visual Mode
 */
function markdownToHtml(md: string): string {
  if (!md) return '';
  const lines = md.split('\n');
  const htmlParts: string[] = [];
  let inUl = false;
  let inOl = false;

  const closeLists = () => {
    if (inUl) { htmlParts.push('</ul>'); inUl = false; }
    if (inOl) { htmlParts.push('</ol>'); inOl = false; }
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i] ?? '';
    const trimmed = raw.trim();

    if (!trimmed) {
      closeLists();
      continue;
    }

    if (trimmed.startsWith('#### ') || /^####[^#]/.test(trimmed)) {
      closeLists();
      htmlParts.push(`<h4>${inlineMdToHtml(trimmed.replace(/^####\s*/, ''))}</h4>`);
      continue;
    }
    if (trimmed.startsWith('### ') || /^###[^#]/.test(trimmed)) {
      closeLists();
      htmlParts.push(`<h3>${inlineMdToHtml(trimmed.replace(/^###\s*/, ''))}</h3>`);
      continue;
    }
    if (trimmed.startsWith('## ') || /^##[^#]/.test(trimmed)) {
      closeLists();
      htmlParts.push(`<h2>${inlineMdToHtml(trimmed.replace(/^##\s*/, ''))}</h2>`);
      continue;
    }
    if (trimmed.startsWith('# ') || /^#[^#]/.test(trimmed)) {
      closeLists();
      htmlParts.push(`<h2>${inlineMdToHtml(trimmed.replace(/^#\s*/, ''))}</h2>`);
      continue;
    }

    if (trimmed.startsWith('> ')) {
      closeLists();
      htmlParts.push(`<blockquote>${inlineMdToHtml(trimmed.replace(/^>\s+/, ''))}</blockquote>`);
      continue;
    }

    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      closeLists();
      htmlParts.push(`<p><img src="${imgMatch[2]}" alt="${imgMatch[1]}" class="max-h-[480px] rounded-xl my-4 object-cover" /></p>`);
      continue;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inUl) {
        closeLists();
        htmlParts.push('<ul>');
        inUl = true;
      }
      htmlParts.push(`<li>${inlineMdToHtml(trimmed.replace(/^[-*]\s+/, ''))}</li>`);
      continue;
    }

    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      if (!inOl) {
        closeLists();
        htmlParts.push('<ol>');
        inOl = true;
      }
      htmlParts.push(`<li>${inlineMdToHtml(numMatch[2] || '')}</li>`);
      continue;
    }

    closeLists();
    htmlParts.push(`<p>${inlineMdToHtml(trimmed)}</p>`);
  }
  closeLists();
  return htmlParts.join('\n');
}

function inlineMdToHtml(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/~~(.*?)~~/g, '<del>$1</del>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

/**
 * Bidirectional conversion: HTML to Markdown for Visual Mode output
 */
function htmlToMarkdown(html: string): string {
  if (typeof window === 'undefined') return html;
  const div = document.createElement('div');
  div.innerHTML = html;

  const processNode = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || '';
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    const childText = Array.from(el.childNodes).map(processNode).join('');

    switch (tag) {
      case 'h1':
        return `\n\n# ${childText.trim()}\n\n`;
      case 'h2':
        return `\n\n## ${childText.trim()}\n\n`;
      case 'h3':
        return `\n\n### ${childText.trim()}\n\n`;
      case 'h4':
      case 'h5':
      case 'h6':
        return `\n\n#### ${childText.trim()}\n\n`;
      case 'p':
        return `\n\n${childText.trim()}\n\n`;
      case 'strong':
      case 'b':
        return `**${childText}**`;
      case 'em':
      case 'i':
        return `*${childText}*`;
      case 'del':
      case 's':
      case 'strike':
        return `~~${childText}~~`;
      case 'code':
        return `\`${childText}\``;
      case 'blockquote':
        return `\n\n> ${childText.trim()}\n\n`;
      case 'ul':
      case 'ol':
        return `\n\n${childText}\n\n`;
      case 'li': {
        const isParentOl = el.parentElement?.tagName.toLowerCase() === 'ol';
        if (isParentOl) {
          const index = Array.from(el.parentElement?.children || []).indexOf(el) + 1;
          return `${index}. ${childText.trim()}\n`;
        }
        return `- ${childText.trim()}\n`;
      }
      case 'img': {
        const src = el.getAttribute('src') || '';
        const alt = el.getAttribute('alt') || 'Image';
        return `\n\n![${alt}](${src})\n\n`;
      }
      case 'a': {
        const href = el.getAttribute('href') || '';
        return `[${childText.trim()}](${href})`;
      }
      case 'div':
        return `\n${childText}\n`;
      case 'br':
        return '\n';
      default:
        return childText;
    }
  };

  const md = Array.from(div.childNodes).map(processNode).join('');
  return md.replace(/\n{3,}/g, '\n\n').trim();
}
