import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import CheckboxFilter from "./CheckboxFilter";
import IntersectionFilter from "./IntersectionFilter"
import RadioFilter from "./RadioFilter";
import RangeFilter from "./RangeFilter";
import RangeFilterInverted from "./RangeFilterInverted";
import ToggleFilter from "./ToggleFilter";
import TextFilter from "./TextFilter";
import ExcludeFilter from "./ExcludeFilter";
import RadioMinFilter from "./RadioMinFilter";
import RadioAltFilter from "./RadioAltFilter";
import CheckboxMinFilter from "./CheckboxMinFilter";
import "./FilterSidebar.css";
import { API_BASE } from "../../config";

export interface FilterOption {
  value: string;
  displayName: string;
}

export type FilterType =
  | "checkbox" | "toggle" | "radio" | "intersection" | "text" | "range"
  | "range_inverted" | "radio_min" | "toggle_exclude" | "radio_alt"  | "checkbox_min";

export type VisibilityOperator =
  | "equals"
  | "not_equals"
  | "greater_than"
  | "less_than"
  | "greater_than_or_equal"
  | "less_than_or_equal"
  | "contains"
  | "not_contains";

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
  numberType?: "integer" | "decimal" | null;
  allowMultiple: boolean;
  range: { min: number; max: number } | null;
  options: FilterOption[];
  visibilityRules?: AttributeVisibilityRule[];
  maxSelections?: number | null;
}

export interface FilterGroup {
  id: string;
  name: string;
  sortOrder: number;
  attributes: FilterAttribute[];
}

export type FilterValues = Record<
  string,
  boolean | string | string[] | { min?: number; max?: number }
>;

export interface FilterSidebarProps {
  categorySlug?: string | null;
  onChange: (filters: FilterValues) => void;
  productCount?: number;
}

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
        .includes(String(expected ?? "").toLowerCase());

    case "not_contains":
      if (Array.isArray(actual)) return !actual.includes(expected);
      return !String(actual ?? "")
        .toLowerCase()
        .includes(String(expected ?? "").toLowerCase());

    case "greater_than":
    case "greater_than_or_equal":
    case "less_than":
    case "less_than_or_equal": {
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

function isAttributeVisible(
  attr: FilterAttribute,
  values: FilterValues,
  attrById: Map<string, FilterAttribute>,
): boolean {
  if (!attr.visibilityRules || attr.visibilityRules.length === 0) return true;

  const byDependency = new Map<string, AttributeVisibilityRule[]>();
  attr.visibilityRules.forEach((rule) => {
    const list = byDependency.get(rule.dependsOnAttributeId) ?? [];
    list.push(rule);
    byDependency.set(rule.dependsOnAttributeId, list);
  });

  // Across different dependencies: AND.
  // Within the same dependency (multiple allowed values): OR.
  return Array.from(byDependency.entries()).every(([dependsOnId, rules]) => {
    const dependsOn = attrById.get(dependsOnId);
    if (!dependsOn) return true;

    const actual = values[dependsOn.slug];
    if (actual === undefined) return false;

    return rules.some((rule) => compareValues(rule.operator, actual, rule.value));
  });
}

const PortalTooltip = ({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) => {
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
          document.body,
        )}
    </>
  );
};

const renderLabel = (
  attr: FilterAttribute,
  hint?: string,
  onClear?: () => void,
) => {
  //const labelText = attr.unit ? `${attr.name} (${attr.unit})` : attr.name;
  const labelText = attr.name;

  return (
    <div className="filter-sidebar__label-container">
      <p className="filter-sidebar__label">
        {labelText}
        {hint && <span className="filter-sidebar__hint">{hint}</span>}
      </p>

      <div className="filter-sidebar__label-actions">
        {onClear && (
          <button
            type="button"
            className="filter-sidebar__clear-filter"
            onClick={onClear}
          >
            Clear
          </button>
        )}

        {attr.description && (
          <PortalTooltip text={attr.description}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
            </svg>
          </PortalTooltip>
        )}
      </div>
    </div>
  );
};

const CollapsibleSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="filter-sidebar__section-group">
      <div
        className="filter-sidebar__section-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h4 className="filter-sidebar__section-title">{title}</h4>
        <svg
          className={`filter-sidebar__section-chevron ${isOpen ? "open" : ""}`}
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
      {isOpen && (
        <div className="filter-sidebar__section-content">{children}</div>
      )}
    </div>
  );
};

