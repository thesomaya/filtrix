import "./ExcludeFilter.css";

export interface ExcludeFilterProps {
  label: string;
  // undefined = no filter applied, true = "Yes" selected, false = "No" selected
  value: boolean | undefined;
  onChange: (next: boolean | undefined) => void;
}

export default function ExcludeFilter({
  label,
  value,
  onChange,
}: ExcludeFilterProps) {
  const isYes = value === true;
  const isNo = value === false;

  return (
    <div className="exclude-filter">
      <span className="exclude-filter__label">{label}</span>

      <div className="exclude-filter__controls">
        <label className="exclude-filter__yes-switch">
          <input
            type="checkbox"
            checked={isYes}
            aria-label={`${label}: Yes`}
            // Clicking Yes while it's already on clears the filter;
            // clicking it while No is selected switches straight to Yes.
            onChange={(e) => onChange(e.target.checked ? true : undefined)}
          />
          <span className="exclude-filter__yes-track">
            <span className="exclude-filter__yes-thumb" />
          </span>
        </label>

        <label className="exclude-filter__option">
          <input
            type="checkbox"
            checked={isNo}
            onChange={(e) => onChange(e.target.checked ? false : undefined)}
          />
          <span className="exclude-filter__box" aria-hidden="true" />
          <span className="exclude-filter__text">No</span>
        </label>
      </div>
    </div>
  );
}