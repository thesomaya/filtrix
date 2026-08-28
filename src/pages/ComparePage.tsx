import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCompare } from "../context/CompareContext";
import type { ApiAttribute, ApiProduct } from "../types/product";
import "./ComparePage.css";
import { API_BASE } from "../config";

interface CompareRow {
  key: string;
  label: string;
  values: string[];
  isDifferent: boolean;
}

// Same shape-checking as formatSpecValue() in ProductDetailPage.tsx —
// attr.value can be a plain string/number/boolean, a { min, max } range
// object, or an array of selected option values. String() on a range
// object just gives "[object Object]", and on an array gives a bare
// comma list with no unit, so branch on shape instead.
function formatAttributeValue(attr: ApiAttribute): string {
  const { value, unit } = attr;

  if (value === null || value === undefined) {
    return "—";
  }

  if (
    typeof value === "object" &&
    !Array.isArray(value) &&
    "min" in value &&
    "max" in value
  ) {
    const { min, max } = value as { min: number; max: number };
    return unit ? `${min} to ${max} ${unit}` : `${min} to ${max}`;
  }

  if (Array.isArray(value)) {
    const joined = value.join(", ");
    return unit ? `${joined} ${unit}` : joined;
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return unit ? `${value} ${unit}` : String(value);
}

function buildRows(products: ApiProduct[]): CompareRow[] {
  const rows: Omit<CompareRow, "isDifferent">[] = [];

  rows.push({
    key: "price",
    label: "Price",
    values: products.map((p) => `$${p.price}`),
  });
  rows.push({
    key: "category",
    label: "Category",
    values: products.map((p) => p.category.name),
  });

  // Collect every distinct attribute name across the selected products,
  // in the order it's first seen, so products missing an attribute still
  // line up in the same row as the ones that have it.
  const attrNames: string[] = [];
  for (const product of products) {
    for (const attr of product.attributes ?? []) {
      if (!attrNames.includes(attr.name)) attrNames.push(attr.name);
    }
  }

  for (const name of attrNames) {
    rows.push({
      key: `attr:${name}`,
      label: name,
      values: products.map((p) => {
        const found = (p.attributes ?? []).find((a) => a.name === name);
        return found ? formatAttributeValue(found) : "—";
      }),
    });
  }

  return rows.map((row) => ({
    ...row,
    isDifferent: new Set(row.values).size > 1,
  }));
}

export default function ComparePage() {
  const { selected, toggleCompare, clear } = useCompare();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      if (selected.length === 0) {
        setProducts([]);
        return;
      }
      setLoading(true);
      try {
        const results = await Promise.all(
          selected.map((id) =>
            fetch(`${API_BASE}/products/${id}`).then((res) => res.json()),
          ),
        );
        if (!cancelled) {
          setProducts(results.filter(Boolean) as ApiProduct[]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, [selected]);

  if (selected.length === 0) {
    return (
      <div className="compare-page">
        <p className="compare-page__empty">
          No products selected yet. Go to{" "}
          <Link to="/products">Products</Link> and pick up to 4 to compare.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="compare-page">
        <p className="compare-page__loading">Loading comparison…</p>
      </div>
    );
  }

  const rows = buildRows(products);
  const visibleRows = showOnlyDifferences
    ? rows.filter((row) => row.isDifferent)
    : rows;

  return (
    <div className="compare-page">
      <div className="compare-page__header">
        <h1 className="compare-page__title">Compare Products</h1>
        <div className="compare-page__controls">
          <label className="compare-page__toggle">
            <input
              type="checkbox"
              checked={showOnlyDifferences}
              onChange={(e) => setShowOnlyDifferences(e.target.checked)}
            />
            Show only differences
          </label>
          <button
            type="button"
            className="compare-page__clear"
            onClick={clear}
          >
            Clear all
          </button>
        </div>
      </div>

      <div className="compare-page__table-wrap">
        <table className="compare-page__table">
          <thead>
            <tr>
              <th className="compare-page__feature-col">Feature</th>
              {products.map((product) => (
                <th key={product.id} className="compare-page__product-col">
                  <div className="compare-page__product-heading">
                    <span>{product.title}</span>
                    <button
                      type="button"
                      className="compare-page__remove"
                      onClick={() => toggleCompare(product.id)}
                      aria-label={`Remove ${product.title} from comparison`}
                    >
                      ✕
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 && (
              <tr>
                <td
                  className="compare-page__no-diff"
                  colSpan={products.length + 1}
                >
                  These products don't differ on any feature.
                </td>
              </tr>
            )}
            {visibleRows.map((row) => (
              <tr
                key={row.key}
                className={
                  row.isDifferent ? "compare-page__row--different" : undefined
                }
              >
                <td className="compare-page__feature-col">{row.label}</td>
                {row.values.map((value, i) => (
                  <td key={i} className="compare-page__product-col">
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}