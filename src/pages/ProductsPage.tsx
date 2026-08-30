import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import FilterSidebar, {
  type FilterValues,
} from "../components/filters/FilterSidebar";
import ProductCard from "../components/ProductCard";
import { useCategories } from "../hooks/useCategories";
import { useCompare, MAX_COMPARE } from "../context/CompareContext";
import type { ApiAttribute, ApiProduct } from "../types/product";
import "./ProductsPage.css";
import { API_BASE } from "../config";

// Renders a product attribute's value for the card preview. Mirrors
// formatSpecValue() in ProductDetailPage.tsx — `attr.value` can be a plain
// string/number/boolean, a { min, max } range object, or an array of
// selected option values, so it needs the same shape-checking instead of
// a raw template-string interpolation (which just gives "[object Object]"
// for a range, or a bare comma list for an array).
function formatAttributeDetail(attr: ApiAttribute): string {
  const { name, value, unit } = attr;

  if (value === null || value === undefined) {
    return `${name}: —`;
  }

  if (
    typeof value === "object" &&
    !Array.isArray(value) &&
    "min" in value &&
    "max" in value
  ) {
    const { min, max } = value as { min: number; max: number };
    return unit ? `${name}: ${min} to ${max} ${unit}` : `${name}: ${min} to ${max}`;
  }

  if (Array.isArray(value)) {
    const joined = value.join(", ");
    return unit ? `${name}: ${joined} ${unit}` : `${name}: ${joined}`;
  }

  if (typeof value === "boolean") {
    return `${name}: ${value ? "Yes" : "No"}`;
  }

  return unit ? `${name}: ${value} ${unit}` : `${name}: ${value}`;
}

// True if this product's title matches the search text, OR its Brand
// attribute value matches. Title matching is unchanged from before; brand
// matching is what lets "xirgo" surface Xirgo products even when "xirgo"
// isn't in the title itself (the brand filter checkbox also gets
// auto-selected in FilterSidebar, so the backend already narrows results —
// this client-side check just keeps things consistent while that filter
// change round-trips).
function matchesSearch(product: ApiProduct, searchLower: string): boolean {
  if (!searchLower) return true;

  if (product.title.toLowerCase().includes(searchLower)) return true;

  const brandAttr = product.attributes?.find(
    (attr) => attr.name.toLowerCase() === "brand",
  );

  if (brandAttr && typeof brandAttr.value === "string") {
    return brandAttr.value.toLowerCase().includes(searchLower);
  }

  return false;
}

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get("category");
  const searchQuery = searchParams.get("search") ?? "";
  const navigate = useNavigate();

  const { categories } = useCategories();
  const activeCategory = categories.find((c) => c.slug === categorySlug);

  const { selected, toggleCompare, isSelected, isFull, clear } = useCompare();

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [filters, setFilters] = useState<FilterValues>({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(searchQuery);

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug, filters]);

  useEffect(() => {
    setSearch(searchQuery);
  }, [searchQuery]);

  async function loadProducts() {
    setLoading(true);
    try {
      const body: { categorySlug?: string; filters: FilterValues } = {
        filters,
      };
      if (categorySlug) body.categorySlug = categorySlug;

      const response = await fetch(`${API_BASE}/products/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data: ApiProduct[] = await response.json();
      console.log(data);
      setProducts(data);
    } finally {
      setLoading(false);
    }
  }

  const searchLower = search.trim().toLowerCase();
  const visibleProducts = searchLower
    ? products.filter((p) => matchesSearch(p, searchLower))
    : products;

  return (
    <div className="products-page">
      <div className="products-page__header">
        <h1 className="products-page__title">
          {activeCategory ? activeCategory.name : "All Products"}
        </h1>
        <p className="products-page__count">
          {loading ? "Loading…" : `${visibleProducts.length} results`}
        </p>

        <div className="products-page__search">
          <svg
            className="products-page__search-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="products-page__search-input"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="products-page__search-clear"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="products-page__categories">
        <Link
          to="/products"
          className={`products-page__pill ${
            !categorySlug ? "products-page__pill--active" : ""
          }`}
        >
          All
        </Link>
        {categories.map((category) => (
          <Link
            key={category.slug}
            to={`/products?category=${category.slug}`}
            className={`products-page__pill ${
              categorySlug === category.slug
                ? "products-page__pill--active"
                : ""
            }`}
          >
            {category.name}
          </Link>
        ))}
      </div>

      <div className="products-page__layout">
        <FilterSidebar
          categorySlug={categorySlug}
          onChange={setFilters}
          productCount={loading ? undefined : visibleProducts.length}
          searchQuery={search}
        />

        <div className="products-page__grid">
          {!loading && visibleProducts.length === 0 && (
            <p className="products-page__empty">
              {search
                ? `No products match "${search}".`
                : "No products found."}
            </p>
          )}

          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              image={
                product.images?.[0]?.url
                  ? product.images[0].url
                  : ""
              }
              title={product.title}
              details={(product.attributes ?? [])
                .slice(0, 3)
                .map(formatAttributeDetail)}
              compareSelected={isSelected(product.id)}
              onToggleCompare={toggleCompare}
              compareDisabled={isFull}
            />
          ))}
        </div>
      </div>

      {selected.length > 0 && (
        <div className="products-page__compare-bar">
          <span className="products-page__compare-count">
            {selected.length}/{MAX_COMPARE} selected for comparison
          </span>
          <button
            type="button"
            className="products-page__compare-clear"
            onClick={clear}
          >
            Clear
          </button>
          <button
            type="button"
            className="products-page__compare-action"
            disabled={selected.length < 2}
            onClick={() => navigate("/compare")}
          >
            Compare
          </button>
        </div>
      )}
    </div>
  );
}
