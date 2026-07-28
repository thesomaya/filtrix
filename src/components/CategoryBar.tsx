import { NavLink, useSearchParams } from "react-router-dom";
import { CATEGORIES } from "../data/Catalog";
import "./CategoryBar.css";

export interface CategoryBarProps {
  variant?: "light" | "dark";
}

export default function CategoryBar({ variant = "dark" }: CategoryBarProps) {
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get("category");

  return (
    <nav
      className={`category-bar category-bar--${variant}`}
      aria-label="Categories"
    >
      <ul className="category-bar__list">
        <li className="category-bar__item">
          <NavLink
            to="/products"
            end
            className={({ isActive }) =>
              `category-bar__pill${isActive && !activeCategory ? " category-bar__pill--active" : ""}`
            }
          >
            All
          </NavLink>
        </li>
        {CATEGORIES.map((category) => (
          <li key={category.slug} className="category-bar__item">
            <NavLink
              to={`/products?category=${category.slug}`}
              className={`category-bar__pill${activeCategory === category.slug ? " category-bar__pill--active" : ""}`}
            >
              <span className="category-bar__icon">{category.icon}</span>
              {category.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}