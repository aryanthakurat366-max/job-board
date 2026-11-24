import { Link, Outlet } from 'react-router-dom';

function BriefcaseIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="currentColor" />
      <rect x="14" y="22" width="36" height="26" rx="5" fill="none" stroke="#fff" strokeWidth="4" />
      <path d="M25 22v-4a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v4" fill="none" stroke="#fff" strokeWidth="4" />
      <path d="M14 34h36" stroke="#f4a259" strokeWidth="4" />
    </svg>
  );
}

export default function Layout() {
  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="site-header">
        <div className="container site-header__inner">
          <Link to="/" className="brand">
            <BriefcaseIcon />
            <span>
              Remote<strong>Board</strong>
            </span>
          </Link>
          <a
            className="site-header__source"
            href="https://remotive.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Jobs via Remotive
          </a>
        </div>
      </header>

      <main id="main" className="container main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>
            Job data provided by{' '}
            <a href="https://remotive.com" target="_blank" rel="noopener noreferrer">
              Remotive
            </a>
            . Listings are delayed by 24 hours and every job links back to its original Remotive
            page.
          </p>
        </div>
      </footer>
    </div>
  );
}
