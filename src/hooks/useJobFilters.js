import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Filters and the current page live in the URL (?q=react&category=...&page=2).
 * Why: links are shareable, refresh keeps your place, and the browser back button works.
 */
export function useJobFilters() {
  const [params, setParams] = useSearchParams();

  const filters = useMemo(
    () => ({
      q: params.get('q') ?? '',
      category: params.get('category') ?? '',
      type: params.get('type') ?? '',
      location: params.get('location') ?? '',
      page: Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1),
    }),
    [params],
  );

  /** Change one or more filters. Changing a filter sends you back to page 1. */
  const updateFilters = useCallback(
    (updates) => {
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          Object.entries(updates).forEach(([key, value]) => {
            if (value === '' || value == null) next.delete(key);
            else next.set(key, String(value));
          });
          next.delete('page');
          return next;
        },
        { replace: true }, // typing shouldn't flood the browser history
      );
    },
    [setParams],
  );

  /** Change page. This one pushes a history entry so Back goes to the previous page. */
  const setPage = useCallback(
    (page) => {
      setParams((previous) => {
        const next = new URLSearchParams(previous);
        if (page <= 1) next.delete('page');
        else next.set('page', String(page));
        return next;
      });
    },
    [setParams],
  );

  const clearFilters = useCallback(() => setParams({}, { replace: true }), [setParams]);

  const hasActiveFilters = Boolean(filters.q || filters.category || filters.type || filters.location);

  return { filters, updateFilters, setPage, clearFilters, hasActiveFilters };
}
