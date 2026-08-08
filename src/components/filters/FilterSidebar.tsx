import { useEffect, useState } from "react";
import FilterSection from "./FilterSection";
import CheckboxFilter from "./CheckboxFilter";
import RadioFilter from "./RadioFilter";
import RangeFilter from "./RangeFilter";
import ToggleFilter from "./ToggleFilter";
import TextFilter from "./TextFilter";
import "./FilterSidebar.css";

export interface FilterOption {
  value: string;
  displayName: string;
}

// Mirrors the `FilterType` enum in schema.prisma. This decides which
// widget an attribute renders as, independent of its underlying valueType.
export type FilterType =
  | "checkbox"
  | "toggle"
  | "radio"
  | "intersection"
  | "text"
  | "range";

// Mirrors the `VisibilityOperator` enum in schema.prisma.
export type VisibilityOperator =
  | "equals"
  | "not_equals"
  | "greater_than"
  | "less_than"
  | "greater_than_or_equal"
  | "less_than_or_equal"
  | "contains"
  | "not_contains";

// One row of the `AttributeVisibility` table: "show me only when
// `dependsOnAttributeId`'s current value satisfies `operator` `value`".
export interface AttributeVisibilityRule {
  dependsOnAttributeId: string;
  operator: VisibilityOperator;
  value: string;
}

export interface FilterAttribute {
  id: string;
  slug: string;
  name: string;
  valueType: "text" | "number" | "boolean";
  filterType: FilterType;
  allowMultiple: boolean;
  range: { min: number; max: number } | null;
  options: FilterOption[];
  // Unit of measurement for numeric attributes (e.g. "mm", "g", "hour").
  // Mirrors the `unit` column returned by the attributes API.
  unit?: string | null;
  // Rules that must ALL pass for this attribute to be shown. Absent/empty
  // means "always visible".
  visibilityRules?: AttributeVisibilityRule[];
}

export interface FilterGroup {
  id: string;
  name: string;
  sortOrder: number;
  attributes: FilterAttribute[];
}

export type FilterValues = Record<
  string,
  boolean | string | string[] | { min: number; max: number }
>;

export interface FilterSidebarProps {
  categorySlug?: string | null;
  onChange: (filters: FilterValues) => void;
}

const API_BASE = "http://localhost:3000";

// --- Visibility evaluation -------------------------------------------------

function compareValues(
  operator: VisibilityOperator,
  actual: unknown,
  expected: string,
): boolean {
  switch (operator) {
    case "equals":
      if (Array.isArray(actual)) return actual.includes(expected);
      return String(actual) === expected;

    case "not_equals":
      if (Array.isArray(actual)) return !actual.includes(expected);
      return String(actual) !== expected;

    case "contains":
      if (Array.isArray(actual)) return actual.includes(expected);
      return String(actual ?? "")
        .toLowerCase()
        .includes(expected.toLowerCase());

    case "not_contains":
      if (Array.isArray(actual)) return !actual.includes(expected);
      return !String(actual ?? "")
        .toLowerCase()
        .includes(expected.toLowerCase());

    case "greater_than":
    case "greater_than_or_equal":
    case "less_than":
    case "less_than_or_equal": {
      // For range filters there's no single "current value" — we compare
      // against the low end of the selected range.
      const actualNum =
        actual && typeof actual === "object" && "min" in (actual as object)
          ? (actual as { min: number }).min
          : Number(actual);
      const expectedNum = Number(expected);
      if (Number.isNaN(actualNum) || Number.isNaN(expectedNum)) return false;

      if (operator === "greater_than") return actualNum > expectedNum;
      if (operator === "greater_than_or_equal") return actualNum >= expectedNum;
      if (operator === "less_than") return actualNum < expectedNum;
      return actualNum <= expectedNum;
    }

    default:
      return false;
  }
}

// An attribute with no rules is always visible. Otherwise every rule must
// pass (AND), and the attribute it depends on must currently have a value
// set at all — an unset dependency can't satisfy any condition.
function isAttributeVisible(
  attr: FilterAttribute,
  values: FilterValues,
  attrById: Map<string, FilterAttribute>,
): boolean {
  if (!attr.visibilityRules || attr.visibilityRules.length === 0) return true;

  return attr.visibilityRules.every((rule) => {
    const dependsOn = attrById.get(rule.dependsOnAttributeId);
    if (!dependsOn) return true; // dependency isn't in this category, don't block rendering

    const actual = values[dependsOn.slug];
    if (actual === undefined) return false;

    return compareValues(rule.operator, actual, rule.value);
  });
}

