import { z } from "zod";

export const createUserSchema = z
  .object({
    fullName: z.string().trim().min(1).max(200),
    email: z
      .string()
      .trim()
      .email()
      .transform((email) => email.toLowerCase()),
    password: z.string().min(8).max(100),
    role: z.enum(["admin", "staff"]).default("staff"),
  })
  .strict();

export const userListSchema = z.object({
  search: z.string().trim().default(""),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .default(10)
    .transform((limit) => Math.min(limit, 100)),
});
