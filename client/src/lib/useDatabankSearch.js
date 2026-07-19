import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export function useDatabankSearch(pageSize) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filterType, setFilterType] = useState('general');

  const [entries, setEntries] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadIndex, setReloadIndex] = useState(0);
  const refresh = () => setReloadIndex((i) => i + 1);

  // Debounce keystrokes so we don't fire a query on every character.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

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
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

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
  }, [page, debouncedQuery, filterType, pageSize, reloadIndex]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return {
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
    loading,
    error,
    refresh,
  };
}
