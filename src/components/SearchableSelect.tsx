import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ChevronDown, X, Plus } from 'lucide-react';

export interface SearchableOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
}

export interface SearchableSelectProps {
  options: string[] | SearchableOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  label?: string;
  icon?: React.ReactNode;
  required?: boolean;
  compact?: boolean;
  clearable?: boolean;
  allowCustom?: boolean;
  containerStyle?: React.CSSProperties;
  triggerStyle?: React.CSSProperties;
  className?: string;
  dropdownWidth?: string;
  autoFocusSearch?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'พิมพ์เพื่อค้นหาหรือเลือก...',
  searchPlaceholder,
  disabled = false,
  label,
  icon,
  required = false,
  compact = false,
  clearable = false,
  allowCustom = true,
  containerStyle,
  triggerStyle,
  className = '',
  dropdownWidth,
  autoFocusSearch = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Normalize options to a list of SearchableOption
  const normalizedOptions = useMemo<SearchableOption[]>(() => {
    return options.map(opt => {
      if (typeof opt === 'string') {
        return { value: opt, label: opt };
      }
      return opt;
    });
  }, [options]);

  const selectedOption = useMemo(() => {
    const found = normalizedOptions.find(o => o.value === value);
    if (found) return found;
    if (value && value.trim()) {
      return { value, label: value };
    }
    return null;
  }, [normalizedOptions, value]);

