import "./ProductCard.css";

export interface ProductCardProps {
  image: string;
  title: string;
  details: string[];
  onClick?: () => void;
}

export default function ProductCard({
  image,
  title,
  details,
  onClick,
}: ProductCardProps) {
  return (
    <article className="product-card" onClick={onClick}>
      <div className="product-card__image-wrap">
        <img src={image} alt={title} className="product-card__image" />
      </div>
      <div className="product-card__body">
        <h3 className="product-card__title">{title}</h3>
        <ul className="product-card__details">
          {details.map((detail) => (
            <li key={detail} className="product-card__detail">
              {detail}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}