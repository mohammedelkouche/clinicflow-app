import request from "supertest";

import app from "../src/app.js";
import { clearTestData, closeTestDatabase } from "./helpers/database.js";
import {
  authorization,
  futureAppointmentDate,
  insertPatient,
  login,
  seedTestUsers,
} from "./helpers/fixtures.js";

let adminToken;
let patientA;
let patientB;

function appointmentValues(patientId, appointmentDate, status = "confirmed") {
  return {
    patientId,
    appointmentDate,
    status,
    reason: "Appointment integration test",
    notes: null,
  };
}

async function createAppointment(values, expectedStatus = 201) {
  const appointmentRequest = request(app)
    .post("/api/appointments")
    .set("Authorization", authorization(adminToken))
    .send(values);

  return expectedStatus === null
    ? appointmentRequest
    : appointmentRequest.expect(expectedStatus);
}

beforeEach(async () => {
  await clearTestData();
  await seedTestUsers();
  adminToken = await login(app);
  patientA = await insertPatient({ cin: "APPOINTA" });
  patientB = await insertPatient({
    fullName: "Second Patient",
    cin: "APPOINTB",
    phone: "+212600003002",
  });
});

afterAll(closeTestDatabase);

describe("Appointment conflict rule", () => {
  test("rejects the same patient at 10:00 and 10:20", async () => {
    await createAppointment(
      appointmentValues(patientA.id, futureAppointmentDate(60, "10:00")),
    );

    const response = await createAppointment(
      appointmentValues(patientA.id, futureAppointmentDate(60, "10:20")),
      409,
    );

    expect(response.body.error.code).toBe("APPOINTMENT_CONFLICT");
  });

  test("allows the same patient at 10:00 and 10:30", async () => {
    await createAppointment(
      appointmentValues(patientA.id, futureAppointmentDate(61, "10:00")),
    );

    const response = await createAppointment(
      appointmentValues(patientA.id, futureAppointmentDate(61, "10:30")),
    );

    expect(response.body.data.status).toBe("confirmed");
  });

  test("allows different patients at 10:00 and 10:20", async () => {
    await createAppointment(
      appointmentValues(patientA.id, futureAppointmentDate(62, "10:00")),
    );

    const response = await createAppointment(
      appointmentValues(patientB.id, futureAppointmentDate(62, "10:20")),
    );

    expect(response.body.data.status).toBe("confirmed");
  });

  test("does not let pending or cancelled appointments block confirmation", async () => {
    await createAppointment(
      appointmentValues(
        patientA.id,
        futureAppointmentDate(63, "10:00"),
        "pending",
      ),
    );
    await createAppointment(
      appointmentValues(
        patientA.id,
        futureAppointmentDate(63, "10:10"),
        "cancelled",
      ),
    );

    const response = await createAppointment(
      appointmentValues(patientA.id, futureAppointmentDate(63, "10:20")),
    );

    expect(response.body.data.status).toBe("confirmed");
  });

  test("rejects changing a conflicting pending appointment to confirmed", async () => {
    await createAppointment(
      appointmentValues(patientA.id, futureAppointmentDate(64, "10:00")),
    );
    const pendingResponse = await createAppointment(
      appointmentValues(
        patientA.id,
        futureAppointmentDate(64, "10:20"),
        "pending",
      ),
    );

    const response = await request(app)
      .patch(`/api/appointments/${pendingResponse.body.data.id}/status`)
      .set("Authorization", authorization(adminToken))
      .send({ status: "confirmed" })
      .expect(409);

    expect(response.body.error.code).toBe("APPOINTMENT_CONFLICT");
  });

  test("serializes parallel conflicting confirmations", async () => {
    const responses = await Promise.all([
      createAppointment(
        appointmentValues(patientA.id, futureAppointmentDate(65, "10:00")),
        null,
      ),
      createAppointment(
        appointmentValues(patientA.id, futureAppointmentDate(65, "10:20")),
        null,
      ),
    ]);

    expect(responses.map((response) => response.status).sort()).toEqual([
      201, 409,
    ]);
  });
});
