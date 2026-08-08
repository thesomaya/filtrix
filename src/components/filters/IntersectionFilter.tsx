import "./IntersectionFilter.css";

export interface IntersectionFilterOption {
  value: string;
  label: string;
}

export interface IntersectionFilterProps {
  options: IntersectionFilterOption[];
  selected: string[];
  onChange: (next: string[]) => void;
}

export default function IntersectionFilter({
  options,
  selected,
  onChange,
}: IntersectionFilterProps) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="intersection-filter">
      {options.map((option) => (
        <label key={option.value} className="intersection-filter__option">
          <input
            type="intersection"
            checked={selected.includes(option.value)}
            onChange={() => toggle(option.value)}
          />
          <span className="intersection-filter__box" />
          <span className="intersection-filter__label">{option.label}</span>
        </label>
      ))}
    </div>
  );
}