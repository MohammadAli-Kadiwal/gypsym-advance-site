import * as React from 'react';

/**
 * Renders title/headline text with an accent word stylized in Instrument Serif italic.
 * Preserves multi-line breaks (\n -> <br />).
 */
export function renderTitleWithHighlight(
  title: string,
  highlightWord?: string,
  customItalicClass?: string
): React.ReactNode {
  if (!title) return null;

  const italicClass =
    customItalicClass ||
    'font-serif italic font-normal text-[1.08em] tracking-normal inline-block';

  if (!highlightWord || !highlightWord.trim() || !title.toLowerCase().includes(highlightWord.trim().toLowerCase())) {
    const lines = title.split('\n');
    return lines.map((line, lIdx) => (
      <React.Fragment key={lIdx}>
        {lIdx > 0 && <br />}
        {line}
      </React.Fragment>
    ));
  }

  const trimmed = highlightWord.trim();
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = title.split(regex);

  return parts.map((part, i) => {
    if (part.toLowerCase() === trimmed.toLowerCase()) {
      return (
        <span key={i} className={italicClass}>
          {part}
        </span>
      );
    }

    const lines = part.split('\n');
    return (
      <React.Fragment key={i}>
        {lines.map((line, lIdx) => (
          <React.Fragment key={lIdx}>
            {lIdx > 0 && <br />}
            {line}
          </React.Fragment>
        ))}
      </React.Fragment>
    );
  });
}
