import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FilterSidebar from "../components/filters/FilterSidebar";
import ProductCard from "../components/ProductCard";
import CategoryBar from "../components/CategoryBar";
import { CATEGORIES } from "../data/Catalog";
import "./ProductsPage.css";

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get("category");

  const activeCategory = CATEGORIES.find(
    (c) => c.slug === categorySlug
  );

  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    loadProducts();
  }, [categorySlug]);

  async function loadProducts() {
    const body: any = {
      filters: {},
    };

    if (categorySlug) {
      body.categorySlug = categorySlug;
    }

    const response = await fetch(
      "http://localhost:3000/products/search",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    console.log(data);

    setProducts(data);
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
          {products.length} results
        </p>
      </div>

      <div className="products-page__layout">
        <FilterSidebar />

        <div className="products-page__grid">
          {products.length === 0 && (
            <p className="products-page__empty">
              No products found.
            </p>
          )}

          {products.map((product) => (
            <ProductCard
              key={product.id}
              image=""
              title={product.title}
              details={[]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}