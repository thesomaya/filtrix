import { useEffect, useState } from "react";
import "./TextFilter.css";

export interface TextFilterProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

// Debounces keystrokes before pushing them up, so a text filter doesn't
// trigger a products-search request on every character typed.
export default function TextFilter({
  value,
  placeholder,
  onChange,
}: TextFilterProps) {
  const [draft, setDraft] = useState(value);

  // Stay in sync if the value is cleared elsewhere (e.g. "Clear" button,
  // active-filter chip removal, or a hidden/visible toggle resetting it).
  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (draft !== value) onChange(draft);
    }, 350);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  return (
    <input
      type="text"
      className="text-filter__input"
      value={draft}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
    />
  );
}
