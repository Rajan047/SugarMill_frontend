// The dashboard data comes from the local Python API, which reads the event CSV.

export async function getDashboardSummary(filter) {
  const params = new URLSearchParams();
  if (filter) {
    params.set("date", filter.date);
    params.set("from", filter.from);
    params.set("to", filter.to);
  }
  const query = params.toString();
  const response = await fetch(`/api/dashboard${query ? `?${query}` : ""}`);
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.detail || "Could not load CSV dashboard data");
  }
  return response.json();
}
