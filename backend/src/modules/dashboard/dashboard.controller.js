import { getDashboardStats } from "./dashboard.service.js";

export async function getStats(_request, response) {
  const stats = await getDashboardStats();
  response.json(stats);
}
