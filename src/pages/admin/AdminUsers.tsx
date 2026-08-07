import SimpleCrudPage from "../../components/admin/SimpleCrudPage";

export default function AdminUsers() {
  return (
    <SimpleCrudPage
      title="Users"
      endpoint="/admin/users"
      allowCreate={false}
      columns={[
        {
          key: "name",
          label: "Name",
          render: (row) => `${row.firstName} ${row.lastName}`,
        },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        {
          key: "role",
          label: "Role",
          render: (row) => (
            <span
              className={`admin-badge ${
                row.role === "super_admin"
                  ? "admin-badge--red"
                  : row.role === "admin"
                    ? "admin-badge--blue"
                    : "admin-badge--gray"
              }`}
            >
              {row.role}
            </span>
          ),
        },
      ]}
      fields={[
        { key: "firstName", label: "First name", type: "text", required: true },
        { key: "lastName", label: "Last name", type: "text", required: true },
        { key: "email", label: "Email", type: "text", required: true },
        { key: "phone", label: "Phone", type: "text" },
        {
          key: "role",
          label: "Role",
          type: "select",
          required: true,
          options: [
            { value: "user", label: "User" },
            { value: "admin", label: "Admin" },
            { value: "super_admin", label: "Super Admin" },
          ],
        },
      ]}
    />
  );
}
