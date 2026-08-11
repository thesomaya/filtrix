import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
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
  section?: string | null;
  description?: string | null;
  valueType: "text" | "number" | "boolean";
  filterType: FilterType;
  unit?: string | null;
  allowMultiple: boolean;
  range: { min: number; max: number } | null;
  options: FilterOption[];
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

  // 1. The Portal Component
const PortalTooltip = ({ text, children }: { text: string; children: React.ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + rect.height / 2,
        left: rect.right + 10,
      });
      setVisible(true);
    }
  };

  // Hide the tooltip if the user scrolls the sidebar so it doesn't detach and float away
  useEffect(() => {
    if (visible) {
      const handleScroll = () => setVisible(false);
      window.addEventListener("scroll", handleScroll, true); 
      return () => window.removeEventListener("scroll", handleScroll, true);
    }
  }, [visible]);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setVisible(false)}
        className="filter-sidebar__tooltip-trigger"
      >
        {children}
      </div>
      {visible &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="filter-sidebar__portal-tooltip"
            style={{ top: coords.top, left: coords.left }}
          >
            <div className="filter-sidebar__portal-arrow" />
            {text}
          </div>,
          document.body
        )}
    </>
  );
};

// 2. The Updated Label Renderer
const renderLabel = (attr: FilterAttribute, hint?: string) => {
  const labelText = attr.unit ? `${attr.name} (${attr.unit})` : attr.name;

  return (
    <div className="filter-sidebar__label-container">
      <p className="filter-sidebar__label">
        {labelText}
        {hint && <span className="filter-sidebar__hint">{hint}</span>}
      </p>

      {attr.description && (
        <PortalTooltip text={attr.description}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
          </svg>
        </PortalTooltip>
      )}
    </div>
  );
};

  const CollapsibleSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="filter-sidebar__section-group">
      <div
        className="filter-sidebar__section-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h4 className="filter-sidebar__section-title">{title}</h4>
        <svg
          className={`filter-sidebar__section-chevron ${isOpen ? 'open' : ''}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {isOpen && <div className="filter-sidebar__section-content">{children}</div>}
    </div>
  );
};

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
        {groups.map((group, index) => {
          const visibleAttrs = group.attributes.filter((attr) =>
            isAttributeVisible(attr, values, attrById),
          );

          // A group with every attribute currently hidden shouldn't render
          // an empty, collapsible shell.
          if (visibleAttrs.length === 0) return null;

          const groupedAttributes = visibleAttrs.reduce((acc, attr) => {
            const sectionKey = attr.section || "unsectioned";
            if (!acc[sectionKey]) {
              acc[sectionKey] = [];
            }
            acc[sectionKey].push(attr);
            return acc;
          }, {} as Record<string, typeof visibleAttrs>);

          return (
            // The top-level group (e.g., "Design") is now its own separate card block
            <div key={group.id} className="filter-card">
              <h3 className="filter-card__title">{group.name}</h3>

              <div className="filter-card__body">
                {Object.entries(groupedAttributes).map(([sectionTitle, attrs]) => {
                  
                  // Helper function to keep the switch statement clean
                  const renderFilters = () => attrs.map((attr) => {
                    const current = values[attr.slug];

                    switch (attr.filterType) {
                      case "toggle":
                        return (
                          <div key={attr.slug}>
                            <ToggleFilter
                              label={attr.name}
                              checked={Boolean(current)}
                              onChange={(next) => updateToggle(attr.slug, next)}
                            />
                          </div>
                        );

                      case "range": {
                        if (!attr.range) return null;

                        const value =
                          rangeUi[attr.slug] ?? [attr.range.min, attr.range.max];

                        return (
                          <div key={attr.slug}>
                            {renderLabel(attr)}
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
                            {renderLabel(attr)}

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
                            {renderLabel(attr)}

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
                            {renderLabel(attr)}

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
                            {renderLabel(attr)}

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
                  });

                  // If there is no section assigned, just render the filters normally
                  if (sectionTitle === "unsectioned") {
                    return (
                      <div
                        key={sectionTitle}
                        className="filter-sidebar__section-group filter-sidebar__section-content"
                      >
                        {renderFilters()}
                      </div>
                    );
                  }

                  // If it has a section (e.g., "DIMENSIONS"), render it with the new collapsible toggle
                  return (
                    <CollapsibleSection key={sectionTitle} title={sectionTitle}>
                      {renderFilters()}
                    </CollapsibleSection>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {activeChips.length > 0 && (
        <div className="filter-sidebar__active">
          <div className="filter-sidebar__active-header">
            <h3 className="filter-sidebar__active-title">Active filters</h3>
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
    </aside>
  );
}
