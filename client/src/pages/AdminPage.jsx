import { useState } from 'react';
import { Pencil, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useDatabankSearch } from '../lib/useDatabankSearch';
import { highlight } from '../lib/highlight';
import Navbar from '../components/Navbar';
import DatabankSearchBar from '../components/DatabankSearchBar';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 8;

export default function AdminPage() {
  const [issue, setIssue] = useState('');
  const [caseLaw, setCaseLaw] = useState('');
  const [findings, setFindings] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const {
    query,
    setQuery,
    filterType,
    setFilterType,
    debouncedQuery,
    entries,
    setEntries,
    page,
    setPage,
    totalPages,
    loading: loadingEntries,
    error: listError,
    refresh,
  } = useDatabankSearch(PAGE_SIZE);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ issue: '', case_law: '', findings: '', notes: '' });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  const highlightTerm = debouncedQuery;

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
    if (page === 1) {
      refresh();
    } else {
      setPage(1);
    }
  };

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setEditForm({
      issue: entry.issue,
      case_law: entry.case_law,
      findings: entry.findings,
      notes: entry.notes === 'None' ? '' : entry.notes,
    });
    setEditError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError('');
  };

  const saveEdit = async () => {
    if (!editForm.issue.trim() || !editForm.case_law.trim() || !editForm.findings.trim()) return;

    setSavingEdit(true);
    setEditError('');

    const updated = {
      issue: editForm.issue.trim(),
      case_law: editForm.case_law.trim(),
      findings: editForm.findings.trim(),
      notes: editForm.notes.trim() || 'None',
    };

    const { error } = await supabase.from('case_databank').update(updated).eq('id', editingId);

    setSavingEdit(false);
    if (error) {
      setEditError(error.message);
      return;
    }

    setEntries((prev) => prev.map((e) => (e.id === editingId ? { ...e, ...updated } : e)));
    setEditingId(null);
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

        <h2 className="heading" style={styles.listTitle}>All Entries</h2>

        <DatabankSearchBar
          query={query}
          onQueryChange={setQuery}
          filterType={filterType}
          onFilterChange={setFilterType}
          placeholder="Search your entries…"
        />

        {listError && <div style={styles.errorBox}>{listError}</div>}

        {!listError && !loadingEntries && entries.length === 0 && (
          <div style={styles.empty}>
            {debouncedQuery ? `No entries matched "${debouncedQuery}".` : 'No entries yet.'}
          </div>
        )}

        <div style={styles.results}>
          {entries.map((entry) =>
            editingId === entry.id ? (
              <div key={entry.id} className="card" style={styles.entryCard}>
                <label style={styles.label}>Issue</label>
                <input
                  type="text"
                  value={editForm.issue}
                  onChange={(e) => setEditForm((f) => ({ ...f, issue: e.target.value }))}
                  style={{ marginBottom: 12 }}
                />

                <label style={styles.label}>Case Law</label>
                <input
                  type="text"
                  value={editForm.case_law}
                  onChange={(e) => setEditForm((f) => ({ ...f, case_law: e.target.value }))}
                  style={{ marginBottom: 12 }}
                />

                <label style={styles.label}>Findings</label>
                <textarea
                  value={editForm.findings}
                  onChange={(e) => setEditForm((f) => ({ ...f, findings: e.target.value }))}
                  rows={5}
                  style={{ marginBottom: 12, resize: 'vertical' }}
                />

                <label style={styles.label}>Additional Notes</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  style={{ marginBottom: 16, resize: 'vertical' }}
                />

                {editError && <div style={styles.errorBox}>{editError}</div>}

                <div style={styles.editActions}>
                  <button type="button" className="btn-primary" onClick={saveEdit} disabled={savingEdit}>
                    {savingEdit ? 'Saving…' : 'Save'}
                  </button>
                  <button type="button" style={styles.cancelBtn} onClick={cancelEdit}>
                    <X size={14} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div key={entry.id} className="card" style={styles.entryCard}>
                <div style={styles.entryHeader}>
                  <span style={styles.issueBadge}>{highlight(entry.issue, highlightTerm)}</span>
                  <button type="button" style={styles.modifyBtn} onClick={() => startEdit(entry)}>
                    <Pencil size={13} />
                    Modify
                  </button>
                </div>
                <div style={styles.entryCaseLaw}>{highlight(entry.case_law, highlightTerm)}</div>
                <div style={styles.entryFindings}>{highlight(entry.findings, highlightTerm)}</div>
                <div style={styles.entryNotes}>Notes: {highlight(entry.notes, highlightTerm)}</div>
              </div>
            )
          )}
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          loading={loadingEntries}
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
  entryHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
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
  },
  modifyBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    borderRadius: 6,
    padding: '4px 10px',
    fontSize: 12,
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
  editActions: {
    display: 'flex',
    gap: 8,
  },
  cancelBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    borderRadius: 8,
    padding: '0 16px',
    fontSize: 14,
  },
};
