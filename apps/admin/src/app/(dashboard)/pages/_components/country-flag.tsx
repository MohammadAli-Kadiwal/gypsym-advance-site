'use client';

import * as React from 'react';
import { getCountryCodeFromFlagEmoji } from './country-locales';

export interface CountryFlagProps {
  code?: string;
  flag?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function CountryFlag({
  code,
  flag,
  name,
  size = 'md',
  className = '',
}: CountryFlagProps) {
  const [hasError, setHasError] = React.useState(false);

  // Extract or resolve 2-letter ISO code
  const resolvedCode = (code || (flag ? getCountryCodeFromFlagEmoji(flag) : '') || '').toUpperCase().trim();
  const isValidCode = resolvedCode.length === 2 && /^[A-Z]{2}$/.test(resolvedCode);

  const sizeConfig = {
    sm: { w: 16, h: 12, imgW: 32, fontSize: 'text-xs' },
    md: { w: 20, h: 15, imgW: 40, fontSize: 'text-sm' },
    lg: { w: 26, h: 19, imgW: 60, fontSize: 'text-base' },
    xl: { w: 34, h: 25, imgW: 80, fontSize: 'text-xl' },
  }[size] || { w: 20, h: 15, imgW: 40, fontSize: 'text-sm' };

  // If invalid code or failed to load image, fall back to emoji or globe
  if (!isValidCode || hasError) {
    return (
      <span
        className={`inline-flex items-center justify-center leading-none ${sizeConfig.fontSize} ${className}`}
        title={name || resolvedCode || 'Country'}
        aria-label={name || resolvedCode || 'Country'}
      >
        {flag && flag !== '🌐' ? flag : '🌐'}
      </span>
    );
  }

  const lowerCode = resolvedCode.toLowerCase();

  return (
    <span
      className={`inline-flex items-center shrink-0 align-middle leading-none ${className}`}
      title={name || resolvedCode}
    >
      <img
        src={`https://flagcdn.com/w${sizeConfig.imgW}/${lowerCode}.png`}
        srcSet={`https://flagcdn.com/w${sizeConfig.imgW * 2}/${lowerCode}.png 2x`}
        width={sizeConfig.w}
        height={sizeConfig.h}
        alt={name || `${resolvedCode} flag`}
        className="rounded-[2.5px] object-cover shadow-[0_1px_2px_rgba(0,0,0,0.12)] border border-black/10 inline-block align-middle select-none"
        loading="lazy"
        onError={() => setHasError(true)}
      />
    </span>
  );
}
