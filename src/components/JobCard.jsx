import { memo } from 'react';
import { Link } from 'react-router-dom';
import CompanyLogo from './CompanyLogo.jsx';
import { formatDate, formatJobType, timeAgo } from '../utils/formatters.js';

/**
 * One job in the list.
 * The title link is "stretched" over the whole card with CSS, so the entire card is
 * clickable while the "via Remotive" link stays a separate, valid link (no nested <a>).
 * `from` is the list's query string, so the details page can send the user back to the
 * same filters and page.
 */
function JobCard({ job, from }) {
  return (
    <article className="job-card">
      <div className="job-card__top">
        <CompanyLogo name={job.company} src={job.companyLogo} />
        <div className="job-card__heading">
          <p className="job-card__company">{job.company}</p>
          <h2 className="job-card__title">
            <Link to={`/jobs/${job.id}`} state={{ from }}>
              {job.title}
            </Link>
          </h2>
        </div>
      </div>

      <ul className="chips" aria-label="Job details">
        <li className="chip chip--type">{formatJobType(job.jobType)}</li>
        <li className="chip">{job.category}</li>
        <li className="chip chip--location">{job.location}</li>
      </ul>

      {job.salary && <p className="job-card__salary">{job.salary}</p>}

      <div className="job-card__footer">
        <span className="job-card__date">
          Posted <time dateTime={job.publishedAt ?? undefined}>{formatDate(job.publishedAt)}</time>
          {timeAgo(job.publishedAt) && <span className="muted"> · {timeAgo(job.publishedAt)}</span>}
        </span>
        <a className="job-card__source" href={job.url} target="_blank" rel="noopener noreferrer">
          via Remotive
        </a>
      </div>
    </article>
  );
}

export default memo(JobCard);
