import "./RadioFilter.css";

export interface RadioFilterProps {
  name: string;
  options: string[];
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
        <label key={option} className="radio-filter__option">
          <input
            type="radio"
            name={name}
            checked={selected === option}
            onChange={() => onChange(option)}
          />
          <span className="radio-filter__dot" />
          <span className="radio-filter__label">{option}</span>
        </label>
      ))}
    </div>
  );
}