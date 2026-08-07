import SimpleCrudPage from "../../components/admin/SimpleCrudPage";

export default function AdminSubscriptionPlans() {
  return (
    <SimpleCrudPage
      title="Subscription Plans"
      endpoint="/admin/subscription-plans"
      columns={[
        { key: "name", label: "Name" },
        { key: "price", label: "Price", render: (row) => `$${row.price}` },
        { key: "adsLimit", label: "Ads limit" },
        { key: "durationDays", label: "Duration (days)" },
      ]}
      fields={[
        { key: "name", label: "Name", type: "text", required: true },
        { key: "price", label: "Price", type: "number", required: true },
        { key: "adsLimit", label: "Ads limit", type: "number", required: true },
        { key: "durationDays", label: "Duration (days)", type: "number", required: true },
      ]}
    />
  );
}
