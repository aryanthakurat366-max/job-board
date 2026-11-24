import { describe, expect, it } from 'vitest';
import { filterJobs, getUniqueValues, sortByNewest } from './filterJobs.js';
import { getPageNumbers, paginate } from './pagination.js';
import { formatJobType, getInitials, timeAgo } from './formatters.js';
import { normalizeJob } from '../api/remotive.js';

const jobs = [
  {
    id: '1',
    title: 'Senior React Developer',
    company: 'Acme',
    category: 'Software Development',
    jobType: 'full_time',
    location: 'Worldwide',
    tags: ['react', 'typescript'],
    publishedAt: '2026-11-20T10:00:00',
  },
  {
    id: '2',
    title: 'Product Designer',
    company: 'Globex',
    category: 'Design',
    jobType: 'contract',
    location: 'USA Only',
    tags: ['figma'],
    publishedAt: '2026-11-22T10:00:00',
  },
  {
    id: '3',
    title: 'Support Specialist',
    company: 'Initech',
    category: 'Customer Support',
    jobType: 'part_time',
    location: 'Europe',
    tags: [],
    publishedAt: null,
  },
];

describe('filterJobs', () => {
  it('returns everything when no filters are set', () => {
    expect(filterJobs(jobs, {})).toHaveLength(3);
  });

  it('matches keywords against title, company and tags (case-insensitive)', () => {
    expect(filterJobs(jobs, { q: 'REACT' }).map((j) => j.id)).toEqual(['1']);
    expect(filterJobs(jobs, { q: 'globex' }).map((j) => j.id)).toEqual(['2']);
    expect(filterJobs(jobs, { q: 'figma' }).map((j) => j.id)).toEqual(['2']);
  });

  it('requires every typed word to match', () => {
    expect(filterJobs(jobs, { q: 'react acme' })).toHaveLength(1);
    expect(filterJobs(jobs, { q: 'react globex' })).toHaveLength(0);
  });

  it('filters by category and job type exactly', () => {
    expect(filterJobs(jobs, { category: 'Design' }).map((j) => j.id)).toEqual(['2']);
    expect(filterJobs(jobs, { type: 'part_time' }).map((j) => j.id)).toEqual(['3']);
  });

  it('filters location by partial match', () => {
    expect(filterJobs(jobs, { location: 'usa' }).map((j) => j.id)).toEqual(['2']);
  });

  it('combines filters with AND', () => {
    expect(filterJobs(jobs, { q: 'react', category: 'Design' })).toHaveLength(0);
  });
});

describe('sortByNewest / getUniqueValues', () => {
  it('sorts newest first and puts undated jobs last', () => {
    expect(sortByNewest(jobs).map((j) => j.id)).toEqual(['2', '1', '3']);
  });

  it('does not mutate the original array', () => {
    const copy = [...jobs];
    sortByNewest(jobs);
    expect(jobs).toEqual(copy);
  });

  it('returns sorted unique values', () => {
    expect(getUniqueValues(jobs, 'category')).toEqual([
      'Customer Support',
      'Design',
      'Software Development',
    ]);
  });
});

describe('paginate', () => {
  const items = Array.from({ length: 25 }, (_, i) => i + 1);

  it('slices the right page', () => {
    const page = paginate(items, 2, 10);
    expect(page.items).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    expect(page).toMatchObject({ currentPage: 2, totalPages: 3, startIndex: 11, endIndex: 20 });
  });

  it('handles a partial last page', () => {
    expect(paginate(items, 3, 10).items).toHaveLength(5);
  });

  it('clamps out-of-range pages', () => {
    expect(paginate(items, 99, 10).currentPage).toBe(3);
    expect(paginate(items, -4, 10).currentPage).toBe(1);
  });

  it('handles an empty list', () => {
    expect(paginate([], 1, 10)).toMatchObject({
      items: [],
      totalPages: 1,
      totalItems: 0,
      startIndex: 0,
      endIndex: 0,
    });
  });
});

describe('getPageNumbers', () => {
  it('shows every page when there are few', () => {
    expect(getPageNumbers(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('adds ellipses in the middle', () => {
    expect(getPageNumbers(10, 20)).toEqual([1, 'ellipsis', 9, 10, 11, 'ellipsis', 20]);
  });

  it('adds one ellipsis near the edges', () => {
    expect(getPageNumbers(1, 20)).toEqual([1, 2, 'ellipsis', 20]);
    expect(getPageNumbers(20, 20)).toEqual([1, 'ellipsis', 19, 20]);
  });
});

describe('formatters', () => {
  it('formats job types', () => {
    expect(formatJobType('full_time')).toBe('Full-time');
    expect(formatJobType('weird_type')).toBe('Weird type');
  });

  it('builds relative dates', () => {
    const now = new Date('2026-11-24T12:00:00Z').getTime();
    expect(timeAgo('2026-11-23T12:00:00Z', now)).toBe('yesterday');
    expect(timeAgo('2026-11-21T12:00:00Z', now)).toBe('3 days ago');
    expect(timeAgo(null, now)).toBe('');
  });

  it('builds initials', () => {
    expect(getInitials('Acme Corp Inc')).toBe('AC');
    expect(getInitials('')).toBe('');
  });
});

describe('normalizeJob', () => {
  it('maps API fields and fills safe defaults', () => {
    const job = normalizeJob({
      id: 42,
      title: 'Dev',
      company_name: 'Acme',
      job_type: 'full_time',
      candidate_required_location: '  ',
      url: 'https://remotive.com/x',
    });
    expect(job).toMatchObject({
      id: '42',
      company: 'Acme',
      jobType: 'full_time',
      location: 'Anywhere',
      salary: '',
      tags: [],
    });
  });
});
