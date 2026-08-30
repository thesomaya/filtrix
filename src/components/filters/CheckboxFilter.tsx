import "./CheckboxFilter.css";

export interface CheckboxFilterOption {
  value: string;
  label: string;
}

export interface CheckboxFilterProps {
  options: CheckboxFilterOption[];
  selected: string[];
  maxSelections?: number | null;
  onChange: (next: string[]) => void;
}

export default function CheckboxFilter({
  options,
  selected,
  maxSelections,
  onChange,
}: CheckboxFilterProps) {
  const limitReached =
    maxSelections != null && selected.length >= maxSelections;

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      if (maxSelections != null && maxSelections === 1) {
        // Radio-equivalent behavior: picking a new option replaces
        // whatever was selected, rather than requiring the user to
        // manually uncheck the old one first.
        onChange([value]);
        return;
      }
      if (limitReached) return;
      onChange([...selected, value]);
    }
  };

  return (
    <div className="checkbox-filter">
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        const isDisabled =
          !isSelected && limitReached && maxSelections !== 1;

        return (
          <label
            key={option.value}
            className={`checkbox-filter__option${
              isDisabled ? " checkbox-filter__option--disabled" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={isSelected}
              disabled={isDisabled}
              onChange={() => toggle(option.value)}
            />
            <span className="checkbox-filter__box" />
            <span className="checkbox-filter__label">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}