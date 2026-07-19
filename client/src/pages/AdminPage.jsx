import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/Navbar';

export default function AdminPage() {
  const [issue, setIssue] = useState('');
  const [caseLaw, setCaseLaw] = useState('');
  const [findings, setFindings] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);

  const loadEntries = async () => {
    setLoadingEntries(true);
    const { data, error } = await supabase
      .from('case_databank')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error) setEntries(data ?? []);
    setLoadingEntries(false);
  };

  useEffect(() => {
    (async () => {
      await loadEntries();
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!issue.trim() || !caseLaw.trim() || !findings.trim()) return;

    setSaving(true);
    setError('');

    const { error } = await supabase.from('case_databank').insert({
      issue: issue.trim(),
      case_law: caseLaw.trim(),
      findings: findings.trim(),
      ...(notes.trim() && { notes: notes.trim() }),
    });

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }

    setIssue('');
    setCaseLaw('');
    setFindings('');
    setNotes('');
    loadEntries();
  };

  return (
    <div>
      <Navbar />
      <div style={styles.container} className="page-enter">
        <h1 className="heading" style={styles.title}>Admin</h1>
        <p style={styles.subtitle}>Register entries into the case databank.</p>

        <div className="card" style={styles.formCard}>
          <h2 className="heading" style={styles.sectionTitle}>Case Databank</h2>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <label style={styles.label}>Issue</label>
            <input
              type="text"
              placeholder="e.g. DNA/FINGERPRINT"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              style={{ marginBottom: 16 }}
            />

            <label style={styles.label}>Case Law</label>
            <input
              type="text"
              placeholder="e.g. Zainuddin bin Abbas v PP [2012]"
              value={caseLaw}
              onChange={(e) => setCaseLaw(e.target.value)}
              style={{ marginBottom: 16 }}
            />

            <label style={styles.label}>Findings</label>
            <textarea
              placeholder="Findings / excerpt text…"
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              rows={6}
              style={{ marginBottom: 16, resize: 'vertical' }}
            />

            <label style={styles.label}>Additional Notes (optional)</label>
            <textarea
              placeholder="Any extra remarks…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              style={{ marginBottom: 20, resize: 'vertical' }}
            />

            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Add Entry'}
            </button>
          </form>
        </div>

        <h2 className="heading" style={styles.listTitle}>Recent Entries</h2>

        {loadingEntries && <div style={styles.empty}>Loading…</div>}
        {!loadingEntries && entries.length === 0 && (
          <div style={styles.empty}>No entries yet.</div>
        )}

        <div style={styles.results}>
          {entries.map((entry) => (
            <div key={entry.id} className="card" style={styles.entryCard}>
              <span style={styles.issueBadge}>{entry.issue}</span>
              <div style={styles.entryCaseLaw}>{entry.case_law}</div>
              <div style={styles.entryFindings}>{entry.findings}</div>
              <div style={styles.entryNotes}>Notes: {entry.notes}</div>
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
  formCard: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 20,
  },
  label: {
    display: 'block',
    fontSize: 13,
    color: 'var(--muted)',
    marginBottom: 6,
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
  listTitle: {
    fontSize: 20,
    marginBottom: 16,
  },
  empty: {
    color: 'var(--muted)',
    fontSize: 14,
    padding: '12px 0',
  },
  results: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  entryCard: {
    padding: 18,
  },
  issueBadge: {
    display: 'inline-block',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: 'var(--accent)',
    border: '1px solid var(--border)',
    borderRadius: 6,
    padding: '2px 8px',
    marginBottom: 8,
  },
  entryCaseLaw: {
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 6,
  },
  entryFindings: {
    fontSize: 13,
    color: 'var(--muted)',
    lineHeight: 1.5,
  },
  entryNotes: {
    fontSize: 12,
    color: 'var(--muted)',
    marginTop: 8,
    paddingTop: 8,
    borderTop: '1px solid var(--border)',
    fontStyle: 'italic',
  },
};
