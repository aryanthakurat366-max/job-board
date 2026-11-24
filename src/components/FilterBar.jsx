import DebouncedInput from './DebouncedInput.jsx';
import SelectField from './SelectField.jsx';
import { formatJobType } from '../utils/formatters.js';

export default function FilterBar({
  filters,
  categories,
  jobTypes,
  onChange,
  onClear,
  hasActiveFilters,
}) {
  return (
    <form className="filter-bar" role="search" onSubmit={(event) => event.preventDefault()}>
      <div className="filter-bar__search">
        <DebouncedInput
          id="search"
          label="Search"
          type="search"
          placeholder="Job title, company, skill..."
          autoComplete="off"
          value={filters.q}
          onChange={(q) => onChange({ q })}
        />
      </div>

      <SelectField
        id="category"
        label="Category"
        placeholder="All categories"
        value={filters.category}
        onChange={(category) => onChange({ category })}
        options={categories.map((category) => ({ value: category, label: category }))}
      />

      <SelectField
        id="type"
        label="Job type"
        placeholder="All types"
        value={filters.type}
        onChange={(type) => onChange({ type })}
        options={jobTypes.map((type) => ({ value: type, label: formatJobType(type) }))}
      />

      <DebouncedInput
        id="location"
        label="Location"
        type="text"
        placeholder="e.g. Worldwide, USA"
        autoComplete="off"
        value={filters.location}
        onChange={(location) => onChange({ location })}
      />

      <button
        type="button"
        className="button button--ghost filter-bar__clear"
        onClick={onClear}
        disabled={!hasActiveFilters}
      >
        Clear filters
      </button>
    </form>
  );
}
