import { useState, type ReactNode } from "react";
import "./FilterSection.css";

export interface FilterSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export default function FilterSection({
  title,
  defaultOpen = true,
  children,
}: FilterSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="filter-section">
      <button
        type="button"
        className="filter-section__header"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span
          className={`filter-section__chevron${open ? " filter-section__chevron--open" : ""}`}
          aria-hidden="true"
        >
          ⌄
        </span>
      </button>
      {open && <div className="filter-section__body">{children}</div>}
    </div>
  );
}