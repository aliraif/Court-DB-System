import { useState } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/Navbar';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setSearched(true);

    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .or(`case_number.ilike.%${query}%,title.ilike.%${query}%,parties.ilike.%${query}%`)
      .limit(50);

    setLoading(false);
    if (error) {
      setError(error.message);
      setResults([]);
    } else {
      setResults(data ?? []);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={styles.container} className="page-enter">
        <h1 className="heading" style={styles.title}>Case Search</h1>
        <p style={styles.subtitle}>Search by case number, title, or party name.</p>

        <form onSubmit={handleSearch} style={styles.searchRow}>
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
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Searching…' : 'Search'}
          </button>
        </form>

        {error && (
          <div style={styles.errorBox}>
            {error.includes('does not exist')
              ? 'The case database has not been set up yet — run the starter migration in supabase/migrations.'
              : error}
          </div>
        )}

        {!error && searched && !loading && results.length === 0 && (
          <div style={styles.empty}>No cases matched "{query}".</div>
        )}

        <div style={styles.results}>
          {results.map((c) => (
            <div key={c.id} className="card" style={styles.resultCard}>
              <div style={styles.resultHeader}>
                <span style={styles.caseNumber}>{c.case_number}</span>
                {c.status && <span style={styles.statusBadge}>{c.status}</span>}
              </div>
              <div style={styles.resultTitle}>{c.title}</div>
              {c.parties && <div style={styles.resultParties}>{c.parties}</div>}
            </div>
          ))}
        </div>
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
    marginBottom: 24,
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
  errorBox: {
    background: 'rgba(224,62,26,0.1)',
    border: '1px solid rgba(224,62,26,0.25)',
    borderRadius: 8,
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
  results: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  resultCard: {
    padding: 18,
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  caseNumber: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 13,
    color: 'var(--accent)',
  },
  statusBadge: {
    fontSize: 11,
    color: 'var(--muted)',
    border: '1px solid var(--border)',
    borderRadius: 6,
    padding: '2px 8px',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 500,
    marginBottom: 4,
  },
  resultParties: {
    fontSize: 13,
    color: 'var(--muted)',
  },
};
