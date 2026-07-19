import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/Navbar';

export default function CaseDetailPage() {
  const { caseId } = useParams();
  const [caseItem, setCaseItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCase = async () => {
      setLoading(true);
      setError('');
      
      const { data, error } = await supabase
        .from('case_databank')
        .select('*')
        .eq('id', caseId)
        .single();

      if (error) {
        setError('Case not found');
      } else {
        setCaseItem(data);
      }
      setLoading(false);
    };

    loadCase();
  }, [caseId]);

  return (
    <div>
      <Navbar />
      <div style={styles.container} className="page-enter">
        <Link to="/cases" style={styles.backLink}>
          <ArrowLeft size={18} />
          <span>Back to Cases</span>
        </Link>

        {error && <div style={styles.errorBox}>{error}</div>}

        {loading && <div style={styles.empty}>Loading case…</div>}

        {!loading && caseItem && (
          <div>
            <h1 className="heading" style={styles.issueTitle}>
              {caseItem.issue}
            </h1>

            <div className="card" style={styles.detailCard}>
              <div style={styles.detailSection}>
                <h2 style={styles.sectionTitle}>Case Law</h2>
                <p style={styles.sectionContent}>{caseItem.case_law}</p>
              </div>

              <div style={styles.divider}></div>

              <div style={styles.detailSection}>
                <h2 style={styles.sectionTitle}>Findings</h2>
                <p style={styles.sectionContent}>{caseItem.findings}</p>
              </div>

              {caseItem.notes && (
                <>
                  <div style={styles.divider}></div>
                  <div style={styles.detailSection}>
                    <h2 style={styles.sectionTitle}>Additional Notes</h2>
                    <p style={styles.sectionContent}>{caseItem.notes}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '40px 24px',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    color: 'var(--accent)',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 24,
    transition: 'opacity 0.2s',
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
  issueTitle: {
    fontSize: 36,
    marginBottom: 24,
    color: 'var(--accent)',
  },
  detailCard: {
    padding: 32,
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: 'var(--muted)',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 15,
    color: 'var(--text)',
    lineHeight: 1.7,
  },
  divider: {
    height: '1px',
    background: 'var(--border)',
    margin: '24px 0',
  },
};
