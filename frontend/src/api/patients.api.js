import apiClient from "./client.js";

export async function listPatients(params) {
  const response = await apiClient.get("/patients", { params });
  return response.data;
}

export async function getPatient(patientId) {
  const response = await apiClient.get(`/patients/${patientId}`);
  return response.data.data;
}

export async function createPatient(patient) {
  const response = await apiClient.post("/patients", patient);
  return response.data.data;
}

export async function updatePatient(patientId, patient) {
  const response = await apiClient.put(`/patients/${patientId}`, patient);
  return response.data.data;
}

export async function deletePatient(patientId) {
  await apiClient.delete(`/patients/${patientId}`);
}
