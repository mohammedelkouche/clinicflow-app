import { AppError } from "../utils/AppError.js";

const targets = ["params", "query", "body"];

export function validate(schemas) {
  return (request, _response, next) => {
    const parsedValues = {};
    const details = [];

    for (const target of targets) {
      const schema = schemas[target];

      if (!schema) {
        continue;
      }

      const result = schema.safeParse(request[target]);

      if (!result.success) {
        details.push(
          ...result.error.issues.map((issue) => ({
            path: issue.path.join(".") || target,
            message: issue.message,
          })),
        );
        continue;
      }

      parsedValues[target] = result.data;
    }

    if (details.length > 0) {
      next(new AppError(400, "VALIDATION_ERROR", "Invalid input", details));
      return;
    }

    for (const [target, value] of Object.entries(parsedValues)) {
      request[target] = value;
    }

    next();
  };
}