const VISIBLE_FILTER_LIMIT = 4;

const FilterGroupList = ({
  attrs,
  renderFilter,
}: {
  attrs: FilterAttribute[];
  renderFilter: (attr: FilterAttribute) => React.ReactNode;
}) => {
  const [expanded, setExpanded] = useState(false);
  const hasMore = attrs.length > VISIBLE_FILTER_LIMIT;
  const visible = expanded
    ? attrs
    : attrs.slice(0, VISIBLE_FILTER_LIMIT);

  return (
    <>
      {visible.map(renderFilter)}
      {hasMore && (
        <button
          type="button"
          className="filter-sidebar__show-more"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded
            ? "Show less"
            : `Show ${attrs.length - VISIBLE_FILTER_LIMIT} more`}
        </button>
      )}
    </>
  );
};

const CollapsibleGroupCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="filter-card">
      <button
        type="button"
        className="filter-card__header"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        <h3 className="filter-card__title">{title}</h3>
        <svg
          className={`filter-sidebar__section-chevron ${isOpen ? "open" : ""}`}
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
      </button>
      {isOpen && <div className="filter-card__body">{children}</div>}
    </div>
  );
};

export default function FilterSidebar({
  categorySlug,
  onChange,
  productCount,
}: FilterSidebarProps) {
  const [groups, setGroups] = useState<FilterGroup[]>([]);
  const [rangeUi, setRangeUi] = useState<Record<string, [number, number]>>({});
  const [values, setValues] = useState<FilterValues>({});
  const [loading, setLoading] = useState(true);

  const sidebarRef = useRef<HTMLElement>(null);
  const activeFiltersRef = useRef<HTMLDivElement>(null);

  const [activeFiltersHeight, setActiveFiltersHeight] = useState(0);
  const [activeFiltersPosition, setActiveFiltersPosition] = useState({
    left: 0,
    width: 0,
  });

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
  ) => {
    setRangeUi((prev) => ({
      ...prev,
      [slug]: next,
    }));

    const [low, high] = next;

    // Dragging back out to the full min/max bounds should NOT reset/clear
    // the filter — it should just apply a range that happens to equal the
    // full bounds (still shown as active/selected). The only way to
    // actually remove the filter is the explicit "Clear" action.
    update(slug, {
      min: low,
      max: high,
    });
  };

  const resetRangeUi = (attr: FilterAttribute) => {
    if (attr.range) {
      setRangeUi((prev) => ({
        ...prev,
        [attr.slug]:
          attr.filterType === "range_inverted"
            ? [0, 0]
            : [attr.range!.min, attr.range!.max],
      }));
    }
  };

  const clearAll = () => {
    setValues({});
    setRangeUi({});
    onChange({});
  };

  const attrBySlug = new Map<string, FilterAttribute>();
  const attrById = new Map<string, FilterAttribute>();

  groups.forEach((group) =>
    group.attributes.forEach((attr) => {
      attrBySlug.set(attr.slug, attr);
      attrById.set(attr.id, attr);
    }),
  );

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
  }, [values, groups]);

  type ActiveChip = {
    id: string;
    label: string;
    onRemove: () => void;
  };

  const updateRangeInverted = (attr: FilterAttribute, next: [number, number]) => {
    setRangeUi((prev) => ({ ...prev, [attr.slug]: next }));
    const [low, high] = next;

    // low <= 0 is the "min & below" threshold, high >= 0 is the "max &
    // above" threshold. 0 on either side means that side hasn't been
    // dragged away from the (centered) default and is therefore unset.
    const filterValue: { min?: number; max?: number } = {};
    if (low < 0) filterValue.min = low;
    if (high > 0) filterValue.max = high;

    if (filterValue.min === undefined && filterValue.max === undefined) {
      clear(attr.slug);
    } else {
      update(attr.slug, filterValue);
    }
  };

