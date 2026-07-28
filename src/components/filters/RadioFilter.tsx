import "./RadioFilter.css";

export interface RadioFilterOption {
  value: string;
  label: string;
}

export interface RadioFilterProps {
  name: string;
  options: RadioFilterOption[];
  selected: string | null;
  onChange: (next: string) => void;
}

export default function RadioFilter({
  name,
  options,
  selected,
  onChange,
}: RadioFilterProps) {
  return (
    <div className="radio-filter">
      {options.map((option) => (
        <label key={option.value} className="radio-filter__option">
          <input
            type="radio"
            name={name}
            checked={selected === option.value}
            onChange={() => onChange(option.value)}
          />
          <span className="radio-filter__dot" />
          <span className="radio-filter__label">{option.label}</span>
        </label>
      ))}
    </div>
  );
}