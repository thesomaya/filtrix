interface Props {
  name: string;
  description: string;
  count: number;
}

function CategoryCard({ name, description, count }: Props) {
  return (
    <div className="category-card">
      <div className="category-icon">📡</div>

      <h3>{name}</h3>

      <p>{description}</p>

      <span>{count} Products</span>
    </div>
  );
}

export default CategoryCard;