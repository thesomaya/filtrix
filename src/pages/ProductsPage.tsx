import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import FilterSidebar, {
  type FilterValues,
} from "../components/filters/FilterSidebar";
import ProductCard from "../components/ProductCard";
import { useCategories } from "../hooks/useCategories";
import { useCompare, MAX_COMPARE } from "../context/CompareContext";
import type { ApiProduct } from "../types/product";
import "./ProductsPage.css";

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get("category");
  const navigate = useNavigate();

  const { categories } = useCategories();
  const activeCategory = categories.find((c) => c.slug === categorySlug);

  const { selected, toggleCompare, isSelected, isFull, clear } = useCompare();

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [filters, setFilters] = useState<FilterValues>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug, filters]);

  async function loadProducts() {
    setLoading(true);
    try {
      const body: { categorySlug?: string; filters: FilterValues } = {
        filters,
      };
      if (categorySlug) body.categorySlug = categorySlug;

      const response = await fetch("http://localhost:3000/products/search", {
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

  return (
    <div className="products-page">
      <div className="products-page__header">
        <h1 className="products-page__title">
          {activeCategory ? activeCategory.name : "All Products"}
        </h1>
        <p className="products-page__count">
          {loading ? "Loading…" : `${products.length} results`}
        </p>
      </div>

      <div className="products-page__layout">
        <FilterSidebar categorySlug={categorySlug} onChange={setFilters} />

        <div className="products-page__grid">
          {!loading && products.length === 0 && (
            <p className="products-page__empty">No products found.</p>
          )}

          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              image={
                product.images?.length
                  ? `http://localhost:3000${product.images[0].imageUrl}`
                  : ""
              }
              title={product.title}
              details={(product.attributes ?? [])
                .slice(0, 3)
                .map((attr) => `${attr.name}: ${attr.value}`)}
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
