import { Router } from "express";

import { auth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getCurrentUser, login } from "./auth.controller.js";
import { loginSchema } from "./auth.schemas.js";

const router = Router();

router.post("/login", validate({ body: loginSchema }), asyncHandler(login));
router.get("/me", auth, asyncHandler(getCurrentUser));

export default router;
