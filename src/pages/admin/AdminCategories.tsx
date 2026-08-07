import SimpleCrudPage from "../../components/admin/SimpleCrudPage";

export default function AdminCategories() {
  return (
    <SimpleCrudPage
      title="Categories"
      endpoint="/admin/categories"
      columns={[
        { key: "name", label: "Name" },
        { key: "slug", label: "Slug" },
        {
          key: "parentId",
          label: "Parent",
          render: (row) => (row.parent ? row.parent.name : "—"),
        },
      ]}
      fields={[
        { key: "name", label: "Name", type: "text", required: true },
        { key: "slug", label: "Slug", type: "text", required: true },
        {
          key: "parentId",
          label: "Parent category",
          type: "select",
          optionsEndpoint: "/admin/categories",
        },
      ]}
    />
  );
}
