import { Router } from "express";

import { auth } from "../../middlewares/auth.js";
import { requireRole } from "../../middlewares/requireRole.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createUser, listUsers } from "./users.controller.js";
import { createUserSchema, userListSchema } from "./users.schemas.js";

const router = Router();

router.use(auth, requireRole("admin"));
router.get("/", validate({ query: userListSchema }), asyncHandler(listUsers));
router.post(
  "/",
  validate({ body: createUserSchema }),
  asyncHandler(createUser),
);

export default router;
