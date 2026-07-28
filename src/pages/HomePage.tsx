import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import ProductCard from "../components/ProductCard";
import { CATEGORIES, PRODUCTS } from "../data/Catalog";
import "./HomePage.css";

export default function HomePage() {
  const featured = PRODUCTS.slice(0, 4);

  return (
    <div className="home">
      <Hero />

      <section className="home__section">
        <div className="home__section-header">
          <h2 className="home__section-title">Shop by category</h2>
          <p className="home__section-subtitle">
            Jump straight to the devices you're comparing
          </p>
        </div>
        <div className="home__category-grid">
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              to={`/products?category=${category.slug}`}
              className="home__category-tile"
            >
              <span className="home__category-icon">{category.icon}</span>
              <span className="home__category-name">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home__section home__section--muted">
        <div className="home__section-header">
          <h2 className="home__section-title">Featured products</h2>
          <p className="home__section-subtitle">
            Popular picks across every category
          </p>
        </div>
        <div className="home__product-grid">
          {featured.map((product) => (
            <ProductCard
              key={product.id}
              image={product.image}
              title={product.title}
              details={product.details}
            />
          ))}
        </div>
        <div className="home__section-footer">
          <Link to="/products" className="home__see-all">
            See all products →
          </Link>
        </div>
      </section>
    </div>
  );
}