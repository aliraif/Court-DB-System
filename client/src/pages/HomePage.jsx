import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/Navbar';

const PAGE_SIZE = 8;

const FILTERS = [
  { value: 'general', label: 'General' },
  { value: 'issue', label: 'By Issues' },
  { value: 'case_law', label: 'By Case Law' },
  { value: 'findings', label: 'By Findings' },
];

function highlight(text, term) {
  if (!term) return text;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === term.toLowerCase() ? (
      <mark key={i} style={styles.highlight}>{part}</mark>
    ) : (
      part
    )
  );
}

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filterType, setFilterType] = useState('general');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef(null);

  const [entries, setEntries] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reset to page 1 whenever the active search changes. Computed during
  // render (React's recommended pattern for this) rather than in an
  // effect, so it doesn't cost an extra render pass.
  const searchKey = `${filterType}:${debouncedQuery}`;
  const [lastSearchKey, setLastSearchKey] = useState(searchKey);
  if (searchKey !== lastSearchKey) {
    setLastSearchKey(searchKey);
    setPage(1);
  }

  useEffect(() => {
    const onClickOutside = (e) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target)) {
        setFilterMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Debounce keystrokes so we don't fire a query on every character.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let request = supabase
        .from('case_databank')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (debouncedQuery) {
        if (filterType === 'general') {
          const safeTerm = debouncedQuery.replace(/[,()]/g, ' ').trim();
          request = request.or(
            `issue.ilike.%${safeTerm}%,case_law.ilike.%${safeTerm}%,findings.ilike.%${safeTerm}%`
          );
        } else {
          request = request.ilike(filterType, `%${debouncedQuery}%`);
        }
      }

      const { data, count, error } = await request.range(from, to);

      if (cancelled) return;
      setLoading(false);
      if (error) {
        setError(error.message);
        setEntries([]);
      } else {
        setEntries(data ?? []);
        setTotalCount(count ?? 0);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, debouncedQuery, filterType]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const selectFilter = (value) => {
    setFilterType(value);
    setFilterMenuOpen(false);
  };

  const currentFilterLabel = FILTERS.find((f) => f.value === filterType)?.label;
  const highlightTerm = debouncedQuery;

  return (
    <div>
      <Navbar />
      <div style={styles.container} className="page-enter">
        <h1 className="heading" style={styles.title}>Case Databank</h1>
        <p style={styles.subtitle}>Search issues, case law, and findings.</p>

        <form onSubmit={(e) => e.preventDefault()} style={styles.searchRow}>
          <div style={styles.filterWrap} ref={filterMenuRef}>
            <button
              type="button"
              style={styles.filterBtn}
              onClick={() => setFilterMenuOpen((o) => !o)}
            >
              <SlidersHorizontal size={15} />
              <span>{currentFilterLabel}</span>
              <ChevronDown size={14} />
            </button>
            {filterMenuOpen && (
              <div style={styles.filterMenu}>
                {FILTERS.map((f) => (
                  <button
                    type="button"
                    key={f.value}
                    style={{
                      ...styles.filterOption,
                      ...(f.value === filterType ? styles.filterOptionActive : {}),
                    }}
                    onClick={() => selectFilter(f.value)}
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
              placeholder="Search the case databank…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ paddingLeft: 40 }}
            />
          </div>
        </form>

        {error && <div style={styles.errorBox}>{error}</div>}

        {!error && !loading && entries.length === 0 && (
          <div style={styles.empty}>
            {debouncedQuery ? `No entries matched "${debouncedQuery}".` : 'No entries in the case databank yet.'}
          </div>
        )}

        <div style={styles.entries}>
          {entries.map((entry) => (
            <Link key={entry.id} to={`/cases/${entry.id}`} style={styles.entryLink}>
              <div className="card" style={styles.entryCard}>
                <div style={styles.issue}>{highlight(entry.issue, highlightTerm)}</div>
                <div style={styles.caseLaw}>{highlight(entry.case_law, highlightTerm)}</div>
                <div className="findings-fade" style={styles.findingsWrap}>
                  <div style={styles.findings}>{highlight(entry.findings, highlightTerm)}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              type="button"
              style={styles.pageBtn}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={styles.pageLabel}>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              style={styles.pageBtn}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 800,
    margin: '0 auto',
    padding: '40px 24px',
  },
  title: {
    fontSize: 32,
    marginBottom: 4,
  },
  subtitle: {
    color: 'var(--muted)',
    fontSize: 14,
    marginBottom: 28,
  },
  searchRow: {
    display: 'flex',
    gap: 12,
    marginBottom: 40,
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
  sectionTitle: {
    fontSize: 24,
    marginBottom: 20,
  },
  errorBox: {
    background: 'rgba(179,57,42,0.12)',
    border: '1px solid rgba(179,57,42,0.3)',
    borderRadius: 6,
    padding: '12px 16px',
    marginBottom: 20,
    color: 'var(--red)',
    fontSize: 13,
  },
  empty: {
    color: 'var(--muted)',
    fontSize: 14,
    padding: '20px 0',
  },
  entries: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  entryLink: {
    textDecoration: 'none',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  entryCard: {
    padding: 24,
    cursor: 'pointer',
  },
  issue: {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    fontSize: 26,
    color: 'var(--accent)',
    marginBottom: 6,
  },
  caseLaw: {
    fontSize: 15,
    fontWeight: 500,
    color: 'var(--text)',
    marginBottom: 12,
  },
  findingsWrap: {
    position: 'relative',
    maxHeight: '4.6em',
    overflow: 'hidden',
  },
  findings: {
    fontSize: 13,
    color: 'var(--muted)',
    lineHeight: 1.5,
  },
  highlight: {
    background: '#fce94f',
    color: '#1a1a1a',
    borderRadius: 2,
    padding: '0 1px',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 32,
  },
  pageBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    borderRadius: 8,
    width: 34,
    height: 34,
  },
  pageLabel: {
    fontSize: 13,
    color: 'var(--muted)',
  },
};
