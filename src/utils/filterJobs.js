const normalize = (value) => String(value ?? '').toLowerCase().trim();

/**
 * Pure filtering function (easy to unit test, no React in here).
 * - keyword matches title, company, category, tags or location
 * - category and type are exact matches
 * - location is a "contains" match
 * Every filter is optional; an empty value means "don't filter on this".
 */
export function filterJobs(jobs, { q = '', category = '', type = '', location = '' } = {}) {
  const keyword = normalize(q);
  const place = normalize(location);

  return jobs.filter((job) => {
    if (category && job.category !== category) return false;
    if (type && job.jobType !== type) return false;
    if (place && !normalize(job.location).includes(place)) return false;

    if (keyword) {
      const haystack = [job.title, job.company, job.category, job.location, ...job.tags]
        .map(normalize)
        .join(' ');
      // Every word the user typed must appear somewhere ("react remote" -> both words).
      return keyword.split(/\s+/).every((word) => haystack.includes(word));
    }
    return true;
  });
}

/** Newest first. Jobs without a valid date go last. */
export function sortByNewest(jobs) {
  const toTime = (job) => {
    const time = new Date(job.publishedAt).getTime();
    return Number.isNaN(time) ? 0 : time;
  };
  return [...jobs].sort((a, b) => toTime(b) - toTime(a));
}

/** Unique, sorted values of one job field (used to build the dropdowns). */
export function getUniqueValues(jobs, field) {
  return [...new Set(jobs.map((job) => job[field]).filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b)),
  );
}
