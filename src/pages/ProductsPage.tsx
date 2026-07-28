import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FilterSidebar, {
  type FilterValues,
} from "../components/filters/FilterSidebar";
import ProductCard from "../components/ProductCard";
import CategoryBar from "../components/CategoryBar";
import { CATEGORIES } from "../data/Catalog";
import "./ProductsPage.css";

// Shape actually returned by ProductsService.formatProduct()
interface ApiAttribute {
  id: string;
  name: string;
  value: string | number | boolean;
}

interface ApiProduct {
  id: string;
  title: string;
  description: string | null;
  price: string;
  category: { id: string; name: string };
  attributes: ApiAttribute[];
}

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get("category");

  const activeCategory = CATEGORIES.find((c) => c.slug === categorySlug);

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
      setProducts(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="products-page">
      <div className="products-page__category-bar">
        <CategoryBar variant="light" />
      </div>

      <div className="products-page__header">
        <h1 className="products-page__title">
          {activeCategory ? activeCategory.name : "All Products"}
        </h1>
        <p className="products-page__count">
          {loading ? "Loading…" : `${products.length} results`}
        </p>
      </div>

      <div className="products-page__layout">
        <FilterSidebar onChange={setFilters} />

        <div className="products-page__grid">
          {!loading && products.length === 0 && (
            <p className="products-page__empty">No products found.</p>
          )}

          {products.map((product) => (
            <ProductCard
              key={product.id}
              image=""
              title={product.title}
              details={(product.attributes ?? [])
                .slice(0, 3)
                .map((attr) => `${attr.name}: ${attr.value}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}