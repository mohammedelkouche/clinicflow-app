import { AppError } from "../utils/AppError.js";

function mapPostgresError(error) {
  switch (error.code) {
    case "23505":
      return new AppError(
        409,
        error.constraint === "patients_cin_key"
          ? "CIN_ALREADY_EXISTS"
          : "CONFLICT",
        error.constraint === "patients_cin_key"
          ? "A patient with this CIN already exists"
          : "A record with these values already exists",
      );
    case "23P01":
      return new AppError(
        409,
        "APPOINTMENT_CONFLICT",
        "This appointment conflicts with another confirmed appointment",
      );
    case "22P02":
      return new AppError(400, "VALIDATION_ERROR", "Invalid input");
    case "23503":
      return new AppError(
        400,
        "VALIDATION_ERROR",
        "A referenced resource is invalid",
      );
    default:
      return null;
  }
}

export function errorHandler(error, _request, response, _next) {
  const mappedError = mapPostgresError(error);
  const handledError =
    error instanceof AppError
      ? error
      : (mappedError ??
        new AppError(500, "INTERNAL_ERROR", "An unexpected error occurred"));

  if (handledError.status === 500) {
    console.error("Unexpected server error");
  }

  response.status(handledError.status).json({
    error: {
      code: handledError.code,
      message: handledError.message,
      details: handledError.details,
    },
  });
}
