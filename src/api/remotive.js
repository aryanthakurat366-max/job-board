/**
 * Remotive API layer.
 *
 * Remotive's terms ask consumers to fetch the board only a few times a day
 * (and block more than 2 requests/minute). So this module:
 *   1. fetches the whole board once,
 *   2. caches it in localStorage with a TTL,
 *   3. de-duplicates concurrent requests (React StrictMode mounts effects twice in dev).
 * All searching, filtering and pagination then happens client-side.
 */

const ENDPOINT = 'https://remotive.com/api/remote-jobs';
const CACHE_KEY = 'job-board:remotive:v1';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const REQUEST_TIMEOUT_MS = 15_000;

let inflight = null;

/** Convert one raw API job into the shape the UI uses. */
export function normalizeJob(raw) {
  return {
    id: String(raw.id),
    title: raw.title ?? 'Untitled role',
    company: raw.company_name ?? 'Unknown company',
    companyLogo: raw.company_logo || '',
    category: raw.category ?? 'Other',
    jobType: raw.job_type ?? 'other',
    location: raw.candidate_required_location?.trim() || 'Anywhere',
    publishedAt: raw.publication_date ?? null,
    salary: raw.salary?.trim() || '',
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    url: raw.url ?? 'https://remotive.com',
    description: raw.description ?? '',
  };
}

function readCache() {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (!stored) return null;
    const { savedAt, jobs } = JSON.parse(stored);
    const isFresh = Date.now() - savedAt < CACHE_TTL_MS;
    return isFresh && Array.isArray(jobs) && jobs.length > 0 ? jobs : null;
  } catch {
    return null;
  }
}

function writeCache(jobs) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), jobs }));
  } catch {
    // Storage full or unavailable (private mode). The app still works without a cache.
  }
}

async function request() {
  let response;
  try {
    response = await fetch(ENDPOINT, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  } catch (err) {
    if (err?.name === 'TimeoutError') {
      throw new Error('The request timed out. Please check your connection and try again.');
    }
    throw new Error('Could not reach the jobs service. Please check your connection and try again.');
  }

  if (!response.ok) {
    throw new Error(`The jobs service responded with an error (${response.status}).`);
  }

  const data = await response.json().catch(() => null);
  if (!data || !Array.isArray(data.jobs)) {
    throw new Error('The jobs service returned an unexpected response.');
  }

  const jobs = data.jobs.map(normalizeJob);
  writeCache(jobs);
  return jobs;
}

/**
 * Get all jobs. Uses the cache unless `force` is true.
 * @param {{ force?: boolean }} [options]
 * @returns {Promise<ReturnType<typeof normalizeJob>[]>}
 */
export function fetchJobs({ force = false } = {}) {
  if (!force) {
    const cached = readCache();
    if (cached) return Promise.resolve(cached);
  }
  if (inflight) return inflight;

  inflight = request().finally(() => {
    inflight = null;
  });
  return inflight;
}
