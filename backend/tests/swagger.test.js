import request from "supertest";

import app from "../src/app.js";

function collectLocalReferences(value, references = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectLocalReferences(item, references));
    return references;
  }

  if (!value || typeof value !== "object") {
    return references;
  }

  if (typeof value.$ref === "string" && value.$ref.startsWith("#/")) {
    references.push(value.$ref);
  }

  Object.values(value).forEach((item) =>
    collectLocalReferences(item, references),
  );
  return references;
}

function resolveLocalReference(document, reference) {
  return reference
    .slice(2)
    .split("/")
    .reduce((value, key) => value?.[key], document);
}

describe("Swagger documentation", () => {
  test("serves a valid OpenAPI document for the existing API", async () => {
    const response = await request(app).get("/api/docs.json").expect(200);

    expect(response.body.openapi).toBe("3.0.3");
    expect(response.body.info.title).toBe("ClinicFlow API");
    expect(Object.keys(response.body.paths)).toEqual([
      "/health",
      "/auth/login",
      "/auth/me",
      "/patients",
      "/patients/{id}",
      "/appointments",
      "/appointments/{id}/status",
      "/dashboard/stats",
      "/users",
    ]);
    expect(response.body.components.securitySchemes.bearerAuth).toMatchObject({
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    });

    const httpMethods = new Set([
      "get",
      "post",
      "put",
      "patch",
      "delete",
      "options",
      "head",
      "trace",
    ]);
    const operationCount = Object.values(response.body.paths).reduce(
      (total, pathItem) =>
        total +
        Object.keys(pathItem).filter((key) => httpMethods.has(key)).length,
      0,
    );

    expect(operationCount).toBe(14);

    for (const reference of collectLocalReferences(response.body)) {
      expect(resolveLocalReference(response.body, reference)).toBeDefined();
    }
  });

  test("serves the interactive Swagger UI", async () => {
    const response = await request(app).get("/api/docs/").expect(200);

    expect(response.type).toMatch(/html/);
    expect(response.text).toContain('id="swagger-ui"');
    expect(response.headers["content-security-policy"]).toContain(
      "script-src 'self' 'unsafe-inline'",
    );
  });
});
