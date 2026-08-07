import { Link } from "react-router-dom";
import "./admin.css";

const SECTIONS = [
  { to: "/admin/products", title: "Products", desc: "Manage the product catalog" },
  { to: "/admin/categories", title: "Categories", desc: "Organize the category tree" },
  { to: "/admin/attribute-groups", title: "Attribute Groups", desc: "Group specs for filters and product pages" },
  { to: "/admin/attributes", title: "Attributes", desc: "Define spec fields and their options" },
  { to: "/admin/users", title: "Users", desc: "View accounts and roles" },
  { to: "/admin/subscription-plans", title: "Subscription Plans", desc: "Manage seller plans" },
  { to: "/admin/payments", title: "Payments", desc: "View payment history" },
];

export default function AdminDashboard() {
  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>Dashboard</h1>
      </div>

      <div className="admin-dashboard-grid">
        {SECTIONS.map((s) => (
          <Link key={s.to} to={s.to} className="admin-dashboard-card">
            <p className="admin-dashboard-card__title">{s.title}</p>
            <p className="admin-dashboard-card__desc">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
