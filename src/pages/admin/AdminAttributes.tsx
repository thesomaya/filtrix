import { useEffect, useState, type FormEvent } from "react";
import "./admin.css";
import { API_BASE } from "../../config";

//const API_BASE = "https://filtrix-3y8ynhfah-filtrixd.vercel.app/";

const VALUE_TYPES = ["text", "number", "boolean"];
const FILTER_TYPES = ["checkbox", "radio", "range", "text", "toggle", "select"];
const UNITS = [
  "mm", "cm", "m", "g", "kg", "inch", "mAh", "GB", "TB",
  "MHz", "GHz", "V", "W", "hour", "percent",
];
const OPTION_TYPES = ["checkbox", "radio", "select"];

interface AttributeGroup {
  id: string;
  name: string;
}

interface AttributeOption {
  id: string;
  value: string;
  displayName: string | null;
  sortOrder: number;
}

interface Attribute {
  id: string;
  name: string;
  slug: string;
  valueType: string;
  filterType: string;
  unit: string | null;
  allowMultiple: boolean;
  groupId: string;
  group?: AttributeGroup;
  options?: AttributeOption[];
}

export default function AdminAttributes() {
  const [rows, setRows] = useState<Attribute[]>([]);
  const [groups, setGroups] = useState<AttributeGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<Attribute | null>(null);
  const [form, setForm] = useState<Partial<Attribute>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [options, setOptions] = useState<AttributeOption[]>([]);
  const [newOptionValue, setNewOptionValue] = useState("");
  const [newOptionLabel, setNewOptionLabel] = useState("");

  useEffect(() => {
    loadAttributes();
    fetch(`${API_BASE}/admin/attribute-groups`)
      .then((r) => r.json())
      .then((data) => setGroups(data))
      .catch(() => {});
  }, []);

  async function loadAttributes() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/attributes`);
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingRow(null);
    setForm({
      name: "",
      slug: "",
      valueType: "text",
      filterType: "text",
      unit: "",
      allowMultiple: false,
      groupId: "",
    });
    setOptions([]);
    setError(null);
    setModalOpen(true);
  }

  function openEdit(row: Attribute) {
    setEditingRow(row);
    setForm({ ...row });
    setOptions(row.options ?? []);
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
        ? `${API_BASE}/admin/attributes/${editingRow!.id}`
        : `${API_BASE}/admin/attributes`;
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          valueType: form.valueType,
          filterType: form.filterType,
          unit: form.unit || null,
          allowMultiple: form.allowMultiple ?? false,
          groupId: form.groupId,
        }),
      });
      if (!res.ok) throw new Error("Save failed. Check the fields and try again.");
      setModalOpen(false);
      loadAttributes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row: Attribute) {
    if (!confirm(`Delete "${row.name}"? This can't be undone.`)) return;
    try {
      await fetch(`${API_BASE}/admin/attributes/${row.id}`, { method: "DELETE" });
      loadAttributes();
    } catch {
      // no-op
    }
  }

  async function handleAddOption() {
    if (!editingRow || !newOptionValue.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/admin/attributes/${editingRow.id}/options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          value: newOptionValue,
          displayName: newOptionLabel || newOptionValue,
          sortOrder: options.length,
        }),
      });
      const created: AttributeOption = await res.json();
      setOptions((prev) => [...prev, created]);
      setNewOptionValue("");
      setNewOptionLabel("");
    } catch {
      // no-op
    }
  }

  async function handleRemoveOption(optionId: string) {
    try {
      await fetch(`${API_BASE}/admin/attribute-options/${optionId}`, { method: "DELETE" });
      setOptions((prev) => prev.filter((o) => o.id !== optionId));
    } catch {
      // no-op
    }
  }

  const showOptions = form.filterType && OPTION_TYPES.includes(form.filterType);
  const showUnit = form.valueType === "number";

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>Attributes</h1>
        <button type="button" className="admin-btn admin-btn--primary" onClick={openCreate}>
          + Add Attribute
        </button>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <p className="admin-status">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="admin-status">No attributes yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Group</th>
                <th>Value type</th>
                <th>Filter type</th>
                <th>Unit</th>
                <th className="admin-table__actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.group?.name ?? "—"}</td>
                  <td>{row.valueType}</td>
                  <td>{row.filterType}</td>
                  <td>{row.unit ?? "—"}</td>
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
            <h2>{editingRow ? "Edit Attribute" : "Add Attribute"}</h2>

            {error && <p className="admin-error">{error}</p>}

            <form className="admin-form" onSubmit={handleSubmit}>
              <label className="admin-field">
                <span>Name</span>
                <input
                  type="text"
                  required
                  value={form.name ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />
              </label>

              <label className="admin-field">
                <span>Slug</span>
                <input
                  type="text"
                  required
                  value={form.slug ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                />
              </label>

              <label className="admin-field">
                <span>Attribute group</span>
                <select
                  required
                  value={form.groupId ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, groupId: e.target.value }))}
                >
                  <option value="">—</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="admin-field">
                <span>Value type</span>
                <select
                  required
                  value={form.valueType ?? "text"}
                  onChange={(e) => setForm((p) => ({ ...p, valueType: e.target.value }))}
                >
                  {VALUE_TYPES.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>

              <label className="admin-field">
                <span>Filter type</span>
                <select
                  required
                  value={form.filterType ?? "text"}
                  onChange={(e) => setForm((p) => ({ ...p, filterType: e.target.value }))}
                >
                  {FILTER_TYPES.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>

              {showUnit && (
                <label className="admin-field">
                  <span>Unit</span>
                  <select
                    value={form.unit ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
                  >
                    <option value="">None</option>
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="admin-field admin-field--row">
                <input
                  type="checkbox"
                  checked={form.allowMultiple ?? false}
                  onChange={(e) => setForm((p) => ({ ...p, allowMultiple: e.target.checked }))}
                />
                <span>Allow selecting multiple values</span>
              </label>

              {showOptions && (
                <div className="admin-subsection">
                  <h3>Options</h3>

                  {!editingRow ? (
                    <p className="admin-subsection__hint">
                      Save the attribute first, then add its options.
                    </p>
                  ) : (
                    <>
                      {options.map((opt) => (
                        <div key={opt.id} className="admin-subsection__row">
                          <input value={opt.displayName ?? opt.value} readOnly />
                          <button
                            type="button"
                            className="admin-link-btn admin-link-btn--danger"
                            onClick={() => handleRemoveOption(opt.id)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}

                      <div className="admin-subsection__row">
                        <input
                          placeholder="Value (e.g. lte)"
                          value={newOptionValue}
                          onChange={(e) => setNewOptionValue(e.target.value)}
                        />
                        <input
                          placeholder="Display name (e.g. LTE)"
                          value={newOptionLabel}
                          onChange={(e) => setNewOptionLabel(e.target.value)}
                        />
                        <button
                          type="button"
                          className="admin-btn"
                          onClick={handleAddOption}
                          disabled={!newOptionValue.trim()}
                        >
                          Add
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

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
