import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPrev, onNext, loading }) {
  if (totalPages <= 1) return null;

  return (
    <div style={styles.pagination}>
      <button type="button" style={styles.pageBtn} onClick={onPrev} disabled={page <= 1 || loading}>
        <ChevronLeft size={16} />
      </button>
      <span style={styles.pageLabel}>
        Page {page} of {totalPages}
      </span>
      <button type="button" style={styles.pageBtn} onClick={onNext} disabled={page >= totalPages || loading}>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

const styles = {
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