// Appends the unit to a label when present, e.g. "Weight" -> "Weight (g)".
function labelWithUnit(attr: FilterAttribute): string {
  return attr.name;
}

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

  const updateRadio = (slug: string, next: string) => {
    if (!next) {
      clear(slug);
    } else {
      update(slug, next);
    }
  };

  const updateText = (slug: string, next: string) => {
    if (next.trim() === "") {
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

  const resetRangeUi = (attr: FilterAttribute) => {
    if (attr.range) {
      setRangeUi((prev) => ({
        ...prev,
        [attr.slug]: [attr.range!.min, attr.range!.max],
      }));
    }
  };

  const clearAll = () => {
    setValues({});
    setRangeUi({});
    onChange({});
  };

  // Lookups used both for rendering and visibility evaluation.
  const attrBySlug = new Map<string, FilterAttribute>();
  const attrById = new Map<string, FilterAttribute>();
  groups.forEach((group) =>
    group.attributes.forEach((attr) => {
      attrBySlug.set(attr.slug, attr);
      attrById.set(attr.id, attr);
    }),
  );

  // If a filter becomes hidden (its dependency changed) while it still has
  // a value applied, drop that value so results stay consistent with what
  // the person can actually see and edit.
  useEffect(() => {
    if (groups.length === 0) return;

    const hidden = groups
      .flatMap((group) => group.attributes)
      .filter(
        (attr) =>
          values[attr.slug] !== undefined &&
          !isAttributeVisible(attr, values, attrById),
      );

    if (hidden.length === 0) return;

    const next = { ...values };
    hidden.forEach((attr) => {
      delete next[attr.slug];
      resetRangeUi(attr);
    });

    setValues(next);
    onChange(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, groups]);

  type ActiveChip = { id: string; label: string; onRemove: () => void };

  const activeChips: ActiveChip[] = [];

  Object.entries(values).forEach(([slug, value]) => {
    const attr = attrBySlug.get(slug);
    if (!attr) return;
    if (!isAttributeVisible(attr, values, attrById)) return;

    if (attr.filterType === "toggle" && typeof value === "boolean") {
      activeChips.push({
        id: slug,
        label: attr.name,
        onRemove: () => updateToggle(slug, false),
      });
      return;
    }

    if (attr.filterType === "radio" && typeof value === "string") {
      const option = attr.options.find((o) => o.value === value);
      activeChips.push({
        id: slug,
        label: option ? option.displayName : value,
        onRemove: () => updateRadio(slug, ""),
      });
      return;
    }

    if (attr.filterType === "text" && typeof value === "string") {
      activeChips.push({
        id: slug,
        label: `${attr.name}: "${value}"`,
        onRemove: () => updateText(slug, ""),
      });
      return;
    }

    if (
      (attr.filterType === "checkbox" || attr.filterType === "intersection") &&
      Array.isArray(value)
    ) {
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

    if (
      attr.filterType === "range" &&
      value &&
      !Array.isArray(value) &&
      typeof value === "object"
    ) {
      activeChips.push({
        id: slug,
        label: attr.unit
          ? `${attr.name}: ${value.min} – ${value.max} ${attr.unit}`
          : `${attr.name}: ${value.min} – ${value.max}`,
        onRemove: () => {
          clear(slug);
          resetRangeUi(attr);
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

        {groups.map((group, index) => {
          const visibleAttrs = group.attributes.filter((attr) =>
            isAttributeVisible(attr, values, attrById),
          );

          // A group with every attribute currently hidden shouldn't render
          // an empty, collapsible shell.
          if (visibleAttrs.length === 0) return null;

          return (
            <FilterSection
              key={group.id}
              title={group.name}
              defaultOpen={index < 2}
            >
              {visibleAttrs.map((attr) => {
                const current = values[attr.slug];

                switch (attr.filterType) {
                  case "toggle":
                    return (
                      <ToggleFilter
                        key={attr.slug}
                        label={attr.name}
                        checked={Boolean(current)}
                        onChange={(next) => updateToggle(attr.slug, next)}
                      />
                    );

                  case "range": {
                    if (!attr.range) return null;

                    const value =
                      rangeUi[attr.slug] ?? [attr.range.min, attr.range.max];

                    return (
                      <div key={attr.slug}>
                        <p className="filter-sidebar__label">
                          {labelWithUnit(attr)}
                        </p>

                        <RangeFilter
                          min={attr.range.min}
                          max={attr.range.max}
                          value={value}
                          unit={attr.unit ?? undefined}
                          onChange={(next) =>
                            updateRange(attr.slug, next, attr.range!)
                          }
                        />
                      </div>
                    );
                  }

                  case "radio":
                    return (
                      <div key={attr.slug}>
                        <p className="filter-sidebar__label">{attr.name}</p>

                        <RadioFilter
                          name={attr.slug}
                          options={attr.options.map((o) => ({
                            value: o.value,
                            label: o.displayName,
                          }))}
                          selected={(current as string) ?? null}
                          onChange={(next) => updateRadio(attr.slug, next)}
                        />
                      </div>
                    );

                  case "text":
                    return (
                      <div key={attr.slug}>
                        <p className="filter-sidebar__label">
                          {labelWithUnit(attr)}
                        </p>

                        <TextFilter
                          value={(current as string) ?? ""}
                          placeholder={`Search ${attr.name.toLowerCase()}`}
                          onChange={(next) => updateText(attr.slug, next)}
                        />
                      </div>
                    );

                  case "intersection":
                    return (
                      <div key={attr.slug}>
                        <p className="filter-sidebar__label">
                          {attr.name}
                          <span className="filter-sidebar__hint">
                            {" "}
                            · matches all selected
                          </span>
                        </p>

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

                  case "checkbox":
                  default:
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
                }
              })}
            </FilterSection>
          );
        })}
      </div>
    </aside>
  );
}
