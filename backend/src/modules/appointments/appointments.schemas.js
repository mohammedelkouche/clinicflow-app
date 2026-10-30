import { z } from "zod";

const statusSchema = z.enum(["pending", "confirmed", "cancelled"]);

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return (
      !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
    );
  }, "Date must be valid");

function optionalQueryValue(schema) {
  return z.preprocess((value) => (value === "" ? undefined : value), schema);
}

export const appointmentSchema = z
  .object({
    patientId: z.string().uuid(),
    appointmentDate: z.string().datetime({ offset: true }),
    status: statusSchema.default("pending"),
    reason: z.string().trim().min(1).max(500),
    notes: z
      .string()
      .trim()
      .max(2000)
      .nullable()
      .optional()
      .transform((notes) => notes || null),
  })
  .strict();

export const appointmentListSchema = z.object({
  date: optionalQueryValue(dateSchema.optional()),
  status: optionalQueryValue(statusSchema.optional()),
  patientId: optionalQueryValue(z.string().uuid().optional()),
  page: optionalQueryValue(z.coerce.number().int().min(1).default(1)),
  limit: optionalQueryValue(
    z.coerce
      .number()
      .int()
      .min(1)
      .default(10)
      .transform((limit) => Math.min(limit, 100)),
  ),
});

export const appointmentIdSchema = z.object({
  id: z.string().uuid(),
});

export const appointmentStatusSchema = z
  .object({
    status: statusSchema,
  })
  .strict();
