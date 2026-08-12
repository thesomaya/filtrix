import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCompare } from "../context/CompareContext";
import { useCategories } from "../hooks/useCategories";
import type { FilterGroup } from "../components/filters/FilterSidebar";
import type { ApiAttribute, ApiProduct } from "../types/product";
import "./ProductDetailPage.css";
import { API_BASE } from "../config";

interface SpecGroup {
  id: string;
  name: string;
  sortOrder: number;
  attributes: ApiAttribute[];
}

// Renders a product attribute's value for the spec table. `attr.value` can
// be a plain string/number/boolean, a { min, max } range object, or an
// array of selected option values — String() on the first/last case just
// gives "[object Object]" / a bare comma-joined list, so branch on shape.
function formatSpecValue(attr: ApiAttribute): string {
  const { value, unit } = attr;

  if (value === null || value === undefined) {
    return "—";
  }

  if (
    typeof value === "object" &&
    !Array.isArray(value) &&
    "min" in value &&
    "max" in value
  ) {
    const { min, max } = value as { min: number; max: number };
    return unit ? `${min} to ${max} ${unit}` : `${min} to ${max}`;
  }

  if (Array.isArray(value)) {
    const joined = value.join(", ");
    return unit ? `${joined} ${unit}` : joined;
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return unit ? `${value} ${unit}` : String(value);
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toggleCompare, isSelected, isFull } = useCompare();
  const { categories } = useCategories();

  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [attributeGroups, setAttributeGroups] = useState<FilterGroup[]>([]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setNotFound(false);
      setActiveImage(0);
      try {
        const res = await fetch(`${API_BASE}/products/${id}`);
        if (!res.ok) {
          if (!cancelled) setNotFound(true);
          return;
        }
        const data: ApiProduct = await res.json();
        if (!cancelled) setProduct(data);
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProduct();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // The category on a product only carries id/name, not the slug used in
  // /products?category=slug or in the /attribute-groups/search endpoint —
  // so look the matching category up by name to get its slug.
  const categoryMatch = product
    ? categories.find((c) => c.name === product.category.name)
    : undefined;

  useEffect(() => {
    if (!categoryMatch) return;
    let cancelled = false;

    async function loadAttributeGroups() {
      try {
        const res = await fetch(`${API_BASE}/attribute-groups/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ categorySlug: categoryMatch!.slug }),
        });
        const data: FilterGroup[] = await res.json();
        if (!cancelled) setAttributeGroups(data);
      } catch {
        if (!cancelled) setAttributeGroups([]);
      }
    }

    loadAttributeGroups();
    return () => {
      cancelled = true;
    };
  }, [categoryMatch]);

  if (loading) {
    return (
      <div className="product-detail">
        <p className="product-detail__status">Loading product…</p>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="product-detail">
        <p className="product-detail__status">
          We couldn't find that product.{" "}
          <Link to="/products">Back to all products</Link>
        </p>
      </div>
    );
  }

  const images = product.images ?? [];
  const attributes = product.attributes ?? [];
  const selected = isSelected(product.id);
  const specGroups: SpecGroup[] = [];
  const unmatched: ApiAttribute[] = [];

  for (const attr of attributes) {
    const group = attributeGroups.find((g) =>
      g.attributes.some((a) => a.id === attr.id || a.name === attr.name),
    );

    if (!group) {
      unmatched.push(attr);
      continue;
    }

    let bucket = specGroups.find((g) => g.id === group.id);
    if (!bucket) {
      bucket = {
        id: group.id,
        name: group.name,
        sortOrder: group.sortOrder,
        attributes: [],
      };
      specGroups.push(bucket);
    }
    bucket.attributes.push(attr);
  }

  specGroups.sort((a, b) => a.sortOrder - b.sortOrder);

  if (unmatched.length > 0) {
    specGroups.push({
      id: "__other",
      name: "Other",
      sortOrder: Number.MAX_SAFE_INTEGER,
      attributes: unmatched,
    });
  }

  return (
    <div className="product-detail">
      <nav className="product-detail__breadcrumb" aria-label="Breadcrumb">
        <Link to="/products">All Products</Link>
        <span aria-hidden="true">/</span>
        {categoryMatch ? (
          <Link to={`/products?category=${categoryMatch.slug}`}>
            {product.category.name}
          </Link>
        ) : (
          <span>{product.category.name}</span>
        )}
        <span aria-hidden="true">/</span>
        <span className="product-detail__breadcrumb-current">
          {product.title}
        </span>
      </nav>

      <div className="product-detail__layout">
        <div className="product-detail__gallery">
          <div className="product-detail__gallery-main">
            {images.length > 0 ? (
              <img
                src={`${API_BASE}${images[activeImage].imageUrl}`}
                alt={product.title}
              />
            ) : (
              <div className="product-detail__gallery-placeholder" />
            )}
          </div>

          {images.length > 1 && (
            <div className="product-detail__thumbs">
              {images.map((img, index) => (
                <button
                  key={img.id}
                  type="button"
                  className={`product-detail__thumb${
                    index === activeImage ? " product-detail__thumb--active" : ""
                  }`}
                  onClick={() => setActiveImage(index)}
                >
                  <img src={`${API_BASE}${img.imageUrl}`} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-detail__info">
          <p className="product-detail__category">{product.category.name}</p>
          <h1 className="product-detail__title">{product.title}</h1>

          {product.description && (
            <p className="product-detail__description">{product.description}</p>
          )}

          <div className="product-detail__actions">
            <label className="product-detail__compare-toggle">
              <input
                type="checkbox"
                checked={selected}
                disabled={!selected && isFull}
                onChange={() => toggleCompare(product.id)}
              />
              Add to compare
            </label>

            <button
              type="button"
              className="product-detail__compare-btn"
              disabled={!selected}
              onClick={() => navigate("/compare")}
            >
              Go to compare
            </button>
          </div>

          {specGroups.length === 0 ? (
            <p className="product-detail__no-specs">
              No additional specifications listed for this product.
            </p>
          ) : (
            <div className="product-detail__specs">
              {specGroups.map((group) => (
                <div key={group.id} className="product-detail__spec-group">
                  <h2 className="product-detail__spec-title">{group.name}</h2>
                  <dl className="product-detail__spec-list">
                    {group.attributes.map((attr) => (
                      <div key={attr.id} className="product-detail__spec-row">
                        <dt>{attr.name}</dt>
                        <dd>{formatSpecValue(attr)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}