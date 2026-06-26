// =============================================================================
// File: src/components/ui/SearchableSelect.tsx
// Description: Modern Searchable Select with Inline Search (Combobox Style)
// =============================================================================

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/tailwindcss';

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

interface SearchableSelectProps {
  options: string[] | Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  theme?: 'primary' | 'gray' | 'success' | 'danger';
  disabled?: boolean;
  className?: string;
  label?: string;
  icon?: React.ReactNode;
  prefixIcon?: React.ReactNode;
  error?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  maxHeight?: number;
  size?: 'sm' | 'md' | 'lg';
  clearable?: boolean;
  usePortal?: boolean;
  showBackdrop?: boolean;
  dropdownTitle?: string;
  loading?: boolean;
  /** เปิดให้พิมพ์ค้นหาได้ในช่อง input โดยตรง */
  typeToSearch?: boolean;
}

// ============================================
// Dropdown Portal Component
// ============================================
interface DropdownPortalProps {
  children: React.ReactNode;
  targetRef: React.RefObject<HTMLElement | null>;
  inputRef: React.RefObject<HTMLElement | null>;
  isOpen: boolean;
  openUp: boolean;
  maxHeight: number;
  showBackdrop?: boolean;
  onBackdropClick?: () => void;
  floatingInput?: React.ReactNode;
}

const DropdownPortal: React.FC<DropdownPortalProps> = ({
  children,
  targetRef,
  inputRef,
  isOpen,
  openUp,
  maxHeight,
  showBackdrop = false,
  onBackdropClick,
  floatingInput,
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const [inputPosition, setInputPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });

  useEffect(() => {
    if (!isOpen || !targetRef.current) return;

    const updatePosition = () => {
      const rect = targetRef.current?.getBoundingClientRect();
      if (!rect) return;

      setPosition({
        top: openUp ? rect.top - maxHeight - 8 : rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });

      // Update input position for floating input
      if (inputRef.current && showBackdrop) {
        const inputRect = inputRef.current.getBoundingClientRect();
        setInputPosition({
          top: inputRect.top,
          left: inputRect.left,
          width: inputRect.width,
          height: inputRect.height,
        });
      }
    };

    updatePosition();

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, targetRef, inputRef, openUp, maxHeight, showBackdrop]);

  if (!isOpen || typeof window === 'undefined') return null;

  return createPortal(
    <>
      {/* Backdrop */}
      {showBackdrop && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-[9998] animate-in fade-in-0 duration-200"
            aria-hidden="true"
            onClick={onBackdropClick}
          />
        </>
      )}

      {/* Floating Input (above backdrop) */}
      {showBackdrop && floatingInput && (
        <div
          style={{
            position: 'fixed',
            top: inputPosition.top,
            left: inputPosition.left,
            width: inputPosition.width,
            height: inputPosition.height,
            zIndex: 9999,
          }}
        >
          {floatingInput}
        </div>
      )}

      {/* Dropdown */}
      <div
        style={{
          position: 'fixed',
          top: position.top,
          left: position.left,
          width: position.width,
          zIndex: 9999,
        }}
      >
        {children}
      </div>
    </>,
    document.body
  );
};

// ============================================
// Highlight Text Component
// ============================================
const HighlightText: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  if (!query) return <>{text}</>;

  const parts = text.split(new RegExp(`(${query})`, 'gi'));

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            className="bg-brand-100 text-brand-700 rounded px-0.5"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

