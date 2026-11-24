import { useEffect, useRef, useState } from 'react';
import { useDebounce } from '../hooks/useDebounce.js';

/**
 * A text input that keeps its own text while you type, and only reports the value to the
 * parent (which writes it to the URL) after you pause. The parent's `value` stays the
 * source of truth: when it changes from outside (Clear filters, browser Back) the
 * input follows it.
 */
export default function DebouncedInput({ id, label, value, onChange, delay = 300, ...inputProps }) {
  const [text, setText] = useState(value);
  const debounced = useDebounce(text, delay);

  // Keep the latest props in a ref so the debounce effect below only fires on `debounced`.
  const latest = useRef({ value, onChange });
  useEffect(() => {
    latest.current = { value, onChange };
  });

  // Parent changed the value (e.g. cleared filters) -> follow it.
  useEffect(() => {
    setText(value);
  }, [value]);

  // User stopped typing -> report it, but only if it's actually different.
  useEffect(() => {
    if (debounced !== latest.current.value) latest.current.onChange(debounced);
  }, [debounced]);

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} value={text} onChange={(event) => setText(event.target.value)} {...inputProps} />
    </div>
  );
}
