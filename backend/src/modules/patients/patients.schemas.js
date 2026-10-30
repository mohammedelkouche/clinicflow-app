import { z } from "zod";

import { env } from "../../config/env.js";

const clinicDateFormatter = new Intl.DateTimeFormat("en", {
  timeZone: env.CLINIC_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function getCurrentClinicDate() {
  const parts = Object.fromEntries(
    clinicDateFormatter
      .formatToParts(new Date())
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return `${parts.year}-${parts.month}-${parts.day}`;
}

const birthDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Birth date must use YYYY-MM-DD")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return (
      !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
    );
  }, "Birth date must be a valid date")
  .refine(
    (value) => value <= getCurrentClinicDate(),
    "Birth date cannot be in the future",
  );

export const patientSchema = z
  .object({
    fullName: z.string().trim().min(1).max(200),
    cin: z
      .string()
      .trim()
      .min(1)
      .max(50)
      .transform((cin) => cin.toUpperCase()),
    phone: z.string().trim().min(1).max(50),
    birthDate: birthDateSchema,
    address: z
      .string()
      .trim()
      .max(500)
      .nullable()
      .optional()
      .transform((address) => address || null),
  })
  .strict();

export const patientIdSchema = z.object({
  id: z.string().uuid(),
});

export const patientListSchema = z.object({
  search: z.string().trim().default(""),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .default(10)
    .transform((limit) => Math.min(limit, 100)),
});
