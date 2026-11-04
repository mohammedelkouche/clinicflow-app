import { rateLimit } from "express-rate-limit";

import { AppError } from "../utils/AppError.js";

export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (_request, _response, next) => {
    next(
      new AppError(
        429,
        "TOO_MANY_LOGIN_ATTEMPTS",
        "Too many failed login attempts. Please try again later",
      ),
    );
  },
});
