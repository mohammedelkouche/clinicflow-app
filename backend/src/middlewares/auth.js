import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export function auth(request, _response, next) {
  const authorization = request.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    next(new AppError(401, "UNAUTHORIZED", "Authentication is required"));
    return;
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    next(new AppError(401, "UNAUTHORIZED", "Authentication is required"));
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);

    if (
      typeof payload !== "object" ||
      typeof payload.sub !== "string" ||
      !["admin", "staff"].includes(payload.role)
    ) {
      throw new Error("Invalid token payload");
    }

    request.user = {
      id: payload.sub,
      role: payload.role,
    };

    next();
  } catch {
    next(new AppError(401, "UNAUTHORIZED", "Invalid or expired token"));
  }
}
