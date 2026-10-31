import apiClient from "./client.js";

export async function listAppointments(params) {
  const response = await apiClient.get("/appointments", { params });
  return response.data;
}

export async function createAppointment(appointment) {
  const response = await apiClient.post("/appointments", appointment);
  return response.data.data;
}

export async function updateAppointmentStatus(appointmentId, status) {
  const response = await apiClient.patch(
    `/appointments/${appointmentId}/status`,
    {
      status,
    },
  );
  return response.data.data;
}
