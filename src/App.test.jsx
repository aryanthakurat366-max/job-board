// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';
import { JobsProvider } from './context/JobsContext.jsx';

/** 30 fake API jobs, newest first: 5 React jobs, 25 design jobs. */
function makeApiJobs() {
  return Array.from({ length: 30 }, (_, index) => {
    const n = index + 1;
    const isReact = n <= 5;
    return {
      id: n,
      title: isReact ? `React Developer ${n}` : `Designer ${n}`,
      company_name: isReact ? 'Acme' : 'Globex',
      category: isReact ? 'Software Development' : 'Design',
      job_type: isReact ? 'full_time' : n % 2 === 0 ? 'contract' : 'part_time',
      candidate_required_location: isReact ? 'Worldwide' : 'USA Only',
      publication_date: new Date(Date.UTC(2026, 10, 24 - n)).toISOString(),
      salary: '',
      tags: isReact ? ['react'] : ['figma'],
      company_logo: '',
      url: `https://remotive.com/remote-jobs/job-${n}`,
      description:
        n === 1
          ? '<p>Hello team</p><script>window.__pwned = true</script><img src="x" onerror="window.__pwned = true">'
          : `<p>Description ${n}</p>`,
    };
  });
}

function mockFetchOk() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, json: async () => ({ 'job-count': 30, jobs: makeApiJobs() }) }),
  );
}

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <JobsProvider>
        <App />
      </JobsProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
  window.scrollTo = vi.fn();
  mockFetchOk();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('Job board', () => {
  it('shows a loading state, then the first page of jobs', async () => {
    renderApp();
    expect(screen.getAllByText('Loading jobs...').length).toBeGreaterThan(0);

    expect(await screen.findByText('Showing 1–12 of 30 jobs')).toBeTruthy();
    expect(screen.getAllByRole('article')).toHaveLength(12);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('shows required fields and a link back to Remotive on every card', async () => {
    renderApp();
    await screen.findByText('Showing 1–12 of 30 jobs');

    const card = screen.getAllByRole('article')[0];
    expect(within(card).getByRole('heading', { name: 'React Developer 1' })).toBeTruthy(); // title
    expect(within(card).getByText('Acme')).toBeTruthy(); // company
    expect(within(card).getByText('Worldwide')).toBeTruthy(); // location
    expect(within(card).getByText('Full-time')).toBeTruthy(); // job type
    expect(within(card).getByText('Nov 23, 2026')).toBeTruthy(); // posted date
    expect(within(card).getByRole('link', { name: 'via Remotive' }).getAttribute('href')).toBe(
      'https://remotive.com/remote-jobs/job-1',
    );
  });

  it('paginates client-side', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByText('Showing 1–12 of 30 jobs');

    await user.click(screen.getByRole('button', { name: 'Page 2' }));
    expect(await screen.findByText('Showing 13–24 of 30 jobs')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(await screen.findByText('Showing 25–30 of 30 jobs')).toBeTruthy();
    expect(screen.getByRole('button', { name: /next/i }).disabled).toBe(true);
  });

  it('searches with a debounce, and resets to page 1', async () => {
    const user = userEvent.setup();
    renderApp('/?page=2');
    await screen.findByText('Showing 13–24 of 30 jobs');

    await user.type(screen.getByLabelText('Search'), 'react');
    expect(
      await screen.findByText('Showing 1–5 of 5 jobs matching your filters', {}, { timeout: 2000 }),
    ).toBeTruthy();
  });

  it('filters by category and job type', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByText('Showing 1–12 of 30 jobs');

    await user.selectOptions(screen.getByLabelText('Category'), 'Design');
    expect(await screen.findByText(/of 25 jobs matching your filters/)).toBeTruthy();

    await user.selectOptions(screen.getByLabelText('Job type'), 'contract');
    expect(await screen.findByText(/of 13 jobs matching your filters/)).toBeTruthy();
  });

  it('shows an empty state and lets the user clear filters', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByText('Showing 1–12 of 30 jobs');

    await user.type(screen.getByLabelText('Search'), 'zzzzzz');
    expect(await screen.findByText('No jobs match your search', {}, { timeout: 2000 })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Clear all filters' }));
    expect(await screen.findByText('Showing 1–12 of 30 jobs')).toBeTruthy();
    expect(screen.getByLabelText('Search').value).toBe('');
  });

  it('opens job details, sanitises the description, and goes back to the same filters', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByText('Showing 1–12 of 30 jobs');

    await user.type(screen.getByLabelText('Search'), 'react');
    await screen.findByText('Showing 1–5 of 5 jobs matching your filters', {}, { timeout: 2000 });

    await user.click(screen.getByRole('link', { name: 'React Developer 1' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'React Developer 1' })).toBeTruthy();
    expect(screen.getByText('Hello team')).toBeTruthy();
    expect(document.querySelector('.rich-text script')).toBeNull();
    expect(document.querySelector('.rich-text img[onerror]')).toBeNull();
    expect(window.__pwned).toBeUndefined();
    expect(screen.getByRole('link', { name: /apply on remotive/i }).getAttribute('href')).toBe(
      'https://remotive.com/remote-jobs/job-1',
    );

    await user.click(screen.getByRole('link', { name: /back to jobs/i }));
    expect(await screen.findByText('Showing 1–5 of 5 jobs matching your filters')).toBeTruthy();
    expect(screen.getByLabelText('Search').value).toBe('react');
  });

  it('loads details from a direct link (no list visit first)', async () => {
    renderApp('/jobs/7');
    expect(await screen.findByRole('heading', { level: 1, name: 'Designer 7' })).toBeTruthy();
  });

  it('shows "Job not found" for an unknown id', async () => {
    renderApp('/jobs/does-not-exist');
    expect(await screen.findByText('Job not found')).toBeTruthy();
  });

  it('shows an error state and recovers on retry', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    renderApp();

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Could not reach the jobs service');

    mockFetchOk();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Showing 1–12 of 30 jobs')).toBeTruthy();
  });

  it('shows an error for a non-OK response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    renderApp();
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('503');
  });

  it('reuses the cache instead of calling the API again', async () => {
    renderApp();
    await screen.findByText('Showing 1–12 of 30 jobs');
    cleanup();

    renderApp();
    await screen.findByText('Showing 1–12 of 30 jobs');
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
