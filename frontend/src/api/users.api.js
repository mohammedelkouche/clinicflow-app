import apiClient from "./client.js";

export async function listUsers(params) {
  const response = await apiClient.get("/users", { params });
  return response.data;
}

export async function createUser(user) {
  const response = await apiClient.post("/users", user);
  return response.data.data;
}
