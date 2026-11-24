import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';

export default function NotFoundPage() {
  return (
    <EmptyState
      title="Page not found"
      message="The page you are looking for doesn't exist."
      action={
        <Link className="button" to="/">
          Go to all jobs
        </Link>
      }
    />
  );
}
