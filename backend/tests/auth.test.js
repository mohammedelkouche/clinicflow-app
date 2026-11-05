import request from "supertest";

import app from "../src/app.js";
import { clearTestData, closeTestDatabase } from "./helpers/database.js";
import { adminCredentials, seedTestUsers } from "./helpers/fixtures.js";

beforeEach(async () => {
  await clearTestData();
  await seedTestUsers();
});

afterAll(closeTestDatabase);

describe("Authentication API", () => {
  test("logs in with valid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send(adminCredentials)
      .expect(200);

    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user).toMatchObject({
      email: adminCredentials.email,
      role: "admin",
    });
    expect(response.body.user).not.toHaveProperty("password_hash");
    expect(response.body.user).not.toHaveProperty("passwordHash");
  });

  test("rejects an incorrect password", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ ...adminCredentials, password: "Incorrect123!" })
      .expect(401);

    expect(response.body.error).toMatchObject({
      code: "INVALID_CREDENTIALS",
      message: "Invalid email or password",
    });
  });

  test("rejects an unknown email with the same safe error", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "unknown@clinicflow.test",
        password: adminCredentials.password,
      })
      .expect(401);

    expect(response.body.error).toMatchObject({
      code: "INVALID_CREDENTIALS",
      message: "Invalid email or password",
    });
  });

  test("rejects a missing token", async () => {
    const response = await request(app).get("/api/auth/me").expect(401);

    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  test("rejects an invalid token", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid-token")
      .expect(401);

    expect(response.body.error).toMatchObject({
      code: "UNAUTHORIZED",
      message: "Invalid or expired token",
    });
  });
});
