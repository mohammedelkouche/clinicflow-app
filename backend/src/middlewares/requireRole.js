import { AppError } from "../utils/AppError.js";

export function requireRole(...roles) {
  return (request, _response, next) => {
    if (!request.user) {
      next(new AppError(401, "UNAUTHORIZED", "Authentication is required"));
      return;
    }

    if (!roles.includes(request.user.role)) {
      next(
        new AppError(
          403,
          "FORBIDDEN",
          "You do not have permission to perform this action",
        ),
      );
      return;
    }

    next();
  };
}
