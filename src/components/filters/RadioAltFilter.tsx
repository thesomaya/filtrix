import "./RadioAltFilter.css";

export interface RadioAltOption {
  value: string;
  label: string;
}

export interface RadioAltFilterProps {
  name: string;
  options: RadioAltOption[];
  selected: string | null;
  onChange: (value: string) => void;
}

export default function RadioAltFilter({
  name,
  options,
  selected,
  onChange,
}: RadioAltFilterProps) {
  return (
    <div className="radio-alt-filter">
      {options.map((option) => {
        const checked = selected === option.value;

        return (
          <label key={option.value} className="radio-alt-filter__option">
            <input
              type="radio"
              name={name}
              className="radio-alt-filter__input"
              checked={checked}
              onChange={() => onChange(option.value)}
            />
            <span className="radio-alt-filter__dot" aria-hidden="true" />
            <span className="radio-alt-filter__text">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}