import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCategories } from "../hooks/useCategories";
import "./Navbar.css";

export default function Navbar() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { categories } = useCategories();

  return (
    <header className="navbar">
      <div className="navbar__row">
        <Link to="/" className="navbar__logo">
          filtrix
        </Link>

        <div className="navbar__search">
          <span className="navbar__search-icon" aria-hidden="true">
            🔍
          </span>
          <input
            type="text"
            className="navbar__search-input"
            placeholder="Search sensors, trackers, cameras and more..."
          />
        </div>

        <div className="navbar__actions">
          <NavLink to="/products" className="navbar__link">
            All Products
          </NavLink>
          <a href="#" className="navbar__link">
            Blog
          </a>
          <button type="button" className="navbar__icon-btn" aria-label="Account">
            👤
          </button>
        </div>
      </div>

      <div className="navbar__categories">
        <Link
          to="/products"
          className={`navbar__pill${activeCategory === null ? " navbar__pill--active" : ""}`}
          onClick={() => setActiveCategory(null)}
        >
          All
        </Link>
        {categories.map((category) => (
          <Link
            key={category.slug}
            to={`/products?category=${category.slug}`}
            className={`navbar__pill${
              activeCategory === category.slug ? " navbar__pill--active" : ""
            }`}
            onClick={() => setActiveCategory(category.slug)}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </header>
  );
}
