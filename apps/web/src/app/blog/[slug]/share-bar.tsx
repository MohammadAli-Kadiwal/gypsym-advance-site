'use client';

import * as React from 'react';
import { Check, Copy, Twitter, Linkedin } from 'lucide-react';

interface ArticleShareBarProps {
  title: string;
  slug: string;
}

export function ArticleShareBar({ title, slug }: ArticleShareBarProps) {
  const [copied, setCopied] = React.useState(false);

  const getUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return `https://gypsym.com/blog/${slug}`;
  };

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`Reading "${title}" by Gypsym Technology:`);
    const url = encodeURIComponent(getUrl());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer');
  };

  const handleLinkedInShare = () => {
    const url = encodeURIComponent(getUrl());
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono text-slate-400 hidden sm:inline-block">Share:</span>

      {/* Copy link */}
      <button
        onClick={handleCopy}
        title="Copy article link"
        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#98c22a]/20 hover:text-[#98c22a] transition-colors flex items-center gap-1.5 text-xs font-mono"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-emerald-500 text-[11px]">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Copy Link</span>
          </>
        )}
      </button>

      {/* Twitter / X */}
      <button
        onClick={handleTwitterShare}
        title="Share on X / Twitter"
        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-500/15 hover:text-sky-500 transition-colors"
      >
        <Twitter className="w-3.5 h-3.5" />
      </button>

      {/* LinkedIn */}
      <button
        onClick={handleLinkedInShare}
        title="Share on LinkedIn"
        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-600/15 hover:text-blue-500 transition-colors"
      >
        <Linkedin className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
