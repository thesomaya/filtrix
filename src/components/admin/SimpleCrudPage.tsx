import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import "../../pages/admin/admin.css";
import { API_BASE } from "../../config";

//const API_BASE = "https://filtrix-3y8ynhfah-filtrixd.vercel.app/";

export type FieldType = "text" | "textarea" | "number" | "boolean" | "select";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  /** Fetched once on mount; expects an array of records with `id` and `name`. */
  optionsEndpoint?: string;
}

export interface ColumnConfig {
  key: string;
  label: string;
  render?: (row: Record<string, any>) => ReactNode;
}

export interface SimpleCrudPageProps {
  title: string;
  endpoint: string;
  columns: ColumnConfig[];
  fields: FieldConfig[];
  allowCreate?: boolean;
  allowDelete?: boolean;
}

export default function SimpleCrudPage({
  title,
  endpoint,
  columns,
  fields,
  allowCreate = true,
  allowDelete = true,
}: SimpleCrudPageProps) {
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<Record<string, any> | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, SelectOption[]>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  useEffect(() => {
    fields.forEach((f) => {
      if (f.type === "select" && f.optionsEndpoint) {
        fetch(`${API_BASE}${f.optionsEndpoint}`)
          .then((r) => r.json())
          .then((data: { id: string | number; name: string }[]) => {
            setDynamicOptions((prev) => ({
              ...prev,
              [f.key]: data.map((d) => ({ value: String(d.id), label: d.name })),
            }));
          })
          .catch(() => {});
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  async function loadRows() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}${endpoint}`);
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  function singular() {
    return title.endsWith("s") ? title.slice(0, -1) : title;
  }

  function openCreate() {
    setEditingRow(null);
    const initial: Record<string, any> = {};
    fields.forEach((f) => {
      initial[f.key] = f.type === "boolean" ? false : "";
    });
    setFormValues(initial);
    setError(null);
    setModalOpen(true);
  }

  function openEdit(row: Record<string, any>) {
    setEditingRow(row);
    const initial: Record<string, any> = {};
    fields.forEach((f) => {
      initial[f.key] = row[f.key] ?? (f.type === "boolean" ? false : "");
    });
    setFormValues(initial);
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
        ? `${API_BASE}${endpoint}/${editingRow!.id}`
        : `${API_BASE}${endpoint}`;
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });
      if (!res.ok) throw new Error("Save failed. Check the fields and try again.");
      setModalOpen(false);
      loadRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row: Record<string, any>) {
    if (!confirm(`Delete this ${singular().toLowerCase()}? This can't be undone.`)) return;
    try {
      await fetch(`${API_BASE}${endpoint}/${row.id}`, { method: "DELETE" });
      loadRows();
    } catch {
      // no-op — table stays as-is, admin can retry
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>{title}</h1>
        {allowCreate && (
          <button type="button" className="admin-btn admin-btn--primary" onClick={openCreate}>
            + Add {singular()}
          </button>
        )}
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <p className="admin-status">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="admin-status">No records yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
                <th className="admin-table__actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  {columns.map((c) => (
                    <td key={c.key}>
                      {c.render ? c.render(row) : String(row[c.key] ?? "—")}
                    </td>
                  ))}
                  <td className="admin-table__actions">
                    <button type="button" className="admin-link-btn" onClick={() => openEdit(row)}>
                      Edit
                    </button>
                    {allowDelete && (
                      <button
                        type="button"
                        className="admin-link-btn admin-link-btn--danger"
                        onClick={() => handleDelete(row)}
                      >
                        Delete
                      </button>
                    )}
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
            <h2>{editingRow ? `Edit ${singular()}` : `Add ${singular()}`}</h2>

            {error && <p className="admin-error">{error}</p>}

            <form className="admin-form" onSubmit={handleSubmit}>
              {fields.map((f) => (
                <label
                  key={f.key}
                  className={`admin-field${f.type === "boolean" ? " admin-field--row" : ""}`}
                >
                  {f.type === "boolean" ? (
                    <>
                      <input
                        type="checkbox"
                        checked={Boolean(formValues[f.key])}
                        onChange={(e) =>
                          setFormValues((prev) => ({ ...prev, [f.key]: e.target.checked }))
                        }
                      />
                      <span>{f.label}</span>
                    </>
                  ) : (
                    <>
                      <span>{f.label}</span>
                      {f.type === "textarea" ? (
                        <textarea
                          value={formValues[f.key] ?? ""}
                          required={f.required}
                          placeholder={f.placeholder}
                          onChange={(e) =>
                            setFormValues((prev) => ({ ...prev, [f.key]: e.target.value }))
                          }
                        />
                      ) : f.type === "select" ? (
                        <select
                          value={formValues[f.key] ?? ""}
                          required={f.required}
                          onChange={(e) =>
                            setFormValues((prev) => ({ ...prev, [f.key]: e.target.value }))
                          }
                        >
                          <option value="">—</option>
                          {(f.options ?? dynamicOptions[f.key] ?? []).map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={f.type === "number" ? "number" : "text"}
                          value={formValues[f.key] ?? ""}
                          required={f.required}
                          placeholder={f.placeholder}
                          onChange={(e) =>
                            setFormValues((prev) => ({ ...prev, [f.key]: e.target.value }))
                          }
                        />
                      )}
                    </>
                  )}
                </label>
              ))}

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
