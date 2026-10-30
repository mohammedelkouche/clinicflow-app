import { Router } from "express";

import { auth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createAppointment,
  listAppointments,
  updateAppointmentStatus,
} from "./appointments.controller.js";
import {
  appointmentIdSchema,
  appointmentListSchema,
  appointmentSchema,
  appointmentStatusSchema,
} from "./appointments.schemas.js";

const router = Router();

router.use(auth);

router.post(
  "/",
  validate({ body: appointmentSchema }),
  asyncHandler(createAppointment),
);
router.get(
  "/",
  validate({ query: appointmentListSchema }),
  asyncHandler(listAppointments),
);
router.patch(
  "/:id/status",
  validate({ params: appointmentIdSchema, body: appointmentStatusSchema }),
  asyncHandler(updateAppointmentStatus),
);

export default router;
