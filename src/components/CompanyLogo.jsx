import { useState } from 'react';
import { getInitials } from '../utils/formatters.js';

/** Company logo with a graceful fallback (initials) when the image is missing or broken. */
export default function CompanyLogo({ name, src, size = 'md' }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`logo logo--${size} logo--fallback`} aria-hidden="true">
        {getInitials(name)}
      </div>
    );
  }

  return (
    <img
      className={`logo logo--${size}`}
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
