import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import ProductCard from "../components/ProductCard";
import { useCategories } from "../hooks/useCategories";
import type { ApiProduct } from "../types/product";

import "./HomePage.css";

const API_BASE = "http://localhost:3000";
const FEATURED_CATEGORY_SLUG = "sensors";

export default function HomePage() {
  const { categories } = useCategories();
  const [featured, setFeatured] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadFeatured() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/products/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categorySlug: FEATURED_CATEGORY_SLUG,
            filters: {},
          }),
        });
        const data: ApiProduct[] = await res.json();
        if (!cancelled) setFeatured(data.slice(0, 5));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFeatured();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="home">
      <Hero />

      <section className="home__section">
        <div className="home__section-header">
          <h2 className="home__section-title">
            Grab the best deals on <span className="home__section-highlight">Sensors</span>
          </h2>
          <Link to="/products" className="home__see-all">
            View All →
          </Link>
        </div>
        <div className="home__product-grid">
          {loading && (
            <p className="home__section-status">Loading…</p>
          )}
          {!loading && featured.length === 0 && (
            <p className="home__section-status">No products found.</p>
          )}
          {featured.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              image={
                product.images?.length
                  ? `${API_BASE}${product.images[0].imageUrl}`
                  : ""
              }
              title={product.title}
              details={(product.attributes ?? [])
                .slice(0, 3)
                .map((attr) => `${attr.name}: ${attr.value}`)}
            />
          ))}
        </div>
      </section>

      <section className="home__section">
        <div className="home__section-header">
          <h2 className="home__section-title">
            Shop From <span className="home__section-highlight">Top Categories</span>
          </h2>
          <Link to="/products" className="home__see-all">
            View All →
          </Link>
        </div>
        <div className="home__category-grid">
          {categories.map((category) => (
            <Link
              key={category.slug}
              to={`/products?category=${category.slug}`}
              className="home__category-tile"
            >
              <span className="home__category-icon"></span>
              <span className="home__category-name">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
