import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useDatabankSearch } from '../lib/useDatabankSearch';
import { highlight } from '../lib/highlight';
import Navbar from '../components/Navbar';
import DatabankSearchBar from '../components/DatabankSearchBar';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 8;

export default function HomePage() {
  const {
    query,
    setQuery,
    filterType,
    setFilterType,
    debouncedQuery,
    entries,
    page,
    setPage,
    totalPages,
    loading,
    error,
  } = useDatabankSearch(PAGE_SIZE);

  const [suggestions, setSuggestions] = useState([]);

  // Clear stale suggestions as soon as the search changes. Computed
  // during render rather than in an effect (same pattern used for page
  // resets elsewhere) so it doesn't need a synchronous setState call
  // inside the fetch effect below.
  const suggestionsKey = debouncedQuery;
  const [lastSuggestionsKey, setLastSuggestionsKey] = useState(suggestionsKey);
  if (suggestionsKey !== lastSuggestionsKey) {
    setLastSuggestionsKey(suggestionsKey);
    setSuggestions([]);
  }

  useEffect(() => {
    let cancelled = false;

    if (!loading && entries.length === 0 && debouncedQuery) {
      (async () => {
        const { data } = await supabase.rpc('case_databank_suggestions', {
          search_term: debouncedQuery,
          match_limit: 5,
        });
        if (!cancelled) setSuggestions(data ?? []);
      })();
    }

    return () => {
      cancelled = true;
    };
  }, [loading, entries, debouncedQuery]);

  const highlightTerm = debouncedQuery;

  return (
    <div>
      <Navbar />
      <div style={styles.container} className="page-enter">
        <h1 className="heading" style={styles.title}>Case Databank</h1>
        <p style={styles.subtitle}>Search issues, case law, and findings.</p>

        <DatabankSearchBar
          query={query}
          onQueryChange={setQuery}
          filterType={filterType}
          onFilterChange={setFilterType}
          placeholder="Search the case databank…"
        />

        {error && <div style={styles.errorBox}>{error}</div>}

        {!error && !loading && entries.length === 0 && (
          <div style={styles.empty}>
            {debouncedQuery ? `No entries matched "${debouncedQuery}".` : 'No entries in the case databank yet.'}
          </div>
        )}

        {!error && !loading && entries.length === 0 && suggestions.length > 0 && (
          <div style={styles.suggestions}>
            <div style={styles.suggestionsLabel}>Maybe you're looking for these:</div>
            <div style={styles.entries}>
              {suggestions.map((entry) => (
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

        <Pagination
          page={page}
          totalPages={totalPages}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          loading={loading}
        />
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
  suggestions: {
    marginTop: 8,
    marginBottom: 24,
  },
  suggestionsLabel: {
    fontSize: 13,
    color: 'var(--muted)',
    fontStyle: 'italic',
    marginBottom: 12,
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
};
