import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/Navbar';

export default function CasesPage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCases = async () => {
      setLoading(true);
      setError('');
      
      const { data, error } = await supabase
        .from('case_databank')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setCases(data ?? []);
      }
      setLoading(false);
    };

    loadCases();
  }, []);

  return (
    <div>
      <Navbar />
      <div style={styles.container} className="page-enter">
        <h1 className="heading" style={styles.title}>Case Database</h1>
        <p style={styles.subtitle}>Browse all cases in the databank.</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        {loading && <div style={styles.empty}>Loading cases…</div>}
        {!loading && cases.length === 0 && (
          <div style={styles.empty}>No cases found in the databank.</div>
        )}

        <div style={styles.casesList}>
          {cases.map((caseItem) => (
            <Link key={caseItem.id} to={`/cases/${caseItem.id}`} style={styles.caseLink}>
              <div className="card" style={styles.caseCard}>
                <h2 className="heading" style={styles.issueTitle}>
                  {caseItem.issue}
                </h2>
                
                <div style={styles.columnsContainer}>
                  <div style={styles.column}>
                    <h3 style={styles.columnTitle}>Case Law</h3>
                    <p style={styles.columnContent}>{caseItem.case_law}</p>
                  </div>
                  
                  <div style={styles.column}>
                    <h3 style={styles.columnTitle}>Findings</h3>
                    <p style={styles.columnContent}>{caseItem.findings}</p>
                  </div>
                </div>

                {caseItem.notes && (
                  <div style={styles.notesSection}>
                    <span style={styles.notesLabel}>Notes:</span>
                    <p style={styles.notesContent}>{caseItem.notes}</p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 1000,
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
    padding: '10px 14px',
    marginBottom: 16,
    color: 'var(--red)',
    fontSize: 13,
  },
  empty: {
    color: 'var(--muted)',
    fontSize: 14,
    padding: '12px 0',
  },
  casesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  caseLink: {
    textDecoration: 'none',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  caseCard: {
    padding: 24,
    cursor: 'pointer',
  },
  issueTitle: {
    fontSize: 22,
    marginBottom: 20,
    color: 'var(--accent)',
  },
  columnsContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 24,
    marginBottom: 16,
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
  },
  columnTitle: {
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: 'var(--muted)',
    marginBottom: 8,
  },
  columnContent: {
    fontSize: 14,
    color: 'var(--text)',
    lineHeight: 1.5,
  },
  notesSection: {
    borderTop: '1px solid var(--border)',
    paddingTop: 16,
    marginTop: 16,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--muted)',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  notesContent: {
    fontSize: 13,
    color: 'var(--text)',
    marginTop: 6,
    lineHeight: 1.5,
  },
};
