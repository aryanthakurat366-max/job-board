# Remote Job Board

A responsive job board built with React. It lists remote jobs from the public [Remotive API](https://remotive.com/remote-jobs/api) with search, filters, pagination, and a job details page.

**Live demo:** https://job-board-cyan-delta.vercel.app/

## Features

- Job listings with title, company, location, job type, category, salary (when given) and posted date
- Job details page (`/jobs/:id`) with the full, sanitised description and a link back to the original Remotive listing
- Search by keyword (title, company, category, location, tags) and filter by category, job type and location
- Client-side pagination (12 jobs per page) with page numbers, Prev/Next, and smooth scroll to top
- Loading (skeleton cards), error (with retry), empty-results (with "clear filters") and success states
- Filters and the current page live in the URL, so links are shareable and refresh / Back keep your place
- Responsive layout (1, 2 and 3 column grid) and keyboard / screen-reader friendly markup
- 32 automated tests (unit tests for logic, integration tests for the real user flows)

## Tech stack

React 19 · React Router 7 · Vite · DOMPurify · Vitest + Testing Library. Plain CSS (no UI library).

## Getting started

Requires Node.js 20 or newer.

```bash
npm install
npm run dev       # start the dev server
npm test          # run the tests
npm run build     # production build into dist/
npm run preview   # preview the production build
```

No API key or environment variables are needed.

## Deploying

The app is a single-page app with client-side routing, so the host must serve `index.html` for every path. Both configs are already included:

- **Vercel:** import the repo. `vercel.json` handles the rewrite. Framework preset: Vite.
- **Netlify:** import the repo. `public/_redirects` handles the rewrite. Build command `npm run build`, publish directory `dist`.

## Project structure

```
src/
  api/
    remotive.js          Fetches the board once, caches it, normalises each job
  context/
    JobsContext.jsx      Loads jobs once and shares them (status, jobs, error, retry)
  hooks/
    useJobFilters.js     Reads/writes filters and page in the URL query string
    useDebounce.js       Delays a fast-changing value (used by the search inputs)
  utils/
    filterJobs.js        Pure functions: filter, sort, unique values
    pagination.js        Pure functions: paginate, page-number list with ellipses
    formatters.js        Dates, job-type labels, initials
  components/
    Layout.jsx           Header, footer (Remotive attribution), <Outlet />
    FilterBar.jsx        Search + category + type + location + clear
    DebouncedInput.jsx   Text input that reports its value after you pause typing
    SelectField.jsx      Labelled select
    JobList.jsx          Grid of cards
    JobCard.jsx          One job (whole card clickable, separate Remotive link)
    CompanyLogo.jsx      Logo with initials fallback
    Pagination.jsx       Prev / numbers / Next
    JobListSkeleton.jsx  Loading placeholder cards
    Loader.jsx           Spinner
    ErrorState.jsx       Error message + retry
    EmptyState.jsx       "Nothing here" message + optional action
    SafeHtml.jsx         Sanitised HTML renderer (DOMPurify)
  pages/
    JobsPage.jsx         List page: filters, results, pagination
    JobDetailsPage.jsx   Details page
    NotFoundPage.jsx     404
  App.jsx                Route table
  main.jsx               Providers (Router, Jobs) and render
```

## How it works

1. `JobsProvider` calls `fetchJobs()` once on startup. Every page reads from that one shared copy.
2. `JobsPage` takes the filters from the URL, runs `filterJobs`, then `paginate`. These results are derived with `useMemo` and never stored in state, so they can't go out of sync.
3. Changing any filter resets to page 1. The page number is clamped, so a stale `?page=99` shows the last page instead of an empty screen.
4. Clicking a card goes to `/jobs/:id`. The list's query string travels along in router state, so "Back to jobs" restores the same filters and page. Opening a details link directly works too, because the provider loads the data first.

## Assumptions and trade-offs

- **Fetch once, filter on the client.** Remotive asks consumers to call the API only a few times a day and blocks more than 2 requests per minute. So the app fetches the whole board once, caches it in `localStorage` for 6 hours, and de-duplicates simultaneous requests (React StrictMode mounts effects twice in development). Searching, filtering and pagination are all client-side. The trade-off is a larger first download and data that can be up to 6 hours old on top of Remotive's own 24-hour delay.
- **Keyword search covers title, company, category, location and tags, not the full description.** This keeps results relevant and fast. Searching descriptions would be a small change in `filterJobs.js`.
- **Location is a free-text "contains" filter** because Remotive's location values are free-form ("Worldwide", "USA Only", "Europe", ...) rather than a fixed list.
- **Filters live in the URL, not in `useState`.** This makes links shareable and Back work, at the cost of a little more plumbing (`useJobFilters`).
- **Context + hooks instead of Redux.** The only global state is "the list of jobs and whether it is loading", which context handles well. Filter state belongs in the URL.
- **Job descriptions are HTML from a third party**, so they are sanitised with DOMPurify before rendering, and links inside open in a new tab with `rel="noopener noreferrer"`.
- **Plain CSS** keeps the project dependency-light and easy to read. CSS variables hold the design tokens.
- **No server, auth, saved jobs or application forms**, as the assignment scopes them out.
- **Possible next steps:** sorting options, virtualised list for very large boards, saved/bookmarked jobs, dark mode, a small serverless proxy to refresh the cache on a schedule.

## Attribution

Job data is provided by [Remotive](https://remotive.com). Following their terms, Remotive is credited in the header and footer, and every job links back to its original Remotive page. Listings are delayed by 24 hours by Remotive.
