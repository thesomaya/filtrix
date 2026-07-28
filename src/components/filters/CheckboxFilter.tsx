import "./CheckboxFilter.css";

export interface CheckboxFilterProps {
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}

export default function CheckboxFilter({
  options,
  selected,
  onChange,
}: CheckboxFilterProps) {
  const toggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="checkbox-filter">
      {options.map((option) => (
        <label key={option} className="checkbox-filter__option">
          <input
            type="checkbox"
            checked={selected.includes(option)}
            onChange={() => toggle(option)}
          />
          <span className="checkbox-filter__box" />
          <span className="checkbox-filter__label">{option}</span>
        </label>
      ))}
    </div>
  );
}