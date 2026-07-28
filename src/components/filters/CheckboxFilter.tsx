import "./CheckboxFilter.css";

export interface CheckboxFilterOption {
  value: string;
  label: string;
}

export interface CheckboxFilterProps {
  options: CheckboxFilterOption[];
  selected: string[];
  onChange: (next: string[]) => void;
}

export default function CheckboxFilter({
  options,
  selected,
  onChange,
}: CheckboxFilterProps) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="checkbox-filter">
      {options.map((option) => (
        <label key={option.value} className="checkbox-filter__option">
          <input
            type="checkbox"
            checked={selected.includes(option.value)}
            onChange={() => toggle(option.value)}
          />
          <span className="checkbox-filter__box" />
          <span className="checkbox-filter__label">{option.label}</span>
        </label>
      ))}
    </div>
  );
}