import * as appointmentsService from "./appointments.service.js";

export async function createAppointment(request, response) {
  const appointment = await appointmentsService.createAppointment(
    request.body,
    request.user.id,
  );
  response.status(201).json({ data: appointment });
}

export async function listAppointments(request, response) {
  const result = await appointmentsService.listAppointments(request.query);
  response.json(result);
}

export async function updateAppointmentStatus(request, response) {
  const appointment = await appointmentsService.updateAppointmentStatus(
    request.params.id,
    request.body.status,
  );
  response.json({ data: appointment });
}
