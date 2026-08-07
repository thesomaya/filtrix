import { Link, NavLink } from "react-router-dom";
import { useCategories } from "../hooks/useCategories";
import "./Navbar.css";

export default function Navbar() {
  const { categories } = useCategories();

  return (
    <header className="navbar">
      <div className="navbar__row">
        <Link to="/" className="navbar__logo">
          filtrix
        </Link>

        <nav className="navbar__nav">
          {/* Hover-driven dropdown: opens on mouseenter via CSS, no click
              needed, so it works while navigating rather than requiring a
              click to toggle. */}
          <div className="navbar__dropdown">
            <button type="button" className="navbar__dropdown-trigger">
              All Categories
              <span className="navbar__chevron" aria-hidden="true">
                ⌄
              </span>
            </button>

            <div className="navbar__dropdown-menu">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  to={`/products?category=${category.slug}`}
                  className="navbar__dropdown-item"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          <NavLink to="/products" className="navbar__link">
            All Products
          </NavLink>
        </nav>

        <div className="navbar__actions">
          <Link to="/login" className="navbar__icon-btn" aria-label="Account">
            👤
          </Link>
        </div>
      </div>
    </header>
  );
}
