import { useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useJobs } from '../context/JobsContext.jsx';
import { useJobFilters } from '../hooks/useJobFilters.js';
import { filterJobs } from '../utils/filterJobs.js';
import { paginate } from '../utils/pagination.js';
import FilterBar from '../components/FilterBar.jsx';
import JobList from '../components/JobList.jsx';
import JobListSkeleton from '../components/JobListSkeleton.jsx';
import Pagination from '../components/Pagination.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function JobsPage() {
  const location = useLocation();
  const { status, jobs, error, categories, jobTypes, retry } = useJobs();
  const { filters, updateFilters, setPage, clearFilters, hasActiveFilters } = useJobFilters();

  // Derived data: computed from jobs + filters on every render, never stored in state.
  const filteredJobs = useMemo(() => filterJobs(jobs, filters), [jobs, filters]);
  const pageData = useMemo(() => paginate(filteredJobs, filters.page), [filteredJobs, filters.page]);

  // Scroll back to the top when the user changes page (but not on first render).
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pageData.currentPage]);

  return (
    <>
      <section className="hero">
        <h1>Find your next remote role</h1>
        <p>
          {status === 'success'
            ? `${jobs.length} remote jobs, curated by Remotive.`
            : 'Browse remote jobs from companies around the world.'}
        </p>
      </section>

      {status === 'loading' && <JobListSkeleton />}

      {status === 'error' && <ErrorState message={error} onRetry={retry} />}

      {status === 'success' && (
        <>
          <FilterBar
            filters={filters}
            categories={categories}
            jobTypes={jobTypes}
            onChange={updateFilters}
            onClear={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          <p className="results-summary" aria-live="polite">
            {pageData.totalItems === 0
              ? 'No jobs found'
              : `Showing ${pageData.startIndex}–${pageData.endIndex} of ${pageData.totalItems} jobs${
                  hasActiveFilters ? ' matching your filters' : ''
                }`}
          </p>

          {pageData.totalItems === 0 ? (
            <EmptyState
              title="No jobs match your search"
              message={
                hasActiveFilters
                  ? 'Try a different keyword or remove some filters.'
                  : 'There are no jobs available right now. Please check back later.'
              }
              action={
                hasActiveFilters && (
                  <button type="button" className="button" onClick={clearFilters}>
                    Clear all filters
                  </button>
                )
              }
            />
          ) : (
            <>
              <JobList jobs={pageData.items} from={location.search} />
              <Pagination
                currentPage={pageData.currentPage}
                totalPages={pageData.totalPages}
                onPageChange={setPage}
              />
            </>
          )}
        </>
      )}
    </>
  );
}
