import { Link, NavLink, useLocation, useSearchParams } from "react-router-dom";
import { useCategories } from "../hooks/useCategories";
import "./Navbar.css";

export default function Navbar() {
  const { categories } = useCategories();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const onProductsPage = location.pathname === "/products";
  const activeCategorySlug = onProductsPage ? searchParams.get("category") : null;

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
          <Link to="/login" className="navbar__icon-btn" aria-label="Account">
            👤
          </Link>
        </div>
      </div>

      <div className="navbar__categories">
        <Link
          to="/products"
          className={`navbar__pill${
            onProductsPage && !activeCategorySlug ? " navbar__pill--active" : ""
          }`}
        >
          All
        </Link>
        {categories.map((category) => (
          <Link
            key={category.slug}
            to={`/products?category=${category.slug}`}
            className={`navbar__pill${
              activeCategorySlug === category.slug ? " navbar__pill--active" : ""
            }`}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </header>
  );
}
