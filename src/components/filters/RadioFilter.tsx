import "./RadioFilter.css";

export interface RadioOption {
  value: string;
  label: string;
}

export interface RadioFilterProps {
  name: string;
  options: RadioOption[];
  selected: string | null;
  onChange: (value: string) => void;
}

export default function RadioFilter({
  name,
  options,
  selected,
  onChange,
}: RadioFilterProps) {
  return (
    <div className="radio-filter">
      {options.map((option) => {
        const checked = selected === option.value;

        return (
          <label key={option.value} className="radio-filter__option">
            <input
              type="radio"
              name={name}
              className="radio-filter__input"
              checked={checked}
              onChange={() => onChange(option.value)}
            />
            <span className="radio-filter__dot" aria-hidden="true" />
            <span className="radio-filter__text">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}
