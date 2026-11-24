import { useEffect, useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useJobs } from '../context/JobsContext.jsx';
import CompanyLogo from '../components/CompanyLogo.jsx';
import Loader from '../components/Loader.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import SafeHtml from '../components/SafeHtml.jsx';
import { formatDate, formatJobType, timeAgo } from '../utils/formatters.js';

const SITE_TITLE = 'Remote Job Board';

export default function JobDetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const { status, jobs, error, retry } = useJobs();

  // The list page passes its query string along, so "Back" restores filters and page.
  const backTo = `/${location.state?.from ?? ''}`;
  const job = useMemo(() => jobs.find((item) => item.id === id), [jobs, id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    document.title = job ? `${job.title} at ${job.company} | ${SITE_TITLE}` : SITE_TITLE;
    return () => {
      document.title = SITE_TITLE;
    };
  }, [job]);

  if (status === 'loading') return <Loader label="Loading job details..." />;
  if (status === 'error') return <ErrorState message={error} onRetry={retry} />;

  if (!job) {
    return (
      <EmptyState
        title="Job not found"
        message="This listing may have been removed, or the link is out of date."
        action={
          <Link className="button" to={backTo}>
            Back to all jobs
          </Link>
        }
      />
    );
  }

  return (
    <article className="details">
      <Link className="back-link" to={backTo}>
        <span aria-hidden="true">&larr;</span> Back to jobs
      </Link>

      <header className="details__header">
        <CompanyLogo name={job.company} src={job.companyLogo} size="lg" />
        <div>
          <p className="details__company">{job.company}</p>
          <h1>{job.title}</h1>
          <p className="details__posted">
            Posted <time dateTime={job.publishedAt ?? undefined}>{formatDate(job.publishedAt)}</time>
            {timeAgo(job.publishedAt) && <span className="muted"> · {timeAgo(job.publishedAt)}</span>}
          </p>
        </div>
      </header>

      <ul className="chips" aria-label="Job details">
        <li className="chip chip--type">{formatJobType(job.jobType)}</li>
        <li className="chip">{job.category}</li>
        <li className="chip chip--location">{job.location}</li>
        {job.salary && <li className="chip chip--salary">{job.salary}</li>}
      </ul>

      <div className="details__actions">
        <a className="button" href={job.url} target="_blank" rel="noopener noreferrer">
          View &amp; apply on Remotive <span aria-hidden="true">&nearr;</span>
        </a>
      </div>

      <section aria-labelledby="description-heading">
        <h2 id="description-heading">About this role</h2>
        <SafeHtml className="rich-text" html={job.description} />
      </section>

      {job.tags.length > 0 && (
        <section aria-labelledby="skills-heading">
          <h2 id="skills-heading">Skills &amp; tags</h2>
          <ul className="chips">
            {job.tags.map((tag) => (
              <li className="chip" key={tag}>
                {tag}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="details__source">
        Source:{' '}
        <a href={job.url} target="_blank" rel="noopener noreferrer">
          this listing on Remotive
        </a>
      </p>
    </article>
  );
}
