import "./ProductCard.css";

export interface ProductCardProps {
  id: string;
  image?: string;
  title: string;
  details?: string[];
  onClick?: () => void;
  compareSelected?: boolean;
  onToggleCompare?: (id: string) => void;
  compareDisabled?: boolean;
}

export default function ProductCard({
  id,
  image = "",
  title,
  details = [],
  onClick,
  compareSelected = false,
  onToggleCompare,
  compareDisabled = false,
}: ProductCardProps) {
  return (
    <article className="product-card" onClick={onClick}>
      <div className="product-card__image-wrap">
        {onToggleCompare && (
          <label
            className="product-card__compare"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={compareSelected}
              disabled={compareDisabled && !compareSelected}
              onChange={() => onToggleCompare(id)}
            />
            Compare
          </label>
        )}

        {image ? (
          <img src={image} alt={title} className="product-card__image" />
        ) : (
          <div
            className="product-card__image product-card__image--placeholder"
            aria-hidden="true"
          />
        )}
      </div>

      <div className="product-card__body">
        <h3 className="product-card__title">{title}</h3>
        <div className="product-card__divider" aria-hidden="true" />
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