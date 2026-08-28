import "./ExcludeFilter.css";

export interface ExcludeFilterProps {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}

export default function ExcludeFilter({
  label,
  checked,
  onChange,
}: ExcludeFilterProps) {
  return (
    <label className="exclude-filter">
      <span className="exclude-filter__label">{label}</span>

      <span className="exclude-filter__option">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="exclude-filter__box" aria-hidden="true" />
        <span className="exclude-filter__text">No</span>
      </span>
    </label>
  );
}