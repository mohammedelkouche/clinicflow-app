import request from "supertest";

import app from "../src/app.js";
import { pool } from "../src/db/pool.js";
import { clearTestData, closeTestDatabase } from "./helpers/database.js";
import {
  authorization,
  insertPatient,
  login,
  patientValues,
  seedTestUsers,
  staffCredentials,
} from "./helpers/fixtures.js";

let adminToken;
let staffToken;

beforeEach(async () => {
  await clearTestData();
  await seedTestUsers();
  adminToken = await login(app);
  staffToken = await login(app, staffCredentials);
});

afterAll(closeTestDatabase);

describe("Patients API", () => {
  test("creates a patient and normalizes the CIN", async () => {
    const response = await request(app)
      .post("/api/patients")
      .set("Authorization", authorization(adminToken))
      .send(patientValues({ cin: "test1001" }))
      .expect(201);

    expect(response.body.data).toMatchObject({
      fullName: "Amina Test",
      cin: "TEST1001",
    });
    expect(response.body.data.id).toEqual(expect.any(String));
  });

  test("searches patients and returns pagination metadata", async () => {
    for (let index = 1; index <= 5; index += 1) {
      await insertPatient({
        fullName: `Searchable Patient ${index}`,
        cin: `SEARCH${index}`,
        phone: `+21260000200${index}`,
      });
    }

    await insertPatient({
      fullName: "Unrelated Person",
      cin: "OTHER100",
    });

    const response = await request(app)
      .get("/api/patients")
      .query({ search: "Searchable", page: 2, limit: 2 })
      .set("Authorization", authorization(adminToken))
      .expect(200);

    expect(response.body.data).toHaveLength(2);
    expect(response.body.meta).toEqual({
      page: 2,
      limit: 2,
      total: 5,
      totalPages: 3,
    });
    expect(
      response.body.data.every((patient) =>
        patient.fullName.includes("Searchable"),
      ),
    ).toBe(true);
  });

  test("updates an existing patient", async () => {
    const patient = await insertPatient();
    const updatedValues = patientValues({
      fullName: "Amina Updated",
      phone: "+212611111111",
      address: "Rabat",
    });

    const response = await request(app)
      .put(`/api/patients/${patient.id}`)
      .set("Authorization", authorization(adminToken))
      .send(updatedValues)
      .expect(200);

    expect(response.body.data).toMatchObject(updatedValues);
  });

  test("allows an admin to delete a patient", async () => {
    const patient = await insertPatient();

    await request(app)
      .delete(`/api/patients/${patient.id}`)
      .set("Authorization", authorization(adminToken))
      .expect(204);

    const result = await pool.query("SELECT id FROM patients WHERE id = $1", [
      patient.id,
    ]);
    expect(result.rowCount).toBe(0);
  });

  test("returns 403 when staff tries to delete a patient", async () => {
    const patient = await insertPatient();

    const response = await request(app)
      .delete(`/api/patients/${patient.id}`)
      .set("Authorization", authorization(staffToken))
      .expect(403);

    expect(response.body.error.code).toBe("FORBIDDEN");

    const result = await pool.query("SELECT id FROM patients WHERE id = $1", [
      patient.id,
    ]);
    expect(result.rowCount).toBe(1);
  });

  test("returns 409 for a duplicate CIN", async () => {
    await insertPatient({ cin: "DUPLICATE1" });

    const response = await request(app)
      .post("/api/patients")
      .set("Authorization", authorization(adminToken))
      .send(
        patientValues({
          fullName: "Another Patient",
          cin: "duplicate1",
        }),
      )
      .expect(409);

    expect(response.body.error.code).toBe("CIN_ALREADY_EXISTS");
  });
});
