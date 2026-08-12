import { useEffect, useState } from "react";
import "./admin.css";
import { API_BASE } from "../../config";

//const API_BASE = "https://filtrix-3y8ynhfah-filtrixd.vercel.app/";

interface Payment {
  id: string;
  amount: string;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed";
  transactionId: string;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
}

export default function AdminPayments() {
  const [rows, setRows] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/admin/payments`)
      .then((r) => r.json())
      .then((data: Payment[]) => {
        if (!cancelled) setRows(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function statusBadge(status: Payment["paymentStatus"]) {
    const className =
      status === "paid"
        ? "admin-badge admin-badge--green"
        : status === "failed"
          ? "admin-badge admin-badge--red"
          : "admin-badge admin-badge--gray";
    return <span className={className}>{status}</span>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>Payments</h1>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <p className="admin-status">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="admin-status">No payments yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Transaction ID</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td>
                    {p.user.firstName} {p.user.lastName}
                  </td>
                  <td>${p.amount}</td>
                  <td>{p.paymentMethod}</td>
                  <td>{statusBadge(p.paymentStatus)}</td>
                  <td>{p.transactionId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
