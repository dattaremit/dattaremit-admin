import { z } from "zod";

export const userIdentitySchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(254),
  phoneNumberPrefix: z
    .string()
    .trim()
    .regex(/^\+\d{1,4}$/, "Prefix must be like +1"),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\d{7,15}$/, "Phone number must be 7–15 digits"),
  dateOfBirth: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date (YYYY-MM-DD)")
    .refine((v) => {
      const ms = Date.parse(v);
      return Number.isFinite(ms) && ms < Date.now();
    }, "Date of birth must be in the past"),
  nationality: z.string().trim().max(100).optional().or(z.literal("")),
});

export type UserIdentityFormValues = z.infer<typeof userIdentitySchema>;

export const referValueSchema = z.coerce
  .number()
  .int("Refer value must be a whole number")
  .min(1, "Refer value must be at least 1")
  .max(10_000, "Refer value is too large");
