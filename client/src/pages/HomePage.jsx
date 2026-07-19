import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/Navbar';

const PAGE_SIZE = 8;

export default function HomePage() {
  const [query, setQuery] = useState('');

  const [entries, setEntries] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, count, error } = await supabase
        .from('case_databank')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

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
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div>
      <Navbar />
      <div style={styles.container} className="page-enter">
        <h1 className="heading" style={styles.title}>Case Search</h1>
        <p style={styles.subtitle}>Search by case number, title, or party name.</p>

        <form onSubmit={(e) => e.preventDefault()} style={styles.searchRow}>
          <div style={styles.searchInputWrap}>
            <Search size={16} color="var(--muted)" style={styles.searchIcon} />
            <input
              type="text"
              placeholder="e.g. JA-22-123-2026, Ahmad bin Ali…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ paddingLeft: 40 }}
            />
          </div>
          <button type="submit" className="btn-primary">
            Search
          </button>
        </form>

        <h2 className="heading" style={styles.sectionTitle}>Case Databank</h2>

        {error && <div style={styles.errorBox}>{error}</div>}

        {!error && !loading && entries.length === 0 && (
          <div style={styles.empty}>No entries in the case databank yet.</div>
        )}

        <div style={styles.entries}>
          {entries.map((entry) => (
            <Link key={entry.id} to={`/cases/${entry.id}`} style={styles.entryLink}>
              <div className="card" style={styles.entryCard}>
                <div style={styles.issue}>{entry.issue}</div>
                <div style={styles.caseLaw}>{entry.case_law}</div>
                <div className="findings-fade" style={styles.findingsWrap}>
                  <div style={styles.findings}>{entry.findings}</div>
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
