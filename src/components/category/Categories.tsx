import { categories } from "../../data/categories";
import CategoryCard from "./CategoryCard";
import "./Category.css";

function Categories() {
  return (
    <section className="categories">
      <h2>Browse Categories</h2>

      <div className="categories-grid">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            name={category.name}
            description={category.description}
            count={category.count}
          />
        ))}
      </div>
    </section>
  );
}

export default Categories;