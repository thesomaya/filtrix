import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCategories } from "../hooks/useCategories";
import "./Navbar.css";

export default function Navbar() {
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const { categories } = useCategories();

  return (
    <header className="navbar">
      <div className="navbar__row">
        <Link to="/" className="navbar__logo">
          filtrix
        </Link>

        <nav className="navbar__links">
          <button
            type="button"
            className={`navbar__categories-toggle${categoriesOpen ? " navbar__categories-toggle--open" : ""}`}
            onClick={() => setCategoriesOpen((prev) => !prev)}
            aria-expanded={categoriesOpen}
          >
            Categories
            <span className="navbar__chevron" aria-hidden="true">
              ⌄
            </span>
          </button>
          <NavLink to="/products" className="navbar__link">
            All Products
          </NavLink>
          <a href="#" className="navbar__link">
            Blog
          </a>
        </nav>

        <div className="navbar__actions">
          <button type="button" className="navbar__icon-btn" aria-label="Account">
            👤
          </button>
        </div>
      </div>

      <div
        className={`navbar__panel${categoriesOpen ? " navbar__panel--open" : ""}`}
      >
        <div className="navbar__panel-grid">
          {categories.map((category) => (
            <Link
              key={category.slug}
              to={`/products?category=${category.slug}`}
              className="navbar__panel-item"
              onClick={() => setCategoriesOpen(false)}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}