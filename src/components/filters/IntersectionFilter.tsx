import "./IntersectionFilter.css";

export interface IntersectionFilterOption {
  value: string;
  label: string;
}

export interface IntersectionFilterProps {
  options: IntersectionFilterOption[];
  selected: string[];
  maxSelections?: number | null;
  onChange: (next: string[]) => void;
}

export default function IntersectionFilter({
  options,
  selected,
  maxSelections,
  onChange,
}: IntersectionFilterProps) {
  const limitReached =
    maxSelections != null && selected.length >= maxSelections;

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      if (limitReached) return; // safety net; disabled inputs already block this
      onChange([...selected, value]);
    }
  };


  return (
    <div className="intersection-filter">
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        const isDisabled = !isSelected && limitReached;

        return (
          <label
            key={option.value}
            className={`intersection-filter__option${
              isDisabled ? " intersection-filter__option--disabled" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={isSelected}
              disabled={isDisabled}
              onChange={() => toggle(option.value)}
            />
            <span className="intersection-filter__box" />
            <span className="intersection-filter__label">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}