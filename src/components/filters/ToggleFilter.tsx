import "./ToggleFilter.css";

export interface ToggleFilterProps {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}

export default function ToggleFilter({
  label,
  checked,
  onChange,
}: ToggleFilterProps) {
  return (
    <label className="toggle-filter">
      <span className="toggle-filter__label">{label}</span>
      <span className="toggle-filter__switch">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="toggle-filter__track">
          <span className="toggle-filter__thumb" />
        </span>
      </span>
    </label>
  );
}