import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import { useCategories } from "../hooks/useCategories";

import "./HomePage.css";

export default function HomePage() {
  const { categories } = useCategories();

  return (
    <div className="home">
      <Hero />
      
      <section className="home__categories">
        <div className="home__categories-track">
          {categories.map((category) => (
            <Link
              key={category.slug}
              to={`/products?category=${category.slug}`}
              className="home__category-pill"
            >
              <img
                className="home__category-icon"
                src={category.file || "public/3887847.png"}
                alt=""
                aria-hidden="true"
              />
              <span className="home__category-name">{category.name}</span>
            </Link>
          ))}
        </div>

        <div className="home__categories-cta">
          <Link to="/products" className="home__view-all-btn">
            View all categories
          </Link>
        </div>
      </section>

      <section className="home__stats">
        <h2 className="home__stats-title">
          100K products in 15 categories. A single objective.
        </h2>
        <p className="home__stats-copy">
          We have been working for more than a decade to become your
          reference guide when it comes to comparisons. We are an impartial
          team of technology enthusiasts: our sole mission is to help you
          make informed decisions.
        </p>
        <div className="home__divider" aria-hidden="true">
          <span />
          <span />
        </div>
      </section>

      <Footer />
    </div>
  );
}