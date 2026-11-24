import { useMemo } from 'react';
import DOMPurify from 'dompurify';

// Links inside job descriptions should open in a new tab, safely.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

/**
 * Job descriptions come from the API as raw HTML. We never inject that directly:
 * it is sanitised with DOMPurify first (strips <script>, inline event handlers, etc.).
 */
export default function SafeHtml({ html, className }) {
  const clean = useMemo(() => DOMPurify.sanitize(html ?? ''), [html]);
  return <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}
