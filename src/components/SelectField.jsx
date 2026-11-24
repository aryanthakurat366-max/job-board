/** A labelled <select>. `options` is a list of { value, label }. */
export default function SelectField({ id, label, value, onChange, options, placeholder }) {
  // If the URL holds a value that isn't in the list, still show it so the select isn't blank.
  const hasValue = !value || options.some((option) => option.value === value);
  const allOptions = hasValue ? options : [...options, { value, label: value }];

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{placeholder}</option>
        {allOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
