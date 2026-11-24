import { getPageNumbers } from '../utils/pagination.js';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="pagination__step"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <span aria-hidden="true">&larr;</span> Prev
      </button>

      <ul className="pagination__pages">
        {pages.map((page, index) =>
          page === 'ellipsis' ? (
            <li key={`ellipsis-${index}`} className="pagination__gap" aria-hidden="true">
              &hellip;
            </li>
          ) : (
            <li key={page}>
              <button
                type="button"
                className={`pagination__page${page === currentPage ? ' is-active' : ''}`}
                onClick={() => onPageChange(page)}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            </li>
          ),
        )}
      </ul>

      <p className="pagination__status">
        Page {currentPage} of {totalPages}
      </p>

      <button
        type="button"
        className="pagination__step"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next <span aria-hidden="true">&rarr;</span>
      </button>
    </nav>
  );
}
