import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ChevronDown } from 'lucide-react';

interface SearchableSelectProps {
  options: string[] | { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  icon?: React.ReactNode;
  required?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'พิมพ์เพื่อค้นหา...',
  disabled = false,
  label,
  icon,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Sync search input when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className="form-group" style={{ position: 'relative' }} ref={containerRef}>
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
          padding: '0.65rem 0.85rem',
          borderRadius: 'var(--radius-sm)',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden', flex: 1 }}>
          {icon && <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{icon}</span>}
          <span style={{ 
            color: selectedOption ? 'var(--text-primary)' : 'var(--text-muted)', 
            fontWeight: selectedOption ? 600 : 400,
            textOverflow: 'ellipsis', 
            overflow: 'hidden', 
            whiteSpace: 'nowrap' 
          }}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown size={15} color="var(--text-muted)" style={{ flexShrink: 0, marginLeft: '0.5rem', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </div>

      {/* Dropdown Options List */}
      {isOpen && (
        <div className="glass-panel" style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '0.4rem',
          maxHeight: '260px',
          overflowY: 'auto',
          zIndex: 1000,
          padding: '0.5rem',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          background: 'var(--bg-secondary)'
        }}>
          {/* Search bar inside dropdown */}
          <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{
                width: '100%',
                padding: '0.4rem 0.75rem 0.4rem 1.8rem',
                fontSize: '0.8rem',
                borderRadius: 'var(--radius-sm)'
              }}
              placeholder="พิมพ์เพื่อกรองตัวเลือก..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>

          {/* Options Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            {filteredOptions.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
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
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.825rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                      color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: isSelected ? 700 : 500,
                      transition: 'all 0.15s ease'
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
                    {opt.label}
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
