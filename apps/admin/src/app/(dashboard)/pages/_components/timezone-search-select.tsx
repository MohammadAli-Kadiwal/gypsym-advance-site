'use client';

import * as React from 'react';
import { Clock, Search, Check, ChevronDown, X, Globe } from 'lucide-react';
import { ALL_TIMEZONES } from './country-locales';

export interface TimezoneSearchSelectProps {
  value: string;
  onChange: (timezone: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

const POPULAR_TZS = [
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'America/Toronto',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Zurich',
  'Asia/Dubai',
  'Asia/Riyadh',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Pacific/Auckland',
  'Africa/Johannesburg',
  'UTC',
];

export function TimezoneSearchSelect({
  value,
  onChange,
  className = '',
  placeholder = 'Select business timezone...',
  disabled = false,
}: TimezoneSearchSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [selectedRegion, setSelectedRegion] = React.useState<string>('ALL');

  const containerRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Close when clicking outside
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input on open
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Current selected timezone object
  const currentOption = React.useMemo(() => {
    return ALL_TIMEZONES.find((t) => t.tz === value) || {
      tz: value,
      label: value,
      region: value.includes('/') ? value.split('/')[0] || 'Other' : 'UTC',
    };
  }, [value]);

  // Filtered timezone list
  const filteredTimezones = React.useMemo(() => {
    const q = search.trim().toLowerCase();

    return ALL_TIMEZONES.filter((item) => {
      // Region filter
      if (selectedRegion === 'POPULAR') {
        if (!POPULAR_TZS.includes(item.tz)) return false;
      } else if (selectedRegion !== 'ALL') {
        if (item.region.toLowerCase() !== selectedRegion.toLowerCase()) return false;
      }

      // Search query filter
      if (!q) return true;

      const tzMatch = item.tz.toLowerCase().includes(q);
      const labelMatch = item.label.toLowerCase().includes(q);
      const regionMatch = item.region.toLowerCase().includes(q);

      // Handle query like "gmt+4" or "utc-5"
      const cleanQ = q.replace(/^(gmt|utc)/i, '');
      const offsetMatch = cleanQ ? item.label.toLowerCase().includes(cleanQ) : false;

      return tzMatch || labelMatch || regionMatch || offsetMatch;
    });
  }, [search, selectedRegion]);

  const handleSelect = (tz: string) => {
    onChange(tz);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full h-9 rounded-xl border border-input bg-white px-3 text-xs flex items-center justify-between gap-2 text-left hover:bg-slate-50/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
      >
        <div className="flex items-center gap-2 truncate">
          <Clock className="h-3.5 w-3.5 text-sky-500 shrink-0" />
          <span className="truncate font-medium text-slate-900">
            {currentOption.label || currentOption.tz || placeholder}
          </span>
          {currentOption.tz && currentOption.tz !== currentOption.label && (
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
              ({currentOption.tz})
            </span>
          )}
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-sky-600' : ''
          }`}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-full min-w-[300px] sm:min-w-[380px] bg-white rounded-2xl border border-slate-200/90 shadow-xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
          {/* Search Header */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/60 space-y-2">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setIsOpen(false);
                  if (e.key === 'Enter' && filteredTimezones[0]) {
                    e.preventDefault();
                    handleSelect(filteredTimezones[0].tz);
                  }
                }}
                placeholder="Type city or timezone (e.g. Dubai, New York, London, Tokyo, GMT+4)..."
                className="w-full h-8 pl-8 pr-7 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Quick Region Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar text-[10px]">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'POPULAR', label: '★ Popular' },
                { id: 'America', label: 'America' },
                { id: 'Europe', label: 'Europe' },
                { id: 'Asia', label: 'Asia' },
                { id: 'Australia', label: 'Australia' },
                { id: 'Africa', label: 'Africa' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedRegion(tab.id)}
                  className={`px-2 py-0.5 rounded-md font-medium whitespace-nowrap transition-all cursor-pointer ${
                    selectedRegion === tab.id
                      ? 'bg-sky-500 text-white shadow-2xs font-semibold'
                      : 'bg-slate-200/60 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timezone Results List */}
          <div className="max-h-56 overflow-y-auto divide-y divide-slate-100/80 p-1">
            {filteredTimezones.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <Globe className="h-6 w-6 mx-auto mb-1.5 text-slate-300 opacity-60" />
                <span>No timezones found matching "{search}"</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setSelectedRegion('ALL');
                  }}
                  className="mt-2 block mx-auto text-sky-600 hover:underline text-[11px] font-medium"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              filteredTimezones.map((tzItem) => {
                const isSelected = tzItem.tz === value;
                return (
                  <button
                    key={tzItem.tz}
                    type="button"
                    onClick={() => handleSelect(tzItem.tz)}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer group ${
                      isSelected
                        ? 'bg-sky-50 text-sky-900 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="truncate">{tzItem.label}</span>
                        {isSelected && <Check className="h-3 w-3 text-sky-600 shrink-0" />}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate group-hover:text-slate-500">
                        {tzItem.tz}
                      </div>
                    </div>

                    <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                      {tzItem.region}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer info */}
          <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Showing {filteredTimezones.length} of {ALL_TIMEZONES.length} world timezones</span>
            <span className="text-slate-400">Esc to close</span>
          </div>
        </div>
      )}
    </div>
  );
}