  const filteredOptions = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return normalizedOptions;
    return normalizedOptions.filter(o => 
      o.label.toLowerCase().includes(q) || 
      o.value.toLowerCase().includes(q) ||
      (o.sublabel && o.sublabel.toLowerCase().includes(q)) ||
      (o.badge && o.badge.toLowerCase().includes(q))
    );
  }, [normalizedOptions, searchTerm]);

  const hasExactMatch = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return normalizedOptions.some(o => o.value.toLowerCase() === q || o.label.toLowerCase() === q);
  }, [normalizedOptions, searchTerm]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync search input when dropdown closes or opens
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(0);
      if (autoFocusSearch) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
      }
    }
  }, [isOpen, autoFocusSearch]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm]);

  const safeHighlightedIndex = Math.min(
    Math.max(0, highlightedIndex),
    Math.max(0, filteredOptions.length - 1)
  );

  useEffect(() => {
    if (isOpen && listRef.current && listRef.current.children[safeHighlightedIndex]) {
      const activeEl = listRef.current.children[safeHighlightedIndex] as HTMLElement;
      if (activeEl && typeof activeEl.scrollIntoView === 'function') {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [safeHighlightedIndex, isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (filteredOptions.length > 0 ? (prev + 1) % filteredOptions.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (filteredOptions.length > 0 ? (prev - 1 + filteredOptions.length) % filteredOptions.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions.length > 0 && safeHighlightedIndex < filteredOptions.length) {
        handleSelect(filteredOptions[safeHighlightedIndex].value);
      } else if (allowCustom && searchTerm.trim()) {
        handleSelect(searchTerm.trim());
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  return (
    <div 
      className={`searchable-select-container ${compact ? '' : 'form-group'} ${className}`} 
      style={{ position: 'relative', marginBottom: compact ? 0 : undefined, ...containerStyle }} 
      ref={containerRef}
    >
      {label && (
        <label className="form-label" style={{ display: 'block', marginBottom: '0.35rem' }}>
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}

      {/* Trigger Box */}
      <div
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        className="form-input"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: disabled ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
          borderColor: isOpen ? 'var(--primary)' : 'var(--border)',
          boxShadow: isOpen ? '0 0 0 4px rgba(79, 70, 229, 0.12)' : undefined,
          opacity: disabled ? 0.65 : 1,
          padding: compact ? '0.35rem 0.65rem' : '0.65rem 0.85rem',
          height: compact ? '36px' : undefined,
          borderRadius: 'var(--radius-md)',
          userSelect: 'none',
          fontSize: compact ? '0.825rem' : undefined,
          outline: 'none',
          ...triggerStyle
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', overflow: 'hidden', flex: 1, minWidth: 0 }}>
          {icon && <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{icon}</span>}
          <div style={{ 
            color: selectedOption && selectedOption.value !== '' ? 'var(--text-primary)' : 'var(--text-muted)', 
            fontWeight: selectedOption && selectedOption.value !== '' ? 600 : 400,
            textOverflow: 'ellipsis', 
            overflow: 'hidden', 
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            minWidth: 0,
            flex: 1
          }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedOption && selectedOption.value !== '' ? selectedOption.label : placeholder}
            </span>
            {selectedOption && selectedOption.value !== '' && selectedOption.sublabel && (
              <span style={{ 
                fontSize: '0.78rem', 
                color: 'var(--text-muted)', 
                fontWeight: 400,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flexShrink: 1
              }}>
                — {selectedOption.sublabel}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0, marginLeft: '0.35rem' }}>
          {clearable && value && !disabled && (
            <span
              onClick={handleClear}
              title="ล้างค่าที่เลือก"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.15rem',
                borderRadius: '50%',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--danger)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <X size={13} />
            </span>
          )}
          <ChevronDown 
            size={14} 
            color="var(--text-muted)" 
            style={{ 
              transition: 'transform 0.2s', 
              transform: isOpen ? 'rotate(180deg)' : 'none' 
            }} 
          />
        </div>
      </div>

      {/* Dropdown Options List */}
      {isOpen && (
        <div className="glass-panel" style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: dropdownWidth ? undefined : 0,
          width: dropdownWidth || '100%',
          minWidth: '220px',
          marginTop: '0.35rem',
          maxHeight: '280px',
          overflowY: 'auto',
          zIndex: 1000,
          padding: '0.4rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          background: 'var(--bg-secondary)'
        }}>
          {/* Search bar inside dropdown */}
          <div style={{ position: 'relative', marginBottom: '0.4rem' }}>
            <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              ref={inputRef}
              type="text"
              className="form-input"
              style={{
                width: '100%',
                padding: '0.35rem 1.6rem 0.35rem 1.7rem',
                fontSize: '0.8rem',
                borderRadius: 'var(--radius-sm)',
                height: '32px'
              }}
              placeholder={searchPlaceholder || (allowCustom ? "พิมพ์เพื่อค้นหา หรือพิมพ์ชื่อใหม่..." : "พิมพ์เพื่อค้นหา...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
            />
            {searchTerm && (
              <span 
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchTerm('');
                  inputRef.current?.focus();
                }}
                title="ล้างข้อความค้นหา"
                style={{
                  position: 'absolute',
                  right: '0.55rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px'
                }}
              >
                <X size={12} />
              </span>
            )}
          </div>

          {/* Custom entry button if user typed something not matching existing options */}
          {allowCustom && searchTerm.trim() && !hasExactMatch && (
            <div
              onClick={() => handleSelect(searchTerm.trim())}
              style={{
                padding: '0.45rem 0.65rem',
                fontSize: '0.8rem',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                background: 'rgba(59, 130, 246, 0.12)',
                color: 'var(--primary)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                border: '1px dashed var(--primary)',
                marginBottom: '0.35rem',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.12)';
              }}
            >
              <Plus size={14} />
              <span>ใช้ค่าที่พิมพ์: &quot;<strong>{searchTerm.trim()}</strong>&quot;</span>
            </div>
          )}

          {/* Options List */}
          <div ref={listRef} style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            {filteredOptions.length === 0 && (!allowCustom || !searchTerm.trim()) ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.85rem' }}>
                ❌ ไม่พบตัวเลือกที่ตรงกัน
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = opt.value === value;
                const isHighlighted = idx === safeHighlightedIndex;
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    style={{
                      padding: opt.sublabel ? '0.45rem 0.65rem' : '0.4rem 0.65rem',
                      fontSize: '0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      background: isSelected 
                        ? 'rgba(59, 130, 246, 0.15)' 
                        : isHighlighted 
                          ? 'var(--bg-tertiary)' 
                          : 'transparent',
                      color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: isSelected ? 700 : 500,
                      transition: 'all 0.1s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', overflow: 'hidden', flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflow: 'hidden' }}>
                        <span style={{ 
                          textOverflow: 'ellipsis', 
                          overflow: 'hidden', 
                          whiteSpace: 'nowrap',
                          fontWeight: isSelected ? 700 : 600,
                          color: isSelected ? 'var(--primary)' : 'var(--text-primary)'
                        }}>
                          {opt.label}
                        </span>
                        {opt.badge && (
                          <span style={{ 
                            fontSize: '0.68rem', 
                            padding: '0.1rem 0.35rem', 
                            borderRadius: 'var(--radius-sm)', 
                            background: 'rgba(239, 68, 68, 0.15)', 
                            color: 'var(--danger)',
                            fontWeight: 600,
                            flexShrink: 0
                          }}>
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {opt.sublabel && (
                        <span style={{ 
                          fontSize: '0.72rem', 
                          color: 'var(--text-muted)', 
                          textOverflow: 'ellipsis', 
                          overflow: 'hidden', 
                          whiteSpace: 'nowrap' 
                        }}>
                          {opt.sublabel}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary)', flexShrink: 0, fontWeight: 700 }}>
                        ✓
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
