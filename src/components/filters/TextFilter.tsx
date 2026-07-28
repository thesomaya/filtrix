import "./TextFilter.css";

export interface TextFilterProps {
  value: string;
  placeholder?: string;
  onChange: (next: string) => void;
}

export default function TextFilter({
  value,
  placeholder,
  onChange,
}: TextFilterProps) {
  return (
    <input
      type="text"
      className="text-filter"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}