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

export type FilterValues = Record<
  string,
  boolean | string[] | { min: number; max: number }
>;

export interface FilterSidebarProps {
  categorySlug?: string | null;
  onChange: (filters: FilterValues) => void;
}

const API_BASE = "http://localhost:3000";

export default function FilterSidebar({
  categorySlug,
  onChange,
}: FilterSidebarProps) {
  const [groups, setGroups] = useState<FilterGroup[]>([]);
  const [rangeUi, setRangeUi] = useState<Record<string, [number, number]>>({});
  const [values, setValues] = useState<FilterValues>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadFilters() {
      setLoading(true);

      try {
        const res = await fetch(`${API_BASE}/attribute-groups/search`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            categorySlug,
          }),
        });

        const data: FilterGroup[] = await res.json();

        if (!cancelled) {
          setGroups(data);

          // Reset filters when category changes
          setValues({});
          setRangeUi({});
          onChange({});
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFilters();

    return () => {
      cancelled = true;
    };
  }, [categorySlug, onChange]);

  const update = (slug: string, value: FilterValues[string]) => {
    const next = { ...values, [slug]: value };
    setValues(next);
    onChange(next);
  };

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
    if (!next) {
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
    setRangeUi((prev) => ({
      ...prev,
      [slug]: next,
    }));

    const [low, high] = next;

    if (low <= bounds.min && high >= bounds.max) {
      clear(slug);
    } else {
      update(slug, {
        min: low,
        max: high,
      });
    }
  };

  const clearAll = () => {
    setValues({});
    setRangeUi({});
    onChange({});
  };

  // Build a flat, readable list of the filters currently applied so we can
  // render them as removable chips in the "Active filters" panel.
  const attrBySlug = new Map<string, FilterAttribute>();
  groups.forEach((group) =>
    group.attributes.forEach((attr) => attrBySlug.set(attr.slug, attr)),
  );

  type ActiveChip = { id: string; label: string; onRemove: () => void };

  const activeChips: ActiveChip[] = [];

  Object.entries(values).forEach(([slug, value]) => {
    const attr = attrBySlug.get(slug);
    if (!attr) return;

    if (typeof value === "boolean") {
      activeChips.push({
        id: slug,
        label: attr.name,
        onRemove: () => updateToggle(slug, false),
      });
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((optionValue) => {
        const option = attr.options.find((o) => o.value === optionValue);
        activeChips.push({
          id: `${slug}:${optionValue}`,
          label: option ? option.displayName : optionValue,
          onRemove: () =>
            updateCheckbox(
              slug,
              (values[slug] as string[]).filter((v) => v !== optionValue),
            ),
        });
      });
      return;
    }

    if (value && typeof value === "object") {
      activeChips.push({
        id: slug,
        label: `${attr.name}: ${value.min} – ${value.max}`,
        onRemove: () => {
          clear(slug);
          if (attr.range) {
            setRangeUi((prev) => ({
              ...prev,
              [slug]: [attr.range!.min, attr.range!.max],
            }));
          }
        },
      });
    }
  });

  if (loading) {
    return (
      <aside className="filter-sidebar">
        <p className="filter-sidebar__loading">
          Loading filters...
        </p>
      </aside>
    );
  }

  if (groups.length === 0) {
    return (
      <aside className="filter-sidebar">
        <div className="filter-sidebar__header">
          <h2 className="filter-sidebar__title">Filters</h2>
        </div>

        <p className="filter-sidebar__empty">
          No filters available yet.
        </p>
      </aside>
    );
  }

  return (
    <aside className="filter-sidebar">
      <div className="filter-sidebar__header">
        <h2 className="filter-sidebar__title">Filters</h2>
        {activeChips.length > 0 && (
          <button
            type="button"
            className="filter-sidebar__clear"
            onClick={clearAll}
          >
            Clear
          </button>
        )}
      </div>

      <div className="filter-sidebar__scroll">
        {activeChips.length > 0 && (
          <div className="filter-sidebar__active">
            <div className="filter-sidebar__active-header">
              <h3 className="filter-sidebar__active-title">
                Active filters
              </h3>
              <button
                type="button"
                className="filter-sidebar__active-clear"
                onClick={clearAll}
                aria-label="Clear all filters"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            </div>

            <ul className="filter-sidebar__active-list">
              {activeChips.map((chip) => (
                <li key={chip.id} className="filter-sidebar__active-item">
                  <span>{chip.label}</span>
                  <button
                    type="button"
                    className="filter-sidebar__active-remove"
                    onClick={chip.onRemove}
                    aria-label={`Remove ${chip.label}`}
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {groups.map((group, index) => (
          <FilterSection
            key={group.id}
            title={group.name}
            defaultOpen={index < 2}
          >
            {group.attributes.map((attr) => {
              const current = values[attr.slug];

              if (attr.valueType === "boolean") {
                return (
                  <ToggleFilter
                    key={attr.slug}
                    label={attr.name}
                    checked={Boolean(current)}
                    onChange={(next) =>
                      updateToggle(attr.slug, next)
                    }
                  />
                );
              }

              if (attr.valueType === "number" && attr.range) {
                const value =
                  rangeUi[attr.slug] ??
                  [attr.range.min, attr.range.max];

                return (
                  <div key={attr.slug}>
                    <p className="filter-sidebar__label">
                      {attr.name}
                    </p>

                    <RangeFilter
                      min={attr.range.min}
                      max={attr.range.max}
                      value={value}
                      onChange={(next) =>
                        updateRange(
                          attr.slug,
                          next,
                          attr.range!,
                        )
                      }
                    />
                  </div>
                );
              }

              return (
                <div key={attr.slug}>
                  <p className="filter-sidebar__label">
                    {attr.name}
                  </p>

                  <CheckboxFilter
                    options={attr.options.map((o) => ({
                      value: o.value,
                      label: o.displayName,
                    }))}
                    selected={(current as string[]) ?? []}
                    onChange={(next) =>
                      updateCheckbox(attr.slug, next)
                    }
                  />
                </div>
              );
            })}
          </FilterSection>
        ))}
      </div>
    </aside>
  );
}
