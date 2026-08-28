import "./RadioMinFilter.css";

export interface RadioMinOption {
  value: string;
  label: string;
}

export interface RadioMinFilterProps {
  name: string;
  // Must already be ordered by sortOrder (ascending) — the component
  // relies on array position, not the values themselves, to know which
  // options are "above" the current selection.
  options: RadioMinOption[];
  selected: string | null;
  onChange: (value: string) => void;
}

export default function RadioMinFilter({
  name,
  options,
  selected,
  onChange,
}: RadioMinFilterProps) {
  const selectedIndex = selected
    ? options.findIndex((o) => o.value === selected)
    : -1;

  return (
    <div className="radio-min-filter">
      {options.map((option, index) => {
        const isSelected = index === selectedIndex;
        // Included = this option and everything ranked at/above the pick,
        // i.e. the actual set of options the backend will match.
        const isIncluded = selectedIndex !== -1 && index >= selectedIndex;

        return (
          <label
            key={option.value}
            className={`radio-min-filter__option${
              isIncluded ? " radio-min-filter__option--included" : ""
            }`}
          >
            <input
              type="radio"
              name={name}
              className="radio-min-filter__input"
              checked={isSelected}
              onChange={() => onChange(option.value)}
            />
            <span
              className="radio-min-filter__dot"
              aria-hidden="true"
            >
              {isIncluded && !isSelected && (
                <span className="radio-min-filter__check" />
              )}
            </span>
            <span className="radio-min-filter__text">{option.label}</span>
            {isSelected && (
              <span className="radio-min-filter__badge">and above</span>
            )}
          </label>
        );
      })}
    </div>
  );
}