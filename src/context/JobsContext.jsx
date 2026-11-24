import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchJobs } from '../api/remotive.js';
import { getUniqueValues, sortByNewest } from '../utils/filterJobs.js';

const JobsContext = createContext(null);

/**
 * Loads the job board once and shares it with every page.
 * The list page and the details page read from the same data, so opening a job
 * never triggers a second network request.
 */
export function JobsProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', jobs: [], error: null });

  const load = useCallback(async ({ force = false } = {}) => {
    setState((previous) => ({ ...previous, status: 'loading', error: null }));
    try {
      const jobs = sortByNewest(await fetchJobs({ force }));
      setState({ status: 'success', jobs, error: null });
    } catch (error) {
      setState({ status: 'error', jobs: [], error: error.message });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo(
    () => ({
      ...state,
      categories: getUniqueValues(state.jobs, 'category'),
      jobTypes: getUniqueValues(state.jobs, 'jobType'),
      retry: () => load({ force: true }),
    }),
    [state, load],
  );

  return <JobsContext.Provider value={value}>{children}</JobsContext.Provider>;
}

export function useJobs() {
  const context = useContext(JobsContext);
  if (!context) throw new Error('useJobs must be used inside <JobsProvider>');
  return context;
}
