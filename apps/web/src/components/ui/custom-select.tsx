'use client';

import * as React from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface CustomSelectProps {
  id?: string;
  value?: string;
  onChange: (value: string) => void;
  options: Array<string | SelectOption>;
  placeholder?: string;
  className?: string;
  error?: boolean;
  accentColor?: 'pink' | 'emerald';
  size?: 'sm' | 'md';
}

export function CustomSelect({
  id,
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  className = '',
  error = false,
  accentColor = 'pink',
  size = 'md',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollListRef = React.useRef<HTMLDivElement>(null);

  // Normalize options to { value, label }
  const normalizedOptions: SelectOption[] = React.useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'string') {
        return { value: opt, label: opt };
      }
      return opt;
    });
  }, [options]);

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Close on outside click
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Isolate scroll so wheeling inside dropdown never scrolls the main window
  React.useEffect(() => {
    const el = scrollListRef.current;
    if (!el || !isOpen) return;

    const onWheel = (e: WheelEvent) => {
      e.stopPropagation();
      const { scrollTop, scrollHeight, clientHeight } = el;
      const isScrollable = scrollHeight > clientHeight;

      if (!isScrollable) {
        e.preventDefault();
        return;
      }

      const deltaY = e.deltaY;
      const isScrollingDown = deltaY > 0;
      const isScrollingUp = deltaY < 0;

      if (isScrollingDown && scrollTop + clientHeight >= scrollHeight - 1) {
        // Prevent scroll chaining to the page at bottom
        e.preventDefault();
      } else if (isScrollingUp && scrollTop <= 0) {
        // Prevent scroll chaining to the page at top
        e.preventDefault();
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.stopPropagation();
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchmove', onTouchMove);
    };
  }, [isOpen]);

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currIndex = normalizedOptions.findIndex((opt) => opt.value === value);
        const nextIndex = currIndex < normalizedOptions.length - 1 ? currIndex + 1 : 0;
        const nextOpt = normalizedOptions[nextIndex];
        if (nextOpt) onChange(nextOpt.value);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currIndex = normalizedOptions.findIndex((opt) => opt.value === value);
        const prevIndex = currIndex > 0 ? currIndex - 1 : normalizedOptions.length - 1;
        const prevOpt = normalizedOptions[prevIndex];
        if (prevOpt) onChange(prevOpt.value);
      }
    }
  };

  const isPink = accentColor === 'pink';

  const triggerHeight = size === 'sm' ? 'py-1.5 px-3 text-xs' : 'py-2.5 sm:py-3 px-3.5 text-xs sm:text-sm';
  const ringClasses = isPink
    ? 'focus:ring-2 focus:ring-[#d9287c]/20 focus:border-[#d9287c]'
    : 'focus:ring-2 focus:ring-[#127a51]/20 focus:border-[#127a51]';

  const selectedItemStyle = isPink
    ? 'bg-pink-50/90 dark:bg-pink-950/40 text-[#d9287c] dark:text-pink-400 font-bold'
    : 'bg-[#e6f4ea] dark:bg-emerald-950/40 text-[#127a51] dark:text-emerald-400 font-bold';

  const hoverItemStyle = isPink
    ? 'hover:bg-pink-50/70 dark:hover:bg-pink-950/30 hover:text-[#d9287c] dark:hover:text-pink-400'
    : 'hover:bg-[#e6f4ea]/70 dark:hover:bg-emerald-950/30 hover:text-[#127a51] dark:hover:text-emerald-400';

  const checkColor = isPink ? 'text-[#d9287c] dark:text-pink-400' : 'text-[#127a51] dark:text-emerald-400';

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={`w-full rounded-xl bg-white dark:bg-neutral-900 border text-left flex items-center justify-between gap-2 text-neutral-900 dark:text-white transition-all shadow-2xs cursor-pointer ${triggerHeight} ${ringClasses} ${
          error
            ? 'border-rose-500'
            : isOpen
            ? isPink
              ? 'border-[#d9287c] ring-2 ring-[#d9287c]/20'
              : 'border-[#127a51] ring-2 ring-[#127a51]/20'
            : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
        } ${className}`}
      >
        <span
          className={`truncate ${
            selectedOption ? 'font-medium text-neutral-900 dark:text-white' : 'text-neutral-400'
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <ChevronDown
          className={`w-4 h-4 text-neutral-400 dark:text-neutral-500 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-neutral-700 dark:text-neutral-300' : ''
          }`}
        />
      </button>

      {/* Floating Menu Popover */}
      {isOpen && (
        <div
          role="listbox"
          data-lenis-prevent="true"
          className="absolute z-50 left-0 right-0 mt-1.5 w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-xl shadow-neutral-900/10 dark:shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          <div
            ref={scrollListRef}
            data-lenis-prevent="true"
            className="p-1.5 max-h-64 overflow-y-auto space-y-0.5 overscroll-contain [scrollbar-width:thin]"
          >
            {placeholder && (
              <div
                role="option"
                aria-selected={!value}
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 rounded-xl text-xs sm:text-[13px] flex items-center justify-between text-neutral-400 dark:text-neutral-500 cursor-pointer transition-colors ${
                  !value ? 'bg-neutral-100/70 dark:bg-neutral-800/70 font-semibold' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                }`}
              >
                <span>{placeholder}</span>
                {!value && <Check className="w-3.5 h-3.5 text-neutral-500 shrink-0" />}
              </div>
            )}

            {normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-[13px] flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? selectedItemStyle
                      : `text-neutral-700 dark:text-neutral-200 ${hoverItemStyle}`
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className={`w-3.5 h-3.5 ${checkColor} shrink-0 ml-2`} />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