// Tri-state setter for toggle_exclude: true = Yes, false = No, undefined =
// no filter. Unlike updateToggle, `false` here is a real selected value and
// must NOT be treated as "clear" — only undefined removes the filter key.
const updateExclude = (slug: string, next: boolean | undefined) => {
  setValues((prev) => {
    const updated = { ...prev };
    if (next === undefined) {
      delete updated[slug];
    } else {
      updated[slug] = next;
    }
    onChange(updated);
    return updated;
  });
};

  const activeChips: ActiveChip[] = [];

  Object.entries(values).forEach(([slug, value]) => {
    const attr = attrBySlug.get(slug);
    if (!attr) return;
    if (!isAttributeVisible(attr, values, attrById)) return;

    if (
      (attr.filterType === "toggle" || attr.filterType === "toggle_exclude") &&
      typeof value === "boolean"
    ) {
      activeChips.push({
        id: slug,
        label: attr.filterType === "toggle_exclude" ? `No ${attr.name}` : attr.name,
        onRemove: () => updateToggle(slug, false),
      });
      return;
    }

    if (
        (attr.filterType === "radio" || attr.filterType === "radio_min" || attr.filterType === "radio_alt") &&
        typeof value === "string"
      ) {
        const option = attr.options.find((o) => o.value === value);
        const label = option ? option.displayName : value;

        activeChips.push({
          id: slug,
          label: attr.filterType === "radio_min" ? `${label} & above` : label,
          onRemove: () => updateRadio(slug, ""),
        });

        return;
      }

    if (attr.filterType === "range_inverted" && value && !Array.isArray(value) && typeof value === "object") {
      const v = value as { min?: number; max?: number };
      const unit = attr.unit ? ` ${attr.unit}` : "";
      const label =
        v.min !== undefined && v.max !== undefined
          ? `${attr.name}: outside ${v.min}–${v.max}${unit}`
          : v.min !== undefined
            ? `${attr.name}: ${v.min}${unit} & below`
            : `${attr.name}: ${v.max}${unit} & above`;

      activeChips.push({ id: slug, label, onRemove: () => { clear(slug); resetRangeUi(attr); } });
    }

    if (attr.filterType === "text" && typeof value === "string") {
      activeChips.push({
        id: slug,
        label: `${attr.name}: "${value}"`,
        onRemove: () => updateText(slug, ""),
      });

      return;
    }

    if (attr.filterType === "checkbox_min" && Array.isArray(value) && value.length > 0) {
        // The picked value is whichever option has the lowest sortOrder
        // among everything in the expanded set.
        const indices = value
          .map((v) => attr.options.findIndex((o) => o.value === v))
          .filter((i) => i !== -1);
        const pickedIndex = Math.min(...indices);
        const picked = attr.options[pickedIndex];
        const label = picked ? picked.displayName : value[0];

        activeChips.push({
          id: slug,
          label: `${label} & above`,
          onRemove: () => updateCheckbox(slug, []),
        });

        return;
      }

    if (
      (attr.filterType === "checkbox" ||
        attr.filterType === "intersection") &&
      Array.isArray(value)
    ) {
      value.forEach((optionValue) => {
        const option = attr.options.find((o) => o.value === optionValue);
        const baseLabel = option ? option.displayName : optionValue;
        const label =
          attr.filterType === "checkbox_min" ? `${baseLabel} & above` : baseLabel;

        activeChips.push({
          id: `${slug}:${optionValue}`,
          label,
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

  useEffect(() => {
    const updatePosition = () => {
      if (!sidebarRef.current) return;

      const rect = sidebarRef.current.getBoundingClientRect();

      setActiveFiltersPosition({
        left: rect.left,
        width: rect.width,
      });
    };

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [loading, groups.length]);

  useEffect(() => {
    const element = activeFiltersRef.current;

    if (!element || activeChips.length === 0) {
      setActiveFiltersHeight(0);
      return;
    }

    const updateHeight = () => {
      setActiveFiltersHeight(element.offsetHeight);
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);

    return () => observer.disconnect();
  }, [activeChips.length]);

  if (loading) {
    return (
      <aside ref={sidebarRef} className="filter-sidebar">
        <p className="filter-sidebar__loading">
          Loading filters...
        </p>
      </aside>
    );
  }

  if (groups.length === 0) {
    return (
      <aside ref={sidebarRef} className="filter-sidebar">
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
    <aside ref={sidebarRef} className="filter-sidebar">
      <div className="filter-sidebar__header">
        <div className="filter-sidebar__header-titles">
          <h2 className="filter-sidebar__title">Filters</h2>

          {typeof productCount === "number" && (
            <span className="filter-sidebar__count">
              {productCount.toLocaleString()}{" "}
              {productCount === 1 ? "result" : "results"}
            </span>
          )}
        </div>

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

      <div
        className="filter-sidebar__scroll"
        style={{
          paddingBottom:
            activeChips.length > 0
              ? `${activeFiltersHeight + 24}px`
              : undefined,
        }}
      >
        {groups.map((group) => {
          const visibleAttrs = group.attributes.filter((attr) =>
            isAttributeVisible(attr, values, attrById),
          );

          if (visibleAttrs.length === 0) return null;

          const groupedAttributes = visibleAttrs.reduce(
            (acc, attr) => {
              const sectionKey = attr.section || "unsectioned";

              if (!acc[sectionKey]) {
                acc[sectionKey] = [];
              }

              acc[sectionKey].push(attr);

              return acc;
            },
            {} as Record<string, typeof visibleAttrs>,
          );

          return (
            <CollapsibleGroupCard
              key={group.id}
              title={group.name}
            >
              {Object.entries(groupedAttributes).map(
                ([sectionTitle, attrs]) => {
                  const renderFilter = (
                    attr: (typeof attrs)[number],
                  ): React.ReactNode => {
                    const current = values[attr.slug];

                    switch (attr.filterType) {
                      case "toggle":
                        return (
                          <div key={attr.slug}>
                            <ToggleFilter
                              label={attr.name}
                              checked={Boolean(current)}
                              onChange={(next) =>
                                updateToggle(attr.slug, next)
                              }
                            />
                          </div>
                        );

                      case "toggle_exclude":
                          return (
                            <div key={attr.slug}>
                              <ExcludeFilter
                                label={attr.name}
                                value={typeof current === "boolean" ? current : undefined}
                                onChange={(next) => updateExclude(attr.slug, next)}
                              />
                            </div>
                          );


                      case "range": {
                        if (!attr.range) return null;

                        const value =
                          rangeUi[attr.slug] ?? [
                            attr.range.min,
                            attr.range.max,
                          ];

                        return (
                          <div key={attr.slug}>
                            {renderLabel(
                              attr,
                              undefined,
                              current !== undefined
                                ? () => {
                                    clear(attr.slug);
                                    resetRangeUi(attr);
                                  }
                                : undefined,
                            )}

                            <RangeFilter
                              min={attr.range.min}
                              max={attr.range.max}
                              value={value}
                              unit={attr.unit ?? undefined}
                              numberType={
                                attr.numberType ?? undefined
                              }
                              active={current !== undefined}
                              onChange={(next) =>
                                updateRange(attr.slug, next)
                              }
                            />
                          </div>
                        );
                      }

                      case "range_inverted": {
                        if (!attr.range) return null;
                        const value = rangeUi[attr.slug] ?? [0, 0];

                        return (
                          <div key={attr.slug}>
                            {renderLabel(
                              attr,
                              undefined,
                              current !== undefined
                                ? () => { clear(attr.slug); resetRangeUi(attr); }
                                : undefined,
                            )}
                            <RangeFilterInverted
                              min={attr.range.min}
                              max={attr.range.max}
                              value={value as [number, number]}
                              unit={attr.unit ?? undefined}
                              numberType={attr.numberType ?? undefined}
                              active={current !== undefined}
                              onChange={(next) => updateRangeInverted(attr, next)}
                            />
                          </div>
                        );
                      }

                      case "radio_alt":
                        return (
                          <div key={attr.slug}>
                            {renderLabel(
                              attr,
                              undefined,
                              current !== undefined ? () => updateRadio(attr.slug, "") : undefined,
                            )}
                            <RadioAltFilter
                              name={attr.slug}
                              options={attr.options.map((o) => ({ value: o.value, label: o.displayName }))}
                              selected={(current as string) ?? null}
                              onChange={(next) => updateRadio(attr.slug, next)}
                            />
                          </div>
                        );

                      case "radio":
                        return (
                          <div key={attr.slug}>
                            {renderLabel(
                              attr,
                              undefined,
                              current !== undefined ? () => updateRadio(attr.slug, "") : undefined,
                            )}
                            <RadioFilter
                              name={attr.slug}
                              options={attr.options.map((o) => ({ value: o.value, label: o.displayName }))}
                              selected={(current as string) ?? null}
                              onChange={(next) => updateRadio(attr.slug, next)}
                            />
                          </div>
                        );

                      case "radio_min":
                        return (
                          <div key={attr.slug}>
                            {renderLabel(
                              attr,
                              undefined,
                              current !== undefined ? () => updateRadio(attr.slug, "") : undefined,
                            )}
                            <RadioMinFilter
                              name={attr.slug}
                              options={attr.options.map((o) => ({ value: o.value, label: o.displayName }))}
                              selected={(current as string) ?? null}
                              onChange={(next) => updateRadio(attr.slug, next)}
                            />
                          </div>
                        );

                      case "text":
                        return (
                          <div key={attr.slug}>
                            {renderLabel(
                              attr,
                              undefined,
                              current
                                ? () =>
                                    updateText(
                                      attr.slug,
                                      "",
                                    )
                                : undefined,
                            )}

                            <TextFilter
                              value={(current as string) ?? ""}
                              placeholder={`Search ${attr.name.toLowerCase()}`}
                              onChange={(next) =>
                                updateText(attr.slug, next)
                              }
                            />
                          </div>
                        );

                      case "intersection":
                        return (
                          <div key={attr.slug}>
                            {renderLabel(
                              attr,
                              undefined,
                              Array.isArray(current) &&
                                current.length > 0
                                ? () =>
                                    updateCheckbox(
                                      attr.slug,
                                      [],
                                    )
                                : undefined,
                            )}

                            <IntersectionFilter
                              options={attr.options.map((o) => ({ value: o.value, label: o.displayName }))}
                              selected={(current as string[]) ?? []}
                              maxSelections={attr.maxSelections}
                              onChange={(next) => updateCheckbox(attr.slug, next)}
                            />
                            
                          </div>
                        );
                      
                        case "checkbox_min":
                            return (
                              <div key={attr.slug}>
                                {renderLabel(
                                  attr,
                                  undefined,
                                  Array.isArray(current) && current.length > 0
                                    ? () => updateCheckbox(attr.slug, [])
                                    : undefined,
                                )}
                                <CheckboxMinFilter
                                  options={attr.options.map((o) => ({ value: o.value, label: o.displayName }))}
                                  selected={(current as string[]) ?? []}
                                  onChange={(next) => updateCheckbox(attr.slug, next)}
                                />
                              </div>
                            );
                            
                      case "checkbox":
                      default:
                        return (
                          <div key={attr.slug}>
                            {renderLabel(
                              attr,
                              undefined,
                              Array.isArray(current) &&
                                current.length > 0
                                ? () =>
                                    updateCheckbox(
                                      attr.slug,
                                      [],
                                    )
                                : undefined,
                            )}

                            <CheckboxFilter
                              options={attr.options.map((o) => ({
                                value: o.value,
                                label: o.displayName,
                              }))}
                              selected={
                                (current as string[]) ?? []
                              }
                              maxSelections={attr.maxSelections}
                              onChange={(next) =>
                                updateCheckbox(
                                  attr.slug,
                                  next,
                                )
                              }
                            />
                          </div>
                        );
                    }
                  };

                  if (sectionTitle === "unsectioned") {
                    return (
                      <div
                        key={sectionTitle}
                        className="filter-sidebar__section-group filter-sidebar__section-content"
                      >
                        <FilterGroupList
                          attrs={attrs}
                          renderFilter={renderFilter}
                        />
                      </div>
                    );
                  }

                  return (
                    <CollapsibleSection
                      key={sectionTitle}
                      title={sectionTitle}
                    >
                      <FilterGroupList
                        attrs={attrs}
                        renderFilter={renderFilter}
                      />
                    </CollapsibleSection>
                  );
                },
              )}
            </CollapsibleGroupCard>
          );
        })}
      </div>

      {activeChips.length > 0 && (
        <div
          ref={activeFiltersRef}
          className="filter-sidebar__active"
          style={{
            left: `${activeFiltersPosition.left}px`,
            width: `${activeFiltersPosition.width}px`,
          }}
        >
          <div className="filter-sidebar__active-header">
            <div className="filter-sidebar__active-title-group">
              <h3 className="filter-sidebar__active-title">
                Active filters
              </h3>

              {typeof productCount === "number" && (
                <span className="filter-sidebar__active-count">
                  {productCount.toLocaleString()}{" "}
                  {productCount === 1 ? "result" : "results"}
                </span>
              )}
            </div>

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
              <li
                key={chip.id}
                className="filter-sidebar__active-item"
              >
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
                    <line
                      x1="18"
                      y1="6"
                      x2="6"
                      y2="18"
                    />
                    <line
                      x1="6"
                      y1="6"
                      x2="18"
                      y2="18"
                    />
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