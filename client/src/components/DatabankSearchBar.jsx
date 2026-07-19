import { useEffect, useRef, useState } from 'react';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { DATABANK_FILTERS } from '../lib/databankFilters';

export default function DatabankSearchBar({ query, onQueryChange, filterType, onFilterChange, placeholder }) {
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target)) {
        setFilterMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const currentFilterLabel = DATABANK_FILTERS.find((f) => f.value === filterType)?.label;

  return (
    <form onSubmit={(e) => e.preventDefault()} style={styles.searchRow}>
      <div style={styles.filterWrap} ref={filterMenuRef}>
        <button type="button" style={styles.filterBtn} onClick={() => setFilterMenuOpen((o) => !o)}>
          <SlidersHorizontal size={15} />
          <span>{currentFilterLabel}</span>
          <ChevronDown size={14} />
        </button>
        {filterMenuOpen && (
          <div style={styles.filterMenu}>
            {DATABANK_FILTERS.map((f) => (
              <button
                type="button"
                key={f.value}
                style={{
                  ...styles.filterOption,
                  ...(f.value === filterType ? styles.filterOptionActive : {}),
                }}
                onClick={() => {
                  onFilterChange(f.value);
                  setFilterMenuOpen(false);
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={styles.searchInputWrap}>
        <Search size={16} color="var(--muted)" style={styles.searchIcon} />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          style={{ paddingLeft: 40 }}
        />
      </div>
    </form>
  );
}

const styles = {
  searchRow: {
    display: 'flex',
    gap: 12,
    marginBottom: 24,
  },
  filterWrap: {
    position: 'relative',
  },
  filterBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: '100%',
    background: 'var(--card2)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    borderRadius: 8,
    padding: '0 14px',
    fontSize: 13,
    whiteSpace: 'nowrap',
  },
  filterMenu: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    background: 'var(--card2)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: 6,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    zIndex: 20,
    minWidth: 160,
    boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
  },
  filterOption: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text)',
    textAlign: 'left',
    padding: '8px 10px',
    borderRadius: 6,
    fontSize: 13,
  },
  filterOptionActive: {
    background: 'var(--accent)',
    color: '#0e1420',
    fontWeight: 600,
  },
  searchInputWrap: {
    position: 'relative',
    flex: 1,
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
  },
};
