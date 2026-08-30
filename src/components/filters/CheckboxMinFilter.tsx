import "./CheckboxMinFilter.css";

export interface CheckboxMinOption {
  value: string;
  label: string;
}

export interface CheckboxMinFilterProps {
  // Must already be ordered by sortOrder (ascending).
  options: CheckboxMinOption[];
  // The full expanded set the backend will match against
  // (selected value + everything ranked above it).
  selected: string[];
  onChange: (next: string[]) => void;
}

export default function CheckboxMinFilter({
  options,
  selected,
  onChange,
}: CheckboxMinFilterProps) {
  // The "pick" is whichever selected option has the lowest index —
  // i.e. the bottom of the expanded range, since everything else in
  // `selected` is above it and included as a consequence.
  const selectedIndex =
    selected.length > 0
      ? Math.min(
          ...selected
            .map((v) => options.findIndex((o) => o.value === v))
            .filter((i) => i !== -1),
        )
      : -1;

  const pickedValue =
    selectedIndex !== -1 ? options[selectedIndex]?.value ?? null : null;

  const handleClick = (index: number, value: string) => {
    if (value === pickedValue) {
      onChange([]); // clicking the current pick again clears it
      return;
    }
    // Send the picked value plus every option ranked at/above it.
    const expanded = options.slice(index).map((o) => o.value);
    onChange(expanded);
  };

  return (
    <div className="checkbox-min-filter">
      {options.map((option, index) => {
        const isSelected = option.value === pickedValue;
        const isIncluded = selectedIndex !== -1 && index >= selectedIndex;

        return (
          <label
            key={option.value}
            className={`checkbox-min-filter__option${
              isIncluded ? " checkbox-min-filter__option--included" : ""
            }`}
          >
            <input
              type="checkbox"
              className="checkbox-min-filter__input"
              checked={isSelected}
              onChange={() => handleClick(index, option.value)}
            />
            <span className="checkbox-min-filter__box" aria-hidden="true">
              {isIncluded && !isSelected && (
                <span className="checkbox-min-filter__check" />
              )}
            </span>
            <span className="checkbox-min-filter__text">{option.label}</span>
            {isSelected && (
              <span className="checkbox-min-filter__badge">and above</span>
            )}
          </label>
        );
      })}
    </div>
  );
}