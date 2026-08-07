import SimpleCrudPage from "../../components/admin/SimpleCrudPage";

export default function AdminAttributeGroups() {
  return (
    <SimpleCrudPage
      title="Attribute Groups"
      endpoint="/admin/attribute-groups"
      columns={[
        { key: "name", label: "Name" },
        { key: "slug", label: "Slug" },
        { key: "sortOrder", label: "Sort order" },
      ]}
      fields={[
        { key: "name", label: "Name", type: "text", required: true },
        { key: "slug", label: "Slug", type: "text", required: true },
        { key: "sortOrder", label: "Sort order", type: "number", required: true },
      ]}
    />
  );
}
