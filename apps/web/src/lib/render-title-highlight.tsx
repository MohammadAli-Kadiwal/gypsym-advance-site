import * as React from 'react';

/**
 * Smartly finds the exact or morphological word match in the title.
 * e.g. "engineering" matches "Engineered"
 * e.g. "engineered" matches "Engineered"
 * e.g. "modern" matches "modern"
 */
function findHighlightTarget(title: string, highlightWord?: string): string | null {
  if (!highlightWord || !highlightWord.trim()) return null;
  const trimmed = highlightWord.trim();

  // 1. Direct substring match
  if (title.toLowerCase().includes(trimmed.toLowerCase())) {
    return trimmed;
  }

  // 2. Morphological stem matching against words in the title
  const words = title.split(/\s+/).map((w) => w.replace(/[^\w]/g, ''));
  const hLower = trimmed.toLowerCase();

  for (const w of words) {
    if (!w) continue;
    const wLower = w.toLowerCase();

    // Find common prefix length
    let commonLen = 0;
    while (
      commonLen < wLower.length &&
      commonLen < hLower.length &&
      wLower[commonLen] === hLower[commonLen]
    ) {
      commonLen++;
    }

    // If they share 4+ leading characters (e.g. "engineer" in "engineered" & "engineering")
    if (commonLen >= 4 && commonLen >= Math.min(wLower.length, hLower.length) * 0.55) {
      return w;
    }
  }

  return null;
}

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

  const matchedTarget = findHighlightTarget(title, highlightWord);

  if (!matchedTarget) {
    const lines = title.split('\n');
    return lines.map((line, lIdx) => (
      <React.Fragment key={lIdx}>
        {lIdx > 0 && <br />}
        {line}
      </React.Fragment>
    ));
  }

  const escaped = matchedTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = title.split(regex);

  return parts.map((part, i) => {
    if (part.toLowerCase() === matchedTarget.toLowerCase()) {
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