// ============================================
// Main SearchableSelect Component
// ============================================
const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'เลือก...',
  theme: colorTheme = 'primary',
  disabled = false,
  className = '',
  label,
  icon,
  prefixIcon,
  error,
  searchable = false,
  searchPlaceholder = 'พิมพ์เพื่อค้นหา...',
  maxHeight = 320,
  size = 'md',
  clearable = false,
  usePortal = true,
  showBackdrop = false,
  dropdownTitle,
  loading = false,
  typeToSearch = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isTyping, setIsTyping] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const floatingInputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Normalize options
  const normalizedOptions: Option[] = options.map((option, index) =>
    typeof option === 'string'
      ? { value: option, label: option }
      : { ...option, value: option.value || `option-${index}` }
  );

  // Filter options
  const filteredOptions = searchQuery
    ? normalizedOptions.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opt.value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : normalizedOptions;

  const currentOption = normalizedOptions.find((o) => o.value === value);
  const displayValue = currentOption?.label || '';

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (usePortal) {
        const portalDropdown = document.querySelector('[data-select-dropdown]');
        const isOutsideContainer = containerRef.current && !containerRef.current.contains(target);
        const isOutsidePortal = !portalDropdown?.contains(target);

        if (isOutsideContainer && isOutsidePortal) {
          closeDropdown();
        }
      } else if (containerRef.current && !containerRef.current.contains(target)) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [usePortal]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
            handleSelect(filteredOptions[highlightedIndex].value);
          }
          break;
        case 'Escape':
          e.preventDefault();
          closeDropdown();
          break;
        case 'Tab':
          closeDropdown();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, filteredOptions]);

  // Reset highlighted on search
  useEffect(() => {
    if (searchQuery) {
      setHighlightedIndex(filteredOptions.length > 0 ? 0 : -1);
    } else {
      const currentIndex = filteredOptions.findIndex((o) => o.value === value);
      setHighlightedIndex(currentIndex);
    }
  }, [searchQuery, filteredOptions, value]);

  // Scroll highlighted into view
  useEffect(() => {
    if (highlightedIndex >= 0 && optionsRef.current) {
      const option = optionsRef.current.children[highlightedIndex] as HTMLElement;
      option?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && typeToSearch) {
      // Small delay to ensure portal is rendered
      setTimeout(() => {
        if (showBackdrop && floatingInputRef.current) {
          floatingInputRef.current.focus();
        } else if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    }
  }, [isOpen, typeToSearch, showBackdrop]);

  // Calculate dropdown direction
  const calculateDirection = useCallback(() => {
    if (!containerRef.current) return false;
    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    return spaceBelow < maxHeight + 20 && spaceAbove > maxHeight + 20;
  }, [maxHeight]);

  const openDropdown = () => {
    if (disabled || loading) return;
    setOpenUp(calculateDirection());
    setIsOpen(true);
    setIsTyping(false);
    const currentIndex = normalizedOptions.findIndex((o) => o.value === value);
    setHighlightedIndex(currentIndex);
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setSearchQuery('');
    setIsTyping(false);
    setHighlightedIndex(-1);
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    closeDropdown();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchQuery('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setIsTyping(val.length > 0);
    if (!isOpen) {
      openDropdown();
    }
  };

  const handleInputFocus = () => {
    if (!isOpen) {
      openDropdown();
    }
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      openDropdown();
    }
  };

  // Theme styles (Aligned with project brand)
  const themeStyles = {
    primary: {
      ring: 'ring-brand-400/20',
      border: 'border-brand-500',
      selected: 'bg-brand-50 text-brand-700 font-bold',
      hover: 'hover:bg-slate-50',
      highlighted: 'bg-slate-50',
      check: 'text-brand-600',
      indicator: 'bg-brand-500',
    },
    gray: {
      ring: 'ring-slate-400/20',
      border: 'border-slate-400',
      selected: 'bg-slate-100 text-slate-900 font-bold',
      hover: 'hover:bg-slate-50',
      highlighted: 'bg-slate-50',
      check: 'text-slate-600',
      indicator: 'bg-slate-400',
    },
    success: {
      ring: 'ring-emerald-500/20',
      border: 'border-emerald-500',
      selected: 'bg-emerald-50 text-emerald-700 font-bold',
      hover: 'hover:bg-emerald-50/50',
      highlighted: 'bg-emerald-50/30',
      check: 'text-emerald-500',
      indicator: 'bg-emerald-500',
    },
    danger: {
      ring: 'ring-rose-500/20',
      border: 'border-rose-500',
      selected: 'bg-rose-50 text-rose-700 font-bold',
      hover: 'hover:bg-rose-50/50',
      highlighted: 'bg-rose-50/30',
      check: 'text-rose-500',
      indicator: 'bg-rose-500',
    },
  };

  const colors = themeStyles[colorTheme];

  // Size classes
  const sizeClasses = {
    sm: {
      container: 'h-9',
      input: 'text-xs',
      option: 'px-3 py-2 text-sm',
      icon: 14,
    },
    md: {
      container: 'h-11',
      input: 'text-sm',
      option: 'px-4 py-2.5 text-sm',
      icon: 16,
    },
    lg: {
      container: 'h-12',
      input: 'text-base',
      option: 'px-4 py-3 text-base',
      icon: 18,
    },
  };

  const sizes = sizeClasses[size];

  // Calculate header height for maxHeight
  const headerHeight = dropdownTitle || label ? 52 : 0;
  const searchHeight = searchable && !typeToSearch ? 56 : 0;
  const footerHeight = filteredOptions.length > 5 ? 40 : 0;
  const optionsMaxHeight = maxHeight - headerHeight - searchHeight - footerHeight;

  // Dropdown content
  const dropdownContent = (
    <div
      data-select-dropdown
      className="
        w-full overflow-hidden
        bg-white
        border border-slate-100
        rounded-2xl
        shadow-2xl shadow-slate-900/10
        ring-1 ring-black/5
        animate-in fade-in-0 zoom-in-95 slide-in-from-top-2
        duration-200
      "
    >
      {/* Header */}
      {(dropdownTitle || label) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50 bg-slate-50/30">
          <div className="flex items-center gap-2">
            <div className={`size-2 rounded-full ${colors.indicator}`} />
            <span className="font-display font-bold text-xs text-slate-500 uppercase tracking-wider">
              {dropdownTitle || label}
            </span>
            {filteredOptions.length > 0 && (
              <span className="text-[10px] font-black text-brand-600/60 tabular-nums">
                ({filteredOptions.length})
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={closeDropdown}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Separate Search (when typeToSearch is false) */}
      {searchable && !typeToSearch && (
        <div className="p-2 border-b border-slate-50">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="
                w-full h-9 pl-9 pr-3
                text-sm
                bg-slate-50/50
                border border-slate-100
                rounded-xl
                placeholder:text-slate-400
                focus:outline-none focus:ring-2 focus:ring-brand-400/20 focus:border-brand-500
                transition-colors font-medium
              "
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Options */}
      <div ref={optionsRef} className="overflow-y-auto overscroll-contain custom-scrollbar" style={{ maxHeight: optionsMaxHeight }}>
        {loading ? (
          <div className="px-4 py-8 text-center">
            <Loader2 className="size-6 text-brand-600 animate-spin mx-auto mb-2" />
            <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">กำลังโหลด...</div>
          </div>
        ) : filteredOptions.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="text-slate-400 text-sm">
              {searchQuery ? (
                <div className="space-y-2">
                  <Search size={28} className="mx-auto opacity-20" />
                  <div className="font-medium">
                    ไม่พบ "<span className="font-bold text-slate-900">{searchQuery}</span>"
                  </div>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs font-black text-brand-600 hover:underline uppercase tracking-tighter"
                  >
                    ล้างการค้นหา
                  </button>
                </div>
              ) : (
                'ไม่มีตัวเลือก'
              )}
            </div>
          </div>
        ) : (
          <div className="py-1">
            {filteredOptions.map((option, index) => {
              const isSelected = value === option.value;
              const isHighlighted = highlightedIndex === index;

              return (
                <button
                  key={`${option.value}-${index}`}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`
                    relative w-full text-left transition-all duration-100
                    flex items-center gap-3
                    ${sizes.option}
                    ${option.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                    ${isSelected ? colors.selected : 'text-slate-700 font-medium'}
                    ${isHighlighted && !isSelected ? colors.highlighted : ''}
                    ${!isHighlighted && !isSelected ? colors.hover : ''}
                  `}
                >
                  {/* Selected indicator bar */}
                  {isSelected && (
                    <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full ${colors.indicator}`} />
                  )}

                  {/* Icon */}
                  {option.icon && (
                    <span className="shrink-0 text-slate-400">
                      {option.icon}
                    </span>
                  )}

                  {/* Label & Description */}
                  <span className="flex-1 min-w-0">
                    <span className={`block truncate ${isSelected ? 'font-bold' : ''}`}>
                      {/* Highlight matching text */}
                      {searchQuery ? <HighlightText text={option.label} query={searchQuery} /> : option.label}
                    </span>
                    {option.description && (
                      <span className="block text-[10px] text-slate-400 font-bold truncate mt-0.5">
                        {option.description}
                      </span>
                    )}
                  </span>

                  {/* Check icon */}
                  {isSelected && (
                    <span className={`shrink-0 ${colors.check}`}>
                      <Check size={sizes.icon} strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer hint */}
      {filteredOptions.length > 5 && (
        <div className="px-3 py-2 border-t border-slate-50 bg-slate-50/20">
          <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest">
            ↑↓ เลื่อน • Enter เลือก • Esc ปิด
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className={cn(`space-y-1.5 relative ${isOpen && showBackdrop ? 'z-9999' : ''}`, className)} ref={containerRef}>
      {/* Label */}
      {label && (
        <label className="text-xs font-display font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 pl-1">
          {icon && <span>{icon}</span>}
          {label}
        </label>
      )}

      {/* Input Container */}
      <div
        ref={inputContainerRef}
        onClick={openDropdown}
        className={`
          group relative w-full rounded-xl
          flex items-center gap-2 px-4
          ${sizes.container}
          border transition-all duration-200 cursor-pointer
          ${isOpen && showBackdrop ? 'invisible' : ''}
          ${disabled || loading ? 'opacity-50 cursor-not-allowed bg-slate-50/50' : ''}
          ${error
            ? 'border-rose-300 bg-rose-50/30'
            : isOpen
              ? `ring-2 ${colors.ring} ${colors.border} bg-white shadow-lg`
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
          }
        `}
      >
        {/* Prefix Icon / Search Icon */}
        {typeToSearch && isTyping ? (
          <Search size={16} className="shrink-0 text-slate-400" />
        ) : prefixIcon ? (
          <div className="shrink-0 text-slate-400">
            {prefixIcon}
          </div>
        ) : null}

        {/* Input Field */}
        {typeToSearch ? (
          <input
            ref={inputRef}
            type="text"
            value={isTyping || isOpen ? searchQuery : displayValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onClick={handleInputClick}
            placeholder={isOpen ? searchPlaceholder : placeholder}
            disabled={disabled || loading}
            className={`
              flex-1 min-w-0 bg-transparent outline-none
              ${sizes.input}
              ${displayValue && !isTyping && !isOpen
                ? 'text-slate-900 font-bold'
                : 'text-slate-900 font-medium placeholder:text-slate-400'
              }
              ${disabled || loading ? 'cursor-not-allowed' : 'cursor-text'}
            `}
            autoComplete="off"
            spellCheck={false}
          />
        ) : (
          <span className={`flex-1 truncate ${sizes.input} ${displayValue ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
            {displayValue || placeholder}
          </span>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Loading */}
          {loading && (
            <Loader2 size={16} className="text-slate-400 animate-spin" />
          )}

          {/* Clear button */}
          {clearable && value && !disabled && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <X size={14} />
            </button>
          )}

          {/* Chevron */}
          {!loading && (
            <span className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-600' : ''}`}>
              <ChevronDown size={sizes.icon} />
            </span>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1 font-bold">
          <span className="size-1 rounded-full bg-rose-500" />
          {error}
        </p>
      )}

      {/* Dropdown */}
      {usePortal ? (
        <DropdownPortal
          targetRef={containerRef}
          inputRef={inputContainerRef}
          isOpen={isOpen}
          openUp={openUp}
          maxHeight={maxHeight}
          showBackdrop={showBackdrop}
          onBackdropClick={closeDropdown}
          floatingInput={
            <div
              className={`
                w-full rounded-xl
                flex items-center gap-2 px-4
                ${sizes.container}
                border transition-all duration-200
                ring-2 ${colors.ring} ${colors.border} 
                bg-white shadow-xl
              `}
            >
              {/* Prefix Icon / Search Icon */}
              {typeToSearch && isTyping ? (
                <Search size={16} className="shrink-0 text-slate-400" />
              ) : prefixIcon ? (
                <div className="shrink-0 text-slate-400">
                  {prefixIcon}
                </div>
              ) : null}

              {/* Input Field */}
              {typeToSearch ? (
                <input
                  ref={floatingInputRef}
                  type="text"
                  value={isTyping || isOpen ? searchQuery : displayValue}
                  onChange={handleInputChange}
                  onClick={handleInputClick}
                  placeholder={isOpen ? searchPlaceholder : placeholder}
                  disabled={disabled || loading}
                  className={`
                    flex-1 min-w-0 bg-transparent outline-none
                    ${sizes.input}
                    text-slate-900 font-bold
                    placeholder:text-slate-400
                  `}
                  autoComplete="off"
                  spellCheck={false}
                />
              ) : (
                <span
                  className={`
                    flex-1 truncate ${sizes.input}
                    ${displayValue ? 'text-slate-900 font-bold' : 'text-slate-400'}
                  `}
                >
                  {displayValue || placeholder}
                </span>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {loading && (
                  <Loader2 size={16} className="text-slate-400 animate-spin" />
                )}
                {clearable && value && !disabled && !loading && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
                {!loading && (
                  <span className="text-brand-600 rotate-180">
                    <ChevronDown size={sizes.icon} />
                  </span>
                )}
              </div>
            </div>
          }
        >
          {dropdownContent}
        </DropdownPortal>
      ) : (
        isOpen && (
          <div className={`absolute z-50 w-full ${openUp ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
            {dropdownContent}
          </div>
        )
      )}
    </div>
  );
};

export default SearchableSelect;
