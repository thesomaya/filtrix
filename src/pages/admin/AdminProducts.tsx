import { useEffect, useState, type FormEvent } from "react";
import "./admin.css";

const API_BASE = "http://localhost:3000";

interface Category {
  id: string;
  name: string;
}

interface AttributeDef {
  id: string;
  name: string;
  valueType: "text" | "number" | "boolean";
  unit: string | null;
}

interface ProductImage {
  id: string;
  fileId: string;
  imageUrl?: string;
  isPrimary: boolean;
}

interface ProductAttributeValue {
  attributeId: string;
  textValue?: string | null;
  numberValue?: string | null;
  booleanValue?: boolean | null;
}

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: string;
  isFeatured: boolean;
  categoryId: string;
  category?: Category;
  images?: ProductImage[];
  attributes?: ProductAttributeValue[];
}

function attrValueFor(attr: AttributeDef, values: Record<string, any>) {
  return values[attr.id] ?? (attr.valueType === "boolean" ? false : "");
}

export default function AdminProducts() {
  const [rows, setRows] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<Product>>({});
  const [attrDefs, setAttrDefs] = useState<AttributeDef[]>([]);
  const [attrValues, setAttrValues] = useState<Record<string, any>>({});
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
    fetch(`${API_BASE}/admin/categories`)
      .then((r) => r.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/products`);
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  // Load the attributes relevant to whichever category is selected, so the
  // form only shows spec fields that actually apply to this product.
  useEffect(() => {
    if (!form.categoryId) {
      setAttrDefs([]);
      return;
    }
    let cancelled = false;
    fetch(`${API_BASE}/admin/categories/${form.categoryId}/attributes`)
      .then((r) => r.json())
      .then((data: AttributeDef[]) => {
        if (!cancelled) setAttrDefs(data);
      })
      .catch(() => {
        if (!cancelled) setAttrDefs([]);
      });
    return () => {
      cancelled = true;
    };
  }, [form.categoryId]);

  function openCreate() {
    setEditingRow(null);
    setForm({ title: "", description: "", price: "", isFeatured: false, categoryId: "" });
    setAttrValues({});
    setImages([]);
    setError(null);
    setModalOpen(true);
  }

  function openEdit(row: Product) {
    setEditingRow(row);
    setForm({ ...row });
    const values: Record<string, any> = {};
    (row.attributes ?? []).forEach((a) => {
      values[a.attributeId] = a.textValue ?? a.numberValue ?? a.booleanValue ?? "";
    });
    setAttrValues(values);
    setImages(row.images ?? []);
    setError(null);
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const isEdit = Boolean(editingRow);
      const url = isEdit
        ? `${API_BASE}/admin/products/${editingRow!.id}`
        : `${API_BASE}/admin/products`;

      const attributes = attrDefs.map((attr) => ({
        attributeId: attr.id,
        value: attrValueFor(attr, attrValues),
      }));

      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          price: form.price,
          isFeatured: form.isFeatured ?? false,
          categoryId: form.categoryId,
          attributes,
        }),
      });
      if (!res.ok) throw new Error("Save failed. Check the fields and try again.");
      setModalOpen(false);
      loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row: Product) {
    if (!confirm(`Delete "${row.title}"? This can't be undone.`)) return;
    try {
      await fetch(`${API_BASE}/admin/products/${row.id}`, { method: "DELETE" });
      loadProducts();
    } catch {
      // no-op
    }
  }

  async function handleUploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    if (!editingRow || !e.target.files?.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", e.target.files[0]);
      const res = await fetch(`${API_BASE}/admin/products/${editingRow.id}/images`, {
        method: "POST",
        body: formData,
      });
      const created: ProductImage = await res.json();
      setImages((prev) => [...prev, created]);
    } catch {
      // no-op
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleRemoveImage(imageId: string) {
    try {
      await fetch(`${API_BASE}/admin/product-images/${imageId}`, { method: "DELETE" });
      setImages((prev) => prev.filter((i) => i.id !== imageId));
    } catch {
      // no-op
    }
  }

  async function handleSetPrimary(imageId: string) {
    try {
      await fetch(`${API_BASE}/admin/product-images/${imageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrimary: true }),
      });
      setImages((prev) => prev.map((i) => ({ ...i, isPrimary: i.id === imageId })));
    } catch {
      // no-op
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>Products</h1>
        <button type="button" className="admin-btn admin-btn--primary" onClick={openCreate}>
          + Add Product
        </button>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <p className="admin-status">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="admin-status">No products yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Price</th>
                <th>Featured</th>
                <th className="admin-table__actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.title}</td>
                  <td>{row.category?.name ?? "—"}</td>
                  <td>${row.price}</td>
                  <td>
                    {row.isFeatured ? (
                      <span className="admin-badge admin-badge--blue">Featured</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="admin-table__actions">
                    <button type="button" className="admin-link-btn" onClick={() => openEdit(row)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="admin-link-btn admin-link-btn--danger"
                      onClick={() => handleDelete(row)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingRow ? "Edit Product" : "Add Product"}</h2>

            {error && <p className="admin-error">{error}</p>}

            <form className="admin-form" onSubmit={handleSubmit}>
              <label className="admin-field">
                <span>Title</span>
                <input
                  type="text"
                  required
                  value={form.title ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                />
              </label>

              <label className="admin-field">
                <span>Description</span>
                <textarea
                  value={form.description ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                />
              </label>

              <label className="admin-field">
                <span>Price</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.price ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                />
              </label>

              <label className="admin-field">
                <span>Category</span>
                <select
                  required
                  value={form.categoryId ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
                >
                  <option value="">—</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="admin-field admin-field--row">
                <input
                  type="checkbox"
                  checked={form.isFeatured ?? false}
                  onChange={(e) => setForm((p) => ({ ...p, isFeatured: e.target.checked }))}
                />
                <span>Featured product</span>
              </label>

              {attrDefs.length > 0 && (
                <div className="admin-subsection">
                  <h3>Specifications</h3>
                  {attrDefs.map((attr) => (
                    <label key={attr.id} className="admin-field">
                      <span>
                        {attr.name}
                        {attr.unit ? ` (${attr.unit})` : ""}
                      </span>
                      {attr.valueType === "boolean" ? (
                        <input
                          type="checkbox"
                          checked={Boolean(attrValues[attr.id])}
                          onChange={(e) =>
                            setAttrValues((p) => ({ ...p, [attr.id]: e.target.checked }))
                          }
                        />
                      ) : (
                        <input
                          type={attr.valueType === "number" ? "number" : "text"}
                          value={attrValues[attr.id] ?? ""}
                          onChange={(e) =>
                            setAttrValues((p) => ({ ...p, [attr.id]: e.target.value }))
                          }
                        />
                      )}
                    </label>
                  ))}
                </div>
              )}

              <div className="admin-subsection">
                <h3>Images</h3>

                {!editingRow ? (
                  <p className="admin-subsection__hint">
                    Save the product first, then upload images.
                  </p>
                ) : (
                  <>
                    {images.map((img) => (
                      <div key={img.id} className="admin-subsection__row">
                        <span style={{ flex: 1 }}>
                          {img.isPrimary ? "★ Primary" : "Image"} — {img.fileId}
                        </span>
                        {!img.isPrimary && (
                          <button
                            type="button"
                            className="admin-link-btn"
                            onClick={() => handleSetPrimary(img.id)}
                          >
                            Make primary
                          </button>
                        )}
                        <button
                          type="button"
                          className="admin-link-btn admin-link-btn--danger"
                          onClick={() => handleRemoveImage(img.id)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}

                    <input type="file" accept="image/*" onChange={handleUploadImage} disabled={uploading} />
                    {uploading && <p className="admin-subsection__hint">Uploading…</p>}
                  </>
                )}
              </div>

              <div className="admin-modal__actions">
                <button type="button" className="admin-btn" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
