import JobCard from './JobCard.jsx';

export default function JobList({ jobs, from }) {
  return (
    <div className="job-grid">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} from={from} />
      ))}
    </div>
  );
}
