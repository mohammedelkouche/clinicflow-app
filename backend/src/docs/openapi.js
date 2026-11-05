const bearerSecurity = [{ bearerAuth: [] }];

const standardErrors = {
  400: {
    description: "The request failed validation",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
      },
    },
  },
  401: {
    description: "The bearer token is missing, invalid, or expired",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
      },
    },
  },
  404: {
    description: "The requested resource was not found",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
      },
    },
  },
};

const adminErrors = {
  ...standardErrors,
  403: {
    description: "The signed-in user is not an administrator",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
      },
    },
  },
};

const paginationParameters = [
  {
    in: "query",
    name: "page",
    description: "Page number",
    schema: { type: "integer", minimum: 1, default: 1 },
  },
  {
    in: "query",
    name: "limit",
    description: "Records per page; values above 100 are capped at 100",
    schema: { type: "integer", minimum: 1, default: 10 },
  },
];

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "ClinicFlow API",
    version: "1.0.0",
    description:
      "REST API for authentication, patients, appointments, dashboard statistics, and administrator-managed user accounts.",
  },
  servers: [{ url: "/api", description: "Current ClinicFlow server" }],
  tags: [
    { name: "System", description: "API availability" },
    { name: "Authentication", description: "Sign-in and current user" },
    { name: "Patients", description: "Patient records" },
    { name: "Appointments", description: "Clinic appointments" },
    { name: "Dashboard", description: "Summary metrics" },
    { name: "Users", description: "Administrator-only user management" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Check API health",
        operationId: "getHealth",
        security: [],
        responses: {
          200: {
            description: "The API is running",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Health" },
                example: { status: "ok" },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Sign in",
        description:
          "Returns a JWT for valid credentials. Ten failed attempts from one client within 15 minutes are rate-limited; successful attempts are not counted.",
        operationId: "login",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
              example: {
                email: "admin@clinicflow.test",
                password: "Admin123!",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Authentication succeeded",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginResponse" },
              },
            },
          },
          400: standardErrors[400],
          401: {
            description: "The email or password is incorrect",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: {
                  error: {
                    code: "INVALID_CREDENTIALS",
                    message: "Invalid email or password",
                  },
                },
              },
            },
          },
          429: {
            description: "Too many failed login attempts",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Get the signed-in user",
        operationId: "getCurrentUser",
        security: bearerSecurity,
        responses: {
          200: {
            description: "Current user",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: { $ref: "#/components/schemas/AuthUser" },
                  },
                },
              },
            },
          },
          401: standardErrors[401],
        },
      },
    },
    "/patients": {
      get: {
        tags: ["Patients"],
        summary: "List and search patients",
        description:
          "Search matches a partial patient name or a CIN prefix. Results are newest first.",
        operationId: "listPatients",
        security: bearerSecurity,
        parameters: [
          {
            in: "query",
            name: "search",
            description: "Partial name or CIN prefix",
            schema: { type: "string", default: "" },
          },
          ...paginationParameters,
        ],
        responses: {
          200: {
            description: "Paginated patients",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PatientListResponse" },
              },
            },
          },
          400: standardErrors[400],
          401: standardErrors[401],
        },
      },
      post: {
        tags: ["Patients"],
        summary: "Create a patient",
        operationId: "createPatient",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PatientInput" },
            },
          },
        },
        responses: {
          201: {
            description: "Patient created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PatientResponse" },
              },
            },
          },
          400: standardErrors[400],
          401: standardErrors[401],
          409: {
            description: "A patient with the same CIN already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/patients/{id}": {
      parameters: [{ $ref: "#/components/parameters/ResourceId" }],
      get: {
        tags: ["Patients"],
        summary: "Get a patient",
        operationId: "getPatient",
        security: bearerSecurity,
        responses: {
          200: {
            description: "Patient found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PatientResponse" },
              },
            },
          },
          ...standardErrors,
        },
      },
      put: {
        tags: ["Patients"],
        summary: "Replace a patient record",
        operationId: "updatePatient",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PatientInput" },
            },
          },
        },
        responses: {
          200: {
            description: "Patient updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PatientResponse" },
              },
            },
          },
          ...standardErrors,
          409: {
            description: "Another patient already uses the submitted CIN",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Patients"],
        summary: "Delete a patient",
        description:
          "Administrator only. The database also deletes the patient's appointments.",
        operationId: "deletePatient",
        security: bearerSecurity,
        responses: {
          204: { description: "Patient deleted; no response body" },
          ...adminErrors,
        },
      },
    },
    "/appointments": {
      get: {
        tags: ["Appointments"],
        summary: "List and filter appointments",
        description: "Results are ordered by creation time, newest first.",
        operationId: "listAppointments",
        security: bearerSecurity,
        parameters: [
          {
            in: "query",
            name: "date",
            description: "Clinic-local calendar date",
            schema: { type: "string", format: "date" },
          },
          {
            in: "query",
            name: "status",
            schema: { $ref: "#/components/schemas/AppointmentStatus" },
          },
          {
            in: "query",
            name: "patientId",
            schema: { type: "string", format: "uuid" },
          },
          ...paginationParameters,
        ],
        responses: {
          200: {
            description: "Paginated appointments",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AppointmentListResponse",
                },
              },
            },
          },
          400: standardErrors[400],
          401: standardErrors[401],
        },
      },
      post: {
        tags: ["Appointments"],
        summary: "Create an appointment",
        description:
          "The timestamp must be in the future. Confirmed appointments for the same patient must be at least 30 minutes apart; pending and cancelled appointments do not block a time.",
        operationId: "createAppointment",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AppointmentInput" },
            },
          },
        },
        responses: {
          201: {
            description: "Appointment created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AppointmentResponse" },
              },
            },
          },
          400: {
            description: "Invalid input or appointment timestamp in the past",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: standardErrors[401],
          404: {
            description: "Patient not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          409: {
            description: "Confirmed appointment conflicts with this patient",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/appointments/{id}/status": {
      patch: {
        tags: ["Appointments"],
        summary: "Change an appointment status",
        description:
          "Changing to confirmed applies the future-time and patient-specific 30-minute conflict rules.",
        operationId: "updateAppointmentStatus",
        security: bearerSecurity,
        parameters: [{ $ref: "#/components/parameters/ResourceId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AppointmentStatusInput" },
            },
          },
        },
        responses: {
          200: {
            description: "Appointment status updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AppointmentResponse" },
              },
            },
          },
          ...standardErrors,
          409: {
            description: "Confirmed appointment conflicts with this patient",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/dashboard/stats": {
      get: {
        tags: ["Dashboard"],
        summary: "Get dashboard metrics",
        operationId: "getDashboardStats",
        security: bearerSecurity,
        responses: {
          200: {
            description: "Current dashboard totals",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DashboardStats" },
              },
            },
          },
          401: standardErrors[401],
        },
      },
    },
    "/users": {
      get: {
        tags: ["Users"],
        summary: "List and search application users",
        operationId: "listUsers",
        security: bearerSecurity,
        parameters: [
          {
            in: "query",
            name: "search",
            description: "Partial full name or email",
            schema: { type: "string", default: "" },
          },
          ...paginationParameters,
        ],
        responses: {
          200: {
            description: "Paginated users",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserListResponse" },
              },
            },
          },
          ...adminErrors,
        },
      },
      post: {
        tags: ["Users"],
        summary: "Create an application user",
        operationId: "createUser",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserInput" },
            },
          },
        },
        responses: {
          201: {
            description: "User created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserResponse" },
              },
            },
          },
          ...adminErrors,
          409: {
            description: "An account with the same email already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Paste the JWT returned by POST /auth/login",
      },
    },
    parameters: {
      ResourceId: {
        in: "path",
        name: "id",
        required: true,
        description: "Resource UUID",
        schema: { type: "string", format: "uuid" },
      },
    },
    schemas: {
      Health: {
        type: "object",
        required: ["status"],
        properties: { status: { type: "string", enum: ["ok"] } },
      },
      UserRole: { type: "string", enum: ["admin", "staff"] },
      AppointmentStatus: {
        type: "string",
        enum: ["pending", "confirmed", "cancelled"],
      },
      LoginRequest: {
        type: "object",
        additionalProperties: false,
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 1, format: "password" },
        },
      },
      AuthUser: {
        type: "object",
        required: ["id", "fullName", "email", "role"],
        properties: {
          id: { type: "string", format: "uuid" },
          fullName: { type: "string" },
          email: { type: "string", format: "email" },
          role: { $ref: "#/components/schemas/UserRole" },
        },
      },
      LoginResponse: {
        type: "object",
        required: ["token", "user"],
        properties: {
          token: { type: "string", description: "Signed JSON Web Token" },
          user: { $ref: "#/components/schemas/AuthUser" },
        },
      },
      PatientInput: {
        type: "object",
        additionalProperties: false,
        required: ["fullName", "cin", "phone", "birthDate"],
        properties: {
          fullName: { type: "string", minLength: 1, maxLength: 200 },
          cin: {
            type: "string",
            minLength: 1,
            maxLength: 50,
            description: "Trimmed and stored in uppercase",
          },
          phone: { type: "string", minLength: 1, maxLength: 50 },
          birthDate: {
            type: "string",
            format: "date",
            description: "Cannot be in the future",
          },
          address: {
            type: "string",
            maxLength: 500,
            nullable: true,
          },
        },
        example: {
          fullName: "Amina El Amrani",
          cin: "AB123456",
          phone: "+212600000000",
          birthDate: "1990-05-12",
          address: "Casablanca",
        },
      },
      Patient: {
        type: "object",
        required: [
          "id",
          "fullName",
          "cin",
          "phone",
          "birthDate",
          "address",
          "createdAt",
          "updatedAt",
        ],
        properties: {
          id: { type: "string", format: "uuid" },
          fullName: { type: "string" },
          cin: { type: "string" },
          phone: { type: "string" },
          birthDate: { type: "string", format: "date" },
          address: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      PatientResponse: {
        type: "object",
        required: ["data"],
        properties: { data: { $ref: "#/components/schemas/Patient" } },
      },
      AppointmentInput: {
        type: "object",
        additionalProperties: false,
        required: ["patientId", "appointmentDate", "reason"],
        properties: {
          patientId: { type: "string", format: "uuid" },
          appointmentDate: {
            type: "string",
            format: "date-time",
            description: "Future ISO 8601 timestamp including a UTC offset",
          },
          status: {
            allOf: [{ $ref: "#/components/schemas/AppointmentStatus" }],
            default: "pending",
          },
          reason: { type: "string", minLength: 1, maxLength: 500 },
          notes: { type: "string", maxLength: 2000, nullable: true },
        },
        example: {
          patientId: "4e94cc62-b84d-42b6-b8c5-08fde87e5514",
          appointmentDate: "2099-01-15T10:00:00+01:00",
          status: "pending",
          reason: "Routine consultation",
          notes: null,
        },
      },
      Appointment: {
        type: "object",
        required: [
          "id",
          "patientId",
          "patientName",
          "appointmentDate",
          "status",
          "reason",
          "notes",
          "createdBy",
          "createdAt",
          "updatedAt",
        ],
        properties: {
          id: { type: "string", format: "uuid" },
          patientId: { type: "string", format: "uuid" },
          patientName: { type: "string" },
          appointmentDate: { type: "string", format: "date-time" },
          status: { $ref: "#/components/schemas/AppointmentStatus" },
          reason: { type: "string" },
          notes: { type: "string", nullable: true },
          createdBy: { type: "string", format: "uuid" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      AppointmentResponse: {
        type: "object",
        required: ["data"],
        properties: { data: { $ref: "#/components/schemas/Appointment" } },
      },
      AppointmentStatusInput: {
        type: "object",
        additionalProperties: false,
        required: ["status"],
        properties: {
          status: { $ref: "#/components/schemas/AppointmentStatus" },
        },
      },
      UserInput: {
        type: "object",
        additionalProperties: false,
        required: ["fullName", "email", "password"],
        properties: {
          fullName: { type: "string", minLength: 1, maxLength: 200 },
          email: { type: "string", format: "email" },
          password: {
            type: "string",
            minLength: 8,
            maxLength: 100,
            format: "password",
          },
          role: {
            allOf: [{ $ref: "#/components/schemas/UserRole" }],
            default: "staff",
          },
        },
      },
      User: {
        type: "object",
        required: ["id", "fullName", "email", "role", "createdAt", "updatedAt"],
        properties: {
          id: { type: "string", format: "uuid" },
          fullName: { type: "string" },
          email: { type: "string", format: "email" },
          role: { $ref: "#/components/schemas/UserRole" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      UserResponse: {
        type: "object",
        required: ["data"],
        properties: { data: { $ref: "#/components/schemas/User" } },
      },
      PaginationMeta: {
        type: "object",
        required: ["page", "limit", "total", "totalPages"],
        properties: {
          page: { type: "integer", minimum: 1 },
          limit: { type: "integer", minimum: 1, maximum: 100 },
          total: { type: "integer", minimum: 0 },
          totalPages: { type: "integer", minimum: 0 },
        },
      },
      PatientListResponse: {
        type: "object",
        required: ["data", "meta"],
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Patient" },
          },
          meta: { $ref: "#/components/schemas/PaginationMeta" },
        },
      },
      AppointmentListResponse: {
        type: "object",
        required: ["data", "meta"],
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Appointment" },
          },
          meta: { $ref: "#/components/schemas/PaginationMeta" },
        },
      },
      UserListResponse: {
        type: "object",
        required: ["data", "meta"],
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/User" },
          },
          meta: { $ref: "#/components/schemas/PaginationMeta" },
        },
      },
      DashboardStats: {
        type: "object",
        required: [
          "totalPatients",
          "appointmentsToday",
          "pending",
          "confirmed",
        ],
        properties: {
          totalPatients: { type: "integer", minimum: 0 },
          appointmentsToday: { type: "integer", minimum: 0 },
          pending: { type: "integer", minimum: 0 },
          confirmed: { type: "integer", minimum: 0 },
        },
      },
      ErrorDetail: {
        type: "object",
        required: ["path", "message"],
        properties: {
          path: { type: "string" },
          message: { type: "string" },
        },
      },
      ErrorResponse: {
        type: "object",
        required: ["error"],
        properties: {
          error: {
            type: "object",
            required: ["code", "message"],
            properties: {
              code: { type: "string" },
              message: { type: "string" },
              details: {
                type: "array",
                items: { $ref: "#/components/schemas/ErrorDetail" },
              },
            },
          },
        },
      },
    },
  },
};
