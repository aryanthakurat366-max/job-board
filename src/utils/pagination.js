export const PAGE_SIZE = 12;

/**
 * Slice a list into one page. The requested page is clamped into range, so a stale
 * URL like ?page=99 still shows the last page instead of an empty screen.
 */
export function paginate(items, page, pageSize = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    currentPage,
    totalPages,
    totalItems: items.length,
    startIndex: items.length === 0 ? 0 : start + 1,
    endIndex: Math.min(start + pageSize, items.length),
  };
}

/**
 * Page numbers to render, with "ellipsis" markers for gaps.
 * Example: current 6 of 20 -> [1, 'ellipsis', 5, 6, 7, 'ellipsis', 20]
 */
export function getPageNumbers(currentPage, totalPages, siblings = 1) {
  const maxWithoutGaps = siblings * 2 + 5;
  if (totalPages <= maxWithoutGaps) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const left = Math.max(currentPage - siblings, 2);
  const right = Math.min(currentPage + siblings, totalPages - 1);
  const pages = [1];

  if (left > 2) pages.push('ellipsis');
  for (let page = left; page <= right; page += 1) pages.push(page);
  if (right < totalPages - 1) pages.push('ellipsis');

  pages.push(totalPages);
  return pages;
}
