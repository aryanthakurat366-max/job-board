/** Placeholder cards shown while the first load is in flight. */
export default function JobListSkeleton({ count = 6 }) {
  return (
    <div className="job-grid" role="status" aria-busy="true">
      <span className="visually-hidden">Loading jobs...</span>
      {Array.from({ length: count }, (_, index) => (
        <div className="job-card skeleton" key={index} aria-hidden="true">
          <div className="job-card__top">
            <div className="skeleton__block skeleton__logo" />
            <div className="skeleton__lines">
              <div className="skeleton__block skeleton__line skeleton__line--short" />
              <div className="skeleton__block skeleton__line" />
            </div>
          </div>
          <div className="skeleton__block skeleton__line skeleton__line--chips" />
          <div className="skeleton__block skeleton__line skeleton__line--short" />
        </div>
      ))}
    </div>
  );
}
