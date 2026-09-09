import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

interface SearchableSelectProps {
  options: string[] | { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  icon?: React.ReactNode;
  required?: boolean;
  compact?: boolean;
  clearable?: boolean;
  containerStyle?: React.CSSProperties;
  className?: string;
  dropdownWidth?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'พิมพ์เพื่อค้นหา...',
  disabled = false,
  label,
  icon,
  required = false,
  compact = false,
  clearable = false,
  containerStyle,
  className = '',
  dropdownWidth
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Normalize options to a list of { value, label }
  const normalizedOptions = useMemo(() => {
    return options.map(opt => {
      if (typeof opt === 'string') {
        return { value: opt, label: opt };
      }
      return opt;
    });
  }, [options]);

  const selectedOption = useMemo(() => {
    return normalizedOptions.find(o => o.value === value);
  }, [normalizedOptions, value]);

  const filteredOptions = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return normalizedOptions;
    return normalizedOptions.filter(o => 
      o.label.toLowerCase().includes(q) || 
      o.value.toLowerCase().includes(q)
    );
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
    } else {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
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
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="form-input"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: disabled ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
          borderColor: isOpen ? 'var(--primary)' : 'var(--border)',
          opacity: disabled ? 0.65 : 1,
          padding: compact ? '0.35rem 0.65rem' : '0.65rem 0.85rem',
          height: compact ? '36px' : undefined,
          borderRadius: 'var(--radius-sm)',
          userSelect: 'none',
          fontSize: compact ? '0.825rem' : undefined
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', overflow: 'hidden', flex: 1 }}>
          {icon && <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{icon}</span>}
          <span style={{ 
            color: selectedOption && selectedOption.value !== '' ? 'var(--text-primary)' : 'var(--text-muted)', 
            fontWeight: selectedOption && selectedOption.value !== '' ? 600 : 400,
            textOverflow: 'ellipsis', 
            overflow: 'hidden', 
            whiteSpace: 'nowrap' 
          }}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
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
          maxHeight: '260px',
          overflowY: 'auto',
          zIndex: 1000,
          padding: '0.4rem',
          borderRadius: 'var(--radius-sm)',
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
                padding: '0.35rem 0.65rem 0.35rem 1.7rem',
                fontSize: '0.785rem',
                borderRadius: 'var(--radius-sm)',
                height: '30px'
              }}
              placeholder="พิมพ์เพื่อค้นหา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Options Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            {filteredOptions.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.85rem' }}>
                ❌ ไม่พบตัวเลือกที่ตรงกัน
              </div>
            ) : (
              filteredOptions.map(opt => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    style={{
                      padding: '0.4rem 0.65rem',
                      fontSize: '0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                      color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: isSelected ? 700 : 500,
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'var(--bg-tertiary)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }
                    }}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>✓</span>}
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
