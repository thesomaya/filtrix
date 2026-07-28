import { useEffect, useState } from "react";
import FilterSection from "./FilterSection";
import CheckboxFilter from "./CheckboxFilter";
import RangeFilter from "./RangeFilter";
import ToggleFilter from "./ToggleFilter";
import "./FilterSidebar.css";

export interface FilterOption {
  value: string;
  displayName: string;
}

export interface FilterAttribute {
  id: string;
  slug: string;
  name: string;
  valueType: "text" | "number" | "boolean";
  allowMultiple: boolean;
  range: { min: number; max: number } | null;
  options: FilterOption[];
}

export interface FilterGroup {
  id: string;
  name: string;
  sortOrder: number;
  attributes: FilterAttribute[];
}

// What gets sent to /products/search as `filters`
export type FilterValues = Record<
  string,
  boolean | string[] | { min: number; max: number }
>;

export interface FilterSidebarProps {
  onChange: (filters: FilterValues) => void;
}

const API_BASE = "http://localhost:3000";

export default function FilterSidebar({ onChange }: FilterSidebarProps) {
  const [groups, setGroups] = useState<FilterGroup[]>([]);
  // UI-only state: what each slider currently shows (always a tuple)
  const [rangeUi, setRangeUi] = useState<Record<string, [number, number]>>({});
  // What actually gets sent to the backend
  const [values, setValues] = useState<FilterValues>({});
  const [loading, setLoading] = useState(true);

  // Fetch every available filter once on mount
  useEffect(() => {
    let cancelled = false;

    async function loadFilters() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/attribute-groups/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const data: FilterGroup[] = await res.json();
        if (!cancelled) setGroups(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFilters();
    return () => {
      cancelled = true;
    };
  }, []);

  const update = (slug: string, value: FilterValues[string]) => {
    const next = { ...values, [slug]: value };
    setValues(next);
    onChange(next);
  };

  // Remove a filter key entirely (means "no constraint", not "match nothing")
  const clear = (slug: string) => {
    const next = { ...values };
    delete next[slug];
    setValues(next);
    onChange(next);
  };

  const updateCheckbox = (slug: string, next: string[]) => {
    if (next.length === 0) {
      clear(slug);
    } else {
      update(slug, next);
    }
  };

  const updateToggle = (slug: string, next: boolean) => {
    if (next === false) {
      clear(slug);
    } else {
      update(slug, next);
    }
  };

  const updateRange = (
    slug: string,
    next: [number, number],
    bounds: { min: number; max: number },
  ) => {
    setRangeUi((prev) => ({ ...prev, [slug]: next }));
    const [low, high] = next;
    if (low <= bounds.min && high >= bounds.max) {
      // back to the full range no constraint
      clear(slug);
    } else {
      update(slug, { min: low, max: high });
    }
  };

  if (loading) {
    return (
      <aside className="filter-sidebar">
        <p className="filter-sidebar__loading">Loading filters…</p>
      </aside>
    );
  }

  if (groups.length === 0) {
    return (
      <aside className="filter-sidebar">
        <div className="filter-sidebar__header">
          <h2 className="filter-sidebar__title">Filters</h2>
        </div>
        <p className="filter-sidebar__empty">No filters available yet.</p>
      </aside>
    );
  }

  return (
    <aside className="filter-sidebar">
      <div className="filter-sidebar__header">
        <h2 className="filter-sidebar__title">Filters</h2>
      </div>

      {groups.map((group) => (
        <FilterSection key={group.id} title={group.name}>
          {group.attributes.map((attr) => {
            const current = values[attr.slug];

            if (attr.valueType === "boolean") {
              return (
                <ToggleFilter
                  key={attr.slug}
                  label={attr.name}
                  checked={Boolean(current)}
                  onChange={(next) => updateToggle(attr.slug, next)}
                />
              );
            }

            if (attr.valueType === "number" && attr.range) {
              const value = rangeUi[attr.slug] ?? [attr.range.min, attr.range.max];
              return (
                <div key={attr.slug}>
                  <p className="filter-sidebar__label">{attr.name}</p>
                  <RangeFilter
                    min={attr.range.min}
                    max={attr.range.max}
                    value={value}
                    onChange={(next) => updateRange(attr.slug, next, attr.range!)}
                  />
                </div>
              );
            }

            // text: checkbox list of every distinct value seen in the data
            return (
              <div key={attr.slug}>
                <p className="filter-sidebar__label">{attr.name}</p>
                <CheckboxFilter
                  options={attr.options.map((o) => ({
                    value: o.value,
                    label: o.displayName,
                  }))}
                  selected={(current as string[]) ?? []}
                  onChange={(next) => updateCheckbox(attr.slug, next)}
                />
              </div>
            );
          })}
        </FilterSection>
      ))}
    </aside>
  );
}