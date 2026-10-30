import { Router } from "express";

import { auth } from "../../middlewares/auth.js";
import { requireRole } from "../../middlewares/requireRole.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createPatient,
  deletePatient,
  getPatient,
  listPatients,
  updatePatient,
} from "./patients.controller.js";
import {
  patientIdSchema,
  patientListSchema,
  patientSchema,
} from "./patients.schemas.js";

const router = Router();

router.use(auth);

router.post(
  "/",
  validate({ body: patientSchema }),
  asyncHandler(createPatient),
);
router.get(
  "/",
  validate({ query: patientListSchema }),
  asyncHandler(listPatients),
);
router.get(
  "/:id",
  validate({ params: patientIdSchema }),
  asyncHandler(getPatient),
);
router.put(
  "/:id",
  validate({ params: patientIdSchema, body: patientSchema }),
  asyncHandler(updatePatient),
);
router.delete(
  "/:id",
  requireRole("admin"),
  validate({ params: patientIdSchema }),
  asyncHandler(deletePatient),
);

export default router;
