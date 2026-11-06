'use client';

import * as React from 'react';
import { Check, Copy, Twitter, Linkedin, Facebook } from 'lucide-react';
import { getSiteUrl } from '@/lib/site-url';

interface ArticleShareBarProps {
  title: string;
  slug: string;
}

function WhatsAppIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2ZM12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.68 12.04 3.68C14.25 3.68 16.31 4.54 17.87 6.1C19.42 7.66 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15ZM16.55 14.39C16.3 14.27 15.09 13.67 14.86 13.59C14.64 13.51 14.47 13.46 14.31 13.71C14.14 13.96 13.67 14.51 13.53 14.68C13.38 14.84 13.24 14.86 12.99 14.74C12.74 14.61 11.94 14.35 11 13.51C10.26 12.85 9.77 12.04 9.62 11.79C9.48 11.54 9.61 11.4 9.73 11.28C9.84 11.17 9.98 10.99 10.1 10.84C10.23 10.7 10.27 10.59 10.35 10.43C10.44 10.26 10.39 10.12 10.33 10C10.27 9.87 9.77 8.65 9.57 8.14C9.37 7.65 9.16 7.71 9.01 7.71C8.87 7.7 8.7 7.7 8.54 7.7C8.37 7.7 8.1 7.76 7.87 8.01C7.64 8.26 7 8.86 7 10.08C7 11.3 7.89 12.47 8.01 12.64C8.14 12.8 9.76 15.3 12.24 16.37C12.83 16.63 13.29 16.78 13.65 16.89C14.24 17.08 14.78 17.05 15.21 16.99C15.69 16.92 16.69 16.38 16.9 15.8C17.11 15.21 17.11 14.71 17.05 14.61C16.98 14.51 16.81 14.45 16.55 14.39Z" />
    </svg>
  );
}

export function ArticleShareBar({ title, slug }: ArticleShareBarProps) {
  const [copied, setCopied] = React.useState(false);

  const getUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return `${getSiteUrl()}/blog/${slug}`;
  };

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Check out this publication: "${title}"\n${getUrl()}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(getUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'noopener,noreferrer');
  };

  const handleLinkedInShare = () => {
    const url = encodeURIComponent(getUrl());
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'noopener,noreferrer');
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`Reading "${title}" by Gypsym Technology:`);
    const url = encodeURIComponent(getUrl());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
      <span className="text-xs font-mono text-slate-400 hidden sm:inline-block">Share:</span>

      {/* Copy link */}
      <button
        onClick={handleCopy}
        type="button"
        title="Copy article link"
        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#d9287c]/15 hover:text-[#d9287c] transition-colors flex items-center gap-1.5 text-xs font-mono cursor-pointer"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-emerald-500 text-[11px] font-semibold">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Copy Link</span>
          </>
        )}
      </button>

      {/* WhatsApp */}
      <button
        onClick={handleWhatsAppShare}
        type="button"
        title="Share on WhatsApp"
        aria-label="Share on WhatsApp"
        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#25D366]/15 hover:text-[#25D366] transition-colors cursor-pointer"
      >
        <WhatsAppIcon className="w-3.5 h-3.5" />
      </button>

      {/* Facebook */}
      <button
        onClick={handleFacebookShare}
        type="button"
        title="Share on Facebook"
        aria-label="Share on Facebook"
        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#1877F2]/15 hover:text-[#1877F2] transition-colors cursor-pointer"
      >
        <Facebook className="w-3.5 h-3.5" />
      </button>

      {/* LinkedIn */}
      <button
        onClick={handleLinkedInShare}
        type="button"
        title="Share on LinkedIn"
        aria-label="Share on LinkedIn"
        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#0A66C2]/15 hover:text-[#0A66C2] transition-colors cursor-pointer"
      >
        <Linkedin className="w-3.5 h-3.5" />
      </button>

      {/* Twitter / X */}
      <button
        onClick={handleTwitterShare}
        type="button"
        title="Share on X / Twitter"
        aria-label="Share on X / Twitter"
        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-neutral-900/15 dark:hover:bg-white/15 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
      >
        <Twitter className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
