import { Router } from "express";

import { auth } from "../../middlewares/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getStats } from "./dashboard.controller.js";

const router = Router();

router.get("/stats", auth, asyncHandler(getStats));

export default router;
