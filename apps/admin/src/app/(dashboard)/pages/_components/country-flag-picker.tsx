'use client';

import * as React from 'react';
import { CountryFlag } from './country-flag';
import {
  COUNTRY_PRESETS,
  CountryPresetItem,
  findCountryLocale,
  getCountryCodeFromFlagEmoji,
} from './country-locales';
import { Search, Sparkles, ChevronDown, Check, Globe } from 'lucide-react';

export interface CountryFlagPickerProps {
  value: string;
  onChange: (flag: string, preset?: CountryPresetItem) => void;
  countryName?: string;
  slug?: string;
  className?: string;
}

export function CountryFlagPicker({
  value,
  onChange,
  countryName = '',
  slug = '',
  className = '',
}: CountryFlagPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Close when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // focus search input
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filter country presets based on search query
  const filteredPresets = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COUNTRY_PRESETS;
    return COUNTRY_PRESETS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.currency.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q) ||
        c.flag.includes(q)
    );
  }, [search]);

  // Auto-detect flag from country name or slug
  const handleAutoDetect = React.useCallback(() => {
    const matched =
      findCountryLocale(countryName) ||
      findCountryLocale(slug);
    if (matched) {
      onChange(matched.flag, matched);
      setIsOpen(false);
    }
  }, [countryName, slug, onChange]);

  const displayFlag = value && value !== '🌐' ? value : '';
  const currentIso = displayFlag ? getCountryCodeFromFlagEmoji(displayFlag) : '';

  return (
    <div ref={containerRef} className={`relative flex items-center gap-1.5 ${className}`}>
      {/* Trigger Button with Flag Preview */}
      <div className="relative flex-1 flex items-center">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="h-9 w-full flex items-center justify-between gap-2 px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-xs text-left transition-colors shadow-xs"
          title="Select country flag"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center shrink-0">
              {displayFlag ? (
                <CountryFlag code={currentIso} flag={displayFlag} size="sm" />
              ) : (
                <Globe className="h-4 w-4 text-slate-400" />
              )}
            </div>
            <span className="font-medium text-slate-800 truncate">
              {displayFlag ? `${displayFlag} ${currentIso ? `(${currentIso})` : ''}` : 'Select flag...'}
            </span>
          </div>
          <ChevronDown className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Auto-Detect Quick Button */}
      <button
        type="button"
        onClick={handleAutoDetect}
        className="h-9 px-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors shadow-xs"
        title="Auto-detect icon from country name and route slug"
      >
        <Sparkles className="h-3 w-3 text-emerald-600" />
        <span>Auto-Detect</span>
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-72 max-w-[90vw] z-50 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col">
          {/* Header & Search */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/70 space-y-2">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country, code, flag..."
                className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-slate-400"
              />
            </div>

            {/* Quick Auto-Detect inside popover */}
            {(countryName || slug) && (
              <button
                type="button"
                onClick={handleAutoDetect}
                className="w-full py-1.5 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Sparkles className="h-3 w-3 text-emerald-600" />
                <span>Auto-Match for &ldquo;{countryName || slug}&rdquo;</span>
              </button>
            )}
          </div>

          {/* Country List */}
          <div className="max-h-60 overflow-y-auto p-1 divide-y divide-slate-50">
            {filteredPresets.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No matching country found
              </div>
            ) : (
              filteredPresets.map((c) => {
                const isSelected = value === c.flag;
                const iso = getCountryCodeFromFlagEmoji(c.flag);
                return (
                  <button
                    key={`${c.name}-${c.flag}`}
                    type="button"
                    onClick={() => {
                      onChange(c.flag, c);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <CountryFlag code={iso} flag={c.flag} size="sm" />
                      <span className="truncate">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {c.currency}
                      </span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Fallback to Globe */}
          <div className="p-1.5 border-t border-slate-100 bg-slate-50 text-right">
            <button
              type="button"
              onClick={() => {
                onChange('🌐');
                setIsOpen(false);
              }}
              className="text-[10px] text-slate-500 hover:text-slate-800 font-medium px-2 py-1 rounded"
            >
              Reset to Globe (🌐)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
