import apiClient from "./client.js";

export async function getDashboardStats() {
  const response = await apiClient.get("/dashboard/stats");
  return response.data;
}
