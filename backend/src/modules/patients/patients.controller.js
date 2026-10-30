import * as patientsService from "./patients.service.js";

export async function createPatient(request, response) {
  const patient = await patientsService.createPatient(request.body);
  response.status(201).json({ data: patient });
}

export async function listPatients(request, response) {
  const result = await patientsService.listPatients(request.query);
  response.json(result);
}

export async function getPatient(request, response) {
  const patient = await patientsService.getPatientById(request.params.id);
  response.json({ data: patient });
}

export async function updatePatient(request, response) {
  const patient = await patientsService.updatePatient(
    request.params.id,
    request.body,
  );
  response.json({ data: patient });
}

export async function deletePatient(request, response) {
  await patientsService.deletePatient(request.params.id);
  response.status(204).send();
}
