const dateFormatter = new Intl.DateTimeFormat('en', { dateStyle: 'medium' });
const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

const JOB_TYPE_LABELS = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  freelance: 'Freelance',
  internship: 'Internship',
  other: 'Other',
};

export function formatJobType(type) {
  if (JOB_TYPE_LABELS[type]) return JOB_TYPE_LABELS[type];
  // Fallback for unknown values: "some_type" -> "Some type"
  const text = String(type ?? 'other').replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatDate(isoString) {
  if (!isoString) return 'Date unavailable';
  const date = new Date(isoString);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : dateFormatter.format(date);
}

/** "today", "yesterday", "3 days ago", "2 months ago" */
export function timeAgo(isoString, now = Date.now()) {
  if (!isoString) return '';
  const time = new Date(isoString).getTime();
  if (Number.isNaN(time)) return '';

  const days = Math.round((time - now) / 86_400_000);
  if (Math.abs(days) < 30) return relativeFormatter.format(days, 'day');
  if (Math.abs(days) < 365) return relativeFormatter.format(Math.round(days / 30), 'month');
  return relativeFormatter.format(Math.round(days / 365), 'year');
}

export function getInitials(name) {
  return String(name ?? '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}
